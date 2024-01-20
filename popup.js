document.addEventListener('DOMContentLoaded', function () {
  let youtubeCheckbox = document.getElementById('youtube');
  let recommendationsCheckbox = document.getElementById('toggleRecommendations');
  let toggleHomeFeedCheckbox = document.getElementById('toggleHomeFeed');
  let toggleCommentsCheckbox = document.getElementById('toggleComments');
  let toggleShortsCheckbox = document.getElementById('toggleShorts');

  function applyStates(settings) {
    if (settings) {
      youtubeCheckbox.checked = !!settings.youtube;
      recommendationsCheckbox.checked = settings.youtube ? !!settings.toggleRecommendations : false;
      toggleHomeFeedCheckbox.checked = settings.youtube ? !!settings.toggleHomeFeed : false;
      toggleCommentsCheckbox.checked = settings.youtube ? !!settings.toggleComments : false;
      toggleShortsCheckbox.checked = settings.youtube ? !!settings.toggleShorts : false;
    }
  }


  // Load checkbox state from storage
  chrome.storage.sync.get('settings', function (data) {
    applyStates(data.settings);
  });

  // Update hide recommendations state to storage
  recommendationsCheckbox.addEventListener('change', function () {
    chrome.storage.sync.get('settings', function (data) {
      var settings = data.settings || {};
      settings.toggleRecommendations = recommendationsCheckbox.checked;
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

  // Update toggle comments state to storage
  toggleCommentsCheckbox.addEventListener('change', function () {
    chrome.storage.sync.get('settings', function (data) {
      var settings = data.settings || {};
      settings.toggleComments = toggleCommentsCheckbox.checked;
      chrome.storage.sync.set({ 'settings': settings });
    });
  });

  // Update toggle shorts state to storage
  toggleShortsCheckbox.addEventListener('change', function () {
    chrome.storage.sync.get('settings', function (data) {
      var settings = data.settings || {};
      settings.toggleShorts = toggleShortsCheckbox.checked;
      chrome.storage.sync.set({ 'settings': settings });
    });
  });

  // Update youtube state to storage
  youtubeCheckbox.addEventListener('change', function () {
    chrome.storage.sync.get('settings', function (data) {
      var settings = data.settings || {};
      settings.youtube = youtubeCheckbox.checked;
      chrome.storage.sync.set({ 'settings': settings });
      applyStates(settings);
    });
  });

});
