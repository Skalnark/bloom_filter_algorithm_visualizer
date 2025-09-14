// Extends Step
import { Step } from "../../Step.js";

export default class CheckBitStep extends Step {
    constructor() {
        super();
        this.name = 'check-bit';

    }

    undo(context) {
        let hashName = `h${this.id}`;
        let bitPosition = context[hashName];
        let item = context.item;
        draw.removeCheckLine(bitPosition, item);

        draw.renderBitList(managerInstance.bf.bitArray);
        draw.redrawLines();
    }
}