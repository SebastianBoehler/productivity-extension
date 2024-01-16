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

// Run the function on script load
checkForHomeURL();

let previousUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== previousUrl) {
    previousUrl = url;
    checkForHomeURL();
  }
}).observe(document, { subtree: true, childList: true });
