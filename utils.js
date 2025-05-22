// Zentrale Hilfsfunktionen für die Extension

/**
 * Setzt das Theme (dark/light) für die Extension und speichert es im localStorage.
 * @param {boolean} dark - true für Dark Mode, false für Light Mode
 */
export function setTheme(dark) {
  if (dark) {
    document.body.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.checked = true;
  } else {
    document.body.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.checked = false;
  }
}

/**
 * Initialisiert das Theme beim Laden der Seite.
 */
export function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    setTheme(true);
  } else {
    setTheme(false);
  }
  if (themeToggle) {
    themeToggle.addEventListener('change', (e) => {
      setTheme(e.target.checked);
    });
  }
}
