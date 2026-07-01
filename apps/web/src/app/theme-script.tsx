// Inline script injected before React hydration to prevent theme/accent flash.
// Runs synchronously in <head> — no React, no hooks.
export function ThemeScript() {
  const script = `
    (function() {
      try {
        var stored = JSON.parse(localStorage.getItem('lumora-ui') || '{}');
        var state = stored.state || {};
        var theme = state.theme || 'dark';
        document.documentElement.dataset.theme = theme;
        if (state.accent && state.accent !== 'violet') {
          document.documentElement.dataset.accent = state.accent;
        }
      } catch(e) {
        document.documentElement.dataset.theme = 'dark';
      }
    })();
  `
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
