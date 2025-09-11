import i18next from "i18next";
import Step from "./Step.js";
import { Util } from "./Util.js";

export class Journey {
    constructor(name = null) {
        this.name = name;
        this.context = {};
        this.firstStep = new Step();
        this.messages = i18next.t(`journeys.${this.name}`, { returnObjects: true });
    }

    async run(baseContext = { return: false }) {
        let currentStep = 0;
        while (currentStep < this.steps.length) {
            if (baseContext.return === true) break;

            let result = await this.steps[currentStep].executeStep(baseContext);

            Util.updateContext(baseContext, result.context);

            if (baseContext.return === true) break;

            if (result.next) {
                let subJourney = new Journey();
                subJourney.buildFromSteps(this.steps[currentStep].possibleNextSteps);
                baseContext = await subJourney.run(baseContext);

                if (!baseContext.return) {
                    currentStep++
                }
                else this.currentStep = -1;
            } else {
                currentStep++;
            }
        }
        return baseContext;
    }

    async buildFromSteps(steps = []) {
        steps.forEach(s => { s.journey = this; });
        this.steps = steps;
        this.firstStep = steps[0];
    }
}

export default Journey;