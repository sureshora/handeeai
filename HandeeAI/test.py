import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Print the API key
api_key = os.getenv('API_KEY')
if api_key:
    print(f"API Key Loaded: {api_key}")
else:
    print("API Key is not loaded. Check your .env file.")
