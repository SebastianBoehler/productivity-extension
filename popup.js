import { setTheme, initTheme } from './utils.js';

document.addEventListener('DOMContentLoaded', function () {
  let youtubeCheckbox = document.getElementById('youtube');
  // Optional advanced controls (may be absent in popup, present in Options)
  let recommendationsCheckbox = document.getElementById('toggleRecommendations');
  let toggleHomeFeedCheckbox = document.getElementById('toggleHomeFeed');
  let toggleCommentsCheckbox = document.getElementById('toggleComments');
  let toggleShortsCheckbox = document.getElementById('toggleShorts');
  let grayThumbnailsCheckbox = document.getElementById('grayThumbnails');
  let hideThumbnailsCheckbox = document.getElementById('hideThumbnails');

  let instagramCheckbox = document.getElementById('instagram');
  let toggleExploreFeedCheckbox = document.getElementById('toggleExploreFeed');
  let toggleReelsFeedCheckbox = document.getElementById('toggleReelsFeed');
  let toggleForYouPageCheckbox = document.getElementById('toggleForYouPage');
  let toggleSearchButtonCheckbox = document.getElementById('toggleSearchButton');

  // Theme initialisieren
  initTheme();

  function applyStates(settings) {
    if (settings) {
      //youtube
      youtubeCheckbox.checked = !!settings.youtube;
      if (recommendationsCheckbox) recommendationsCheckbox.checked = settings.youtube ? !!settings.toggleRecommendations : false;
      if (toggleHomeFeedCheckbox) toggleHomeFeedCheckbox.checked = settings.youtube ? !!settings.toggleHomeFeed : false;
      if (toggleCommentsCheckbox) toggleCommentsCheckbox.checked = settings.youtube ? !!settings.toggleComments : false;
      if (toggleShortsCheckbox) toggleShortsCheckbox.checked = settings.youtube ? !!settings.toggleShorts : false;
      if (grayThumbnailsCheckbox) grayThumbnailsCheckbox.checked = settings.youtube ? !!settings.grayThumbnails : false;
      if (hideThumbnailsCheckbox) hideThumbnailsCheckbox.checked = settings.youtube ? !!settings.hideThumbnails : false;

      //instagram
      instagramCheckbox.checked = !!settings.instagram;
      if (toggleExploreFeedCheckbox) toggleExploreFeedCheckbox.checked = settings.instagram ? !!settings.toggleExploreFeed : false;
      if (toggleReelsFeedCheckbox) toggleReelsFeedCheckbox.checked = settings.instagram ? !!settings.toggleReelsFeed : false;
      if (toggleForYouPageCheckbox) toggleForYouPageCheckbox.checked = settings.instagram ? !!settings.toggleForYouPage : false;
      if (toggleSearchButtonCheckbox) toggleSearchButtonCheckbox.checked = settings.instagram ? !!settings.toggleSearchButton : false;
    }
  }

  function initSettings() {
    // Load checkbox state from storage
    chrome.storage.sync.get('settings', function (data) {
      applyStates(data.settings);
    });
  }

  function initStudyMode() {
    // Update hide recommendations state to storage
    if (recommendationsCheckbox) recommendationsCheckbox.addEventListener('change', function () {
      chrome.storage.sync.get('settings', function (data) {
        var settings = data.settings || {};
        settings.toggleRecommendations = recommendationsCheckbox.checked;
        if (recommendationsCheckbox.checked) settings.youtube = true;
        chrome.storage.sync.set({ 'settings': settings });
        applyStates(settings);
      });
    });

    // Update toggle home feed state to storage
    if (toggleHomeFeedCheckbox) toggleHomeFeedCheckbox.addEventListener('change', function () {
      chrome.storage.sync.get('settings', function (data) {
        var settings = data.settings || {};
        settings.toggleHomeFeed = toggleHomeFeedCheckbox.checked;
        if (toggleHomeFeedCheckbox.checked) settings.youtube = true;
        chrome.storage.sync.set({ 'settings': settings });
        applyStates(settings);
      });
    });

    // Update toggle comments state to storage
    if (toggleCommentsCheckbox) toggleCommentsCheckbox.addEventListener('change', function () {
      chrome.storage.sync.get('settings', function (data) {
        var settings = data.settings || {};
        settings.toggleComments = toggleCommentsCheckbox.checked;
        if (toggleCommentsCheckbox.checked) settings.youtube = true;
        chrome.storage.sync.set({ 'settings': settings });
        applyStates(settings);
      });
    });

    // Update toggle shorts state to storage
    if (toggleShortsCheckbox) toggleShortsCheckbox.addEventListener('change', function () {
      chrome.storage.sync.get('settings', function (data) {
        var settings = data.settings || {};
        settings.toggleShorts = toggleShortsCheckbox.checked;
        if (toggleShortsCheckbox.checked) settings.youtube = true;
        chrome.storage.sync.set({ 'settings': settings });
        applyStates(settings);
      });
    });

    // Update grayscale thumbnails state to storage
    if (grayThumbnailsCheckbox) grayThumbnailsCheckbox.addEventListener('change', function () {
      chrome.storage.sync.get('settings', function (data) {
        var settings = data.settings || {};
        settings.grayThumbnails = grayThumbnailsCheckbox.checked;
        if (grayThumbnailsCheckbox.checked) {
          settings.youtube = true;
          settings.hideThumbnails = false;
          hideThumbnailsCheckbox.checked = false;
        }
        chrome.storage.sync.set({ 'settings': settings });
      });
    });

    // Update hide thumbnails state to storage
    if (hideThumbnailsCheckbox) hideThumbnailsCheckbox.addEventListener('change', function () {
      chrome.storage.sync.get('settings', function (data) {
        var settings = data.settings || {};
        settings.hideThumbnails = hideThumbnailsCheckbox.checked;
        if (hideThumbnailsCheckbox.checked) {
          settings.youtube = true;
          settings.grayThumbnails = false;
          grayThumbnailsCheckbox.checked = false;
        }
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

    // Update instagram state to storage
    if (instagramCheckbox) instagramCheckbox.addEventListener('change', function () {
      chrome.storage.sync.get('settings', function (data) {
        var settings = data.settings || {};
        settings.instagram = instagramCheckbox.checked;
        chrome.storage.sync.set({ 'settings': settings });
        applyStates(settings);
      });
    });

    // Update toggle explore feed state to storage
    if (toggleExploreFeedCheckbox) toggleExploreFeedCheckbox.addEventListener('change', function () {
      chrome.storage.sync.get('settings', function (data) {
        var settings = data.settings || {};
        settings.toggleExploreFeed = toggleExploreFeedCheckbox.checked;
        if (toggleExploreFeedCheckbox.checked) settings.instagram = true;
        chrome.storage.sync.set({ 'settings': settings });
        applyStates(settings);
      });
    });

    // Update toggle reels feed state to storage
    if (toggleReelsFeedCheckbox) toggleReelsFeedCheckbox.addEventListener('change', function () {
      chrome.storage.sync.get('settings', function (data) {
        var settings = data.settings || {};
        settings.toggleReelsFeed = toggleReelsFeedCheckbox.checked;
        if (toggleReelsFeedCheckbox.checked) settings.instagram = true;
        chrome.storage.sync.set({ 'settings': settings });
        applyStates(settings);
      });
    });

    // Update toggle for you page state to storage
    if (toggleForYouPageCheckbox) toggleForYouPageCheckbox.addEventListener('change', function () {
      chrome.storage.sync.get('settings', function (data) {
        var settings = data.settings || {};
        settings.toggleForYouPage = toggleForYouPageCheckbox.checked;
        if (toggleForYouPageCheckbox.checked) settings.instagram = true;
        chrome.storage.sync.set({ 'settings': settings });
        applyStates(settings);
      });
    });

    // Update toggle search button state to storage
    if (toggleSearchButtonCheckbox) toggleSearchButtonCheckbox.addEventListener('change', function () {
      chrome.storage.sync.get('settings', function (data) {
        var settings = data.settings || {};
        settings.toggleSearchButton = toggleSearchButtonCheckbox.checked;
        if (toggleSearchButtonCheckbox.checked) settings.instagram = true;
        chrome.storage.sync.set({ 'settings': settings });
        applyStates(settings);
      });
    });

    // Open options page from popup
    const openOptions = document.getElementById('openOptions');
    const openYTSettings = document.getElementById('openYTSettings');
    const openIGSettings = document.getElementById('openIGSettings');
    const openSMSettings = document.getElementById('openSMSettings');
    function openOptionsPage() {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open('options.html');
      }
    }
    if (openOptions) openOptions.addEventListener('click', openOptionsPage);
    if (openYTSettings) openYTSettings.addEventListener('click', openOptionsPage);
    if (openIGSettings) openIGSettings.addEventListener('click', openOptionsPage);
    if (openSMSettings) openSMSettings.addEventListener('click', openOptionsPage);
  }

  initSettings();
  initStudyMode();
});
