import Journey from "../Journey.js";
import Step from "../Step.js";
import { managerInstance } from "../Manager.js";
import { Util } from "../Util.js";
import draw from "../Draw.js";
import { prompt } from "../Prompt.js";

export default class CheckItemJourney extends Journey {
    constructor() {
        super();
        this.name = 'check-bit';
    }

    build(item) {
        this.context = { item: item };

        let pseudoCode =
`k = ${managerInstance.bf.hashCount}
not_found = false
for i from 0 to k-1 do
    p = hash('${item}', i)
    bit = bitArray[p]
    if bit == 0 then
        not_found = true
        break
    end
end
if not_found then
    return true
else
    return false
end`;

        prompt.initPseudoCode(pseudoCode);

        let first = new Step();
        first.skip = true;
        first.action = async (context) => {
            await prompt.nextLine();
            await this._print(`Checking if '${item}' is in the Bloom Filter...`, 1000);
            await prompt.nextLine();
            return context;
        };
        this.steps.push(first);

        let hash;
        for (let i = 0; i < managerInstance.bf.hashCount; i++) {
            hash = new Step();
            let hashName = `h${i + 1}`;
            hash.action = ((i) => async (context) => {
                await this._print(`hash_${i}/${managerInstance.bf.hashCount} positions verified.`, 1000);
                await prompt.nextLine();
                context[hashName] = managerInstance.bf.hash(context.item, i);
                await this._print(`The hash_${i + 1} for '${context.item}' is ${context[hashName]}`);
                return context;
            })(i);
            this.steps.push(hash);

            let checkBit = new Step('check-bit', i + 1);
            checkBit.action = ((i) => async (context) => {
                await prompt.nextLine();
                checkBit.context = context;
                let hashName = `h${checkBit.id}`;
                await this._print(`Check the bit at position ${context[hashName]} in the bit array`);
                await managerInstance.waitForUser();

                draw.renderBitList(managerInstance.bf.bitArray);
                draw.redrawLines();

                let bit = managerInstance.bf.bitArray[context[hashName]];
                draw.drawCheckBox(item, context[hashName]);

                draw.drawCheckLine(context[hashName], bit, item);

                Util.scroll("bit-" + context[hashName]);
                await Util.delay(3000);
                Util.scroll('prompt-simulator');
                await prompt.nextLine();

                if (bit) {
                    await prompt.nextLine(6);
                    await this._print(`The bit at position ${context[hashName]} is 1`);
                    await this._print("This means the item might be in the Bloom Filter...", 2000);
                    await prompt.nextLine(9);
                    await prompt.nextLine(3);
                } else {
                    await prompt.nextLine();
                    await this._print(`The bit at position ${context[hashName]} is 0`, 1000);
                    await this._print(`This means that '${item}' is definitely NOT in the Bloom Filter.`, 1000);
                    await prompt.nextLine();
                    await prompt.nextLine();
                    await prompt.nextLine(13);
                    await prompt.nextLine();
                    await prompt.nextLine();
                    window.dispatchEvent(new Event('journey-finished'));
                    return context;
                }
                return context;
            })(i);
            this.steps.push(checkBit);
        }

        let finalStep = new Step();
        finalStep.action = async (context) => {
            await this._print(`${managerInstance.bf.hashCount}/${managerInstance.bf.hashCount} positions verified.`, 2500);
            await prompt.nextLine(10);
            await prompt.nextLine(11);
            await this._print(`All the bits at the calculated positions are 1.`);
            await prompt.nextLine();
            await this._print(`This means that '${item}' is possibly in the Bloom Filter.`);
            if (managerInstance.bf.elements.includes(item)) {
                await this._print("In fact, it was added earlier!");
            } else {
                await this._print("However, it was never added. This is a false positive!");
            }
            await prompt.nextLine(15);

            window.dispatchEvent(new Event('journey-finished'));
            return context;
        };

        this.steps.push(finalStep);
    }

}