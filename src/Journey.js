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

    async startJourney(baseContext = {}) {

        let currentStep = this.firstStep;
        this.context = { ...this.context, ...baseContext };
        while (currentStep) {
            let result = await currentStep.executeStep(this.context);
            this.context = result.context;
            currentStep = result.next;
        }
        return this.context;
    }

    async run(baseContext = { return: false }) {
        let currentStep = 0;
        while (currentStep < this.steps.length) {
            if (baseContext.return === true) break;

            let result = await this.steps[currentStep].executeStep(baseContext);

            // FIXME: the context is merging recursively 
            Util.updateContext(baseContext, result.context);

            if (baseContext.return === true) break;

            if (result.next) {
                console.log("Entering sub-journey");
                console.log(this.steps[0].line);
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

    buildFromJson(json) {
        this.name = json.name;

        let messages = i18next.t(`journeys.${this.name}`, { returnObjects: true });
        this.steps = Journey.deserializeSteps(json.steps, messages);

        this.firstStep.chainSteps(steps);
    }

    async buildFromSteps(steps = []) {
        steps.forEach(s => { s.journey = this; });
        this.steps = steps;
        this.firstStep = steps[0];
    }

    static deserializeSteps(stepsDefinitions = [], messages = {}) {
        let steps = [];
        stepsDefinitions.forEach(s => {
            let step;

            switch (s.type) {
                case "message":
                    step = Step.createMessageAction(messages[s.message_id], s.context);
                    break;
                case "execution":
                    step = Step.createExecutionAction(s.function_name, s.context);
                    break;
                case "verification":
                    step = Step.createVerificationAction(s, messages);
                    break;
                // Add other step types here
                default:
                    console.warn(`Unknown step type: ${s.type}`);
            }
            step.name = s.message_id || s.function_name || "step";
            if (step) steps.push(step);
        });

        return steps;
    }
}

export default Journey;