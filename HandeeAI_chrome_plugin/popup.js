document.getElementById('functionality').addEventListener('change', () => {
  const functionality = document.getElementById('functionality').value;
  document.getElementById('languageOptions').style.display = functionality === 'translate' ? 'block' : 'none';
});

const container = document.querySelector('.container');
const maximizeBtn = document.getElementById('maximizeBtn');
const minimizeBtn = document.getElementById('minimizeBtn');
const closeButton = document.getElementById('closeButton');
const outputDiv = document.getElementById('output');
const resizers = document.querySelectorAll('.resizer');

let startX, startY, startWidth, startHeight;
let isMaximized = true;

maximizeBtn.addEventListener('click', () => {
  console.log('Maximize button clicked - Not implemented');
});

minimizeBtn.addEventListener('click', () => {
  console.log('Minimize button clicked - Not implemented');
});

closeButton.addEventListener('click', () => {
  window.close();
});


resizers.forEach(resizer => {
  resizer.addEventListener('mousedown', (e) => {
    startX = e.clientX;
    startY = e.clientY;
    startWidth = parseInt(window.getComputedStyle(container).width);
    startHeight = parseInt(window.getComputedStyle(container).height);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
});

function onMouseMove(e) {
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  const resizer = e.target; // Get the element itself

  let newWidth = startWidth;
  let newHeight = startHeight;

  if (resizer.classList.contains('top')) {
    newHeight -= dy;
  }
  if (resizer.classList.contains('bottom')) {
    newHeight += dy;
  }
  if (resizer.classList.contains('left')) {
    newWidth -= dx;
  }
  if (resizer.classList.contains('right')) {
    newWidth += dx;
  }
  if (resizer.classList.contains('top-left')) {
    newWidth -= dx;
    newHeight -= dy;
  }
  if (resizer.classList.contains('top-right')) {
    newWidth += dx;
    newHeight -= dy;
  }
  if (resizer.classList.contains('bottom-left')) {
    newWidth -= dx;
    newHeight += dy;
  }
  if (resizer.classList.contains('bottom-right')) {
    newWidth += dx;
    newHeight += dy;
  }

  container.style.width = `${Math.max(200, newWidth)}px`;
  container.style.height = `${Math.max(100, newHeight)}px`;
}

function onMouseUp() {
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
}

document.getElementById('submitButton').addEventListener('click', async () => {
  const functionality = document.getElementById('functionality').value;
  const userInput = document.getElementById('inputText').value.trim();
  const language = document.getElementById('language')?.value;

  if (!userInput) {
    outputDiv.textContent = 'Please enter some text!';
    return;
  }

  let prompt = userInput;
  switch (functionality) {
    case 'summary':
      prompt = `Summarize the following text: ${userInput}`;
      break;
    case 'translate':
      if (!language) {
        outputDiv.textContent = 'Please select a language for translation!';
        return;
      }
      prompt = `Translate the following text into ${language}: ${userInput}`;
      break;
    case 'write':
      prompt = `Write a short paragraph about: ${userInput}`;
      break;
    case 'rewrite':
      prompt = `Rewrite the following text for clarity: ${userInput}`;
      break;
    default:
      outputDiv.textContent = 'Invalid functionality selected.';
      return;
  }

  outputDiv.textContent = 'Processing...';

  try {
    const apiKey = await getApiKey(); 
    if (!apiKey) {
      outputDiv.textContent = 'API Key is not configured!';
      return;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      const errorMessage = errorData.error ? errorData.error.message : `Error ${response.status}: ${response.statusText}`;
      outputDiv.textContent = `Error: ${errorMessage}`;
      return;
    }

    const data = await response.json();
    const outputText = data.candidates && data.candidates[0]?.content?.parts[0]?.text ? data.candidates[0].content.parts[0].text : 'No valid response from API.';
    outputDiv.textContent = outputText;
  } catch (error) {
    outputDiv.textContent = `Error: ${error.message}`;
    console.error("API request failed:", error);
  }
});


async function getApiKey() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['API_KEY'], (result) => {
      if (result.API_KEY) {
        resolve(result.API_KEY);
      } else {
        reject(new Error('API key not found.'));
      }
    });
  });
}