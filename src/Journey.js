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
        this.steps = [];
        this.initListeners();
        window.dispatchEvent(new Event('journey-started'));
    }

    async buildFromSteps(steps = [], filterPrints = false) {
        steps.forEach(s => { s.journey = this; });
        this.steps = filterPrints ? steps.filter(s => s.name !== 'print') : steps;
        this.firstStep = steps[0];
    }

    async _print(text, delay = 0) {
        await prompt.print(text, delay);
    }

    async execute() {

        let context = structuredClone(this.context);
        let i = 0;
        let decision = 'next';
        while (i < this.steps.length) {
            if (this.journeyRunning === false) break;
            let step = this.steps[i];

            step.context = structuredClone(context);
            context = await step.action(context);
            if (this.journeyRunning === false) break;

            if (!step.skip) {
                decision = await managerInstance.waitForUser();
            }

            if (decision === 'back') {
                prompt.clear();
                if (i === 0) {
                    decision = 'next';
                    continue;
                }
                this.steps[i].undo(context);
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