from sensors.sensor_adapter import SensorAdapter
import json

def test_sensor_adapter_valid():
    payload = json.dumps({"moisture": 45.0, "temperature": 25.0}).encode('utf-8')
    result = SensorAdapter.parse_payload(payload)
    assert result['moisture'] == 45.0
    assert result['quality'] == 100

def test_sensor_adapter_anomaly():
    payload = json.dumps({"moisture": 150.0, "temperature": 100.0}).encode('utf-8')
    result = SensorAdapter.parse_payload(payload)
    # Moisture capped at 100
    assert result['moisture'] == 100.0
    # Temperature out of bounds sets quality to 50
    assert result['quality'] == 50
