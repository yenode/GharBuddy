import json
import os
from datetime import datetime

class IndianCalendar:
    def __init__(self, festivalsFilePath=None):
        if festivalsFilePath is None:
            currentDir = os.path.dirname(os.path.abspath(__file__))
            festivalsFilePath = os.path.join(currentDir, "..", "Data", "IndianFestivals.json")
        
        self.festivalsFilePath = festivalsFilePath
        self.festivalsList = []
        self.simulatedDate = None  # Format: "MM-DD", e.g. "06-14"
        self.loadFestivals()

    def loadFestivals(self):
        try:
            with open(self.festivalsFilePath, "r", encoding="utf-8") as file:
                self.festivalsList = json.load(file)
        except Exception as e:
            print(f"Error loading festivals file: {e}")
            self.festivalsList = []

    def setSimulatedDate(self, dateString):
        """Sets a simulated date in MM-DD format, e.g. '06-14'"""
        self.simulatedDate = dateString

    def getCurrentDateString(self):
        if self.simulatedDate:
            return self.simulatedDate
        return datetime.now().strftime("%m-%d")

    def getFestivalStatus(self):
        currentDate = self.getCurrentDateString()
        for festival in self.festivalsList:
            if festival.get("dateString") == currentDate:
                return festival
        return None

    def isFastingToday(self):
        status = self.getFestivalStatus()
        return status.get("isFastingDay", False) if status else False

    def shouldSuppressCookingAlerts(self):
        status = self.getFestivalStatus()
        return status.get("suppressCookingAlerts", False) if status else False

    def getPoojaDurationMinutes(self):
        status = self.getFestivalStatus()
        return status.get("poojaDurationMinutes", 20) if status else 20
