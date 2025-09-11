import i18next from "i18next";
import Step from "./Step.js";
import { Util } from "./Util.js";
import { filter } from "d3";

export class Journey {
    constructor(name = null) {
        this.name = name;
        this.context = {};
        this.firstStep = new Step();
    }

    async run(baseContext = { return: false }) {
        let index = 0;
        while (index < this.steps.length) {
            let currentStep = this.steps[index];
            if (baseContext.return === true) break;

            if (currentStep.line == 'define bits=[h1b, h2b, h3b];') {
                console.log("here");
            }

            let result = await currentStep.executeStep(baseContext);

            if (result) {
                let subJourney = new Journey();
                subJourney.buildFromSteps(currentStep.possibleNextSteps);
                baseContext = await subJourney.run(baseContext);
            }
            index++;
        }
        return baseContext;
    }

    async buildFromSteps(steps = [], filterPrints = false) {
        steps.forEach(s => { s.journey = this; });
        this.steps = filterPrints ? steps.filter(s => s.name !== 'print') : steps;
        this.firstStep = steps[0];
    }
}

export default Journey;