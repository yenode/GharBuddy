from Backend.Services.PostgreSqlService import PostgreSqlService

class DatabaseService:
    def __init__(self):
        self.pgService = PostgreSqlService()

    def getDeviceStates(self):
        return self.pgService.getDevices()

    def updateDeviceState(self, deviceId, state):
        return self.pgService.updateDevice(deviceId, state)

    def logEvent(self, event):
        if not event:
            return
        sensorId = event.get("sensorId")
        value = event.get("value")
        timestamp = event.get("timestamp")
        self.pgService.logEvent(sensorId, value, timestamp)

    def getEventHistory(self):
        return self.pgService.getRecentLogs(100)

    def getEnergyStats(self):
        return self.pgService.getEnergyStats()

    def addEnergySavings(self, wattageHours, rupees):
        self.pgService.updateEnergyStats(wattageHours, rupees)

    def setInverterCharge(self, percentage):
        self.pgService.setInverterCharge(percentage)

