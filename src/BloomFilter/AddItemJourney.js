import Journey from "../Journey";
import Step from "../Step.js";
import SetBitStep from "./SetBitStep.js";
import { managerInstance } from "../Manager.js";
import { Util } from "../Util.js";
import draw from "../Draw.js";

export default class AddItemJourney extends Journey {
    constructor() {
        super('add-item-journey');
    }

    build(item) {

        this.context = { item: item };

        let first = new Step();

        first.action = async (context) => {
            first.context = context;
            this._print(`# Adding item '${item}' to the Bloom Filter`);
            if (managerInstance.bf.elements.includes(item)) {
                await this._print(`The item '${item}' is already in the Bloom Filter. Adding it again will not change the filter.`);
                window.dispatchEvent(new Event('journey-finished'));
                return context;
            }
            this._print(`To add ${item} to the Bloom Filter, we will compute ${managerInstance.bf.hashCount} hash values.`);
            this._print();
            return context;
        }
        this.steps.push(first);

        let hash;

        for (let i = 0; i < managerInstance.bf.hashCount; i++) {
            hash = new Step();
            let hashName = `h${i + 1}`;
            hash.action = ((i) => async (context) => {
                hash.context = context;
                await this._print(`Calculating hash ${i + 1} for item '${item}'...`);
                context[hashName] = managerInstance.bf.hash(context.item, i);
                await this._print(`The hash ${hashName} for item '${context.item}' is ${context[hashName]}`);
                this._print();
                return context;
            })(i);
            this.steps.push(hash);

            let setBit = new SetBitStep(i + 1);
            setBit.action = ((i) => async (context) => {
                setBit.context = context;
                let hashName = `h${i + 1}`;
                await this._print(`Set the bit at position ${context[hashName]} in the bit array to 1`);

                managerInstance.bf.bitArray[context[hashName]] = true;
                managerInstance.bf.elements.includes(item) || managerInstance.bf.elements.push(item);

                draw.renderBitList(managerInstance.bf.bitArray);
                draw.drawTextBox(item, context[hashName]);

                Util.scroll("bit-" + context[hashName]);
                await Util.delay(3000);

                Util.scroll('prompt-simulator');
                this._print();
                return context;
            })(i);

            this.steps.push(setBit);
        }

        let finalStep = new Step();
        finalStep.action = async (context) => {
            finalStep.context = context;
            await this._print(`All ${managerInstance.bf.hashCount} hash values have been calculated and the corresponding bits have been set to 1.`);
            await this._print(`The item '${item}' has been added to the Bloom Filter.`);
            this._print();
            window.dispatchEvent(new Event('journey-finished'));
            return context;
        }
        this.steps.push(finalStep);
    }
}