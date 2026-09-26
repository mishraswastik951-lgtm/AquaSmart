import time
import random
import json
import logging
from kafka import KafkaProducer
import os

logging.basicConfig(level=logging.INFO)

KAFKA_BROKER = os.getenv('KAFKA_BROKER', 'localhost:9092')

try:
    producer = KafkaProducer(
        bootstrap_servers=[KAFKA_BROKER],
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )
except Exception as e:
    logging.warning(f"Kafka Producer not connected. Running in simulation mode without publishing: {e}")
    producer = None

FARMS = ['Farm Alpha', 'Farm Beta']
ZONES = ['Zone North', 'Zone East', 'Block A', 'Block B']

def generate_sensor_data():
    while True:
        farm = random.choice(FARMS)
        zone = random.choice(ZONES)
        
        # Simulate realistic daily cycles using sine waves could be added here
        # For now, we use constrained random walks
        
        data = {
            "farm": farm,
            "zone": zone,
            "moisture": round(random.uniform(20.0, 70.0), 1),
            "temp": round(random.uniform(15.0, 35.0), 1),
            "humidity": round(random.uniform(40.0, 90.0), 1),
            "light": int(random.uniform(100, 1000)),
            "wind": round(random.uniform(0.0, 25.0), 1),
            "rain": round(random.uniform(0.0, 10.0) if random.random() > 0.8 else 0.0, 1),
            "timestamp": time.time()
        }

        logging.info(f"Generated Sensor Data: {data}")
        
        if producer:
            try:
                producer.send('sensor_data_stream', data)
                producer.flush()
            except Exception as e:
                logging.error(f"Failed to publish to Kafka: {e}")
        
        # Publish every 5 seconds
        time.sleep(5)

if __name__ == "__main__":
    logging.info("Starting synthetic sensor data generation...")
    generate_sensor_data()
