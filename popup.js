document.addEventListener('DOMContentLoaded', function () {
  let youtubeCheckbox = document.getElementById('youtube');
  let recommendationsCheckbox = document.getElementById('toggleRecommendations');
  let toggleHomeFeedCheckbox = document.getElementById('toggleHomeFeed');
  let toggleCommentsCheckbox = document.getElementById('toggleComments');
  let toggleShortsCheckbox = document.getElementById('toggleShorts');

  let instagramCheckbox = document.getElementById('instagram');
  let toggleExploreFeedCheckbox = document.getElementById('toggleExploreFeed');
  let toggleReelsFeedCheckbox = document.getElementById('toggleReelsFeed');

  function applyStates(settings) {
    if (settings) {
      //youtube
      youtubeCheckbox.checked = !!settings.youtube;
      recommendationsCheckbox.checked = settings.youtube ? !!settings.toggleRecommendations : false;
      toggleHomeFeedCheckbox.checked = settings.youtube ? !!settings.toggleHomeFeed : false;
      toggleCommentsCheckbox.checked = settings.youtube ? !!settings.toggleComments : false;
      toggleShortsCheckbox.checked = settings.youtube ? !!settings.toggleShorts : false;

      //instagram
      instagramCheckbox.checked = !!settings.instagram;
      toggleExploreFeedCheckbox.checked = settings.instagram ? !!settings.toggleExploreFeed : false;
      toggleReelsFeedCheckbox.checked = settings.instagram ? !!settings.toggleReelsFeed : false;
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
      if (recommendationsCheckbox.checked) settings.youtube = true;
      chrome.storage.sync.set({ 'settings': settings });
      applyStates(settings);
    });
  });

  // Update toggle home feed state to storage
  toggleHomeFeedCheckbox.addEventListener('change', function () {
    chrome.storage.sync.get('settings', function (data) {
      var settings = data.settings || {};
      settings.toggleHomeFeed = toggleHomeFeedCheckbox.checked;
      if (toggleHomeFeedCheckbox.checked) settings.youtube = true;
      chrome.storage.sync.set({ 'settings': settings });
      applyStates(settings);
    });
  });

  // Update toggle comments state to storage
  toggleCommentsCheckbox.addEventListener('change', function () {
    chrome.storage.sync.get('settings', function (data) {
      var settings = data.settings || {};
      settings.toggleComments = toggleCommentsCheckbox.checked;
      if (toggleCommentsCheckbox.checked) settings.youtube = true;
      chrome.storage.sync.set({ 'settings': settings });
      applyStates(settings);
    });
  });

  // Update toggle shorts state to storage
  toggleShortsCheckbox.addEventListener('change', function () {
    chrome.storage.sync.get('settings', function (data) {
      var settings = data.settings || {};
      settings.toggleShorts = toggleShortsCheckbox.checked;
      if (toggleShortsCheckbox.checked) settings.youtube = true;
      chrome.storage.sync.set({ 'settings': settings });
      applyStates(settings);
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

  // Update instagram state to storage
  instagramCheckbox.addEventListener('change', function () {
    chrome.storage.sync.get('settings', function (data) {
      var settings = data.settings || {};
      settings.instagram = instagramCheckbox.checked;
      chrome.storage.sync.set({ 'settings': settings });
      applyStates(settings);
    });
  });

  // Update toggle explore feed state to storage
  toggleExploreFeedCheckbox.addEventListener('change', function () {
    chrome.storage.sync.get('settings', function (data) {
      var settings = data.settings || {};
      settings.toggleExploreFeed = toggleExploreFeedCheckbox.checked;
      if (toggleExploreFeedCheckbox.checked) settings.instagram = true;
      chrome.storage.sync.set({ 'settings': settings });
      applyStates(settings);
    });
  });

  // Update toggle reels feed state to storage
  toggleReelsFeedCheckbox.addEventListener('change', function () {
    chrome.storage.sync.get('settings', function (data) {
      var settings = data.settings || {};
      settings.toggleReelsFeed = toggleReelsFeedCheckbox.checked;
      if (toggleReelsFeedCheckbox.checked) settings.instagram = true;
      chrome.storage.sync.set({ 'settings': settings });
      applyStates(settings);
    });
  });

  // Time limit input elements
  let youtubeTimeLimitInput = document.getElementById('youtubeTimeLimit');
  let instagramTimeLimitInput = document.getElementById('instagramTimeLimit');

  // Load time limits from storage
  chrome.storage.sync.get(['settings', 'timeLimits'], function (data) {
    applyStates(data.settings);
    if (data.timeLimits) {
      youtubeTimeLimitInput.value = data.timeLimits.youtube || 0;
      instagramTimeLimitInput.value = data.timeLimits.instagram || 0;
    }
  });

  // Save YouTube time limit
  youtubeTimeLimitInput.addEventListener('change', function () {
    chrome.storage.sync.get('timeLimits', function (data) {
      var timeLimits = data.timeLimits || {};
      timeLimits.youtube = parseInt(youtubeTimeLimitInput.value, 10);
      chrome.storage.sync.set({ timeLimits });
    });
  });

  // Save Instagram time limit
  instagramTimeLimitInput.addEventListener('change', function () {
    chrome.storage.sync.get('timeLimits', function (data) {
      var timeLimits = data.timeLimits || {};
      timeLimits.instagram = parseInt(instagramTimeLimitInput.value, 10);
      chrome.storage.sync.set({ timeLimits });
    });
  });

});
