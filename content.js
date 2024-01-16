
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function toggleElementVisibility(elementId, hide, callee) {
  console.log('Toggling visibility for:', elementId, 'Hide:', hide, 'callee', callee);
  let element = document.getElementById(elementId);
  if (element) {
    element.style.display = hide ? 'none' : '';
  }
}

async function applySettings(callee = 'applySettings') {
  chrome.storage.sync.get('settings', (data) => {
    if (data.settings) {
      if (data.settings.hideSecondary) {
        toggleElementVisibility('secondary', true, callee);
      }
    }
  });
}


window.onload = function () {
  //page has fully loaded including all frames, objects and images
  periodicallyCheckElements();
};

// Repeatedly check if the elements are available in the DOM and apply settings.
// This is necessary because YouTube loads content dynamically.
function periodicallyCheckElements() {
  // Check if the elements are available in the DOM
  const intervalId = setInterval(() => {
    if (document.getElementById('secondary')) {
      applySettings('periodicallyCheckElements');
      clearInterval(intervalId);
    }
  }, 50);

  return intervalId;
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log('Received message:', request);
    if (request.action === 'settingsChanged') {
      const { settings } = request;
      toggleElementVisibility('secondary', settings.hideSecondary, 'settingsChanged');
    }
  }
);


// Function to handle style changes
function handleStyleChange(mutation) {
  const oldDisplayValue = mutation.oldValue; // the previous display value
  const newDisplayValue = mutation.target.style.display; // the new display value

  if (oldDisplayValue !== newDisplayValue) {
    console.log(`Display changed from "${oldDisplayValue}" to "${newDisplayValue}"`);
  }
}
