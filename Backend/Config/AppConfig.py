from dotenv import load_dotenv
import os

load_dotenv()

class AppConfig:
    mockMode = os.getenv("MOCK_MODE", "True").lower() == "true" # Set to False to enable actual AWS Bedrock / Twilio API integration
    awsRegion = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
    bedrockModelId = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-5-sonnet-20240620-v1:0")
    twilioAccountSid = os.getenv("TWILIO_ACCOUNT_SID", "")
    twilioAuthToken = os.getenv("TWILIO_AUTH_TOKEN", "")
    twilioPhoneNumber = os.getenv("TWILIO_PHONE_NUMBER", "whatsapp:+14155238886")
    userPhoneNumber = os.getenv("USER_PHONE_NUMBER", "")
    serverPort = 8000
