import HtmlBuilder from './src/HtmlBuilder.js';
import BloomFilter from './src/BloomFilter.js';
import PromptController from './src/PromptController.js';
import Journey from './src/Journey.js';
import draw from './src/Draw.js';

window.DEBUG = false;

let prompt;
let bloomFilter;
let htmlBuilder;

function awake()
{
    prompt = new PromptController();
    bloomFilter = new BloomFilter();
    htmlBuilder = new HtmlBuilder(bloomFilter, prompt);
    
    draw.renderBitList(bloomFilter.bitArray);
}

window.addEventListener('DOMContentLoaded', () => {
    awake();
    if (window.DEBUG) {
        window.htmlBuilder = htmlBuilder;
        window.bloomFilter = bloomFilter;
    }
});

window.addEventListener('refreshUI', () => {
    htmlBuilder.setInfoLabels();
});
