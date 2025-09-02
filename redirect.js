// Rules work on URL loading, this for site redirecting without reload
function checkForHomeURL() {
  chrome.storage.sync.get('settings', function (data) {
    const settings = data.settings || {};
    const toggleHomeFeedState = settings.toggleHomeFeed || false; // Default to false if not set

    console.log('toggleHomeFeedState', toggleHomeFeedState, settings);

    // Define regular expressions for YouTube and Instagram URLs (any TLD)
    const youtubeHomeRegex = /^(https?:\/\/)?(www\.)?youtube\.[a-zA-Z0-9.-]{2,}\/?$/;
    const instagramExploreRegex = /^(https?:\/\/)?(www\.)?instagram\.[a-zA-Z0-9.-]{2,}\/explore\/?$/;
    const instagramReelsRegex = /^(https?:\/\/)?(www\.)?instagram\.[a-zA-Z0-9.-]{2,}\/reels\/?.*$/;  // Matches all URLs starting with /reels/
    const instagramForYouRegex = /^(https?:\/\/)?(www\.)?instagram\.[a-zA-Z0-9.-]{2,}(\/|\/?variant=home)?$/;  // Updated Instagram "For You" regex

    // YouTube Home Feed Redirect
    if (toggleHomeFeedState && settings.youtube) {
      if (youtubeHomeRegex.test(window.location.href)) {
        window.location.href = 'https://www.youtube.com/feed/subscriptions';
      }
    }

    // Instagram Redirects
    if (settings.instagram) {
      if (settings.toggleExploreFeed && instagramExploreRegex.test(window.location.href)) {
        window.location.href = 'https://www.instagram.com/';
      }

      if (settings.toggleReelsFeed && instagramReelsRegex.test(window.location.href)) {
        window.location.href = 'https://www.instagram.com/';
      }

      // Updated Instagram "For You" page redirect
      if (settings.toggleForYouPage && instagramForYouRegex.test(window.location.href)) {
        window.location.href = 'https://www.instagram.com/?variant=following';
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
