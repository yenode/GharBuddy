import datetime
from Backend.Config.AppConfig import AppConfig

class TwilioService:
    def __init__(self):
        self.notificationLogs = []
        self.client = None
        self.initTwilioClient()

    def initTwilioClient(self):
        # Only initialize if credentials are provided and mockMode is disabled
        if not AppConfig.mockMode and AppConfig.twilioAccountSid and AppConfig.twilioAuthToken:
            try:
                from twilio.rest import Client
                self.client = Client(AppConfig.twilioAccountSid, AppConfig.twilioAuthToken)
                print("Twilio client initialized successfully.")
            except ImportError:
                print("Twilio library not installed. Falling back to log-only notification mode.")
            except Exception as e:
                print(f"Failed to initialize Twilio: {e}")

    def sendWhatsApp(self, messageText, actionId=None, suggestActions=False):
        """
        Simulates sending a WhatsApp notification. Logs history for visual panel access.
        """
        notification = {
            "message": messageText,
            "actionId": actionId,
            "suggestActions": suggestActions,
            "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
            "sentViaTwilio": False
        }
        
        self.notificationLogs.append(notification)
        # Limit the size
        if len(self.notificationLogs) > 30:
            self.notificationLogs.pop(0)

        try:
            print(f"[WhatsApp Notification Logged] {messageText}")
        except UnicodeEncodeError:
            safe_text = messageText.encode('ascii', errors='replace').decode('ascii')
            print(f"[WhatsApp Notification Logged] {safe_text}")

        if self.client and AppConfig.twilioPhoneNumber and AppConfig.userPhoneNumber:
            try:
                # twilio formatted recipient
                fromNumber = AppConfig.twilioPhoneNumber
                if not fromNumber.startswith("whatsapp:"):
                    fromNumber = f"whatsapp:{fromNumber}"
                
                toNumber = AppConfig.userPhoneNumber
                if not toNumber.startswith("whatsapp:"):
                    toNumber = f"whatsapp:{toNumber}"

                self.client.messages.create(
                    body=messageText,
                    from_=fromNumber,
                    to=toNumber
                )
                notification["sentViaTwilio"] = True
                print("Notification delivered successfully via Twilio WhatsApp.")
            except Exception as e:
                print(f"Failed to push message via Twilio: {e}")

        return notification

    def getNotificationLogs(self):
        return self.notificationLogs
