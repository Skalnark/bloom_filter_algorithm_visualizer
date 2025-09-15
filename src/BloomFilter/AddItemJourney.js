import Journey from "../Journey";
import Step from "../Step.js";
import SetBitStep from "./SetBitStep.js";
import { managerInstance } from "../Manager.js";
import { Util } from "../Util.js";
import draw from "../Draw.js";
import { prompt } from "../Prompt.js";

export default class AddItemJourney extends Journey {
    constructor() {
        super('add-item-journey');
    }

    build(item) {

        this.context = { item: item };

        let pseudoCode =
`k = ${managerInstance.bf.hashCount}
stop if '${item}' in elements
do
    for i from 0 to k-1 do
        p = hash('${item}', i)
        bitArray[p] = 1
    end
    add '${item}' to elements
end`;

        prompt.initPseudoCode(pseudoCode);

        let first = new Step();
        first.skip = true;

        first.action = async (context) => {
            first.context = context;
            await Util.delay(1000);
            await prompt.nextLine();
            this._print(`Checking if '${item}' is already in the Bloom Filter...`);
            await managerInstance.waitForUser();
            if (managerInstance.bf.elements.includes(item)) {
                await this._print(`'${item}' was already inserted. Adding it again will not change the filter.`);
                prompt.nextLine(9);
                await managerInstance.waitForUser();
                window.dispatchEvent(new Event('journey-finished'));
                return context;
            }
            await prompt.nextLine();
            return context;
        }
        this.steps.push(first);

        let hash;

        for (let i = 0; i < managerInstance.bf.hashCount; i++) {
            hash = new Step();
            let hashName = `h${i + 1}`;
            hash.action = ((i) => async (context) => {
                if (i === 0) {
                    await prompt.nextLine();
                }
                prompt.print(`${i}/${managerInstance.bf.hashCount} hashes calculated.`, 100);
                hash.context = context;
                await managerInstance.waitForUser();
                prompt.nextLine();
                context[hashName] = managerInstance.bf.hash(context.item, i);
                await this._print(`The hash_${i + 1} for '${context.item}' is ${context[hashName]}`);
                return context;
            })(i);
            this.steps.push(hash);

            let setBit = new SetBitStep(i + 1);
            setBit.skip = true;
            setBit.action = ((i) => async (context) => {
                setBit.context = context;
                let hashName = `h${i + 1}`;
                prompt.nextLine();
                await this._print(`Set the bit at position ${context[hashName]} in the bit array to 1`);
                await managerInstance.waitForUser();

                managerInstance.bf.bitArray[context[hashName]] = true;
                managerInstance.bf.elements.includes(item) || managerInstance.bf.elements.push(item);

                draw.renderBitList(managerInstance.bf.bitArray);
                draw.drawTextBox(item, context[hashName]);

                Util.scroll("bit-" + context[hashName]);
                await Util.delay(3000);

                Util.scroll('prompt-simulator');
                await prompt.nextLine(4);
                return context;
            })(i);

            this.steps.push(setBit);
        }

        let finalStep = new Step();
        finalStep.action = async (context) => {
            finalStep.context = context;
            prompt.print(`${managerInstance.bf.hashCount}/${managerInstance.bf.hashCount} hashes calculated.`, 2500);
            await prompt.nextLine(7);
            await prompt.nextLine();
            await this._print(`'${item}' has been added to the Bloom Filter.`, 1500);
            await prompt.nextLine();
            window.dispatchEvent(new Event('journey-finished'));
            return context;
        }
        this.steps.push(finalStep);
    }
}