import i18next from "i18next";
import { journeyManager } from "../index.js";

export class Journey {
    constructor(name = null, context = {}, steps = []) {
        this.name = name;
        this.context = context;
        this.steps = steps;
        this.messages = i18next.t(`journeys.${this.name}`, { returnObjects: true });
    }

    async startJourney() {
        if(this.steps.length === 0) {
            console.warn("No steps defined for the journey.");
            return;
        }

        let currentStep = this.steps[0];
        this.steps.shift();

        while(currentStep) {
            let result = await currentStep.executeStep(this.context);
            if(result.context !== null)
            {
                this.context = result.context;
            }

            if(result.next !== null) {
                currentStep = result.next;
            }
            else if(this.steps.length > 0) {
                currentStep = this.steps[0];
                this.steps.shift();
            }
            else {
                currentStep = null;
            }
        }
    }
}

export default Journey;