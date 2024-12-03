import os
from flask import Flask, render_template, request, jsonify
import requests
import json
from dotenv import load_dotenv
from flask_cors import CORS  # Import CORS

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__, template_folder='templates')

# Enable CORS for the app (must be done after creating the `app` object)
CORS(app)

# Configuration
#app.config['API_KEY'] = "dummyE"
app.config['API_KEY'] = os.getenv('API_KEY')  # Uncomment if using .env for the API key
BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

if not app.config['API_KEY']:
    raise ValueError("API key is not set. Ensure it's present in the .env file or environment variables.")

@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')

@app.route('/api', methods=['POST'])
def api():
    try:
        # Get the input JSON from the request
        data = request.get_json()

        if not data or 'prompt' not in data:
            return jsonify({'error': 'Missing or invalid "prompt" in request'}), 400

        prompt = data['prompt']

        # Prepare headers and payload
        headers = {
            'Content-Type': 'application/json',
        }
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ]
        }
        url = f"{BASE_URL}?key={app.config['API_KEY']}"

        # Send the request to the API
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()  # Raise an exception for HTTP errors

        # Parse the response
        json_response = response.json()
        result = json_response.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', 'No response from API')

        return jsonify({'result': result}), 200

    except requests.exceptions.RequestException as e:
        return jsonify({'error': f"HTTP request failed: {e}"}), 500  # Internal Server Error
    except (KeyError, IndexError) as e:
        return jsonify({'error': f"Invalid JSON or API response: {e}"}), 400  # Bad Request
    except Exception as e:
        return jsonify({'error': str(e)}), 500  # Internal Server Error


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3710)

