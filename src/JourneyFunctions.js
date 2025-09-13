import { Prompt } from "./Prompt.js";
import Manager from "./Manager.js";
import { Util } from "./Util.js";
import Journey, { Journey } from "./Journey.js";
import Step from "./Step.js";
import draw from "./Draw.js";

const prompt = new Prompt();
const manager = new Manager();

async function print(message = '\n', delayMs = 2000) {
    prompt.print(message);
    return await delay(delayMs);
}

async function delay(ms = 2000) {
    ms = 0;
    if (manager.fastForward)
        ms = 0;
    return new Promise(resolve => setTimeout(resolve, ms));
}

function scroll(elementId) {
    if (manager.fastForward) return;
    Util.scrollToElementById(elementId);
}

async function greetingsJourney() {
    let journey = new Journey("greetings", greetingsRoutine);
    journey.buildFromSteps(
        new Step.createMessageAction("Welcome to the Bloom Filter Algorithm Visualizer"),
        new Step.createMessageAction("You can learn about the Bloom Filter data structure and how it works by following the execution step-by-step"),
        new Step.createMessageAction("Use the Add and Check buttons to see how items are added and checked in the Bloom Filter"),
        new Step.createMessageAction("Set the number of bits and hash functions to see how they affect the performance"),
        new Step.createMessageAction("Enjoy learning about Bloom Filters!"),
    );
    return await journey.run();
}

function greetingsRoutine() {
    print("# Welcome to the Bloom Filter Algorithm Visualizer");
    print("You can learn about the Bloom Filter data structure and how it works by following the execution step-by-step");
    print("Use the Add and Check buttons to see how items are added and checked in the Bloom Filter");
    print("Set the number of bits and hash functions to see how they affect the performance");
    print("Enjoy learning about Bloom Filters!");
    print();
}

async function addItemRoutine(item) {
    let context = { item: item };

    let steps = [];
    let first = new Step();

    first.action = async (context) => {
        first.context = context;
        print(`# Adding item '${item}' to the Bloom Filter`);
        if( manager.bf.elements.includes(item)) {
            await print(`The item '${item}' is already in the Bloom Filter. Adding it again will not change the filter.`);
            window.dispatchEvent(new Event('journey-finished'));
            return context;
        }
        print(`To add ${item} to the Bloom Filter, we will compute ${manager.bf.hashCount} hash values.`);
        print();
        return context;
    }
    steps.push(first);

    let hash;

    for (let i = 0; i < manager.bf.hashCount; i++) {
        hash = new Step();
        let hashName = `h${i + 1}`;
        hash.action = ((i) => async (context) => {
            hash.context = context;
            await print(`Calculating hash ${i + 1} for item '${item}'...`);
            context[hashName] = manager.hash(context.item, i);
            await print(`The hash ${hashName} for item '${context.item}' is ${context[hashName]}`);
            print();
            return context;
        })(i);
        steps.push(hash);

        let setBit = new Step('set-bit', i + 1);
        setBit.action = ((i) => async (context) => {
            setBit.context = context;
            let hashName = `h${i + 1}`;
            await print(`Set the bit at position ${context[hashName]} in the bit array to 1`);

            manager.bf.bitArray[context[hashName]] = true;
            manager.bf.elements.includes(item) || manager.bf.elements.push(item);

            draw.renderBitList(manager.bf.bitArray);
            draw.drawTextBox(item, context[hashName]);

            scroll("bit-" + context[hashName]);
            await delay(3000);

            Util.scrollToElementById('prompt-simulator');
            print();
            return context;
        })(i);

        steps.push(setBit);
    }

    let finalStep = new Step();
    finalStep.action = async (context) => {
        finalStep.context = context;
        await print(`All ${manager.bf.hashCount} hash values have been calculated and the corresponding bits have been set to 1.`);
        await print(`The item '${item}' has been added to the Bloom Filter.`);
        print();
        window.dispatchEvent(new Event('journey-finished'));
        return context;
    }
    steps.push(finalStep);

    let journey = new Journey();
    journey.buildFromSteps(steps);
    await journey.execute(context);
}

async function checkItemRoutine(item) {
    let context = { item: item };

    let steps = [];
    let first = new Step();

    first.action = async (context) => {
        print(`# Checking if item '${item}' is in the Bloom Filter`);
        await print("To check if an item is in the Bloom Filter, we will calculate multiple hash values for the item and check the corresponding bits in the bit array");
        return context;
    };
    steps.push(first);

    let hash;

    for (let i = 0; i < manager.bf.hashCount; i++) {
        hash = new Step();
        let hashName = `h${i + 1}`;
        hash.action = ((i) => async (context) => {
            await print(`Calculating hash ${i + 1} for item '${item}'...`);
            context[hashName] = manager.hash(context.item, i);
            await print(`The hash ${hashName} for item '${context.item}' is ${context[hashName]}`);
            return context;
        })(i);
        steps.push(hash);

        let checkBit = new Step('check-bit', i + 1);
        checkBit.action = ((i) => async (context) => {
            checkBit.context = context;
            let hashName = `h${checkBit.id}`;
            await print(`Check the bit at position ${context[hashName]} in the bit array`);

            draw.renderBitList(manager.bf.bitArray);
            draw.redrawLines();

            let bit = manager.bf.bitArray[context[hashName]];
            draw.drawCheckBox(item, context[hashName]);

            draw.drawCheckLine(context[hashName], bit, item);

            scroll("bit-" + context[hashName]);
            await delay(3000);
            Util.scrollToElementById('prompt-simulator');

            if (manager.bf.bitArray[context[hashName]]) {
                await print(`The bit at position ${context[hashName]} is 1`);
                await print("This means the item might be in the Bloom Filter...");
                print();
            } else {
                await print(`The bit at position ${context[hashName]} is 0`);
                await print(`This means that '${item}' is definitely NOT in the Bloom Filter.`);
                await print("You can add it using the Add button above.");
                window.dispatchEvent(new Event('journey-finished'));
                return context;
            }
            return context;
        })(i);
        steps.push(checkBit);
    }

    let finalStep = new Step();
    finalStep.action = async (context) => {

        await print(`All the bits at the calculated positions are 1.`);
        await print(`This means that '${item}' is possibly in the Bloom Filter.`);
        if (manager.bf.elements.includes(item)) {
            await print("In fact, it was added earlier!");
        } else {
            await print("However, it was never added. This is a false positive!");
        }

        print();
        window.dispatchEvent(new Event('journey-finished'));
        return context;
    };

    steps.push(finalStep);

    let journey = new Journey();
    journey.buildFromSteps(steps);
    await journey.execute(context);
}

export { greetingsRoutine, addItemRoutine, checkItemRoutine };