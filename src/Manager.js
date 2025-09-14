import { prompt } from "./Prompt.js";
import { draw } from "./Draw.js";
import i18next from "i18next";
import BloomFilter from "./BloomFilter/BloomFilter.js";
import AddItemJourney from "./BloomFilter/AddItemJourney.js";
import CheckItemJourney from "./BloomFilter/CheckItemJourney.js";

export default class Manager {
    constructor() {

        if (Manager._instance) {
            return Manager._instance;
        }
        Manager._instance = this;

        this.bf = new BloomFilter();
        this.prompt = prompt;
        this.nextStepButton = document.getElementById('next-step-button');
        this.finishButton = document.getElementById('finish-journey-button');
        this.fastForwardCheckbox = document.getElementById('fast-forward-checkbox');
        this.nextStep = false;
        this.fastForward = true;
        this.direction = 'next';
        this.messages = i18next.t(`messages`, { returnObjects: true });
        this.initListeners();
    }

    async addItem(item) {
        let journey = new AddItemJourney();
        journey.build(item);
        await journey.execute();
    }

    async checkItem(item) {
        let journey = new CheckItemJourney();
        journey.build(item);
        await journey.execute();
    }

    async waitForUser() {

        this.finishButton.disabled = false;

        if (this.fastForward) return this.direction;

        let nextButton = document.getElementById('next-step-button');
        let prevButton = document.getElementById('prev-step-button');

        nextButton.style.backgroundColor = '#4aff50ff';
        nextButton.style.color = 'black';
        nextButton.style.fontWeight = 'bold';

        prevButton.style.backgroundColor = '#fb4a3dff';
        prevButton.style.color = 'black';
        prevButton.style.fontWeight = 'bold';

        while (!this.nextStep) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        nextButton.style.backgroundColor = '';
        nextButton.style.color = '';
        nextButton.style.fontWeight = '';

        prevButton.style.color = '';
        prevButton.style.fontWeight = '';
        prevButton.style.backgroundColor = '';

        this.nextStep = false;
        return this.direction;
    }

    #copyDummyWord(words) {
        if (words.length === 0) return;

        let check = document.getElementById('check-item-input');
        check.value = words[0]
    }


    addDummyWords(words) {
        if (words.length == 0) return;

        this.#copyDummyWord(words);

        for (let word of words) {
            for(let i = 0; i < this.bf.hashCount; i++) {
                let position = this.bf.hash(word, i);
                this.bf.bitArray[position] = true;
                this.bf.elements.push(word) || this.bf.elements.push(word);
                draw.renderBitList(this.bf.bitArray);
                draw.drawTextBox(word, position);
            }
        }
    }

    initListeners() {
        this.nextStepButton.addEventListener('click', () => {
            this.nextStep = true;
        });

        this.finishButton.addEventListener('click', () => {
            this.fastForward = true;
            this.nextStep = true;
            this.direction = 'next';
        });

        window.addEventListener('journey-finished', () => {
            this.fastForward = !this.fastForwardCheckbox.checked;
            this.prompt.print("Finished execution.");
            this.prompt.newLine();
        });

        this.fastForward = !this.fastForwardCheckbox.checked;

        this.fastForwardCheckbox.addEventListener('change', () => {
            this.fastForward = !this.fastForwardCheckbox.checked;
            if (this.fastForward) {
                this.prompt.print("Step by step execution will be fast forwarded.");
            } else {
                this.prompt.print("Step by step execution is enabled.");
            }
        });

        const nextButton = document.getElementById('next-step-button');
        const prevButton = document.getElementById('prev-step-button');

        nextButton.addEventListener('click', () => {
            this.direction = 'next';
            this.nextStep = true;
        });

        prevButton.addEventListener('click', () => {
            this.direction = 'back';
            this.nextStep = true;
        });
    }

    redrawGraphics() {
        draw.renderBitList(this.bf.bitArray);
        draw.redrawLines();
    }

};

const managerInstance = new Manager();
export { managerInstance };