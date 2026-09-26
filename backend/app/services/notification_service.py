import logging
from database.mongo_connection import MongoDB
from datetime import datetime
from bson import ObjectId

class NotificationService:
    @staticmethod
    def _create_alert_in_db(user_id, farm_id, title, message, alert_type="info", sensor_id=None):
        try:
            db = MongoDB.get_db()
            alert = {
                "userId": user_id,
                "farmId": farm_id,
                "title": title,
                "description": message,
                "type": alert_type,
                "status": "open",
                "createdAt": datetime.utcnow()
            }
            if sensor_id:
                alert["sensorId"] = sensor_id
                
            db.alerts.insert_one(alert)
            return True
        except Exception as e:
            logging.error(f"Failed to save alert to DB: {str(e)}")
            return False

    @classmethod
    def trigger_moisture_alert(cls, farm_id, user_id, sensor_id, current_moisture, optimal_range):
        """Trigger an alert if moisture is outside optimal range"""
        if current_moisture < optimal_range[0]:
            title = "Low Soil Moisture"
            message = f"Moisture level is at {current_moisture}%, below the minimum of {optimal_range[0]}%. Immediate irrigation recommended."
            alert_type = "critical"
        elif current_moisture > optimal_range[1]:
            title = "High Soil Moisture"
            message = f"Moisture level is at {current_moisture}%, above the maximum of {optimal_range[1]}%. Suspend irrigation to prevent root rot."
            alert_type = "warning"
        else:
            return False
            
        cls._create_alert_in_db(user_id, farm_id, title, message, alert_type, sensor_id)
        cls._send_push_notification(user_id, title, message)
        return True

    @classmethod
    def _send_push_notification(cls, user_id, title, body):
        """Send FCM notification (stubbed for future implementation)"""
        logging.info(f"Sending push notification to User {user_id}: {title} - {body}")
        # In a real app, this would use firebase_admin.messaging
        # message = messaging.Message(
        #     notification=messaging.Notification(title=title, body=body),
        #     topic=str(user_id)
        # )
        # messaging.send(message)
        pass
        
    @classmethod
    def send_email_alert(cls, user_email, title, body):
        """Send Email using SendGrid (stubbed)"""
        logging.info(f"Sending email to {user_email}: {title}")
        pass
