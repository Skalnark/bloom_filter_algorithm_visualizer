import { Util } from './Util.js';
import { managerInstance } from './Manager.js';
import { prompt } from './Prompt.js';
import draw from './Draw.js';
import { addItemRoutine, checkItemRoutine, greetingsRoutine } from './JourneyFunctions.js';

class HtmlBuilder {
    constructor() {
        this.prompt = prompt;
        this.jm = managerInstance;
        this.initListeners();
        greetingsRoutine();
    }

    getBitSizeInputValue() {
        const input = document.getElementById('bf-bit-size-input');
        if (input) {
            if (input.value > 500) {
                this.prompt.print("Error: Bit size cannot exceed 500.", false);
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
                const hashCount = document.getElementById('bf-hash-count-input').value;

                if (bitSize < 1 || bitSize > 500)
                    document.getElementById('bf-bit-size-input').value = 1;


                if (hashCount < 1 || hashCount > 10)
                    document.getElementById('bf-hash-count-input').value = 1;

                this.jm.bf.initialize(bitSize, hashCount);

                const dummyCount = this.getDummyInputValue();
                const dummyWords = Util.getLoremWords(dummyCount);
                this.jm.addDummyWords(dummyWords);

                this.setInfoLabels();
                draw.renderBitList(this.jm.bf.bitArray);
                Util.scrollToElementById('bf-item-info-holder');
            });

        }
    }

    setInfoLabels() {
        const sizeSpan = document.getElementById('bf-info-size');
        const hashCountSpan = document.getElementById('bf-info-hash-count');
        const elementsSpan = document.getElementById('bf-info-elements');
        const fprSpan = document.getElementById('bf-info-fpr');

        sizeSpan.textContent = this.jm.bf.size;
        hashCountSpan.textContent = this.jm.bf.hashCount;
        elementsSpan.textContent = this.jm.bf.elements.length;
        fprSpan.textContent = (this.jm.bf.calculateFPR() * 100).toFixed(6) + '%';
    }

    async initAddAndCheckEventListeners() {
        const addItemButton = document.getElementById('add-item-submit');

        addItemButton.addEventListener('click', async () => {
            const itemInput = document.getElementById('add-item-input');
            const item = itemInput.value;
            if (item) {
                await addItemRoutine(item);
            }
        });

        const checkItemButton = document.getElementById('check-item-submit');
        checkItemButton.addEventListener('click', async () => {
            const itemInput = document.getElementById('check-item-input');
            const item = itemInput.value;
            if (item) {
                draw.clearCheckLines();
                await checkItemRoutine(item);
            }
        });

        const scrollButton = document.getElementById('scroll-button');
        scrollButton.addEventListener('click', () => {
            Util.scrollToPromptTextarea();
        });


        const bitSizeInput = document.getElementById("bf-bit-size-input");
        const bitSizeInfo = document.getElementById("bit-size-info");

        bitSizeInput.addEventListener("focus", () => {
            bitSizeInfo.style.display = "block";
        });

        bitSizeInput.addEventListener("blur", () => {
            bitSizeInfo.style.display = "none";
        });

        const hashCountInput = document.getElementById("bf-hash-count-input");
        const hashCountInfo = document.getElementById("hash-count-info");
        hashCountInput.addEventListener("focus", () => {
            hashCountInfo.style.display = "block";
        });

        hashCountInput.addEventListener("blur", () => {
            hashCountInfo.style.display = "none";
        });

        const dummyCountInput = document.getElementById("bf-dummy-count-input");
        const dummyCountInfo = document.getElementById("dummy-words-info");
        dummyCountInput.addEventListener("focus", () => {
            dummyCountInfo.style.display = "block";
        });

        dummyCountInput.addEventListener("blur", () => {
            dummyCountInfo.style.display = "none";
        });

    }

    initJourneyListeners() {
        window.addEventListener('journey-started', () => {
            this.disableInputs();
        });

        window.addEventListener('journey-finished', () => {
            this.enableInputs();
            this.setInfoLabels();
            this.prompt.newLine();
        });

        const nextStepButton = document.getElementById('next-step-button');
        window.addEventListener('journey-waiting-click', () => {
            nextStepButton.disabled = false;
        });

        window.addEventListener('journey-disable-click', () => {
            nextStepButton.disabled = true;
        });

        const scrollButton = document.getElementById('scroll-button');
        window.addEventListener('element-out-of-view', () => {
            scrollButton.style.display = 'block';
        });
    }

    disableInputs() {
        const bitSizeInput = document.getElementById('bf-bit-size-input');
        const bitSizeSubmit = document.getElementById('bf-bit-size-submit');
        const hashCountInput = document.getElementById('bf-hash-count-input');
        const hashCountSubmit = document.getElementById('bf-hash-count-submit');
        const dummyCountInput = document.getElementById('bf-dummy-count-input');
        const dummyCountSubmit = document.getElementById('bf-dummy-count-submit');
        const addItemInput = document.getElementById('add-item-input');
        const addItemSubmit = document.getElementById('add-item-submit');
        const checkItemInput = document.getElementById('check-item-input');
        const checkItemSubmit = document.getElementById('check-item-submit');
        const inputFastForwardCheckbox = document.getElementById('fast-forward-checkbox');

        if (bitSizeInput) bitSizeInput.disabled = true;
        if (bitSizeSubmit) bitSizeSubmit.disabled = true;
        if (hashCountInput) hashCountInput.disabled = true;
        if (hashCountSubmit) hashCountSubmit.disabled = true;
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
        const hashCountInput = document.getElementById('bf-hash-count-input');
        const hashCountSubmit = document.getElementById('bf-hash-count-submit');
        const dummyCountInput = document.getElementById('bf-dummy-count-input');
        const dummyCountSubmit = document.getElementById('bf-dummy-count-submit');
        const addItemInput = document.getElementById('add-item-input');
        const addItemSubmit = document.getElementById('add-item-submit');
        const checkItemInput = document.getElementById('check-item-input');
        const checkItemSubmit = document.getElementById('check-item-submit');
        const inputFastForwardCheckbox = document.getElementById('fast-forward-checkbox');

        if (bitSizeInput) bitSizeInput.disabled = false;
        if (bitSizeSubmit) bitSizeSubmit.disabled = false;
        if (hashCountInput) hashCountInput.disabled = false;
        if (hashCountSubmit) hashCountSubmit.disabled = false;
        if (dummyCountInput) dummyCountInput.disabled = false;
        if (dummyCountSubmit) dummyCountSubmit.disabled = false;
        if (addItemInput) addItemInput.disabled = false;
        if (addItemSubmit) addItemSubmit.disabled = false;
        if (checkItemInput) checkItemInput.disabled = false;
        if (checkItemSubmit) checkItemSubmit.disabled = false;
        if (inputFastForwardCheckbox) inputFastForwardCheckbox.disabled = false;
    }
}

export default HtmlBuilder;

