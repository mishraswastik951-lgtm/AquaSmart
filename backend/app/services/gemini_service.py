import google.generativeai as genai
from flask import current_app

class GeminiAIService:
    _initialized = False
    
    @classmethod
    def init_service(cls):
        if not cls._initialized:
            api_key = current_app.config.get('GEMINI_API_KEY')
            if api_key:
                genai.configure(api_key=api_key)
                cls._initialized = True
            else:
                current_app.logger.warning("GEMINI_API_KEY not set")
    
    @classmethod
    def get_model(cls, model_name='gemini-1.5-pro'):
        if not cls._initialized:
            cls.init_service()
        return genai.GenerativeModel(model_name)

    @classmethod
    def get_farm_insights(cls, farm_data, sensor_data):
        """Analyze soil moisture, temperature, and crop type to generate insights"""
        try:
            model = cls.get_model()
            prompt = f"""
            Analyze the following farm and sensor data to provide actionable insights.
            Farm Data: {farm_data}
            Recent Sensor Data: {sensor_data}
            
            Provide the response in structured JSON format with keys:
            - overall_health: (string, brief summary)
            - warnings: (array of strings)
            - recommendations: (array of strings)
            - predicted_yield_impact: (string)
            """
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            current_app.logger.error(f"Gemini API Error: {str(e)}")
            return '{"error": "Failed to generate insights"}'

    @classmethod
    def answer_farmer_question(cls, question, farm_context):
        """QA over farm data + sensor history"""
        try:
            model = cls.get_model('gemini-1.5-flash') # Use flash for quicker chat response
            prompt = f"""
            You are an expert AI agronomist for AquaSmart. 
            Context about the farmer's farm: {farm_context}
            
            Farmer's Question: {question}
            
            Provide a helpful, precise, and contextual answer.
            """
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            current_app.logger.error(f"Gemini API Error: {str(e)}")
            return "I'm sorry, I couldn't process your question at the moment."
            
    @classmethod
    def detect_crop_diseases(cls, symptoms_description):
        """Analyze symptoms and suggest treatments"""
        try:
            model = cls.get_model()
            prompt = f"""
            Based on the following crop symptoms, identify potential diseases, suggest treatments, and recommend preventive measures.
            Symptoms: {symptoms_description}
            
            Format as a JSON object:
            {{ "possible_diseases": [], "treatments": [], "preventive_measures": [] }}
            """
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            current_app.logger.error(f"Gemini API Error: {str(e)}")
            return None
