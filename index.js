import HtmlBuilder from './src/HtmlBuilder.js';
import Manager from './src/Manager.js';
import { Util } from './src/Util.js';
import Prompt from './src/Prompt.js';
import { initializeLocales } from './src/InitializeLocales.js';
import { applyLocales } from './src/ApplyLocales.js';

window.DEBUG = false;

let htmlBuilder;
let manager;
let util;
let prompt;

async function awake() {
    // pick saved language or default to en
    const saved = localStorage.getItem('locale') || 'en';
    await initializeLocales(saved);
    // apply the translations to the static HTML
    applyLocales(document);
    util = new Util();
    manager = new Manager();
    htmlBuilder = new HtmlBuilder();
    prompt = new Prompt();
}

// Theme initialization: default is dark; if user previously chose light, apply it
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const isLight = savedTheme === 'light';
    if (isLight) document.documentElement.classList.add('theme-light');
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
        toggle.setAttribute('aria-pressed', isLight ? 'true' : 'false');
        toggle.addEventListener('click', () => {
            const nowLight = document.documentElement.classList.toggle('theme-light');
            localStorage.setItem('theme', nowLight ? 'light' : 'dark');
            toggle.setAttribute('aria-pressed', nowLight ? 'true' : 'false');
            try {
                if (typeof manager !== 'undefined' && manager && typeof manager.redrawGraphics === 'function') {
                    manager.redrawGraphics();
                }
            } catch (e) {
                console.warn('Failed to redraw graphics after theme toggle', e);
            }
        });
    }
    // redraw on initial theme application so drawings match theme
    try {
        if (isLight && typeof manager !== 'undefined' && manager && typeof manager.redrawGraphics === 'function') {
            manager.redrawGraphics();
        }
    } catch (e) {
        console.warn('Failed to redraw graphics after initial theme apply', e);
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    await awake();

    initTheme();

    // Ensure footer is a direct child of <body> so it's not hidden when tab containers are toggled
    (function ensureFooterPlacement() {
        const footer = document.querySelector('.site-footer');
        if (!footer) return;
        if (footer.parentElement !== document.body) {
            try {
                document.body.appendChild(footer);
            } catch (e) {
                console.warn('Could not move footer to body', e);
            }
        }
        // force visible inline styles
        footer.style.display = 'flex';
        footer.style.visibility = 'visible';
        footer.style.opacity = '1';
        footer.style.pointerEvents = 'auto';
    })();

    manager.bf.initialize(100, 3);
    manager.redrawGraphics();
    htmlBuilder.setInfoLabels();

    greetings();
    let pseudoCode = `// select a routine\nreturn`;
    prompt.initPseudoCode(pseudoCode);
    await prompt.simulatePseudoCode();
    // wire responsive tab select
    const tabSelect = document.getElementById('tab-select');
    if (tabSelect) {
        tabSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            const id = val === 'simulator' ? 'simulator-tab' : (val === 'spell-checker' ? 'spell-checker-tab' : val + '-tab');
            const btn = document.getElementById(id);
            if (btn) btn.click();
        });

        // keep select in sync when tabs are clicked
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', () => {
                const mapping = {
                    'simulator-tab': 'simulator',
                    'theory-tab': 'theory',
                    'spell-checker-tab': 'spell-checker',
                    'about-tab': 'about'
                };
                const v = mapping[btn.id];
                if (v) tabSelect.value = v;
            });
        });
    }

    // language selector wiring
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
        // set current value
        const current = (window.i18next && window.i18next.language) ? window.i18next.language : 'en';
        langSelect.value = current;
        langSelect.addEventListener('change', async (e) => {
            const newLang = e.target.value;
            try {
                await window.i18next.changeLanguage(newLang);
            } catch (err) {
                console.warn('Failed to change language', err);
            }
            localStorage.setItem('locale', newLang);
            applyLocales(document);
        });
    }

    // monitor footer presence — if something removes or hides it, reattach and log for debugging
    (function monitorFooter(){
        const footer = document.querySelector('.site-footer');
        if (!footer) return;
        const footerPlaceholder = footer.cloneNode(true);
        const observer = new MutationObserver((mutations) => {
            const exists = document.body.contains(footer);
            if (!exists) {
                console.warn('site-footer removed from DOM — reattaching');
                try {
                    const newFooter = footerPlaceholder.cloneNode(true);
                    // ensure it's visible and interactive
                    newFooter.style.display = 'flex';
                    newFooter.style.visibility = 'visible';
                    newFooter.style.opacity = '1';
                    newFooter.style.pointerEvents = 'auto';
                    document.body.appendChild(newFooter);
                } catch (e) {
                    console.error('Failed to reattach footer', e);
                }
            } else {
                // also ensure it's visible
                const f = document.querySelector('.site-footer');
                if (f && getComputedStyle(f).display === 'none') {
                    console.warn('site-footer is hidden (display:none) — restoring display');
                    f.style.setProperty('display', 'flex', 'important');
                    f.style.visibility = 'visible';
                    f.style.opacity = '1';
                    f.style.pointerEvents = 'auto';
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    })();
});

function greetings() {
    try {
        prompt.print(window.i18next.t('ui.greetAddItem'));
        prompt.print(window.i18next.t('ui.greetNavigation'));
        prompt.print(window.i18next.t('ui.greetFastForward'));
        prompt.print(window.i18next.t('ui.greetEnjoy'));
    } catch (e) {
        prompt.print("Add an item or check if an item is in the Bloom Filter using the buttons above.");
        prompt.print("You can use the 'Next' and 'Back' buttons to step through the process.");
        prompt.print("Use the 'Fast Forward' checkbox or the 'Finish' button to skip to the end of a process.");
        prompt.print("Enjoy!");
    }
    prompt.print();
}

window.addEventListener('refreshUI', () => {
    htmlBuilder.setInfoLabels();
    manager.redrawGraphics();
});

let resizeTimeout;

window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        manager.redrawGraphics();
    }, 200);
});