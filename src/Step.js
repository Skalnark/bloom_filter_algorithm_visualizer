import { managerInstance } from "./Manager.js";
import { prompt } from "./Prompt.js";
import { Util } from "./Util.js";

class Step {
    constructor(name, index) {
        this.action = null;
        this.context = {};
        this.name = name;
        this.index = index;
        this.skip = false;
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

    undo(context)
    {
        return context;
    }

}

export default Step;