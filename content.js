let settings = undefined;
let domCache = {};

// Debounce function to limit how often a function can be called
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

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

// Cache DOM elements for better performance
function updateDOMCache() {
  if (window.location.hostname.includes('youtube.com')) {
    domCache = {
      secondary: document.getElementById('secondary'),
      guideSections: document.querySelector('.ytd-guide-renderer#sections'),
      comments: document.querySelector('[section-identifier="comment-item-section"], ytd-comments'),
      shorts: document.querySelector('[is-shorts]'),
      shortsInSearch: document.querySelectorAll('.style-scope ytd-reel-shelf-renderer'),
      shortsLockup: document.querySelectorAll('ytm-shorts-lockup-view-model-v2.shortsLockupViewModelHost.style-scope.ytd-rich-item-renderer'),
      thumbnails: document.querySelectorAll('ytd-thumbnail')
    };
  } else if (window.location.hostname.includes('instagram.com')) {
    domCache = {
      explore: document.querySelector('[href="/explore/"]'),
      reels: document.querySelector('[href="/reels/"]'),
      forYou: document.querySelector('div[aria-label="Für dich"][role="button"]'),
      search: document.querySelector('a[href="#"][role="link"] svg[aria-label="Suche"]')?.closest('a[href="#"][role="link"]')
    };
  }
}

async function applySettings(settings) {
  if (!settings) {
    settings = await loadSettings();
  }

  updateDOMCache();
  
  const { youtube, instagram } = settings;

  if (youtube) {
    applyYouTubeSettings(settings);
  }

  if (instagram) {
    applyInstagramSettings(settings);
  }
}

function applyYouTubeSettings(settings) {
  const { toggleRecommendations, toggleHomeFeed, toggleComments, toggleShorts, grayThumbnails, hideThumbnails } = settings;

  if (toggleRecommendations && domCache.secondary) {
    domCache.secondary.remove();
    
    if (domCache.guideSections?.children[2]) {
      domCache.guideSections.children[2].setAttribute('style', 'display: none !important');
    }
  }

  if (toggleHomeFeed && domCache.guideSections) {
    const items = domCache.guideSections.querySelector("#items");
    if (items?.firstChild) {
      items.firstChild.style.display = 'none';
    }
  }

  if (toggleComments && domCache.comments) {
    domCache.comments.style.display = 'none';
  }

  if (toggleShorts) {
    if (domCache.shorts) {
      domCache.shorts.style.display = 'none';
    }

    if (domCache.shortsInSearch) {
      domCache.shortsInSearch.forEach(element => {
        element.style.display = 'none';
      });
    }

    if (domCache.shortsLockup) {
      domCache.shortsLockup.forEach(element => {
        element.style.display = 'none';
      });
    }

    if (domCache.guideSections) {
      const items = domCache.guideSections.querySelector("#items");
      if (items?.children[1]) {
        items.children[1].style.display = 'none';
      }
    }
  }

  if (domCache.thumbnails) {
    domCache.thumbnails.forEach(thumbnail => {
      if (hideThumbnails) {
        thumbnail.style.display = 'none';
      } else if (grayThumbnails) {
        thumbnail.style.filter = 'grayscale(100%)';
      } else {
        thumbnail.style.filter = 'none';
        thumbnail.style.display = '';
      }
    });
  }
}

function applyInstagramSettings(settings) {
  const { toggleExploreFeed, toggleReelsFeed, toggleForYouPage, toggleSearchButton } = settings;

  if (toggleExploreFeed && domCache.explore) {
    domCache.explore.style.display = 'none';
  }

  if (toggleReelsFeed && domCache.reels) {
    domCache.reels.style.display = 'none';
  }

  if (toggleForYouPage && domCache.forYou) {
    domCache.forYou.style.display = 'none';
  }

  if (toggleSearchButton && domCache.search) {
    domCache.search.style.display = 'none';
  }
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.action === 'settingsChanged') {
      settings = request.settings;
      applySettings(settings);
    }
  }
);

// Immediately load and apply settings when the script starts
loadSettings().then(initialSettings => {
  settings = initialSettings;
  // Apply settings immediately and then set up the observer
  applySettings(settings);
}).catch(() => {
  console.log('No initial settings found');
});

// Throttled mutation observer
const debouncedApplySettings = debounce(() => applySettings(settings), 250);

// Single MutationObserver with optimized configuration
const observer = new MutationObserver((mutations) => {
  // Check if any of the mutations are relevant to our interests
  const relevantChange = mutations.some(mutation => {
    // Skip style changes and characterData changes
    if (mutation.type !== 'childList') return false;
    
    // Check if added nodes contain relevant elements
    return Array.from(mutation.addedNodes).some(node => {
      if (node.nodeType !== Node.ELEMENT_NODE) return false;
      return node.querySelector && (
        node.querySelector('[section-identifier="comment-item-section"]') ||
        node.querySelector('ytd-comments') ||
        node.querySelector('[is-shorts]') ||
        node.querySelector('ytm-shorts-lockup-view-model-v2.shortsLockupViewModelHost.style-scope.ytd-rich-item-renderer') ||
        node.querySelector('ytd-thumbnail') ||
        node.querySelector('[href="/explore/"]') ||
        node.querySelector('[href="/reels/"]') ||
        node.querySelector('div[aria-label="Für dich"][role="button"]') ||
        node.querySelector('a[href="#"][role="link"] svg[aria-label="Suche"]')
      );
    });
  });

  if (relevantChange) {
    debouncedApplySettings();
  }
});

// Start observing with a more specific configuration
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false
});
