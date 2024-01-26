function checkForHomeURL() {
  chrome.storage.sync.get('settings', function (data) {
    const settings = data.settings || {};
    const toggleHomeFeedState = settings.toggleHomeFeed || false; // Default to false if not set

    console.log('toggleHomeFeedState', toggleHomeFeedState, settings);

    if (toggleHomeFeedState && settings.youtube) {
      // Check if the URL is the home page
      if (window.location.href === 'https://www.youtube.com/' || window.location.href === 'https://www.youtube.com') {
        window.location.href = 'https://www.youtube.com/feed/subscriptions';
      }
    }

    if (settings.instagram) {
      if (settings.toggleExploreFeed) {
        if (window.location.href === 'https://www.instagram.com/explore/' || window.location.href === 'https://www.instagram.com/explore') {
          window.location.href = 'https://www.instagram.com/';
        }
      }

      if (settings.toggleReelsFeed) {
        if (window.location.href === 'https://www.instagram.com/reels/' || window.location.href === 'https://www.instagram.com/reels') {
          window.location.href = 'https://www.instagram.com/';
        }
      }
    }
  });
}

checkForHomeURL();

//for page changed without reload
let previousUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== previousUrl) {
    previousUrl = url;
    checkForHomeURL();
  }
}).observe(document, { subtree: true, childList: true });

//for page changed with reload
//TODO: check if this actually works
// Listen for messages from the background script
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log('Received message:', request);
    if (request.action === 'settingsChanged') {
      console.log('settingsChanged apply dynamic rules');
      applyDynamicRules(request.settings);
    }
  }
);

chrome.storage.sync.get('settings', function (data) {
  applyDynamicRules(data.settings);
})

async function applyDynamicRules(settings) {
  // Apply dynamic rules for YouTube
  console.log('applyDynamicRules', settings, chrome.runtime.getManifest());
  console.log(chrome)
  //const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
  //console.log('oldRules', oldRules);
}

