# Application Constants

CROP_TYPES = [
    'wheat', 'corn', 'rice', 'soybeans', 'cotton', 
    'tomatoes', 'potatoes', 'sugarcane', 'vineyard', 'orchard'
]

# Optimal Soil Moisture ranges (%) by crop type
OPTIMAL_MOISTURE = {
    'wheat': (40, 60),
    'corn': (50, 70),
    'rice': (70, 90),
    'soybeans': (45, 65),
    'cotton': (40, 55),
    'tomatoes': (60, 80),
    'potatoes': (55, 75),
    'default': (40, 60)
}

# Alert Thresholds
ALERT_THRESHOLDS = {
    'MOISTURE_LOW': 30.0,
    'MOISTURE_CRITICAL_LOW': 20.0,
    'MOISTURE_HIGH': 85.0,
    'TEMP_HIGH': 35.0,
    'TEMP_CRITICAL_HIGH': 40.0,
    'TEMP_LOW': 10.0,
    'TEMP_CRITICAL_LOW': 5.0,
    'HUMIDITY_DISEASE_RISK': 85.0
}
