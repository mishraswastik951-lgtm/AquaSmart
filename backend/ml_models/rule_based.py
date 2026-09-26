class RuleBasedModel:
    def __init__(self):
        self.rules = []

    def evaluate(self, data):
        """Evaluate sensor data against predefined rules"""
        # Simplistic rule evaluation
        results = []
        if data.get('temperature', 0) > 35:
            results.append("Heat stress risk")
        if data.get('humidity', 0) > 85 and data.get('temperature', 0) > 25:
            results.append("High fungal disease risk")
        return results
