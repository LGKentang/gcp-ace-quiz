// Apply the saved colour theme before first paint to avoid a flash.
// (Kept as a separate file so the server's Content-Security-Policy can forbid inline scripts.)
try {
  var t = localStorage.getItem('acePrep.theme');
  if (!t) {
    var legacy = JSON.parse(localStorage.getItem('acePrep.v1') || '{}');
    t = legacy && legacy.prefs && legacy.prefs.theme;
  }
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
} catch (e) { /* ignore */ }
