document.addEventListener('DOMContentLoaded', function () {
  var recommendationsCheckbox = document.getElementById('toggleRecommendations');
  var secondaryCheckbox = document.getElementById('toggleSecondary');


  // Load the state of the checkboxes
  chrome.storage.sync.get('settings', function (data) {
    if (data.settings) {
      recommendationsCheckbox.checked = !!data.settings.hideRecommendations;
      secondaryCheckbox.checked = !!data.settings.hideSecondary;
    }
  });

  // Save the state of the checkboxes
  recommendationsCheckbox.addEventListener('change', function () {
    chrome.storage.sync.get('settings', function (data) {
      var settings = data.settings || {};
      settings.hideRecommendations = recommendationsCheckbox.checked;
      chrome.storage.sync.set({ 'settings': settings });
    });
  });

  secondaryCheckbox.addEventListener('change', function () {
    chrome.storage.sync.get('settings', function (data) {
      var settings = data.settings || {};
      settings.hideSecondary = secondaryCheckbox.checked;
      chrome.storage.sync.set({ 'settings': settings });
    });
  });
});
