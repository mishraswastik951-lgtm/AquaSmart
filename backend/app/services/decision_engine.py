from config.constants import OPTIMAL_MOISTURE
from app.services.notification_service import NotificationService
from app.services.gemini_service import GeminiAIService
import logging

class IrrigationDecisionEngine:
    @staticmethod
    def analyze_sensor_data(farm_id, user_id, crop_type, moisture_level, temp, humidity):
        """Analyze current data and return decision/action"""
        
        # Get thresholds
        optimal_range = OPTIMAL_MOISTURE.get(crop_type.lower(), OPTIMAL_MOISTURE['default'])
        
        # Trigger alerts if necessary
        NotificationService.trigger_moisture_alert(
            farm_id=farm_id,
            user_id=user_id,
            sensor_id=None,
            current_moisture=moisture_level,
            optimal_range=optimal_range
        )
        
        # Generate decision
        decision = {
            "irrigate_now": False,
            "recommended_volume_liters": 0,
            "status": "optimal"
        }
        
        if moisture_level < optimal_range[0]:
            decision["irrigate_now"] = True
            decision["status"] = "dry"
            # Calculate volume needed (simplified formula)
            deficit = optimal_range[1] - moisture_level
            decision["recommended_volume_liters"] = deficit * 15 # Example multiplier
        elif moisture_level > optimal_range[1]:
            decision["status"] = "overwatered"
            
        return decision

    @classmethod
    def generate_recommendations(cls, farm_id, current_data):
        """Use Gemini AI for complex recommendations"""
        farm_context = f"Crop: {current_data.get('crop_type')}, Area: {current_data.get('area')} hectares"
        sensor_context = f"Moisture: {current_data.get('moisture')}%, Temp: {current_data.get('temp')}C"
        
        try:
            insights_json = GeminiAIService.get_farm_insights(farm_context, sensor_context)
            return insights_json
        except Exception as e:
            logging.error(f"Failed to generate recommendations: {e}")
            return None
