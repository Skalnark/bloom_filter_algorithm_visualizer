import Journey from "../Journey.js";
import Step from "../Step.js";
import { managerInstance } from "../Manager.js";
import { Util } from "../Util.js";
import draw from "../Draw.js";

export default class CheckItemJourney extends Journey {
    constructor() {
        super();
        this.name = 'check-bit';
    }

    build(item) {
        this.context = { item: item };

        let first = new Step();
        first.action = async (context) => {
            this._print(`# Checking if item '${item}' is in the Bloom Filter`);
            await this._print("To check if an item is in the Bloom Filter, we will calculate multiple hash values for the item and check the corresponding bits in the bit array");
            return context;
        };
        this.steps.push(first);

        let hash;
        for (let i = 0; i < managerInstance.bf.hashCount; i++) {
            hash = new Step();
            let hashName = `h${i + 1}`;
            hash.action = ((i) => async (context) => {
                await this._print(`Calculating hash ${i + 1} for item '${item}'...`);
                context[hashName] = managerInstance.bf.hash(context.item, i);
                await this._print(`The hash ${hashName} for item '${context.item}' is ${context[hashName]}`);
                return context;
            })(i);
            this.steps.push(hash);

            let checkBit = new Step('check-bit', i + 1);
            checkBit.action = ((i) => async (context) => {
                checkBit.context = context;
                let hashName = `h${checkBit.id}`;
                await this._print(`Check the bit at position ${context[hashName]} in the bit array`);

                draw.renderBitList(managerInstance.bf.bitArray);
                draw.redrawLines();

                let bit = managerInstance.bf.bitArray[context[hashName]];
                draw.drawCheckBox(item, context[hashName]);

                draw.drawCheckLine(context[hashName], bit, item);

                Util.scroll("bit-" + context[hashName]);
                await Util.delay(3000);
                Util.scroll('prompt-simulator');

                if (managerInstance.bf.bitArray[context[hashName]]) {
                    await this._print(`The bit at position ${context[hashName]} is 1`);
                    await this._print("This means the item might be in the Bloom Filter...");
                    this._print();
                } else {
                    await this._print(`The bit at position ${context[hashName]} is 0`);
                    await this._print(`This means that '${item}' is definitely NOT in the Bloom Filter.`);
                    await this._print("You can add it using the Add button above.");
                    window.dispatchEvent(new Event('journey-finished'));
                    return context;
                }
                return context;
            })(i);
            this.steps.push(checkBit);
        }

        let finalStep = new Step();
        finalStep.action = async (context) => {

            await this._print(`All the bits at the calculated positions are 1.`);
            await this._print(`This means that '${item}' is possibly in the Bloom Filter.`);
            if (managerInstance.bf.elements.includes(item)) {
                await this._print("In fact, it was added earlier!");
            } else {
                await this._print("However, it was never added. This is a false positive!");
            }

            this._print();
            window.dispatchEvent(new Event('journey-finished'));
            return context;
        };

        this.steps.push(finalStep);
    }

}