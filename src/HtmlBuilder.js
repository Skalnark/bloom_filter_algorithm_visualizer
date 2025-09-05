import { Util } from "./Util.js";
import { BloomFilter } from "./BloomFilter.js";

class HtmlBuilder {
  constructor(bf) {
    this.bf = bf;
    this.initListeners();
  }

  getBitSizeInputValue() {
    const input = document.getElementById("bf-bit-size-input");
    if (input) {
      return input.value;
    }
    return null;
  }

  getDummyInputValue() {
    const input = document.getElementById("bf-dummy-count-input");
    if (input) {
      return input.value;
    }
    return null;
  }

  initListeners() {
    this.submitFilterParams();
    this.setInfoLabels();
  }

  submitFilterParams() {
    const button = document.getElementById("bf-bit-size-submit");
    if (button) {
      button.addEventListener("click", () => {
        const bitSize = this.getBitSizeInputValue();

        this.bf = new BloomFilter(bitSize);
      });
    }
  }

  setInfoLabels() {
    const sizeSpan = document.getElementById("bf-info-size");
    const hashCountSpan = document.getElementById("bf-info-hash-count");
    const elementsSpan = document.getElementById("bf-info-elements");
    const fprSpan = document.getElementById("bf-info-fpr");

    const size = this.bf.size;
    const hashCount = this.bf.hashCount;
    const elements = this.bf.elements.length;
    const fpr = this.bf.calculateFPR();

    if (!(fpr !== undefined || fpr !== null || fpr !== NaN)) fpr = "-";

    if (sizeSpan) sizeSpan.textContent = size;
    if (hashCountSpan) hashCountSpan.textContent = hashCount;
    if (elementsSpan) elementsSpan.textContent = elements;
    if (fprSpan) fprSpan.textContent = fpr;
  }
}

export default HtmlBuilder;
