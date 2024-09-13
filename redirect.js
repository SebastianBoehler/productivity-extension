// Rules work on URL loading, this for site redirecting without reload
function checkForHomeURL() {
  chrome.storage.sync.get('settings', function (data) {
    const settings = data.settings || {};
    const toggleHomeFeedState = settings.toggleHomeFeed || false; // Default to false if not set

    console.log('toggleHomeFeedState', toggleHomeFeedState, settings);

    // Define regular expressions for YouTube and Instagram URLs
    const youtubeHomeRegex = /^(https?:\/\/)?(www\.)?youtube\.com\/?$/;
    const instagramExploreRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/explore\/?$/;
    const instagramReelsRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/reels\/?.*$/;  // Matches all URLs starting with /reels/


    // YouTube Home Feed Redirect
    if (toggleHomeFeedState && settings.youtube) {
      if (youtubeHomeRegex.test(window.location.href)) {
        window.location.href = 'https://www.youtube.com/feed/subscriptions';
      }
    }

    // Instagram Explore Feed Redirect
    if (settings.instagram) {
      if (settings.toggleExploreFeed && instagramExploreRegex.test(window.location.href)) {
        window.location.href = 'https://www.instagram.com/';
      }

      // Instagram Reels Feed Redirect
      if (settings.toggleReelsFeed && instagramReelsRegex.test(window.location.href)) {
        window.location.href = 'https://www.instagram.com/';
      }
    }
  });
}

checkForHomeURL();

// For page changed without reload
let previousUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== previousUrl) {
    previousUrl = url;
    checkForHomeURL();
  }
}).observe(document, { subtree: true, childList: true });
