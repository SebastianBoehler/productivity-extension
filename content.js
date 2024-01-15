const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function toggleElementVisibility(elementId, hide) {
  console.log('Toggling visibility for:', elementId, 'Hide:', hide);
  let element = document.getElementById(elementId);
  if (element) {
    element.style.display = hide ? 'none' : '';
  }
}

async function applySettings() {
  console.log('Applying settings');
  await sleep(1000);
  chrome.storage.sync.get('settings', (data) => {
    if (data.settings) {
      if (data.settings.hideRecommendations) {
        toggleElementVisibility('related', true);
      }
      if (data.settings.hideSecondary) {
        toggleElementVisibility('secondary', true);
      }
    }
  });
}

function checkAndApplySettings() {
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', applySettings);
  } else {
    applySettings();
  }
}

// Repeatedly check if the elements are available in the DOM and apply settings.
// This is necessary because YouTube loads content dynamically.
function periodicallyCheckElements() {
  console.log('Periodically checking elements');
  const intervalId = setInterval(() => {
    if (document.getElementById('related') || document.getElementById('secondary')) {
      applySettings();
      clearInterval(intervalId);
    }
  }, 200);
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log('Received message:', request);
    if (request.action === "toggleRecommendations") {
      toggleElementVisibility('related', request.hide);
    } else if (request.action === "toggleSecondary") {
      toggleElementVisibility('secondary', request.hide);
    }
  }
);

checkAndApplySettings();
periodicallyCheckElements();

