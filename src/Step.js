import ConditionEvaluator from "./ConditionEvaluator.js";
import { prompt } from "./PromptController.js";

class Step {
    constructor(action, message, predicate, possibleNextSteps = []) {
        this.action = action;
        this.message = message;
        this.possibleNextSteps = possibleNextSteps;
        this.predicate = predicate;
    }

    async executeStep(context = {}) {
        let result = { next: null, context: context };

        if (this.action) {
            result = await this.action(context);
        }
        if (result.context) context = result.context;

        if (this.message) prompt.printJourneyMessage(this.message, context);

        if (this.possibleNextSteps.length === 0) return result;

        let evaluator = new ConditionEvaluator(this.predicate, context);
        let predicateResult = evaluator.evaluate();
        return { next: this.possibleNextSteps[predicateResult] || null, context: context };
    }

    updateContext(context, result) {
        for (const key in result) {
            context[key] = result[key];
        }
    }
}

export default Step;