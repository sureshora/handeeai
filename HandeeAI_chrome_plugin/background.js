//This version uses a function to set the API key, allowing for easier updates
function setApiKey(apiKey){
  chrome.storage.local.set({ API_KEY: apiKey });
}

// Set the API key only once (on install) using a check in chrome.storage
chrome.runtime.onInstalled.addListener(async () => {
  const { API_KEY } = await chrome.storage.local.get('API_KEY');
  if (!API_KEY){ //Only sets it if it's not already present
    setApiKey("AIzaSyDhabWdf6Tojab7ga3bS3q8mlvyVpjAPEY"); // Replace with how you'll manage API keys in the future
  }
});
