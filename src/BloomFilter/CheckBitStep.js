import Step from "../Step.js";
import { managerInstance } from "../Manager.js";
import draw from "../Draw.js";

export default class CheckBitStep extends Step {
    constructor() {
        super();
        this.name = 'check-bit';

    }

    undo(context) {
        let hashName = `h${this.index}`;
        let bitPosition = context[hashName];
        let item = context.item;
        draw.removeCheckLine(bitPosition, item);

        draw.renderBitList(managerInstance.bf.bitArray);
        draw.redrawLines();
    }
}