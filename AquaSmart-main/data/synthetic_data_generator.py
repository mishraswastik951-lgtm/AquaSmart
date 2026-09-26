import pandas as pd
import numpy as np
import datetime
import os

def generate_synthetic_data(num_days=30):
    np.random.seed(42)
    
    # 24 readings per day
    timestamps = []
    start_date = datetime.datetime.now() - datetime.timedelta(days=num_days)
    
    for i in range(num_days * 24):
        timestamps.append(start_date + datetime.timedelta(hours=i))
        
    farms = [
        {"farm_id": "Farm_A", "soil_type": "Clay", "threshold": 35, "crop_type": "Wheat", "retention": 0.95},
        {"farm_id": "Farm_B", "soil_type": "Loam", "threshold": 45, "crop_type": "Rice", "retention": 0.85},
        {"farm_id": "Farm_C", "soil_type": "Sand", "threshold": 25, "crop_type": "Maize", "retention": 0.60}
    ]
    
    all_data = []
    
    for farm in farms:
        current_moisture = farm["threshold"] + 15.0 # start hydrated
        
        for idx, ts in enumerate(timestamps):
            hour = ts.hour
            # Sinusoidal temperature with daily cycle
            base_temp = 20 + 10 * np.sin(np.pi * (hour - 8) / 12) # peak around 2 PM
            temp = base_temp + np.random.normal(0, 1.0)
            
            # Humidity is inversely proportional to temperature
            base_humidity = 80 - 30 * np.sin(np.pi * (hour - 8) / 12)
            humidity = base_humidity + np.random.normal(0, 3.0)
            humidity = np.clip(humidity, 10, 100)
            
            # Random rainfall (5% chance at any hour)
            is_raining = np.random.choice([0, 1], p=[0.95, 0.05])
            rainfall = 0.0
            if is_raining:
                rainfall = round(np.random.uniform(2.0, 15.0), 1)
                
            # Soil moisture dynamics
            # Evaporation rate
            evaporation = temp * (1.0 - humidity / 100.0) * 0.05
            
            # Moisture changes: goes up with rainfall, goes down with evaporation
            if rainfall > 0:
                current_moisture += rainfall * 2.0
            else:
                # Drying depends on soil retention
                current_moisture -= evaporation / farm["retention"]
                
            # If irrigated previously, moisture resets/increases
            # Let's say if moisture fell below threshold previously, we "irrigated"
            irrigate = 0
            if current_moisture < farm["threshold"]:
                irrigate = 1
                current_moisture += np.random.uniform(15.0, 25.0) # add water
                
            current_moisture = np.clip(current_moisture, 5.0, 100.0)
            
            all_data.append({
                "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
                "farm_id": farm["farm_id"],
                "temperature": round(temp, 1),
                "humidity": round(humidity, 1),
                "rainfall": rainfall,
                "soil_moisture": round(current_moisture, 1),
                "irrigate": irrigate
            })
            
    df = pd.DataFrame(all_data)
    
    # Ensure data folder exists
    os.makedirs("data", exist_ok=True)
    
    # Save unified CSV
    df.to_csv("data/raw_data.csv", index=False)
    print("Generated data/raw_data.csv")
    
    # Save per-farm CSVs
    for farm_id in df["farm_id"].unique():
        farm_df = df[df["farm_id"] == farm_id]
        farm_df.to_csv(f"data/{farm_id}.csv", index=False)
        print(f"Generated data/{farm_id}.csv")
        
if __name__ == "__main__":
    generate_synthetic_data()
