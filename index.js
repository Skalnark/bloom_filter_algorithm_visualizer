import HtmlBuilder from './src/HtmlBuilder.js';
import Manager from './src/Manager.js';
import { initializeLocales } from './src/InitializeLocales.js';
import { greetingsRoutine } from './src/JourneyFunctions.js';

window.DEBUG = false;

let htmlBuilder;
let manager;

async function awake() {
    //await initializeLocales();
    manager = new Manager();
    htmlBuilder = new HtmlBuilder();
}

window.addEventListener('DOMContentLoaded', async () => {
    await awake();

    //await initializeLocales();
});

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