import threading
import time
from virtual_sensors.sensor_simulator import SensorSimulator

class VirtualSensorNode:
    def __init__(self, farm_id, sensor_id, crop_type):
        self.simulator = SensorSimulator(farm_id, crop_type)
        self.sensor_id = sensor_id
        self._running = False
        self._thread = None
        
    def start(self, callback_fn):
        """Start emitting synthetic data"""
        self._running = True
        self._thread = threading.Thread(target=self._run_loop, args=(callback_fn,))
        self._thread.daemon = True
        self._thread.start()
        
    def stop(self):
        self._running = False
        
    def _run_loop(self, callback_fn):
        while self._running:
            reading = self.simulator.generate_reading()
            reading['sensor_id'] = self.sensor_id
            callback_fn(reading)
            time.sleep(5) # Emit every 5 seconds for testing
