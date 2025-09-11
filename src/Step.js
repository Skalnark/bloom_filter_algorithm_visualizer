import { managerInstance } from "./Manager.js";
import { prompt } from "./Prompt.js";
import { Util } from "./Util.js";

class Step {
    constructor(journey, action = null, context = {}, predicate = () => { return null; }, possibleNextSteps = []) {
        this.journey = journey;
        this.action = action;
        this.possibleNextSteps = possibleNextSteps;
        this.context = context;
        this.predicate = predicate;
        this.name = null;
        this.line = '';
    }

    updateContext(newContext = {}) {
        Util.updateContext(this.context, newContext);
    }

    async executeStep(baseContext = {}) {
        let result = { next: false, context: baseContext };


        if (this.line === 'define bits=[h1b, h2b, h3b]')
            console.log("here");

        if (this.action) {
            try {
                result = await this.action(baseContext);
                this.updateContext(result.context);
            } catch (e) {
                console.log(this);
                console.log(baseContext);
                throw e;
            }
        }
        if (this.context.predicate_result !== undefined
            && this.context.expectedResult !== undefined
            && this.context.predicate_result !== null
            && this.context.expectedResult !== null
        ) {
            result.next = this.context.predicate_result === this.context.expectedResult;
            this.context.predicate_result = null;
            this.context.expectedResult = null;
        }
        result.context = this.context;
        return result;
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
        console.log(`chained: ${last.name} -> ${chainName}`);
    }

    singleStep(step) {
        this.possibleNextSteps.push(step);
        this.predicate = () => {
            return 0;
        };
    }

    static createMessageAction(message, context = {}) {
        let step = new Step();
        step.context = context;
        step.action = async (context) => {
            if (!message) { prompt.newLine(); return { next: null, context: context }; }
            prompt.printJourneyMessage(message, context);
            return { next: null, context: context };
        };
        return step;
    }

    static createExecutionAction(functionName, context = {}) {
        let manager = managerInstance;
        let step = new Step();
        step.context = context;
        step.action = manager.functionRegistry(functionName);
        return step;
    }

    static createDefineAction() {
        let step = new Step();
        step.action = async (context) => {

            Util.updateContext(context, step.context);

            let name = context['varName'];
            let value = context['varValue'];
            let arr = [];
            if (Array.isArray(value) && value.length > 0) {
                let len = value.length;

                for (let i = 0; i < len; i++) {
                    let val = context[value[i]];
                    arr.push(val);
                }
                context[name] = arr;
                return { next: null, context: context };
            }

            context[name] = context[value];
            return { next: null, context: context };
        };

        return step;
    }

}

export default Step;