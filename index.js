import HtmlBuilder from './src/HtmlBuilder.js';
import BloomFilter from './src/BloomFilter.js';
import PromptController from './src/PromptController.js';
import draw from './src/Draw.js';
import { initializeLocales } from './src/InitializeLocales.js';

window.DEBUG = false;

let prompt;
let bloomFilter;
let htmlBuilder;

function awake() {
    prompt = new PromptController();
    bloomFilter = new BloomFilter();
    initializeLocales();
    htmlBuilder = new HtmlBuilder(bloomFilter, prompt);

    draw.renderBitList(bloomFilter.bitArray);
}

window.addEventListener('DOMContentLoaded', () => {
    awake();
});

window.addEventListener('refreshUI', () => {
    htmlBuilder.setInfoLabels();
});
