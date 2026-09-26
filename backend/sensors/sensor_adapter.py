import json
import logging

class SensorAdapter:
    """Parses and sanitizes real IoT data (e.g. from ESP32/Arduino)"""
    
    @staticmethod
    def parse_payload(payload_bytes):
        try:
            data = json.loads(payload_bytes.decode('utf-8'))
            return SensorAdapter.sanitize(data)
        except Exception as e:
            logging.error(f"Failed to parse payload: {e}")
            return None
            
    @staticmethod
    def sanitize(data):
        """Apply calibration and check anomalies (Z-score placeholder)"""
        # Basic bounds checking
        if 'moisture' in data:
            if not (0 <= data['moisture'] <= 100):
                data['moisture'] = max(0, min(100, data['moisture']))
        
        if 'temperature' in data:
            if not (-20 <= data['temperature'] <= 60):
                # Anomaly detected, might discard or flag
                data['quality'] = 50
            else:
                data['quality'] = 100
                
        return data
