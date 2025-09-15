import Step from "../Step.js";
import { managerInstance } from "../Manager.js";
import draw from "../Draw.js";

export default class SetBitStep extends Step {
    constructor() {
        super();
        this.name = 'set-bit';
    }

    undo(context) {
        let hashName = `h${this.index}`;
        managerInstance.bf.bitArray[context[hashName]] = false;

        draw.renderBitList(managerInstance.bf.bitArray);
        let itemBoxId = 'item-box-' + context.item;
        let itemBox = draw.itemBoxes.filter(b => b.rect.getAttribute('id') === itemBoxId);
        if (itemBox.length > 0) {
            itemBox[0].bits.pop();
        }
        draw.repositionItemBoxes();
    }
}