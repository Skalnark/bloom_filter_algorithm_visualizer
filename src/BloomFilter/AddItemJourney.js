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
    for i from 1 to k do
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
            await prompt.nextLine(2);
            try {
                this._print(window.i18next ? window.i18next.t('messages.checkingIf', { item }) : `Checking if '${item}' is already in the Bloom Filter...`);
            } catch (e) {
                this._print(`Checking if '${item}' is already in the Bloom Filter...`);
            }
            await managerInstance.waitForUser();
            if (managerInstance.bf.elements.includes(item)) {
                try {
                    await this._print(window.i18next ? window.i18next.t('messages.alreadyInserted', { item }) : `'${item}' was already inserted. Adding it again will not change the filter.`);
                } catch (e) {
                    await this._print(`'${item}' was already inserted. Adding it again will not change the filter.`);
                }
                prompt.nextLine(9);
                await managerInstance.waitForUser();
                window.dispatchEvent(new Event('journey-finished'));
                return context;
            }
            await prompt.nextLine(3);
            return context;
        }
        this.steps.push(first);

        let hash;

        for (let i = 0; i < managerInstance.bf.hashCount; i++) {
            hash = new Step();
            let hashName = `h${i + 1}`;
            hash.action = ((i) => async (context) => {
                hash.index = i + 1;
                await prompt.nextLine(4);
                try {
                    await prompt.print(window.i18next ? window.i18next.t('messages.hashesCalculated', { count: i + 1, total: managerInstance.bf.hashCount }) : `${i + 1}/${managerInstance.bf.hashCount} hashes calculated.`, 1000);
                } catch (e) {
                    await prompt.print(`${i + 1}/${managerInstance.bf.hashCount} hashes calculated.`, 1000);
                }
                hash.context = context;
                prompt.nextLine(5);
                context[hashName] = managerInstance.bf.hash(context.item, i);
                try {
                    await this._print(window.i18next ? window.i18next.t('messages.hashFor', { index: i + 1, item: context.item, value: context[hashName] }) : `The hash_${i + 1} for '${context.item}' is ${context[hashName]}`);
                } catch (e) {
                    await this._print(`The hash_${i + 1} for '${context.item}' is ${context[hashName]}`);
                }
                return context;
            })(i);
            this.steps.push(hash);

            let setBit = new SetBitStep(i + 1);
            setBit.action = ((i) => async (context) => {
                setBit.index = i + 1;
                setBit.context = context;
                let hashName = `h${i + 1}`;
                prompt.nextLine(6);
                try {
                    await this._print(window.i18next ? window.i18next.t('messages.setBit', { position: context[hashName] }) : `Set the bit at position ${context[hashName]} in the bit array to 1`);
                } catch (e) {
                    await this._print(`Set the bit at position ${context[hashName]} in the bit array to 1`);
                }

                managerInstance.bf.bitArray[context[hashName]] = true;

                draw.renderBitList(managerInstance.bf.bitArray);
                draw.drawTextBox(item, context[hashName]);

                Util.scroll("bit-" + context[hashName]);
                await Util.delay(3000);

                Util.scroll('prompt-simulator');
                return context;
            })(i);

            this.steps.push(setBit);
        }

        let finalStep = new Step();
        finalStep.action = async (context) => {
            await prompt.nextLine(4);
            finalStep.context = context;
            try {
                prompt.print(window.i18next ? window.i18next.t('messages.hashesCalculated', { count: managerInstance.bf.hashCount, total: managerInstance.bf.hashCount }) : `${managerInstance.bf.hashCount}/${managerInstance.bf.hashCount} hashes calculated.`, 2500);
            } catch (e) {
                prompt.print(`${managerInstance.bf.hashCount}/${managerInstance.bf.hashCount} hashes calculated.`, 2500);
            }
            await prompt.nextLine(7);
            await prompt.nextLine(8);
            managerInstance.bf.elements.includes(item) || managerInstance.bf.elements.push(item);
            try {
                await this._print(window.i18next ? window.i18next.t('messages.itemAdded', { item }) : `'${item}' has been added to the Bloom Filter.`, 1500);
            } catch (e) {
                await this._print(`'${item}' has been added to the Bloom Filter.`, 1500);
            }
            await prompt.nextLine(9);
            window.dispatchEvent(new Event('journey-finished'));
            return context;
        }
        this.steps.push(finalStep);
    }
}