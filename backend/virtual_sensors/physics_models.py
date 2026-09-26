class SoilMoistureModel:
    """Physics-based model to simulate soil moisture depletion"""
    
    @staticmethod
    def calculate_depletion(current_moisture, temperature, humidity, evapotranspiration_rate):
        """Calculate how much moisture is lost over a time period"""
        # Simplified Penman-Monteith logic
        loss = (temperature * 0.05) + (evapotranspiration_rate * 0.1) - (humidity * 0.01)
        new_moisture = max(0, current_moisture - loss)
        return new_moisture
