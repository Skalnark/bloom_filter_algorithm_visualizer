import { prompt } from "./PromptController";

class Journey {
    constructor(bf, prompt) {

        if (Journey._instance) {
            return Journey._instance;
        }
        Journey._instance = this;

        this.bf = bf;
        this.prompt = prompt;
        this.nextStepButton = document.getElementById('next-step-button');
        this.finishButton = document.getElementById('finish-journey-button');
        this.nextStep = false;
        this.verboseExecution = true;
        this.fastForward = false;
        this.initListeners();
    }

    // While this.nextStep is false, wait for the user to click the button
    async waitForUser() {
        if( this.fastForward ) {
            return new Promise(resolve => resolve());
        }

        if (!this.verboseExecution) {
            return new Promise(resolve => resolve());
        }
        this.nextStep = false;
        this.nextStepButton.style.backgroundColor = '#a71212ff';
        while (!this.nextStep) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.nextStepButton.style.backgroundColor = '#181f1aff';
    }

    initListeners() {
        this.nextStepButton.addEventListener('click', () => {
            this.nextStep = true;
        });

        this.finishButton.addEventListener('click', () => {
            this.fastForward = true;
            this.prompt.quietMode = true;
            this.nextStep = true;
        });

        window.addEventListener('journey-finished', () => {
            this.fastForward = false;
            this.prompt.quietMode = false;
            this.prompt.print("Finished execution.");
        });
    }

    async addItemStepByStep(item) {
        window.dispatchEvent(new Event('journey-started'));

        if (this.bf.elements.includes(item)) {
            prompt.print(`The item "${item}" is already in the Bloom Filter. Adding it again won't change the filter.`);
            window.dispatchEvent(new Event('journey-finished'));
            return;
        }

        prompt.print(`To add the item "${item}", we will first calculate its hashes`);
        prompt.printVerbose(`Click 'Next Step' to proceed through each character of the item.`, false);
        let hash1 = await this.bf.hash1(item);

        prompt.print(`hash1 for item "${item}" is ${hash1}`);
        await this.waitForUser();
        prompt.print("We need to set the bit at position " + hash1 + " to true in the bit array.");
        await this.waitForUser();
        // Todo render the bit and the arrow for hash 1
        this.bf.bitArray[hash1] = true;

        prompt.print("Now, let's calculate hash2");
        let hash2 = await this.bf.hash2(item);
        prompt.print("Now, we set the bit at position " + hash2 + " to true in the bit array as well.");
        await this.waitForUser();
        // Todo render the bit and the arrow for hash 2
        this.bf.bitArray[hash2] = true;

        prompt.print("Finally, let's calculate hash3");
        let hash3 = await this.bf.hash3(item);

        prompt.print("And we set the bit at position " + hash3 + " to true in the bit array.");
        await this.waitForUser();
        // Todo render the bit and the arrow for hash 3
        this.bf.bitArray[hash3] = true;

        prompt.print(`All done! The item "${item}" has been added to the Bloom Filter.`);
        this.bf.elements.push(item);

        prompt.printVerbose(`We can now calculate the new values for the false positive rate`);
        await this.waitForUser();
        prompt.printVerbose(`To do this, we use the formula: FPR = (1 - e^(-kn/m))^k`);
        await this.waitForUser();
        prompt.printVerbose(`Where:`);
        prompt.printVerbose(`k = number of hash functions (3 in our case)`);
        prompt.printVerbose(`m = size of the bit array (${this.bf.size} in our case)`);
        prompt.printVerbose(`n = number of elements added to the filter (${this.bf.elements.length} in our case)`);
        await this.waitForUser();
        prompt.printVerbose(`Plugging in the values, we get:`);
        prompt.printVerbose(`FPR = (1 - e^(-3*${this.bf.elements.length}/${this.bf.size}))^3`);
        prompt.printVerbose(`Calculating this gives us the new false positive rate...`);
        await this.waitForUser();
        const fpr = this.bf.calculateFPR();
        prompt.printVerbose(`The new false positive rate is: ${fpr * 100}%`);
        prompt.printVerbose(`You can now add another item or check for membership of an item.`);

        window.dispatchEvent(new Event('journey-finished'));
    }

    async checkItemStepByStep(item) {
        window.dispatchEvent(new Event('journey-started'));
        
        prompt.print(`To check if the item "${item}" is in the Bloom Filter, we will calculate its hashes`);
        let hash1 = await this.bf.hash1(item);
        let hash2 = await this.bf.hash2(item);
        let hash3 = await this.bf.hash3(item);

        await this.waitForUser();

        prompt.print(`We have calculated the hashes:`);
        prompt.print(`hash1: ${hash1}`);
        prompt.print(`hash2: ${hash2}`);
        prompt.print(`hash3: ${hash3}`);
        await this.waitForUser();
        prompt.print(`Now, we will check the bits at these positions in the bit array.`);
        await this.waitForUser();

        let h1b = this.bf.bitArray[hash1];
        let h2b = this.bf.bitArray[hash2];
        let h3b = this.bf.bitArray[hash3];
        
        await this.waitForUser();
        prompt.print(`Let's check the bit at each position`);
        await this.waitForUser();
        // Todo render the arrows for all three hashes

        prompt.print(`So, for the bit at position:`);
        await this.waitForUser();
        prompt.print(`- Position ${hash1}: it is ${h1b ? 'true' : 'false'}`);
        await this.waitForUser();
        prompt.print(`- Position ${hash2}: it is ${h2b ? 'true' : 'false'}`);
        await this.waitForUser();
        prompt.print(`- Position ${hash3}: it is ${h3b ? 'true' : 'false'}`);
        await this.waitForUser();
        
        if (h1b && h2b && h3b) {
            prompt.print(`All the bits at positions ${hash1}, ${hash2}, and ${hash3} are set to true!`);
            prompt.print(`The item "${item}" is possibly in the Bloom Filter.`);
            await this.waitForUser();

            if(this.bf.elements.includes(item)) {
                prompt.print(`In fact, the item "${item}" is definitely in the Bloom Filter (no false positive here!).`);
            } else {
                prompt.print(`However, the item "${item}" was never added to the Bloom Filter. This is a false positive!`);
            }
        }else {

            
            if(!h1b) {
                prompt.print(`The bit at position ${hash1} is set to false!`);
            }
            if(!h2b) {
                prompt.print(`The bit at position ${hash2} is set to false!`);
            }
            if(!h3b) {
                prompt.print(`The bit at position ${hash3} is set to false!`);
            }

            prompt.print(`Since at least one of the bits is false, the item "${item}" is definitely NOT in the Bloom Filter.`);
        }

        window.dispatchEvent(new Event('journey-finished'));
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
}

export default Journey;
export { Journey };