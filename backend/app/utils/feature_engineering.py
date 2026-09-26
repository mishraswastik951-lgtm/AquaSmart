import pandas as pd
import numpy as np

class FeatureEngineering:
    @staticmethod
    def calculate_rolling_averages(data_df, windows=[7, 14, 30]):
        """Calculate rolling averages for moisture and temp"""
        for window in windows:
            data_df[f'moisture_ma_{window}'] = data_df['moisture'].rolling(window=window).mean()
            data_df[f'temp_ma_{window}'] = data_df['temperature'].rolling(window=window).mean()
        return data_df
        
    @staticmethod
    def compute_anomaly_score(value, historical_mean, historical_std):
        """Z-score based anomaly detection"""
        if historical_std == 0:
            return 0
        z_score = abs(value - historical_mean) / historical_std
        return z_score
