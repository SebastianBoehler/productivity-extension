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

// Study mode constants
const STUDY_MODE_RULE_START = 100;
const SOCIAL_MEDIA_SITES = [
  '*://*.facebook.com/*',
  '*://*.twitter.com/*',
  '*://*.x.com/*',
  '*://*.instagram.com/*',
  '*://*.tiktok.com/*'
];
const VIDEO_SITES = [
  '*://www.youtube.com/*',
  '*://youtube.com/*',
  '*://m.youtube.com/*',
  '*://*.netflix.com/*',
  '*://*.twitch.tv/*'
];

function updateStudyModeRules(studyMode) {
  const rulesToAdd = [];
  let ruleId = STUDY_MODE_RULE_START;

  // Only add rules if study mode is enabled and we have triggers
  if (studyMode.enabled && studyMode.triggers && studyMode.triggers.length > 0) {
    // Add social media blocking rules
    if (studyMode.blockSocial) {
      SOCIAL_MEDIA_SITES.forEach((site, index) => {
        rulesToAdd.push({
          "id": ruleId + index,
          "priority": 2, // Higher priority than redirect rules
          "action": { "type": "block" },
          "condition": {
            "urlFilter": site,
            "resourceTypes": ["main_frame"]
          }
        });
      });
      ruleId += SOCIAL_MEDIA_SITES.length;
    }

    // Add video site blocking rules
    if (studyMode.blockVideo) {
      VIDEO_SITES.forEach((site, index) => {
        rulesToAdd.push({
          "id": ruleId + index,
          "priority": 2, // Higher priority than redirect rules
          "action": { "type": "block" },
          "condition": {
            "urlFilter": site,
            "resourceTypes": ["main_frame"]
          }
        });
      });
    }
  }

  // Remove existing study mode rules and add new ones
  const removeIds = Array.from(
    { length: SOCIAL_MEDIA_SITES.length + VIDEO_SITES.length },
    (_, i) => STUDY_MODE_RULE_START + i
  );

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: removeIds,
    addRules: rulesToAdd
  });
}

// Listen for study mode changes
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'studyModeChanged') {
    updateStudyModeRules(message.settings);
  }
});

// Initialize study mode rules
chrome.storage.sync.get(['studyMode'], (result) => {
  if (result.studyMode) {
    updateStudyModeRules(result.studyMode);
  }
});

// Call applyRulesBasedOnSettings initially and whenever settings change
applyRulesBasedOnSettings();

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.settings) {
    applyRulesBasedOnSettings();
  }
  if (changes.studyMode?.newValue) {
    updateStudyModeRules(changes.studyMode.newValue);
  }
});
