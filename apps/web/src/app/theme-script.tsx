// Inline script injected before React hydration to prevent theme flash.
// Runs synchronously in <head> — no React, no hooks.
export function ThemeScript() {
  const script = `
    (function() {
      try {
        var stored = JSON.parse(localStorage.getItem('lumora-ui') || '{}');
        var theme = stored.state?.theme || 'dark';
        document.documentElement.dataset.theme = theme;
      } catch(e) {
        document.documentElement.dataset.theme = 'dark';
      }
    })();
  `
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
