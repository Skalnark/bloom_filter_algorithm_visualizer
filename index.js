import HtmlBuilder from './src/HtmlBuilder.js';
import BloomFilter from './src/BloomFilter.js';
import Prompt from './src/PromptController.js';
import draw from './src/Draw.js';
import { initializeLocales } from './src/InitializeLocales.js';
import Manager from './src/JourneyManager.js';
import Parser from './src/Parser.js';

window.DEBUG = false;

let prompt;
let bloomFilter;
let htmlBuilder;
let i18next;
let journeyManager;
const parser = new Parser();

async function awake() {
    prompt = new Prompt();
    i18next = await initializeLocales();
    htmlBuilder = new HtmlBuilder();
    journeyManager = new Manager(prompt, bloomFilter);
}

window.addEventListener('DOMContentLoaded', async () => {
    await awake();

    await initializeLocales();
});

window.addEventListener('refreshUI', () => {
    htmlBuilder.setInfoLabels();
});


export { prompt, bloomFilter, i18next, journeyManager };