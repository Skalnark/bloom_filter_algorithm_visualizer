class ConditionEvaluator {
    constructor(predicateCallBack, context = {}) {
        this.predicateCallBack = predicateCallBack;
        this.context = context;
    }

    evaluate() {
        if (this.predicateCallBack) {
            return this.predicateCallBack(this.context);
        }
        return -1;
    }
}

export default ConditionEvaluator;
