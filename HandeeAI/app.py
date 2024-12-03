import os
from flask import Flask, render_template, request, jsonify
import requests
import json

app = Flask(__name__, template_folder='templates')

app.config['ENV'] = 'development'

# Load API key from environment variables
app.config['API_KEY'] = os.environ.get('API_KEY')
BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')

@app.route('/api', methods=['POST'])
def api():
    try:
        data = request.get_json()
        prompt = data['prompt']

        headers = {
            'Content-Type': 'application/json',
        }
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ]
        }
        url = f"{BASE_URL}?key={app.config['API_KEY']}"

        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)

        json_response = response.json()
        result = json_response.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', 'No response from API')

        return jsonify({'result': result}), 200

    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500  # Internal Server Error
    except (KeyError, IndexError) as e:
        return jsonify({'error': f"Invalid JSON or API response: {e}"}), 400 # Bad Request
    except Exception as e:
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3710) # host='0.0.0.0' makes it accessible from other machines on the network