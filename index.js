import HtmlBuilder from './src/HtmlBuilder.js';
import BloomFilter from './src/BloomFilter.js';
import PromptController from './src/PromptController.js';
import draw from './src/Draw.js';
import { initializeLocales } from './src/InitializeLocales.js';
import JourneyManager from './src/JourneyManager.js';
import Parser from './src/Parser.js';

window.DEBUG = false;

let prompt;
let bloomFilter;
let htmlBuilder;
let i18next;
let journeyManager;
const parser = new Parser();

async function awake() {
    prompt = new PromptController();
    bloomFilter = new BloomFilter();
    i18next = await initializeLocales();
    htmlBuilder = new HtmlBuilder(bloomFilter, prompt);
    journeyManager = new JourneyManager(prompt, bloomFilter);

    draw.renderBitList(bloomFilter.bitArray);
    journeyManager.greetingsJourney();
}

window.addEventListener('DOMContentLoaded', async () => {
    await awake();

    await initializeLocales();
});

window.addEventListener('refreshUI', () => {
    htmlBuilder.setInfoLabels();
});


export { prompt, bloomFilter, i18next, journeyManager };