import HtmlBuilder from "./src/HtmlBuilder.js";
import BloomFilter from "./src/BloomFilter.js";
import CodeExecutor from "./src/CodeExecutor.js";

window.DEBUG = true;

const codeExecutor = new CodeExecutor();
const bloomFilter = new BloomFilter();
const htmlBuilder = new HtmlBuilder(bloomFilter);

window.addEventListener("DOMContentLoaded", () => {
  if (window.DEBUG) {
    window.htmlBuilder = htmlBuilder;
    window.bloomFilter = bloomFilter;
    window.codeExecutor = codeExecutor;
  }
});

window.addEventListener("refreshUI", () => {
  htmlBuilder.setInfoLabels();
});
