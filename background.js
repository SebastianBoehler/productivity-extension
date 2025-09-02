import { SOCIAL_MEDIA_DOMAINS, VIDEO_DOMAINS } from './sites.js';

// Debug helpers
const DEBUG = true; // Toggle to reduce logs if needed
const debugLog = (...args) => { if (DEBUG) console.log('[FocusFeed]', ...args); };
const debugWarn = (...args) => { if (DEBUG) console.warn('[FocusFeed]', ...args); };

chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    debugLog(`Storage key "${key}" in namespace "${namespace}" changed.`);
    debugLog('Old -> New:', oldValue, newValue)
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
    // Always remove the known IDs first to avoid duplicate ID errors
    const BASE_RULE_IDS = [1, 2, 3, 4];
    const rulesToRemove = [...BASE_RULE_IDS];

    debugLog('applyRulesBasedOnSettings', settings)

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
    }

    // Instagram Explore Feed Redirect (any TLD)
    if (settings.toggleExploreFeed && settings.instagram) {
      rulesToAdd.push({
        "id": 2,
        "priority": 1,
        "action": {
          "type": "redirect",
          "redirect": { "url": "https://www.instagram.com/" }
        },
        "condition": {
          "regexFilter": "^(https?://)?(www\\.)?instagram\\.[a-zA-Z0-9.-]{2,}/explore(/)?$",
          "resourceTypes": ["main_frame"]
        }
      });
    }

    // Instagram Reels Feed Redirect (any TLD)
    if (settings.toggleReelsFeed && settings.instagram) {
      rulesToAdd.push({
        "id": 3,
        "priority": 1,
        "action": {
          "type": "redirect",
          "redirect": { "url": "https://www.instagram.com/" }
        },
        "condition": {
          "regexFilter": "^(https?://)?(www\\.)?instagram\\.[a-zA-Z0-9.-]{2,}/reels(/)?.*$",
          "resourceTypes": ["main_frame"]
        }
      });
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
          "regexFilter": "^(https?://)?(www\\.)?instagram\\.[a-zA-Z0-9.-]{2,}(/|/\\?variant=home)?$",
          "resourceTypes": ["main_frame"]
        }
      });
    }

    // Update the dynamic rules
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: rulesToRemove,
      addRules: rulesToAdd
    }, () => {
      if (chrome.runtime.lastError) {
        debugWarn('updateDynamicRules error:', chrome.runtime.lastError.message);
      } else {
        debugLog('Dynamic rules updated (base rules) add:', rulesToAdd.map(r => r.id), 'remove:', rulesToRemove);
      }
    });
  });
}

// Study mode constants
const STUDY_MODE_RULE_START = 100;

// Helper: build rules based on selected categories and custom sites
function domainToMainFrameRegex(domain) {
  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Support generic brand patterns like "facebook.*" or just "facebook"
  const d = (domain || '').trim().toLowerCase();
  if (!d) return '';
  const isAnyTLD = d.endsWith('.*') || !d.includes('.');
  if (isAnyTLD) {
    const base = d.endsWith('.*') ? d.slice(0, -2) : d;
    const baseEsc = escapeRe(base);
    // Match any subdomain of base + any TLD (e.g., facebook.com, facebook.co.uk)
    return `^https?://(?:[^/]*\\.)?${baseEsc}\\.[a-z0-9.-]{2,}(?::\\d+)?(?:/|$)`;
  }
  // Explicit domain with TLD
  return '^https?://(?:[^/]*\\.)?' + escapeRe(d) + '(?::\\d+)?(?:/|$)';
}

function buildStudyModeRules(studyMode) {
  const rules = [];
  let ruleId = STUDY_MODE_RULE_START;
  if (studyMode.blockSocial) {
    SOCIAL_MEDIA_DOMAINS.forEach((site) => {
      const domain = extractDomainFromTrigger(site);
      if (!domain) return;
      const regex = domainToMainFrameRegex(domain);
      rules.push({ id: ruleId++, priority: 2, action: { type: 'block' }, condition: { regexFilter: regex, resourceTypes: ['main_frame'] } });
    });
  }
  if (studyMode.blockVideo) {
    VIDEO_DOMAINS.forEach((site) => {
      const domain = extractDomainFromTrigger(site);
      if (!domain) return;
      const regex = domainToMainFrameRegex(domain);
      rules.push({ id: ruleId++, priority: 2, action: { type: 'block' }, condition: { regexFilter: regex, resourceTypes: ['main_frame'] } });
    });
  }
  if (Array.isArray(studyMode.customBlocked) && studyMode.customBlocked.length > 0) {
    studyMode.customBlocked.forEach((site) => {
      const domain = extractDomainFromTrigger(site);
      if (!domain) return;
      const regex = domainToMainFrameRegex(domain);
      rules.push({
        id: ruleId++,
        priority: 2,
        action: { type: 'block' },
        condition: { regexFilter: regex, resourceTypes: ['main_frame'] }
      });
    });
  }
  debugLog('buildStudyModeRules summary', {
    total: rules.length,
    examples: rules.map(r => r.condition.regexFilter || r.condition.urlFilter).slice(0, 10)
  });
  return rules;
}

// Helper: check if any open tab matches any trigger
// Extract a domain from a user-provided trigger string.
// Accepts plain domains ("iu.org"), subdomains ("mycampus.iu.org"), or legacy patterns ("*://*.iu.org/*").
function extractDomainFromTrigger(trigger) {
  let t = (trigger || '').trim().toLowerCase();
  if (!t) return '';
  // Strip protocol/prefix like https:// or *://
  t = t.replace(/^[a-z*]+:\/\//i, '');
  // Remove leading wildcard subdomain marker
  t = t.replace(/^\*\./, '');
  // Cut at first slash
  const hostPort = t.split('/')[0];
  // Remove port if any
  return hostPort.split(':')[0];
}

function triggerMatchesUrl(trigger, url) {
  const domain = extractDomainFromTrigger(trigger);
  if (!domain) {
    debugLog('triggerMatchesUrl: empty domain from trigger', trigger);
    return false;
  }
  try {
    const u = new URL(url);
    const host = (u.hostname || '').toLowerCase();
    const isAnyTLD = domain.endsWith('.*') || !domain.includes('.');
    let match = false;
    if (isAnyTLD) {
      const base = domain.endsWith('.*') ? domain.slice(0, -2) : domain;
      const re = new RegExp(`(^|\\.)${base}\\.[a-z0-9.-]{2,}$`);
      match = re.test(host);
    } else {
      match = host === domain || host.endsWith('.' + domain);
    }
    debugLog('triggerMatchesUrl(domain-mode)', { trigger, domain, url, host, result: match });
    return match;
  } catch (e) {
    const res = url.toLowerCase().includes(domain.replace(/\\\.\*$/, ''));
    debugLog('triggerMatchesUrl(url-substring-fallback)', { trigger, domain, url, result: res });
    return res;
  }
}

function anyTabMatchesTriggers(triggers, cb) {
  if (!Array.isArray(triggers) || triggers.length === 0) {
    cb(false);
    return;
  }
  debugLog('anyTabMatchesTriggers: evaluating triggers', triggers);
  chrome.tabs.query({}, (tabs) => {
    const matchedTabs = [];
    const matched = tabs.some((tab) => {
      const url = tab.url || '';
      const ok = triggers.some((t) => triggerMatchesUrl(t, url));
      if (ok) matchedTabs.push(url);
      return ok;
    });
    debugLog('anyTabMatchesTriggers: tabs checked:', tabs.length, 'matched:', matched, matchedTabs.slice(0, 5));
    cb(matched);
  });
}

// Update study mode rules, respecting optional trigger gating
function updateStudyModeRules(studyMode) {
  const enabled = !!(studyMode && studyMode.enabled);
  debugLog('updateStudyModeRules: input', studyMode);

  const apply = (shouldEnable) => {
    const rulesToAdd = shouldEnable ? buildStudyModeRules(studyMode) : [];
    // Remove existing study mode rules and add new ones.
    chrome.declarativeNetRequest.getDynamicRules((rules) => {
      const removeIds = rules
        .filter((r) => r.id >= STUDY_MODE_RULE_START)
        .map((r) => r.id);
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: removeIds,
        addRules: rulesToAdd
      }, () => {
        if (chrome.runtime.lastError) {
          debugWarn('Study mode rules update error:', chrome.runtime.lastError.message);
        } else {
          debugLog('Study mode rules updated', { enabled: shouldEnable, removed: removeIds, added: rulesToAdd.map(r => r.id) });
        }
      });
    });
  };

  if (!enabled) {
    debugLog('updateStudyModeRules: disabled');
    apply(false);
    return;
  }

  const requireTrigger = !!studyMode.requireTriggerTab;
  debugLog('updateStudyModeRules: requireTriggerTab', requireTrigger);
  if (!requireTrigger) {
    // Always on when study mode enabled
    debugLog('updateStudyModeRules: applying without trigger gating');
    apply(true);
  } else {
    // Only enable when a trigger tab is open
    anyTabMatchesTriggers(studyMode.triggers || [], (isActive) => {
      debugLog('updateStudyModeRules: trigger evaluation result', isActive);
      apply(isActive);
    });
  }
}

// Debounced refresh when tabs change (for trigger-based activation)
let studyModeRefreshTimer = null;
function scheduleStudyModeRefresh(reason = 'unspecified') {
  debugLog('scheduleStudyModeRefresh called:', reason);
  if (studyModeRefreshTimer) clearTimeout(studyModeRefreshTimer);
  studyModeRefreshTimer = setTimeout(() => {
    chrome.storage.sync.get(['studyMode'], (result) => {
      debugLog('scheduleStudyModeRefresh: current studyMode', result.studyMode);
      updateStudyModeRules(result.studyMode || {});
    });
  }, 250);
}

// Listen for study mode changes
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'studyModeChanged') {
    debugLog('onMessage: studyModeChanged', message.settings);
    updateStudyModeRules(message.settings);
  }
});

// Initialize study mode rules
chrome.storage.sync.get(['studyMode'], (result) => {
  if (result.studyMode) {
    debugLog('init: applying studyMode', result.studyMode);
    updateStudyModeRules(result.studyMode);
  }
});

// React to tab lifecycle to re-evaluate trigger-gated study mode
chrome.tabs.onUpdated.addListener(() => scheduleStudyModeRefresh('tabs.onUpdated'));
chrome.tabs.onRemoved.addListener(() => scheduleStudyModeRefresh('tabs.onRemoved'));
chrome.tabs.onCreated.addListener(() => scheduleStudyModeRefresh('tabs.onCreated'));
chrome.tabs.onActivated.addListener(() => scheduleStudyModeRefresh('tabs.onActivated'));
chrome.windows.onFocusChanged.addListener(() => scheduleStudyModeRefresh('windows.onFocusChanged'));

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
