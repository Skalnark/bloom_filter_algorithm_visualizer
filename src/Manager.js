import { prompt } from "./Prompt.js";
import { draw } from "./Draw.js";
import { Util } from "./Util.js";
import Journey from "./Journey.js";
import Parser from "./Parser.js";
import i18next from "i18next";
import BloomFilter from "./BloomFilter.js";

class Manager {
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
        this.messages = i18next.t(`messages`, { returnObjects: true });
        this.initListeners();
        this.greetingsJourney();
    }

    async waitForUser() {
        if (this.fastForward) {
            return new Promise(resolve => resolve());
        }

        Util.scrollToElementById('prompt-simulator');
        this.nextStep = false;
        this.nextStepButton.style.backgroundColor = '#a71212ff';
        while (!this.nextStep) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.nextStepButton.style.backgroundColor = '#181f1aff';
    }

    #copyDummyWord(words) {
        if (words.length === 0) return;

        let add = document.getElementById('add-item-input');
        let check = document.getElementById('check-item-input');
        add.value = words[0]
        check.value = words[0]
    }


    addDummyWords(words) {
        if (words.length == 0) return;

        this.#copyDummyWord(words);

        for (let word of words) {
            let hash1 = this.bf.hash1(word);
            let hash2 = this.bf.hash2(word);
            let hash3 = this.bf.hash3(word);

            this.bf.bitArray[hash1] = true;
            this.bf.bitArray[hash2] = true;
            this.bf.bitArray[hash3] = true;

            this.bf.elements.push(word);

            draw.renderBitList(this.bf.bitArray);
            draw.drawTextBox(word, hash1);
            draw.drawTextBox(word, hash2);
            draw.drawTextBox(word, hash3);
        }
    }

    initListeners() {
        this.nextStepButton.addEventListener('click', () => {
            this.nextStep = true;
        });

        this.finishButton.addEventListener('click', () => {
            this.fastForward = true;
            this.nextStep = true;
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
    }

    async greetingsJourney() {

        const parser = new Parser(this.messages);

        let steps = await parser.parseJourney('greetings');
        let journey = new Journey();
        journey.buildFromSteps(steps);
        await journey.run();
    }

    async addItemJourney(item) {
        window.dispatchEvent(new Event('journey-started'));
        const parser = new Parser(this.messages);

        let steps = await parser.parseJourney('add_item');
        let journey = new Journey();
        journey.buildFromSteps(steps);
        await journey.run({ item: item });

        window.dispatchEvent(new Event('journey-finished'));
    }

    redrawGraphics() {
        draw.renderBitList(this.bf.bitArray);
        draw.redrawLines();
    }

    async checkItemJourney(item) {
        window.dispatchEvent(new Event('journey-started'));

        draw.clearCheckLines();
        const parser = new Parser(this.messages);

        let steps = await parser.parseJourney('check_item');
        let journey = new Journey();
        journey.buildFromSteps(steps);

        await journey.run({ item: item });

        window.dispatchEvent(new Event('journey-finished'));
    }

    async checkBit(context) {
        draw.renderBitList(this.bf.bitArray);
        draw.drawCheckBox(context.item, context.position);
        draw.drawCheckLine(context.position, context.bit, context.item);
        Util.scrollToNextElement(draw.getBitBoxId(context.position), this.fastForward);
    }

    async setBit(context) {
        this.bf.bitArray[context.position] = true;
        this.bf.elements.push(context.item);
        draw.renderBitList(this.bf.bitArray);
        draw.drawTextBox(context.item, context.position);
        Util.scrollToNextElement(draw.getBitBoxId(context.position), this.fastForward);
        return context
    }

    functionRegistry(functionName) {
        return this.registry[functionName];
    }

    registry = {
        'hash1': async (context) => {
            return this.bf.hash1(context.item);
        },
        'hash2': async (context) => {
            return this.bf.hash2(context.item);
        },
        'hash3': async (context) => {
            return this.bf.hash3(context.item);
        },
        'setBit': async (context) => {
            return await this.setBit(context);
        },
        'bloomFilterContains': async (context) => {
            return this.bf.elements.includes(context.item);
        },
        'waitForUser': async (context) => {
            return await this.waitForUser();
        },
        'getBit': async (context) => {
            return this.bf.bitArray[context.position];
        },
        'checkBit': async (context) => {
            return await this.checkBit(context);
        },
        'allTrue': async (context) => {
            let allTrue = true;
            for (let v of context.bits) {
                if (!v) {
                    allTrue = false;
                    break;
                }
            }
            return allTrue;
        },
        'return': async (context) => {
            return true;
        }
    }
};

const managerInstance = new Manager();
export default Manager;
export { Manager as JourneyManager, managerInstance };