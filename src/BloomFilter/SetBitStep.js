import Step from "../Step.js";

export default class SetBitStep extends Step {
    constructor() {
        super();
        this.name = 'set-bit';
    }

    undo(context) {
        let hashName = `h${this.id}`;
        if (this.id === 1) {
            managerInstance.bf.elements.splice(managerInstance.bf.elements.indexOf(context.item), 1);

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
}