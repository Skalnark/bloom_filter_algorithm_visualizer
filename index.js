import HtmlBuilder from './src/HtmlBuilder.js';
import { initializeLocales } from './src/InitializeLocales.js';

window.DEBUG = false;

let htmlBuilder;

async function awake() {
    await initializeLocales();
    htmlBuilder = new HtmlBuilder();
}

window.addEventListener('DOMContentLoaded', async () => {
    await awake();

    await initializeLocales();
});

window.addEventListener('refreshUI', () => {
    htmlBuilder.setInfoLabels();
});