import HtmlBuilder from './src/HtmlBuilder.js';
import BloomFilter from './src/BloomFilter.js';

window.DEBUG = true;

const bloomFilter = new BloomFilter();
const htmlBuilder = new HtmlBuilder(bloomFilter);

window.addEventListener('DOMContentLoaded', () => {
    if (window.DEBUG) {
        window.htmlBuilder = htmlBuilder;
        window.bloomFilter = bloomFilter;
    }
});

window.addEventListener('refreshUI', () => {
    htmlBuilder.setInfoLabels();
});
