let settings = undefined

async function loadSettings() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('settings', (data) => {
      if (data.settings) {
        settings = data.settings;
        resolve(data.settings);
      } else {
        reject();
      }
    });
  })
}

async function applySettings(settings) {
  if (!settings) {
    settings = await loadSettings();
  }
  //go over features and apply them
  //console.log('Applying settings:', settings);
  const { toggleHomeFeed, toggleRecommendations } = settings;
  if (toggleRecommendations) {
    //remove recommendations feed on the right
    const secondaryElement = document.getElementById('secondary');
    if (secondaryElement) {
      secondaryElement.remove();
    }

    const parentElement = document.getElementById('sections');
    if (parentElement && parentElement.children.length >= 3) {
      const thirdChild = parentElement.children[2];
      if (thirdChild) thirdChild.setAttribute('style', 'display: none !important');
    }
  }

  if (toggleHomeFeed) {
    let sectionsElement = document.getElementById("sections");
    if (sectionsElement) {
      let itemsElement = sectionsElement.querySelector("#items");
      if (itemsElement && itemsElement.firstChild) {
        itemsElement.firstChild.style.display = 'none';
      }
    }
  }
}

// Repeatedly check if the elements are available in the DOM and apply settings.
// This is necessary because YouTube loads content dynamically.
function periodicallyCheckElements() {
  // Check if the elements are available in the DOM
  const intervalId = setInterval(() => {
    if (document.getElementById('secondary')) {
      applySettings();
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
      settings = request.settings;
      applySettings(settings);
    }
  }
);



new MutationObserver(() => {
  applySettings(settings);
}).observe(document, { subtree: true, childList: true });
