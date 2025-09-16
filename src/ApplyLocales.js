import i18next from 'i18next';

export function applyLocales(root = document) {
  // apply simple translations for elements with data-i18n
  root.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    try {
      const text = i18next.t(key);
      if (text) {
        el.innerText = text;
      }
    } catch (e) {
      // ignore
    }
  });

  // apply placeholders
  root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    try {
      const text = i18next.t(key);
      if (text && ('placeholder' in el)) {
        el.placeholder = text;
      }
    } catch (e) {
      // ignore
    }
  });

  // apply values
  root.querySelectorAll('[data-i18n-value]').forEach(el => {
    const key = el.getAttribute('data-i18n-value');
    try {
      const text = i18next.t(key);
      if (text && ('value' in el)) {
        el.value = text;
      }
    } catch (e) {
      // ignore
    }
  });
}
