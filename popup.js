document.addEventListener('DOMContentLoaded', function () {
  let secondaryCheckbox = document.getElementById('toggleSecondary');
  let toggleHomeFeedCheckbox = document.getElementById('toggleHomeFeed');


  // Load checkbox state from storage
  chrome.storage.sync.get('settings', function (data) {
    if (data.settings) {
      secondaryCheckbox.checked = !!data.settings.hideSecondary;
      toggleHomeFeedCheckbox.checked = !!data.settings.toggleHomeFeed;
    }
  });

  // Update hide recommendations state to storage
  secondaryCheckbox.addEventListener('change', function () {
    chrome.storage.sync.get('settings', function (data) {
      var settings = data.settings || {};
      settings.hideSecondary = secondaryCheckbox.checked;
      chrome.storage.sync.set({ 'settings': settings });
    });
  });

  // Update toggle home feed state to storage
  toggleHomeFeedCheckbox.addEventListener('change', function () {
    chrome.storage.sync.get('settings', function (data) {
      var settings = data.settings || {};
      settings.toggleHomeFeed = toggleHomeFeedCheckbox.checked;
      chrome.storage.sync.set({ 'settings': settings });
    });
  });

});
