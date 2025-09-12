import { Prompt } from "./Prompt.js";
import Manager from "./Manager.js";
import { Util } from "./Util.js";

const prompt = new Prompt();
const manager = new Manager();

async function print(message = '\n', delayMs = 2000) {
    prompt.print(message);
    return await delay(delayMs);
}

async function delay(ms = 2000) {
    if (manager.fastForward)
        ms = 0;
    return new Promise(resolve => setTimeout(resolve, ms));
}

function scroll(elementId) {
    if (manager.fastForward) return;
    Util.scrollToElementById(elementId);
}

function greetingsRoutine() {
    print("# Welcome to the Bloom Filter Algorithm Visualizer");
    print("You can learn about the Bloom Filter data structure and how it works by following the execution step-by-step");
    print("Use the Add and Check buttons to see how items are added and checked in the Bloom Filter");
    print("Set the number of bits and hash functions to see how they affect the performance");
    print("Enjoy learning about Bloom Filters!");
    print();
}

async function addItemRoutine(item = 'paçoca') {
    window.dispatchEvent(new Event('journey-started'));
    let context = {};
    print(`# Adding item '${item}' to the Bloom Filter`);
    await print("To add an item to the Bloom Filter, we will calculate", 500);
    await print("multiple hash values for the item and set the corresponding bits in the bit array");
    await print("Let's go through the process step-by-step");
    await manager.waitForUser();

    print(`To add an item to the filter, we'll calculate all the ${manager.bf.hashCount} hash values using our hash functions for the item '${item}'`);
    await delay();

    for (let i = 0; i < manager.bf.hashCount; i++) {
        context[`h${i + 1}`] = manager.hash(item, i);
        await print(`The hash ${i + 1} for item '${item}' is ${context[`h${i + 1}`]}`);
        await print(`Set the bit at position ${i + 1} to 1 in the bit array`);
        manager.setBitFast(context[`h${i + 1}`], item);
        scroll("bit-" + context[`h${i + 1}`]);
        await delay(3000);
        await manager.waitForUser();
        print();
    }

    await print(`The item '${item}' has been added to the Bloom Filter!`, 500);
    await print("Let's calculate the false positive rate based on the current state of the Bloom Filter.");
    await manager.waitForUser();

    let frp = manager.bf.calculateFPR();
    print();
    await print("A Bloom Filter can yield false positives");
    await print("meaning it might indicate that an element is in the set when it is not.", 2000);
    await print("The bloom filter parameter are: ", 500);
    await print(`m: The number of bits in the filter: ${manager.bf.size}`);
    await print(`k: Number of hash functions: ${manager.bf.hashCount}`);
    await print(`n: Number of inserted elements: ${manager.bf.elements.length}`);
    await print(`p: Probability of a false positive.`);
    await print("And to calculate this we use the formula p = (1 - e^(-kn/m))^k");
    await print(`Using three first parameters, we can calculate that p is approximately: ${(frp * 100).toFixed(4)}%`);
    await manager.waitForUser();

    await print("You can add more items or check for items using the buttons above.");

    window.dispatchEvent(new Event('journey-finished'));
}

async function checkItemRoutine(item = 'paçoca') {
    window.dispatchEvent(new Event('journey-started'));
    let context = {};
    print(`# Checking if item '${item}' is in the Bloom Filter`);
    await print("To check if an item is in the Bloom Filter, we will calculate", 1000);
    await print("multiple hash values for the item and check the corresponding bits in the bit array");
    await print("Let's go through the process step-by-step", 0);
    await manager.waitForUser();

    for (let i = 0; i < manager.bf.hashCount; i++) {
        context[`h${i + 1}`] = manager.hash(item, i);
        await print(`The hash ${i + 1} for item '${item}' is ${context[`h${i + 1}`]}`);
        await print(`Check the bit at position ${context[`h${i + 1}`]} in the bit array`);
        manager.checkBitFast(context[`h${i + 1}`], item);
        scroll("bit-" + context[`h${i + 1}`]);
        await delay(3000);
        await manager.waitForUser();

        if (manager.bf.bitArray[context[`h${i + 1}`]]) {
            await print(`The bit at position ${context[`h${i + 1}`]} is 1`);
            await print("This means the item might be in the Bloom Filter...");
            print();
        } else {
            await print(`The bit at position ${context[`h${i + 1}`]} is 0`);
            await print(`This means that '${item}' is definitely NOT in the Bloom Filter.`);
            await print("You can add it using the Add button above.");
            window.dispatchEvent(new Event('journey-finished'));
            return;
        }
    }
    if (manager.bf.elements.includes(item)) {
        await print(`All checked bits are 1, and the item '${item}' was found in the filter.`);
        await print(`So, '${item}' is definitely in the Bloom Filter!`);
        await print("You should try filling the filter with more items to see how the false positive rate changes.");
    } else {
        await print(`All checked bits are 1, but the item '${item}' was NOT found in the filter.`);
        await print(`This is a FALSE POSITIVE!`);
        print(`The Bloom Filter indicates that '${item}' might be in the set, but it is not.`);
        await print("You can add it using the Add button above.");
    }
    window.dispatchEvent(new Event('journey-finished'));
}

export { greetingsRoutine, addItemRoutine, checkItemRoutine };