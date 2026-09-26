import random
import time
from datetime import datetime

class SensorSimulator:
    def __init__(self, farm_id, crop_type):
        self.farm_id = farm_id
        self.crop_type = crop_type
        self.base_temp = 25.0
        self.base_moisture = 50.0
        
    def generate_reading(self):
        """Generate a realistic synthetic reading based on time of day"""
        hour = datetime.utcnow().hour
        
        # Temp rises during day, drops at night
        if 6 <= hour <= 15:
            temp_variation = (hour - 6) * 1.5
        else:
            temp_variation = -((hour % 24) * 0.5)
            
        current_temp = self.base_temp + temp_variation + random.uniform(-1, 1)
        
        # Moisture depletes over time
        self.base_moisture -= random.uniform(0.1, 0.5)
        if self.base_moisture < 20:
            self.base_moisture = 80 # Simulated irrigation event
            
        return {
            "timestamp": datetime.utcnow(),
            "temperature": round(current_temp, 2),
            "moisture": round(self.base_moisture, 2),
            "humidity": round(random.uniform(40, 80), 2)
        }
