function checkForHomeURL() {
  chrome.storage.sync.get('settings', function (data) {
    const settings = data.settings || {};
    const toggleHomeFeedState = settings.toggleHomeFeed || false; // Default to false if not set

    console.log('toggleHomeFeedState', toggleHomeFeedState);

    if (toggleHomeFeedState) {
      // Check if the URL is the home page
      if (window.location.href === 'https://www.youtube.com/' || window.location.href === 'https://www.youtube.com') {
        window.location.href = 'https://www.youtube.com/feed/subscriptions';
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
chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (key === 'toggleHomeFeed') { // Assuming this is the setting name
      if (newValue === true) {
        chrome.declarativeNetRequest.updateDynamicRules({
          addRules: [{
            "id": 1,
            "priority": 1,
            "action": {
              "type": "redirect",
              "redirect": {
                "url": "https://www.youtube.com/feed/subscriptions"
              }
            },
            "condition": {
              "regexFilter": "^(https?://)?(www\\.)?youtube\\.[a-zA-Z]{2,}(/)?$",
              //"resourceTypes": ["main_frame"]
            }
          }],
          //removeRuleIds: [1]
        });
      } else {
        chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: [1]
        });
      }
    }
  }
});

