import Step from "./Step.js";
import { managerInstance } from "./Manager.js";
import draw from "./Draw.js";
import { prompt } from "./Prompt.js";

export class Journey {
    constructor(name = null) {
        this.name = name;
        this.context = {};
        this.firstStep = new Step();
        this.index = 0;
        this.journeyRunning = true;
        this.initListeners();
        window.dispatchEvent(new Event('journey-started'));
    }

    async buildFromSteps(steps = [], filterPrints = false) {
        steps.forEach(s => { s.journey = this; });
        this.steps = filterPrints ? steps.filter(s => s.name !== 'print') : steps;
        this.firstStep = steps[0];
    }

    async execute(context = {}) {

        let i = 0;
        while (i < this.steps.length) {
            //console.log(`step ${i + 1}/${this.steps.length}`);
            if (this.journeyRunning === false) break;
            let step = this.steps[i];

            step.context = structuredClone(context);
            context = await step.action(context);

            let decision = await managerInstance.waitForUser();

            if (decision === 'back') {
                prompt.clear();
                if (i === 0) {
                    continue;
                }
                this.undoPreviousStep(this.steps[i], context);
                context = this.steps[i].context;
                i--;
                continue;
            }
            else if (decision === 'next') {
                i++;
            }
            else {
                throw new Error(`Unknown decision: ${decision}`);
            }
        }
        return context;
    }

    undoPreviousStep(step, context) {
        if (step.name === 'check-bit') {
            let hashName = `h${step.id}`;
            let bitPosition = context[hashName];
            let item = context.item;
            draw.removeCheckLine(bitPosition, item);

            draw.renderBitList(managerInstance.bf.bitArray);
            draw.redrawLines();
        }
        
        if (step.name === 'set-bit')
        {
            let hashName = `h${step.id}`;
            if(step.id === 1)
                managerInstance.bf.elements.splice(managerInstance.bf.elements.indexOf(context.item), 1);

            managerInstance.bf.bitArray[context[hashName]] = false;

            draw.renderBitList(managerInstance.bf.bitArray);
            let itemBoxId = 'item-box-' + context.item;
            let itemBox = draw.itemBoxes.filter(b => b.rect.getAttribute('id') === itemBoxId);
            if (itemBox.length > 0) {
                itemBox[0].bits.pop();
            }
            draw.repositionItemBoxes();
        }
    }

    initListeners() {
        window.addEventListener('journey-started', () => {
            this.journeyRunning = true;
        });
        window.addEventListener('journey-finished', () => {
            this.journeyRunning = false;
        });
    }
}

export default Journey;