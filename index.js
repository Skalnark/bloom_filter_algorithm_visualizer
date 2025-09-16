import HtmlBuilder from './src/HtmlBuilder.js';
import Manager from './src/Manager.js';
import { Util } from './src/Util.js';
import Prompt from './src/Prompt.js';

window.DEBUG = false;

let htmlBuilder;
let manager;
let util;
let prompt;

async function awake() {
    //await initializeLocales();
    util = new Util();
    manager = new Manager();
    htmlBuilder = new HtmlBuilder();
    prompt = new Prompt();
}

window.addEventListener('DOMContentLoaded', async () => {
    await awake();

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
});

function greetings() {
    prompt.print("Add an item or check if an item is in the Bloom Filter using the buttons above.");
    prompt.print("You can use the 'Next' and 'Back' buttons to step through the process.");
    prompt.print("Use the 'Fast Forward' checkbox or the 'Finish' button to skip to the end of a process.");
    prompt.print("Enjoy!");
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