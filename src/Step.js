import { managerInstance } from "./Manager.js";
import { prompt } from "./Prompt.js";
import { Util } from "./Util.js";

class Step {
    constructor(name, id) {
        this.action = null;
        this.context = {};
        this.name = name;
        this.id = id;
    }

    async executeStep(baseContext = {}) {
        let actionResult;
        if (this.action) {
            actionResult = await this.action(baseContext);
            if (this.context.output !== undefined && this.context.output !== null) {
                baseContext[this.context.output] = actionResult;
            }
            else {
                Util.updateContext(baseContext, actionResult);
            }
        }
        if (this.context.output !== undefined
            && this.context.expectedResult !== undefined
            && this.context.output !== null
            && this.context.expectedResult !== null
        ) {
            return actionResult === this.context.expectedResult;
        }
        return null;
    }

    chainSteps(steps) {
        let chainName = '';
        let last = steps[steps.length - 1];
        steps.pop();
        for (let i = steps.length - 1; i >= 0; i--) {
            if (last) {
                let current = steps[i];
                if (current) {
                    current.singleStep(last);
                    chainName = last.name + ' -> ' + chainName;
                    last = current;
                }
            }
        }

        this.singleStep(last);
    }

    singleStep(step) {
        this.possibleNextSteps.push(step);
        this.predicate = () => {
            return 0;
        };
    }

    static createMessageAction(message) {
        let step = new Step();
        step.action = async (context) => {
            if (!message) prompt.newLine();
            prompt.printJourneyMessage(message, context);
            return null;
        };
        return step;
    }

    static createExecutionAction(functionName, context = {}) {
        let manager = managerInstance;
        let step = new Step();
        step.context = context;
        step.action = manager.functionRegistry(functionName);
        if (!step.action)
            throw new Error(`Function '${functionName}' is not registered.`);
        return step;
    }

    static createDefineAction() {
        let step = new Step();
        step.action = async (context) => {

            Util.updateContext(context, step.context);

            let name = context['destiny'];
            let value = context['origin'];
            let arr = [];
            if (Array.isArray(value) && value.length > 0) {
                let len = value.length;

                for (let i = 0; i < len; i++) {
                    let val = context[value[i]];
                    arr.push(val);
                }
                context[name] = arr;
            } else {
                context[name] = context[value];
            }

            return context;
        };

        return step;
    }

}

export default Step;