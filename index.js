import draw from './src/Draw.js';
import HtmlBuilder from './src/HtmlBuilder.js';
import Manager from './src/Manager.js';
import { initializeLocales } from './src/InitializeLocales.js';

window.DEBUG = false;

let htmlBuilder;
let manager;

async function awake() {
    await initializeLocales();
    htmlBuilder = new HtmlBuilder();
    manager = new Manager();
}

window.addEventListener('DOMContentLoaded', async () => {
    await awake();

    await initializeLocales();
});

window.addEventListener('refreshUI', () => {
    htmlBuilder.setInfoLabels();
    manager.redrawGraphics();
});

let resizeTimeout;

window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Call your function here
        manager.redrawGraphics();
        // Example: yourFunction();
    }, 200); // Adjust the delay as needed
});