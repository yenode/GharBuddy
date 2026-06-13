import datetime

class RoutinePredictor:
    def __init__(self):
        # Local event store for active session windowing (last 60 minutes)
        self.recentEventList = []
        # Cooking whistle tracker
        self.whistleCount = 0
        self.targetWhistles = 3

    def recordEvent(self, sensorId, value, timestamp=None):
        if timestamp is None:
            timestamp = datetime.datetime.now().strftime("%H:%M:%S")
        
        event = {
            "sensorId": sensorId,
            "value": value,
            "timestamp": timestamp
        }
        self.recentEventList.append(event)
        
        # Maintain a sliding window of recent events (keep last 20)
        if len(self.recentEventList) > 20:
            self.recentEventList.pop(0)

        # Cooker whistle tracking logic
        if sensorId == "cookerWhistle" and value == "active":
            self.whistleCount += 1
            print(f"Incremented whistle count. Now at: {self.whistleCount}")
        elif sensorId == "resetCooker":
            self.whistleCount = 0
            if isinstance(value, int):
                self.targetWhistles = value

        return event

    def clearCookingWhistles(self):
        self.whistleCount = 0

    def predictNextAction(self, currentTimeString, isFastingDay=False, powerStatus="GRID"):
        """
        Analyzes the last active sensor timeline and predicts proactive actions.
        Returns a dictionary: { predictedAction, targetDevice, deviceCommand, confidence, reason }
        """
        # Parse time-of-day float for boundary checks (e.g. "06:15:00" -> 6.25)
        try:
            parts = currentTimeString.split(":")
            hourFloat = int(parts[0]) + int(parts[1]) / 60.0
        except Exception:
            hourFloat = 12.0  # fallback noon

        recentSensorIds = [e["sensorId"] for e in self.recentEventList]

        # Use Case 1: Morning Routine (Geyser Automation)
        # Triggered by morning toilet flush or bathroom motion between 5:30 AM and 8:30 AM
        if 5.5 <= hourFloat <= 8.5:
            if "toiletFlush" in recentSensorIds or "bathroomMotion" in recentSensorIds:
                return {
                    "predictedAction": "turnOnGeyser",
                    "targetDevice": "geyser",
                    "deviceCommand": "ON",
                    "confidence": 0.94,
                    "reason": "Toilet flush detected during morning window. Pre-heating bath geyser automatically."
                }

        # Use Case 2: Pooja Mode
        # Triggered by pooja room motion or matching exact pooja hours (6:00 AM to 7:00 AM)
        if 6.0 <= hourFloat <= 7.5:
            if "poojaRoomMotion" in recentSensorIds:
                return {
                    "predictedAction": "activatePoojaMode",
                    "targetDevice": "poojaLights",
                    "deviceCommand": "MEDITATION_DIMS",
                    "confidence": 0.92,
                    "reason": "Motion detected in Pooja room at morning prayer hour. Setting tranquil ambiance."
                }

        # Use Case 3: Pressure Cooker Alert
        # Triggered by cooker whistle pulses
        if self.whistleCount > 0:
            if isFastingDay:
                # Suppress normal cooking prompts on fasting days
                self.whistleCount = 0
                return None
            
            if self.whistleCount >= self.targetWhistles:
                # Trigger completion action
                currentCount = self.whistleCount
                self.whistleCount = 0 # reset
                return {
                    "predictedAction": "cookerCompletionAlert",
                    "targetDevice": "speakerSystem",
                    "deviceCommand": f"ANNOUNCE_WHISTLE_COUNT_{currentCount}",
                    "confidence": 0.98,
                    "reason": f"Pressure cooker count reached target of {self.targetWhistles} whistles."
                }

        # Use Case 4: Water Motor Automated Cycles
        # Daily schedules at 7:00 AM & 6:00 PM
        if (6.9 <= hourFloat <= 7.3) or (17.9 <= hourFloat <= 18.3):
            if "waterLevelLow" in recentSensorIds or "motorTimerTrigger" in recentSensorIds:
                return {
                    "predictedAction": "startWaterMotor",
                    "targetDevice": "waterMotor",
                    "deviceCommand": "ON",
                    "confidence": 0.82,
                    "reason": "Scheduled motor window reached and low water level detected. Starting motor."
                }
        
        # Leak detection scenario (motor running for long duration without stop)
        if "waterMotorRunningLong" in recentSensorIds:
            return {
                "predictedAction": "stopWaterMotorLeakAlert",
                "targetDevice": "waterMotor",
                "deviceCommand": "OFF",
                "confidence": 0.96,
                "reason": "Water motor has exceeded safety runtime. Stopping motor to prevent overflow/leak."
            }

        # Use Case 5: Power-Cut Pre-charge
        # Pre-charges inverter before predicted cuts (e.g. load shedding expected 18:30)
        if 18.0 <= hourFloat <= 18.75:
            if powerStatus == "GRID" and "powerCutRiskHigh" in recentSensorIds:
                return {
                    "predictedAction": "prechargeInverter",
                    "targetDevice": "inverterBackup",
                    "deviceCommand": "FAST_CHARGE",
                    "confidence": 0.89,
                    "reason": "High power-cut probability predicted for evening load shedding window. Pre-charging backup batteries."
                }

        # Use Case 6: Study Quiet Mode & Bedtime Wind-Down
        # Evening study window (17:00 - 19:00) or Bedtime (21:30 - 23:30)
        if 17.0 <= hourFloat <= 19.0:
            if "childrenStudyMotion" in recentSensorIds:
                return {
                    "predictedAction": "activateStudyMode",
                    "targetDevice": "livingRoomLights",
                    "deviceCommand": "STUDY_FOCUS_BRIGHTNESS",
                    "confidence": 0.86,
                    "reason": "Study hours detected. Dimming television volume and adjusting lights for focus."
                }
        
        if 21.5 <= hourFloat <= 23.5:
            if "bedroomMotion" in recentSensorIds or "lateNightQuiet" in recentSensorIds:
                return {
                    "predictedAction": "activateBedtimeRoutine",
                    "targetDevice": "allDevices",
                    "deviceCommand": "SLEEP_SHUTDOWN",
                    "confidence": 0.91,
                    "reason": "Bedtime motion patterns detected. Turning off TVs and preparing security perimeter."
                }

        return None
