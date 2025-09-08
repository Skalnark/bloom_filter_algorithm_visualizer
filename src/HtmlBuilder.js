import { Util } from './Util.js';
import { Journey } from './Journey.js';
import draw from './Draw.js';

class HtmlBuilder {
    constructor(bf, promptController) {
        this.bf = bf;
        this.promptTextarea = document.getElementById('prompt-window');
        this.promptController = promptController;
        this.promptController.setTextarea(this.promptTextarea);
        this.journey = new Journey(this.bf, this.promptController);
        this.initListeners();
    }

    getBitSizeInputValue() {
        const input = document.getElementById('bf-bit-size-input');
        if (input) {
            if(input.value > 500) {
                this.promptController.print("Error: Bit size cannot exceed 500.", false);
                input.value = 500;
            }
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
                
                const dummyCount = this.getDummyInputValue();
                const dummyWords = Util.getLoremWords(dummyCount);
                this.journey.addDummyWords(dummyWords);

                this.setInfoLabels();
                draw.renderBitList(this.bf.bitArray);
                Util.scrollToElementById('bf-item-info-holder');
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

        const scrollButton = document.getElementById('scroll-button');
        scrollButton.addEventListener('click', () => {
            Util.scrollToPromptTextarea();
        });
    }

    initJourneyListeners() {
        window.addEventListener('journey-started', () => {
            this.disableInputs();
        });

        window.addEventListener('journey-finished', () => {
            this.enableInputs();
            this.setInfoLabels();
        });

        window.addEventListener('journey-waiting-click', () => {
            this.enableNextStepButton();
        });

        window.addEventListener('journey-disable-click', () => {
            this.disableNextStepButton();
        });

        window.addEventListener('element-out-of-view', () => {
            const scrollButton = document.getElementById('scroll-button');
            scrollButton.style.display = 'block';
        });
    }

    disableInputs() {
        const bitSizeInput = document.getElementById('bf-bit-size-input');
        const bitSizeSubmit = document.getElementById('bf-bit-size-submit');
        const dummyCountInput = document.getElementById('bf-dummy-count-input');
        const dummyCountSubmit = document.getElementById('bf-dummy-count-submit');
        const addItemInput = document.getElementById('add-item-input');
        const addItemSubmit = document.getElementById('add-item-submit');
        const checkItemInput = document.getElementById('check-item-input');
        const checkItemSubmit = document.getElementById('check-item-submit');
        const inputFastForwardCheckbox = document.getElementById('fast-forward-checkbox');
        
        if (bitSizeInput) bitSizeInput.disabled = true;
        if (bitSizeSubmit) bitSizeSubmit.disabled = true;
        if (dummyCountInput) dummyCountInput.disabled = true;
        if (dummyCountSubmit) dummyCountSubmit.disabled = true;
        if (addItemInput) addItemInput.disabled = true;
        if (addItemSubmit) addItemSubmit.disabled = true;
        if (checkItemInput) checkItemInput.disabled = true;
        if (checkItemSubmit) checkItemSubmit.disabled = true;
        if (inputFastForwardCheckbox) inputFastForwardCheckbox.disabled = true;
    }

    enableInputs() {
        const bitSizeInput = document.getElementById('bf-bit-size-input');
        const bitSizeSubmit = document.getElementById('bf-bit-size-submit');
        const dummyCountInput = document.getElementById('bf-dummy-count-input');
        const dummyCountSubmit = document.getElementById('bf-dummy-count-submit');
        const addItemInput = document.getElementById('add-item-input');
        const addItemSubmit = document.getElementById('add-item-submit');
        const checkItemInput = document.getElementById('check-item-input');
        const checkItemSubmit = document.getElementById('check-item-submit');
        const inputFastForwardCheckbox = document.getElementById('fast-forward-checkbox');
        
        if (bitSizeInput) bitSizeInput.disabled = false;
        if (bitSizeSubmit) bitSizeSubmit.disabled = false;
        if (dummyCountInput) dummyCountInput.disabled = false;
        if (dummyCountSubmit) dummyCountSubmit.disabled = false;
        if (addItemInput) addItemInput.disabled = false;
        if (addItemSubmit) addItemSubmit.disabled = false;
        if (checkItemInput) checkItemInput.disabled = false;
        if (checkItemSubmit) checkItemSubmit.disabled = false;
        if (inputFastForwardCheckbox) inputFastForwardCheckbox.disabled = false;
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

