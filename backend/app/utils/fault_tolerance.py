import time
import logging
from functools import wraps

class FaultTolerance:
    @staticmethod
    def retry_with_backoff(retries=3, backoff_in_seconds=1):
        """Retry logic with exponential backoff decorator"""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                x = 0
                while True:
                    try:
                        return func(*args, **kwargs)
                    except Exception as e:
                        if x == retries:
                            logging.error(f"Failed after {retries} retries: {str(e)}")
                            raise
                        sleep_time = (backoff_in_seconds * 2 ** x)
                        logging.warning(f"Retrying in {sleep_time} seconds...")
                        time.sleep(sleep_time)
                        x += 1
            return wrapper
        return decorator
        
    @staticmethod
    def circuit_breaker(failure_threshold=5, reset_timeout=60):
        """Simple circuit breaker stub (in production use libraries like PyBreaker)"""
        # This would maintain state in Redis
        pass
