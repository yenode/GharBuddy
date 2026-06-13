import unittest
from Backend.Models.IndianCalendar import IndianCalendar
from Backend.Models.RoutinePredictor import RoutinePredictor
from Backend.Services.DatabaseService import DatabaseService

class TestGharBuddy(unittest.TestCase):
    def testCalendarNormalDay(self):
        cal = IndianCalendar()
        cal.setSimulatedDate("06-13")
        self.assertFalse(cal.isFastingToday())
        self.assertFalse(cal.shouldSuppressCookingAlerts())
        self.assertEqual(cal.getPoojaDurationMinutes(), 20)

    def testCalendarFestivalFasting(self):
        cal = IndianCalendar()
        cal.setSimulatedDate("10-12")  # Navratri Start date
        self.assertTrue(cal.isFastingToday())
        self.assertTrue(cal.shouldSuppressCookingAlerts())
        self.assertEqual(cal.getPoojaDurationMinutes(), 40)

    def testRoutineGeyserTrigger(self):
        predictor = RoutinePredictor()
        predictor.recordEvent("toiletFlush", "active")
        prediction = predictor.predictNextAction("06:15:00")
        self.assertIsNotNone(prediction)
        self.assertEqual(prediction["predictedAction"], "turnOnGeyser")
        self.assertEqual(prediction["targetDevice"], "geyser")
        self.assertEqual(prediction["deviceCommand"], "ON")

    def testRoutineCookerWhistles(self):
        predictor = RoutinePredictor()
        predictor.recordEvent("resetCooker", 3)
        
        predictor.recordEvent("cookerWhistle", "active")
        self.assertIsNone(predictor.predictNextAction("12:00:00"))
        
        predictor.recordEvent("cookerWhistle", "active")
        self.assertIsNone(predictor.predictNextAction("12:01:00"))
        
        predictor.recordEvent("cookerWhistle", "active")
        prediction = predictor.predictNextAction("12:02:00")
        self.assertIsNotNone(prediction)
        self.assertEqual(prediction["predictedAction"], "cookerCompletionAlert")

    def testDatabaseService(self):
        db = DatabaseService()
        self.assertEqual(db.getDeviceStates()["geyser"]["status"], "OFF")
        db.updateDeviceState("geyser", "ON")
        self.assertEqual(db.getDeviceStates()["geyser"]["status"], "ON")

    def testVectorStoreSimilarity(self):
        from Backend.Services.VectorStoreService import VectorStoreService
        db = DatabaseService()
        vstore = VectorStoreService(db.pgService)
        
        # Verify rules seeded
        rules = db.pgService.getVectors()
        self.assertGreater(len(rules), 0)
        
        # Test similarity search fallback (Toilet flush matches Geyser preheating)
        similar = vstore.querySimilarRules("morning toilet flush in bathroom", topK=1)
        self.assertEqual(len(similar), 1)
        self.assertIn("geyser", similar[0]["content"].lower())

    def testAgenticPreferenceLearning(self):
        from Backend.Services.BedrockService import BedrockService
        from Backend.Services.VectorStoreService import VectorStoreService
        db = DatabaseService()
        vstore = VectorStoreService(db.pgService)
        bedrock = BedrockService()
        
        initial_count = len(db.pgService.getVectors())
        
        # Simulate user override decline
        rule = bedrock.generatePreferenceRule("turnOnGeyser", "06:15:00", "GRID")
        vstore.addRule(rule, "routine")
        
        # Verify rule is saved in the database
        updated_rules = db.pgService.getVectors()
        self.assertEqual(len(updated_rules), initial_count + 1)
        self.assertIn("geyser", updated_rules[-1]["content"].lower())

if __name__ == "__main__":
    unittest.main()
