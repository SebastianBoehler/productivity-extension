// Site lists are centralized in sites.js and used by the background
// service worker to build blocking rules. No lists are maintained here.

// Study mode state
let studyMode = {
  enabled: false,
  blockSocial: true,
  blockVideo: true,
  triggers: []
};

// Load settings from storage
function loadStudyModeSettings() {
  chrome.storage.sync.get(['studyMode'], (result) => {
    if (result.studyMode) {
      studyMode = result.studyMode;
    }
    updateUI();
  });
}

// Save settings to storage
function saveStudyModeSettings() {
  chrome.storage.sync.set({ studyMode }, () => {
    // Notify background script
    chrome.runtime.sendMessage({
      action: 'studyModeChanged',
      settings: studyMode
    });
  });
}

// Update UI based on current settings
function updateUI() {
  const studyModeToggle = document.getElementById('studyMode');
  const blockSocialToggle = document.getElementById('blockSocial');
  const blockVideoToggle = document.getElementById('blockVideo');
  const studyTriggersInput = document.getElementById('studyTriggers');
  const studyModeSettings = document.getElementById('studyModeSettings');

  if (studyModeToggle) studyModeToggle.checked = studyMode.enabled;
  if (blockSocialToggle) blockSocialToggle.checked = studyMode.blockSocial;
  if (blockVideoToggle) blockVideoToggle.checked = studyMode.blockVideo;
  if (studyTriggersInput) studyTriggersInput.value = studyMode.triggers.join(', ');
  if (studyModeSettings) studyModeSettings.style.display = studyMode.enabled ? 'block' : 'none';
}

// Initialize event listeners
function initStudyMode() {
  // Load initial settings
  loadStudyModeSettings();
  
  // Study mode toggle
  const studyModeToggle = document.getElementById('studyMode');
  if (studyModeToggle) {
    studyModeToggle.addEventListener('change', (e) => {
      studyMode.enabled = e.target.checked;
      updateUI();
      saveStudyModeSettings();
    });
  }
  
  // Block settings
  const blockSocialToggle = document.getElementById('blockSocial');
  if (blockSocialToggle) {
    blockSocialToggle.addEventListener('change', (e) => {
      studyMode.blockSocial = e.target.checked;
      saveStudyModeSettings();
    });
  }
  
  const blockVideoToggle = document.getElementById('blockVideo');
  if (blockVideoToggle) {
    blockVideoToggle.addEventListener('change', (e) => {
      studyMode.blockVideo = e.target.checked;
      saveStudyModeSettings();
    });
  }
  
  // Study triggers input
  const studyTriggersInput = document.getElementById('studyTriggers');
  if (studyTriggersInput) {
    studyTriggersInput.addEventListener('input', (e) => {
      studyMode.triggers = e.target.value
        .split(',')
        .map(trigger => trigger.trim())
        .filter(trigger => trigger.length > 0);
      saveStudyModeSettings();
    });
  }
}

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', initStudyMode);
