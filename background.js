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

