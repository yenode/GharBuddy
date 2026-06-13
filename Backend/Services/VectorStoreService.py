import json
import math
from Backend.Config.AppConfig import AppConfig

class VectorStoreService:
    def __init__(self, postgresService):
        self.db = postgresService
        self.bedrockClient = None
        self.initBedrockClient()

    def initBedrockClient(self):
        if not AppConfig.mockMode:
            try:
                import boto3
                self.bedrockClient = boto3.client(
                    service_name="bedrock-runtime",
                    region_name=AppConfig.awsRegion
                )
                print("VectorStore: AWS Bedrock client initialized successfully.")
            except Exception as e:
                print(f"VectorStore: Bedrock client initialization skipped: {e}. Using local embeddings engine.")

    def getEmbedding(self, text):
        """
        Generates text embedding using Bedrock (Titan) or a deterministic local proxy generator.
        """
        if AppConfig.mockMode or not self.bedrockClient:
            return self.getMockEmbedding(text)

        try:
            body = json.dumps({
                "inputText": text
            })
            response = self.bedrockClient.invoke_model(
                modelId="amazon.titan-embed-text-v1",
                body=body
            )
            responseBody = json.loads(response.get("body").read())
            return responseBody.get("embedding")
        except Exception as e:
            print(f"Error querying Bedrock Titan Embeddings: {e}. Falling back to mock embeddings.")
            return self.getMockEmbedding(text)

    def getMockEmbedding(self, text):
        """
        Creates a deterministic 1536-dimensional vector for localized offline evaluations.
        Binds coordinates to matching semantic terms to align similarity models.
        """
        vector = [0.02] * 1536
        lowerText = text.lower()

        # Semantic segment coordinates mapping
        keywords = {
            "geyser": 5,
            "toilet": 5,
            "bathroom": 5,
            "bath": 5,
            "pooja": 15,
            "prayer": 15,
            "lights": 15,
            "fasting": 25,
            "cooker": 35,
            "whistle": 35,
            "kitchen": 35,
            "motor": 45,
            "water": 45,
            "leak": 45,
            "shedding": 55,
            "inverter": 55,
            "power": 55,
            "cut": 55,
            "study": 65,
            "tuition": 65,
            "bedtime": 75,
            "sleep": 75,
            "night": 75
        }

        for word, index in keywords.items():
            if word in lowerText:
                for i in range(index * 10, (index + 1) * 10):
                    vector[i] = 1.0

        return vector

    def addRule(self, content, category):
        vector = self.getEmbedding(content)
        self.db.insertVectorRule(content, vector, category)

    def querySimilarRules(self, queryText, topK=2):
        """
        Calculates cosine distance over stored rules and returns top-K results.
        Uses native pgvector distance operator <=> if active, else falls back to Python.
        Applies a minimum similarity score threshold of 0.65 for Bedrock, and 0.20 for mock mode.
        """
        threshold = 0.65 if self.bedrockClient else 0.20
        
        if self.db.postgresMode == "live" and self.db.hasPgVector:
            try:
                queryVector = self.getEmbedding(queryText)
                vector_str = "[" + ",".join(map(str, queryVector)) + "]"
                with self.db.get_db_connection() as conn:
                    if conn:
                        with conn.cursor() as cur:
                            cur.execute(
                                "SELECT content, category, (vector <=> %s) AS distance FROM VectorIndex ORDER BY distance ASC LIMIT %s;",
                                (vector_str, topK)
                            )
                            rows = cur.fetchall()
                            scoredRecords = []
                            for row in rows:
                                distance = row[2]
                                similarity = 1.0 - float(distance) if distance is not None else 0.0
                                # Apply threshold
                                if similarity >= threshold:
                                    scoredRecords.append({
                                        "content": row[0],
                                        "category": row[1],
                                        "similarity": similarity
                                    })
                            return scoredRecords
            except Exception as e:
                print(f"Error in native pgvector similarity query: {e}. Falling back to Python calculations.")

        queryVector = self.getEmbedding(queryText)
        records = self.db.getVectors()

        scoredRecords = []
        for rec in records:
            similarity = self.calculateCosineSimilarity(queryVector, rec["vector"])
            scoredRecords.append({
                "content": rec["content"],
                "category": rec["category"],
                "similarity": similarity
            })

        # Sort descending by similarity score
        scoredRecords.sort(key=lambda x: x["similarity"], reverse=True)
        # Filter by threshold
        filteredRecords = [r for r in scoredRecords if r["similarity"] >= threshold]
        return filteredRecords[:topK]

    def calculateCosineSimilarity(self, v1, v2):
        dotProduct = sum(x * y for x, y in zip(v1, v2))
        magnitude1 = math.sqrt(sum(x * x for x in v1))
        magnitude2 = math.sqrt(sum(x * x for x in v2))
        if not magnitude1 or not magnitude2:
            return 0.0
        return dotProduct / (magnitude1 * magnitude2)

