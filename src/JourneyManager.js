import { prompt } from "./PromptController.js";
import { draw } from "./Draw.js";
import { Util } from "./Util.js";
import Journey from "./Journey.js";
import Parser from "./Parser.js";
import i18next from "i18next";

class JourneyManager {
    constructor(bf, prompt) {

        if (JourneyManager._instance) {
            return JourneyManager._instance;
        }
        JourneyManager._instance = this;

        this.bf = bf;
        this.prompt = prompt;
        this.nextStepButton = document.getElementById('next-step-button');
        this.finishButton = document.getElementById('finish-journey-button');
        this.fastForwardCheckbox = document.getElementById('fast-forward-checkbox');
        this.nextStep = false;
        this.verboseExecution = true;
        this.fastForward = false;
        this.initListeners();
        this.messages = i18next.t(`messages`, { returnObjects: true });
    }

    async waitForUser() {
        if (this.fastForward) {
            return new Promise(resolve => resolve());
        }

        if (!this.verboseExecution) {
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
        this.bf.clear();

        this.#copyDummyWord(words);

        prompt.print(`Adding ${words.length} dummy words to the Bloom Filter to simulate a more realistic scenario.`);
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
            this.fastForward = this.fastForwardCheckbox.checked;
            this.prompt.print("Finished execution.");
            this.prompt.newLine();
        });

        this.fastForward = this.fastForwardCheckbox.checked;

        this.fastForwardCheckbox.addEventListener('change', () => {
            this.fastForward = this.fastForwardCheckbox.checked;
            if (this.fastForward) {
                this.prompt.print("Step by step execution will be fast forwarded.");
            } else {
                this.prompt.print("Step by step execution is back to normal.");
            }
        });
    }

    async calcHash1(item) {

        let hash = 0;
        let index = 0;
        while (index < item.length) {
            hash = await this.bf.stepByStepHash1(item, index, hash);

            index++;
            await this.waitForUser();
        }
        return hash;
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

    async checkItemJourney(item)
    {
        window.dispatchEvent(new Event('journey-started'));
        const parser = new Parser(this.messages);
        
        let steps = await parser.parseJourney('check_item');
        let journey = new Journey();
        journey.buildFromSteps(steps);

        await journey.run({ item: item });
        
        window.dispatchEvent(new Event('journey-finished'));
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
        return functionRegistry[functionName];
    }
}

const functionRegistry = {
    'hash1': async (context) => {
        let jm = new JourneyManager();
        return await jm.bf.journeyHash1(context);
    },
    'hash2': async (context) => {
        let jm = new JourneyManager();
        return await jm.bf.journeyHash2(context);
    },
    'hash3': async (context) => {
        let jm = new JourneyManager();
        return await jm.bf.journeyHash3(context);
    },
    'setBit': async (context) => {
        let jm = new JourneyManager();
        return await jm.setBit(context);
    },
    'bloomFilterContains': async (context) => {
        let jm = new JourneyManager();
        return await jm.bf.journeyContains(context);
    },
    'waitForUser': async (context) => {
        let jm = new JourneyManager();
        await jm.waitForUser();
        return context
    },
    'return': async () => {
        let newContext = { return: true };
        return { next: null, context: newContext };
    },
    'getBit': async (context) => {
        let jm = new JourneyManager();
        let bit = jm.bf.bitArray[context.position];
        context['bit'] = bit;
        return context
    },
    'allTrue': async (context) => {
        let allTrue = true;
        for (let v of context.bits) {
            if (!v) {
                allTrue = false;
                break;
            }
        }
        context['predicate_result'] = allTrue;
        return context
    }

};

export default JourneyManager;
export { JourneyManager, functionRegistry };