import { initTheme } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  // Common settings elements
  const youtubeCheckbox = document.getElementById('youtube');
  const recommendationsCheckbox = document.getElementById('toggleRecommendations');
  const toggleHomeFeedCheckbox = document.getElementById('toggleHomeFeed');
  const toggleCommentsCheckbox = document.getElementById('toggleComments');
  const toggleShortsCheckbox = document.getElementById('toggleShorts');
  const grayThumbnailsCheckbox = document.getElementById('grayThumbnails');
  const hideThumbnailsCheckbox = document.getElementById('hideThumbnails');

  const instagramCheckbox = document.getElementById('instagram');
  const toggleExploreFeedCheckbox = document.getElementById('toggleExploreFeed');
  const toggleReelsFeedCheckbox = document.getElementById('toggleReelsFeed');
  const toggleForYouPageCheckbox = document.getElementById('toggleForYouPage');
  const toggleSearchButtonCheckbox = document.getElementById('toggleSearchButton');

  // Study mode elements
  const studyModeToggle = document.getElementById('studyMode');
  const blockSocialToggle = document.getElementById('blockSocial');
  const blockVideoToggle = document.getElementById('blockVideo');
  const requireTriggerTabToggle = document.getElementById('requireTriggerTab');
  const studyTriggersInput = document.getElementById('studyTriggers');
  const customSiteInput = document.getElementById('customSiteInput');
  const addCustomSiteBtn = document.getElementById('addCustomSite');
  const customSitesList = document.getElementById('customSitesList');

  let studyMode = { enabled: false, blockSocial: true, blockVideo: true, requireTriggerTab: false, triggers: [], customBlocked: [] };

  function renderCustomSites() {
    customSitesList.innerHTML = '';
    (studyMode.customBlocked || []).forEach((pattern, index) => {
      const li = document.createElement('li');
      li.className = 'flex items-center justify-between bg-white dark:bg-gray-900 rounded border px-3 py-2 text-sm';
      li.innerHTML = `
        <span class="truncate mr-3">${pattern}</span>
        <button data-index="${index}" class="removeCustomSite text-red-600 hover:underline text-xs">Remove</button>
      `;
      customSitesList.appendChild(li);
    });

    Array.from(customSitesList.querySelectorAll('.removeCustomSite')).forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        studyMode.customBlocked.splice(idx, 1);
        saveStudyMode();
        renderCustomSites();
      });
    });
  }

  function loadAll() {
    chrome.storage.sync.get(['settings', 'studyMode'], (data) => {
      const settings = data.settings || {};
      studyMode = Object.assign({ enabled: false, blockSocial: true, blockVideo: true, requireTriggerTab: false, triggers: [], customBlocked: [] }, data.studyMode || {});

      // Apply settings to UI
      if (youtubeCheckbox) youtubeCheckbox.checked = !!settings.youtube;
      if (recommendationsCheckbox) recommendationsCheckbox.checked = settings.youtube ? !!settings.toggleRecommendations : false;
      if (toggleHomeFeedCheckbox) toggleHomeFeedCheckbox.checked = settings.youtube ? !!settings.toggleHomeFeed : false;
      if (toggleCommentsCheckbox) toggleCommentsCheckbox.checked = settings.youtube ? !!settings.toggleComments : false;
      if (toggleShortsCheckbox) toggleShortsCheckbox.checked = settings.youtube ? !!settings.toggleShorts : false;
      if (grayThumbnailsCheckbox) grayThumbnailsCheckbox.checked = settings.youtube ? !!settings.grayThumbnails : false;
      if (hideThumbnailsCheckbox) hideThumbnailsCheckbox.checked = settings.youtube ? !!settings.hideThumbnails : false;

      if (instagramCheckbox) instagramCheckbox.checked = !!settings.instagram;
      if (toggleExploreFeedCheckbox) toggleExploreFeedCheckbox.checked = settings.instagram ? !!settings.toggleExploreFeed : false;
      if (toggleReelsFeedCheckbox) toggleReelsFeedCheckbox.checked = settings.instagram ? !!settings.toggleReelsFeed : false;
      if (toggleForYouPageCheckbox) toggleForYouPageCheckbox.checked = settings.instagram ? !!settings.toggleForYouPage : false;
      if (toggleSearchButtonCheckbox) toggleSearchButtonCheckbox.checked = settings.instagram ? !!settings.toggleSearchButton : false;

      if (studyModeToggle) studyModeToggle.checked = !!studyMode.enabled;
      if (blockSocialToggle) blockSocialToggle.checked = !!studyMode.blockSocial;
      if (blockVideoToggle) blockVideoToggle.checked = !!studyMode.blockVideo;
      if (requireTriggerTabToggle) requireTriggerTabToggle.checked = !!studyMode.requireTriggerTab;
      if (studyTriggersInput) studyTriggersInput.value = (studyMode.triggers || []).join(', ');
      renderCustomSites();
    });
  }

  function saveSettings(mutator) {
    chrome.storage.sync.get('settings', (data) => {
      const settings = data.settings || {};
      mutator(settings);
      chrome.storage.sync.set({ settings });
    });
  }

  function saveStudyMode() {
    chrome.storage.sync.set({ studyMode }, () => {
      chrome.runtime.sendMessage({ action: 'studyModeChanged', settings: studyMode });
    });
  }

  // Listeners - Settings
  if (youtubeCheckbox) youtubeCheckbox.addEventListener('change', () => saveSettings(s => s.youtube = youtubeCheckbox.checked));
  if (recommendationsCheckbox) recommendationsCheckbox.addEventListener('change', () => saveSettings(s => { s.toggleRecommendations = recommendationsCheckbox.checked; if (recommendationsCheckbox.checked) s.youtube = true; }));
  if (toggleHomeFeedCheckbox) toggleHomeFeedCheckbox.addEventListener('change', () => saveSettings(s => { s.toggleHomeFeed = toggleHomeFeedCheckbox.checked; if (toggleHomeFeedCheckbox.checked) s.youtube = true; }));
  if (toggleCommentsCheckbox) toggleCommentsCheckbox.addEventListener('change', () => saveSettings(s => { s.toggleComments = toggleCommentsCheckbox.checked; if (toggleCommentsCheckbox.checked) s.youtube = true; }));
  if (toggleShortsCheckbox) toggleShortsCheckbox.addEventListener('change', () => saveSettings(s => { s.toggleShorts = toggleShortsCheckbox.checked; if (toggleShortsCheckbox.checked) s.youtube = true; }));
  if (grayThumbnailsCheckbox) grayThumbnailsCheckbox.addEventListener('change', () => saveSettings(s => { s.grayThumbnails = grayThumbnailsCheckbox.checked; if (grayThumbnailsCheckbox.checked) { s.youtube = true; s.hideThumbnails = false; } }));
  if (hideThumbnailsCheckbox) hideThumbnailsCheckbox.addEventListener('change', () => saveSettings(s => { s.hideThumbnails = hideThumbnailsCheckbox.checked; if (hideThumbnailsCheckbox.checked) { s.youtube = true; s.grayThumbnails = false; } }));

  if (instagramCheckbox) instagramCheckbox.addEventListener('change', () => saveSettings(s => s.instagram = instagramCheckbox.checked));
  if (toggleExploreFeedCheckbox) toggleExploreFeedCheckbox.addEventListener('change', () => saveSettings(s => { s.toggleExploreFeed = toggleExploreFeedCheckbox.checked; if (toggleExploreFeedCheckbox.checked) s.instagram = true; }));
  if (toggleReelsFeedCheckbox) toggleReelsFeedCheckbox.addEventListener('change', () => saveSettings(s => { s.toggleReelsFeed = toggleReelsFeedCheckbox.checked; if (toggleReelsFeedCheckbox.checked) s.instagram = true; }));
  if (toggleForYouPageCheckbox) toggleForYouPageCheckbox.addEventListener('change', () => saveSettings(s => { s.toggleForYouPage = toggleForYouPageCheckbox.checked; if (toggleForYouPageCheckbox.checked) s.instagram = true; }));
  if (toggleSearchButtonCheckbox) toggleSearchButtonCheckbox.addEventListener('change', () => saveSettings(s => { s.toggleSearchButton = toggleSearchButtonCheckbox.checked; if (toggleSearchButtonCheckbox.checked) s.instagram = true; }));

  // Listeners - Study Mode
  if (studyModeToggle) studyModeToggle.addEventListener('change', (e) => { studyMode.enabled = e.target.checked; saveStudyMode(); });
  if (blockSocialToggle) blockSocialToggle.addEventListener('change', (e) => { studyMode.blockSocial = e.target.checked; saveStudyMode(); });
  if (blockVideoToggle) blockVideoToggle.addEventListener('change', (e) => { studyMode.blockVideo = e.target.checked; saveStudyMode(); });
  if (requireTriggerTabToggle) requireTriggerTabToggle.addEventListener('change', (e) => { studyMode.requireTriggerTab = e.target.checked; saveStudyMode(); });
  if (studyTriggersInput) studyTriggersInput.addEventListener('input', (e) => {
    studyMode.triggers = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
    saveStudyMode();
  });

  if (addCustomSiteBtn && customSiteInput) {
    addCustomSiteBtn.addEventListener('click', () => {
      const val = (customSiteInput.value || '').trim();
      if (!val) return;
      if (!Array.isArray(studyMode.customBlocked)) studyMode.customBlocked = [];
      studyMode.customBlocked.push(val);
      customSiteInput.value = '';
      saveStudyMode();
      renderCustomSites();
    });
  }

  loadAll();
});
