chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(`Storage key "${key}" in namespace "${namespace}" changed.`);
    console.log(`Old value was "${oldValue}", new value is "${newValue}".`);
    console.log(oldValue, newValue)
  }

  if (changes.settings?.newValue) {
    chrome.tabs.query({ url: ["*://*.youtube.com/*", "*://*.instagram.com/*"] }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: "settingsChanged",
          settings: changes.settings.newValue
        });
      });
    });

  }
});

function applyRulesBasedOnSettings() {
  chrome.storage.sync.get('settings', function (data) {
    const settings = data.settings || {};
    const rulesToAdd = [];
    const rulesToRemove = [];

    console.log('applyRulesBasedOnSettings', settings)

    // YouTube Home Feed Redirect
    if (settings.toggleHomeFeed && settings.youtube) {
      rulesToAdd.push({
        "id": 1,
        "priority": 1,
        "action": {
          "type": "redirect",
          "redirect": { "url": "https://www.youtube.com/feed/subscriptions" }
        },
        "condition": {
          "regexFilter": "^(https?://)?(www\\.)?youtube\\.[a-zA-Z]{2,}(/)?$",
          "resourceTypes": ["main_frame"]
        }
      });
    } else {
      rulesToRemove.push(1);
    }

    // Instagram Explore Feed Redirect
    if (settings.toggleExploreFeed && settings.instagram) {
      rulesToAdd.push({
        "id": 2,
        "priority": 1,
        "action": {
          "type": "redirect",
          "redirect": { "url": "https://www.instagram.com/" }
        },
        "condition": {
          "regexFilter": "^(https?://)?(www\\.)?instagram\\.com/explore(/)?$",
          "resourceTypes": ["main_frame"]
        }
      });
    } else {
      rulesToRemove.push(2);
    }

    // Instagram Reels Feed Redirect
    if (settings.toggleReelsFeed && settings.instagram) {
      rulesToAdd.push({
        "id": 3,
        "priority": 1,
        "action": {
          "type": "redirect",
          "redirect": { "url": "https://www.instagram.com/" }
        },
        "condition": {
          "regexFilter": "^(https?://)?(www\\.)?instagram\\.com/reels(/)?.*$",
          "resourceTypes": ["main_frame"]
        }
      });
    } else {
      rulesToRemove.push(3);
    }

    // Updated Instagram "For You" Page Redirect
    if (settings.toggleForYouPage && settings.instagram) {
      console.log('settings.toggleForYouPage', settings.toggleForYouPage)
      rulesToAdd.push({
        "id": 4,
        "priority": 1,
        "action": {
          "type": "redirect",
          "redirect": { "url": "https://www.instagram.com/?variant=following" }
        },
        "condition": {
          "regexFilter": "^(https?://)?(www\\.)?instagram\\.com(/|/\\?variant=home)?$",
          "resourceTypes": ["main_frame"]
        }
      });
    } else {
      rulesToRemove.push(4);
    }

    // Update the dynamic rules
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: rulesToRemove,
      addRules: rulesToAdd
    }, () => {
      console.log('Dynamic rules updated based on settings:', settings);
    });
  });
}

// Call applyRulesBasedOnSettings initially and whenever settings change
applyRulesBasedOnSettings();

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.settings) {
    applyRulesBasedOnSettings();
  }
});
