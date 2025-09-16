import Journey from "../Journey.js";
import Step from "../Step.js";
import { managerInstance } from "../Manager.js";
import { Util } from "../Util.js";
import draw from "../Draw.js";
import { prompt } from "../Prompt.js";
import CheckBitStep from "./CheckBitStep.js";

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
for i from 1 to k do
    p = hash('${item}', i)
    bit = bitArray[p]
    if bit == 0 then
        not_found = true
        break
    end
end
if not_found then
    return false
else
    return true
end`;

        prompt.initPseudoCode(pseudoCode);

        let first = new Step();
        first.skip = true;
        first.action = async (context) => {
            await prompt.nextLine(2);
            await prompt.nextLine(3);
            try {
                await this._print(window.i18next ? window.i18next.t('messages.checkingIf', { item }) : `Checking if '${item}' is in the Bloom Filter...`, 1500);
            } catch (e) {
                await this._print(`Checking if '${item}' is in the Bloom Filter...`, 1500);
            }
            return context;
        };
        this.steps.push(first);

        let hash;
        for (let i = 0; i < managerInstance.bf.hashCount; i++) {
            hash = new Step();
            hash.index = i + 1;
            let hashName = `h${i + 1}`;
            hash.action = ((i) => async (context) => {
                try {
                    await this._print(window.i18next ? window.i18next.t('messages.positionsVerified', { count: i, total: managerInstance.bf.hashCount }) : `${i}/${managerInstance.bf.hashCount} positions verified.`, 1000);
                } catch (e) {
                    await this._print(`${i}/${managerInstance.bf.hashCount} positions verified.`, 1000);
                }
                await prompt.nextLine(4);
                context[hashName] = managerInstance.bf.hash(context.item, i);
                try {
                    this._print(window.i18next ? window.i18next.t('messages.hashFor', { index: i + 1, item: context.item, value: context[hashName] }) : `The hash_${i + 1} for '${context.item}' is ${context[hashName]}`);
                } catch (e) {
                    this._print(`The hash_${i + 1} for '${context.item}' is ${context[hashName]}`);
                }
                return context;
            })(i);
            this.steps.push(hash);

            let checkBit = new CheckBitStep();
            checkBit.action = ((i) => async (context) => {
                checkBit.index = i + 1;
                await prompt.nextLine(5);
                checkBit.context = context;
                let hashName = `h${checkBit.index}`;
                try {
                    await this._print(window.i18next ? window.i18next.t('messages.setBit', { position: context[hashName] }) : `Check the bit at position ${context[hashName]} in the bit array`);
                } catch (e) {
                    await this._print(`Check the bit at position ${context[hashName]} in the bit array`);
                }
                await managerInstance.waitForUser();

                draw.renderBitList(managerInstance.bf.bitArray);
                draw.redrawLines();

                let bit = managerInstance.bf.bitArray[context[hashName]];
                draw.drawCheckBox(item, context[hashName]);

                draw.drawCheckLine(context[hashName], bit, item);

                Util.scroll("bit-" + context[hashName]);
                await Util.delay(3000);
                Util.scroll('prompt-simulator');
                await prompt.nextLine(6);

                if (bit) {
                    try {
                        await this._print(window.i18next ? window.i18next.t('messages.bitIsOne', { position: context[hashName] }) : `The bit at position ${context[hashName]} is 1`);
                        await this._print(window.i18next ? window.i18next.t('messages.itemMightBe') : "This means the item might be in the Bloom Filter...", 2000);
                    } catch (e) {
                        await this._print(`The bit at position ${context[hashName]} is 1`);
                        await this._print("This means the item might be in the Bloom Filter...", 2000);
                    }
                    await prompt.nextLine(9);
                    await prompt.nextLine(3);
                } else {
                    await prompt.nextLine(7);
                    try {
                        await this._print(window.i18next ? window.i18next.t('messages.bitIsZero', { position: context[hashName] }) : `The bit at position ${context[hashName]} is 0`, 1000);
                        await this._print(window.i18next ? window.i18next.t('messages.itemDefinitelyNot', { item }) : `This means that '${item}' is definitely NOT in the Bloom Filter.`, 1000);
                    } catch (e) {
                        await this._print(`The bit at position ${context[hashName]} is 0`, 1000);
                        await this._print(`This means that '${item}' is definitely NOT in the Bloom Filter.`, 1000);
                    }
                    await prompt.nextLine(8);
                    await prompt.nextLine(11);
                    await prompt.nextLine(12);
                    await prompt.nextLine(15);
                    window.dispatchEvent(new Event('journey-finished'));
                    return context;
                }
                return context;
            })(i);
            this.steps.push(checkBit);
        }

        let finalStep = new Step();
        finalStep.skip = true;
        finalStep.action = async (context) => {
            try {
                await this._print(window.i18next ? window.i18next.t('messages.positionsVerified', { count: managerInstance.bf.hashCount, total: managerInstance.bf.hashCount }) : `${managerInstance.bf.hashCount}/${managerInstance.bf.hashCount} positions verified.`, 2500);
            } catch (e) {
                await this._print(`${managerInstance.bf.hashCount}/${managerInstance.bf.hashCount} positions verified.`, 2500);
            }
            await prompt.nextLine(10);
            await prompt.nextLine(11);
            try {
                await this._print(window.i18next ? window.i18next.t('messages.allBitsAreOne') : `All the bits at the calculated positions are 1.`);
            } catch (e) {
                await this._print(`All the bits at the calculated positions are 1.`);
            }
            await prompt.nextLine(13);
            try {
                await this._print(window.i18next ? window.i18next.t('messages.itemMightBe') : `This means that '${item}' is possibly in the Bloom Filter.`);
            } catch (e) {
                await this._print(`This means that '${item}' is possibly in the Bloom Filter.`);
            }
            if (managerInstance.bf.elements.includes(item)) {
                try {
                    await this._print(window.i18next ? window.i18next.t('messages.wasAddedEarlier') : "In fact, it was added earlier!");
                } catch (e) {
                    await this._print("In fact, it was added earlier!");
                }
            } else {
                try {
                    await this._print(window.i18next ? window.i18next.t('messages.falsePositive') : "However, it was never added. This is a false positive!");
                } catch (e) {
                    await this._print("However, it was never added. This is a false positive!");
                }
            }
            await prompt.nextLine(14);
            await prompt.nextLine(15);

            window.dispatchEvent(new Event('journey-finished'));
            return context;
        };

        this.steps.push(finalStep);
    }

}