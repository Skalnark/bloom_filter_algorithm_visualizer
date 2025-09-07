import { Util } from './Util.js';
import { BloomFilter } from './BloomFilter.js';
import { prompt } from './PromptController.js';
import { Journey } from './Journey.js';
import draw from './Draw.js';

class HtmlBuilder {
    constructor(bf, promptController) {
        this.bf = bf;
        this.promptTextarea = document.getElementById('prompt-textarea');
        this.promptController = promptController;
        this.promptController.setTextarea(this.promptTextarea);
        this.journey = new Journey(this.bf, this.promptController);
        this.initListeners();
    }

    getBitSizeInputValue() {
        const input = document.getElementById('bf-bit-size-input');
        if (input) {
            return input.value;
        }
        return null;
    }

    getDummyInputValue() {
        const input = document.getElementById('bf-dummy-count-input');
        if (input) {
            return input.value;
        }
        return null;
    }

    initListeners() {
        this.submitFilterParams();
        this.setInfoLabels();
        this.initAddAndCheckEventListeners();
        this.initJourneyListeners();
    }

    submitFilterParams() {
        const button = document.getElementById('bf-bit-size-submit');
        if (button) {
            button.addEventListener('click', () => {
                const bitSize = this.getBitSizeInputValue();

                this.bf.initialize(bitSize);
                this.setInfoLabels();
                draw.renderBitList(this.bf.bitArray);
            });

        }
    }

    setInfoLabels() {
        const sizeSpan = document.getElementById('bf-info-size');
        const hashCountSpan = document.getElementById('bf-info-hash-count');
        const elementsSpan = document.getElementById('bf-info-elements');
        const fprSpan = document.getElementById('bf-info-fpr');

        const size = this.bf.size;
        const hashCount = this.bf.hashCount;
        const elements = this.bf.elements.length;
        const fpr = (this.bf.calculateFPR() * 100).toFixed(6);

        if (!(fpr !== undefined || fpr !== null || fpr !== NaN)) fpr = '-';

        if (sizeSpan) sizeSpan.textContent = size;
        if (hashCountSpan) hashCountSpan.textContent = hashCount;
        if (elementsSpan) elementsSpan.textContent = elements;
        if (fprSpan) fprSpan.textContent = fpr + '%';
    }

    initAddAndCheckEventListeners() {
        const addItemButton = document.getElementById('add-item-submit');

        addItemButton.addEventListener('click', () => {
            const itemInput = document.getElementById('add-item-input');
            const item = itemInput.value;
            if (item) {
                this.journey.addItemStepByStep(item);
            }
        });

        const checkItemButton = document.getElementById('check-item-submit');
        checkItemButton.addEventListener('click', () => {
            const itemInput = document.getElementById('check-item-input');
            const item = itemInput.value;
            if (item) {
                this.journey.checkItemStepByStep(item);
            }
        });
    }

    initJourneyListeners() {
        window.addEventListener('journey-started', () => {
            this.disableInputs();
            console.log("Journey started, inputs disabled.");
        });

        window.addEventListener('journey-finished', () => {
            this.enableInputs();
            this.setInfoLabels();
            console.log("Journey finished, inputs enabled.");
        });

        window.addEventListener('journey-waiting-click', () => {
            this.enableNextStepButton();
        });

        window.addEventListener('journey-disable-click', () => {
            this.disableNextStepButton();
        });
    }

    disableInputs() {
        const bitSizeInput = document.getElementById('bf-bit-size-input');
        const bitSizeSubmit = document.getElementById('bf-bit-size-submit');
        const dummyCountInput = document.getElementById('bf-dummy-count-input');
        const dummyCountSubmit = document.getElementById('bf-dummy-count-submit');
        const addItemInput = document.getElementById('add-item-input');
        const addItemSubmit = document.getElementById('add-item-submit');
        
        if (bitSizeInput) bitSizeInput.disabled = true;
        if (bitSizeSubmit) bitSizeSubmit.disabled = true;
        if (dummyCountInput) dummyCountInput.disabled = true;
        if (dummyCountSubmit) dummyCountSubmit.disabled = true;
        if (addItemInput) addItemInput.disabled = true;
        if (addItemSubmit) addItemSubmit.disabled = true;
    }

    enableInputs() {
        const bitSizeInput = document.getElementById('bf-bit-size-input');
        const bitSizeSubmit = document.getElementById('bf-bit-size-submit');
        const dummyCountInput = document.getElementById('bf-dummy-count-input');
        const dummyCountSubmit = document.getElementById('bf-dummy-count-submit');
        const addItemInput = document.getElementById('add-item-input');
        const addItemSubmit = document.getElementById('add-item-submit');
        
        if (bitSizeInput) bitSizeInput.disabled = false;
        if (bitSizeSubmit) bitSizeSubmit.disabled = false;
        if (dummyCountInput) dummyCountInput.disabled = false;
        if (dummyCountSubmit) dummyCountSubmit.disabled = false;
        if (addItemInput) addItemInput.disabled = false;
        if (addItemSubmit) addItemSubmit.disabled = false;
    }

    disableNextStepButton() {
        const nextStepButton = document.getElementById('next-step-button');
        if (nextStepButton) nextStepButton.disabled = true;
    }

    enableNextStepButton() {
        const nextStepButton = document.getElementById('next-step-button');
        if (nextStepButton) nextStepButton.disabled = false;
    }
}

export default HtmlBuilder;

