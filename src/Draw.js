import { Util } from './Util.js';

class Draw {
    static svg;
    itemLines;
    checkLines;
    canvasContainer;

    constructor() {
        this.canvasContainer = document.getElementById('filter-container');
        this.svg = document.getElementById('bloom-filter-svg');
        this.itemLines = [];
        this.checkLines = [];
        this.itemBoxes = [];
        this.bitBoxes = [];
        this.checkBox = null;
    }

    _getVar(name, fallback) {
        try {
            const v = getComputedStyle(document.documentElement).getPropertyValue(name);
            if (v && v.trim()) return v.trim();
        } catch (e) {}
        return fallback;
    }

    #drawSquare(x, y, size, fill, stroke) {
        const rect = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'rect',
        );
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', size);
        rect.setAttribute('height', size);
        const fillColor = fill || this._getVar('--panel-bg', '#181c1f');
        const strokeColor = stroke || this._getVar('--accent-color', '#168344');
        rect.setAttribute('fill', fillColor);
        rect.setAttribute('stroke', strokeColor);
        rect.setAttribute('background-color', fillColor);
        rect.setAttribute('class', 'bf-bit');
        return rect;
    }

    #drawBitValue(x, y, value, size, fontColor) {
        const text = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'text',
        );
        text.setAttribute('x', x);
        text.setAttribute('y', y);
        text.setAttribute('font-family', 'sans-serif');
        text.setAttribute('font-size', size);
        const fc = fontColor || this._getVar('--text', '#b6fcd5');
        text.setAttribute('fill', fc);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('alignment-baseline', 'middle');
        text.setAttribute('class', 'bf-bit-text');
        text.textContent = value;
        return text;
    }

    renderBitList(bits) {
        this.bitBoxes.forEach(({ square, text, index }) => {
            this.svg.removeChild(square);
            this.svg.removeChild(text);
            this.svg.removeChild(index);
        });
        this.bitBoxes = [];

        let x = 0;
        let y = 0;
        let gap = 4;
        let size = 32;

        x = this.svg.clientWidth / 6 - size;
        this.svg.style.height = (size + gap) * bits.length + 'px';

        for (let i = 0; i < bits.length; i++) {
            let bit = bits[i] ? '1' : '0';

            let fill = bit === '1' ? this._getVar('--text', '#b6fcd5') : this._getVar('--panel-bg', '#181c1f');
            let fillText = bit === '1' ? this._getVar('--panel-bg', '#181c1f') : this._getVar('--text', '#b6fcd5');
            let square = this.#drawSquare(x, y, size, fill);

            square.setAttribute('id', `bit-${i}`);
            let text = this.#drawBitValue(x + (size / 2), y + (size / 6) * 4, bit, size / 2, fillText);
            text.setAttribute('id', `bit-text-${i}`);

            let index = this.#drawBitValue(x - (size / 2), y + size * 0.7, i, size / 3, this._getVar('--text', '#b6fcd5'));
            index.setAttribute('id', `bit-index-${i}`);
            this.svg.appendChild(index);

            this.svg.appendChild(square);
            this.svg.appendChild(text);

            this.bitBoxes.push({ square, text, index });
            y += size + gap;
        }
    }

    clearItemBoxes() {
        this.itemBoxes.forEach(({ rect, textElem }) => {
            this.svg.removeChild(rect);
            this.svg.removeChild(textElem);
        });
        this.itemBoxes = [];
    }

    unCheck(lineId, boxId, position) {
        this.uncheckBit(position, boxId);
        this.removeCheckLine(lineId);
    }

    uncheckBit(position, boxId) {
        let bitBox = this.bitBoxes.find(b => b.square.getAttribute('id') === `bit-${position}`);
        if (bitBox) {
            bitBox.square.setAttribute('stroke', this._getVar('--accent-color', '#168344'));
            bitBox.square.setAttribute('stroke-width', '1');
            bitBox.text.textContent = bitBox.square.getAttribute('fill') === '#b6fcd5' ? '1' : '0';
        }
    }

    drawCheckBox(item) {

        if (this.checkBox) {
            this.checkBox.textElem.textContent = item;
        }
        else {
            let x = this.svg.clientWidth / 2;
            let y = 0;
            let width = 200;
            let height = 40;
            let fontSize = 20;

            this.checkBox = { rect: null, textElem: null, color: null };

            const rect = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'rect',
            );
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', width);
            rect.setAttribute('height', height);
            rect.setAttribute('fill', this._getVar('--control-bg', '#ffffff'));
            rect.setAttribute('stroke', this._getVar('--text', '#000000'));
            rect.setAttribute('class', 'bf-text-box');
            rect.setAttribute('id', 'check-box');

            const textElem = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'text',
            );
            textElem.setAttribute('x', x + width / 2);
            textElem.setAttribute('y', (y + height / 2));
            textElem.setAttribute('font-family', 'sans-serif');
            textElem.setAttribute('font-size', fontSize);
            textElem.setAttribute('fill', this._getVar('--text', '#000000'));
            textElem.setAttribute('text-anchor', 'middle');
            textElem.setAttribute('alignment-baseline', 'middle');
            textElem.setAttribute('class', 'bf-text-box-text');
            textElem.setAttribute('id', 'check-text');
            textElem.textContent = item;

            this.svg.appendChild(rect);
            this.svg.appendChild(textElem);

            this.checkBox.rect = rect;
            this.checkBox.textElem = textElem;
            this.checkBox.color = this._getVar('--control-bg', '#ffffff');
        }
    }

    removeCheckLine(hash, item)
    {
        let lineId = `check-line-${item}-bit-${hash}`;
        let lineElem = document.getElementById(lineId);
        if (lineElem) {
            this.svg.removeChild(lineElem);
        }
        let checkLineIndex = this.checkLines.findIndex(cl => cl.line === lineId);
        if (checkLineIndex !== -1) {
            this.checkLines.splice(checkLineIndex, 1);
        }
        this.uncheckBit(hash, item);
    }

    drawCheckLine(hash, value, item) {
    let color = value ? this._getVar('--accent-bright', '#11ff00') : '#ff4d4d';
        let line = this.#drawLine({ div1: `check-box`, div2: `bit-${hash}`, color: color }, true);
        line.setAttribute('id', `check-line-${item}-bit-${hash}`);
        this.checkLines.push({ line: line.id, hash, value, item });
        this.svg.appendChild(line);

        let bitBox = this.bitBoxes[hash];
        if (bitBox) {
            bitBox.square.setAttribute('stroke', color);
            bitBox.square.setAttribute('stroke-width', '4');
            bitBox.text.textContent = value ? '1' : '0';
        }
        return line.id;
    }

    redrawLines() {
        this.clearItemLines();
        this.drawItemLines();
        let lines = this.checkLines;
        this.clearCheckLines();

        lines.forEach(({ hash, value, item }) => {
            this.drawCheckLine(hash, value, item);
        });
    }

    clearCheckLines() {
        this.checkLines.forEach(({ line }) => {
            if (document.getElementById(line)) {
                this.svg.removeChild(document.getElementById(line));
            }
        });
        this.checkLines = [];
    }

    drawTextBox(item, hashPosition) {
        let x = 0;
        let y = 0;
        let width = 200;
        let height = 40;
        let fontSize = 20;
        let bit = this.bitBoxes[hashPosition].square;

        if (!this.itemBoxes.find(b => b.textElem.textContent === item)) {

            const textElem = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'text',
            );
            textElem.setAttribute('x', x);
            textElem.setAttribute('y', y);
            textElem.setAttribute('font-family', 'sans-serif');
            textElem.setAttribute('font-size', fontSize);
            textElem.setAttribute('fill', '#000000');
            textElem.setAttribute('text-anchor', 'middle');
            textElem.setAttribute('alignment-baseline', 'middle');
            textElem.setAttribute('class', 'bf-text-box-text');
            textElem.setAttribute('id', 'item-box-text-' + item);
            textElem.textContent = item;
            this.svg.appendChild(textElem);

            const rect = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'rect',
            );
            rect.setAttribute('x', x - textElem.getBBox().width / 2);
            rect.setAttribute('y', y - textElem.getBBox().height / 2);
            rect.setAttribute('width', textElem.getBBox().width + 10);
            rect.setAttribute('height', textElem.getBBox().height + 10);
            rect.setAttribute('fill', '#ffffffff');
            rect.setAttribute('stroke', '#000000');
            rect.setAttribute('class', 'bf-text-box');
            rect.setAttribute('id', 'item-box-' + item);

            this.svg.appendChild(rect);
            this.svg.removeChild(textElem);
            this.svg.appendChild(textElem);

            let itemBox = { rect, textElem, bits: [] };
            itemBox.bits.push(bit);

            this.itemBoxes.unshift(itemBox);
        }
        else {
            let itemBox = this.itemBoxes.find(b => b.textElem.textContent === item);
            itemBox.bits.push(bit);
        }

        this.repositionItemBoxes();
        return 'item-box-' + item;
    }

    repositionItemBoxes() {
        if (this.itemBoxes.length === 0) return;

        let givenX = this.svg.clientWidth / 2;
        let gap = (this.svg.clientHeight * 0.1) / this.itemBoxes.length;
        gap = Math.max(gap, 0);
        let lastYPosition = 20;
        this.itemBoxes.forEach(({ rect, textElem }) => {
            let newY = lastYPosition + parseInt(rect.getAttribute('height')) + gap;
            let fontSize = textElem.getAttribute('font-size');
            let textOffsetY = parseInt(fontSize) * 0.7;
            let textOffsetX = parseInt(rect.getAttribute('width')) / 2;

            rect.setAttribute('x', givenX);
            rect.setAttribute('y', newY);
            textElem.setAttribute('x', givenX + textOffsetX);
            textElem.setAttribute('y', newY + textOffsetY);
            lastYPosition = newY + gap;
        });

        this.drawItemLines();
    }

    drawItemLines() {
        this.clearItemLines();

        this.itemBoxes.forEach(({ rect, textElem, bits }) => {
            bits.forEach(bit => {
                let newLineId = `line-${rect.getAttribute('id')}-${bit.getAttribute('id')}`;
                let color = Util.strToColor(textElem.textContent);
                let line = this.#drawLine({ div1: rect.getAttribute('id'), div2: bit.getAttribute('id'), color: color });
                line.setAttribute('id', newLineId);
                this.itemLines.push(line);
            });
        });

    }

    clearItemLines() {
        this.itemLines.forEach(line => {
            this.svg.removeChild(line);
        });
        this.itemLines = [];
    }

    getBitBoxId(index) {
        let bitBox = this.bitBoxes[index];
        if (bitBox) {
            return bitBox.square.getAttribute('id');
        }
        return null;
    }

    #drawLine(v, checkLine = false) {
        const origin = document.getElementById(v.div1).getBoundingClientRect();
        const destiny = document.getElementById(v.div2).getBoundingClientRect();
        const parent = this.svg.getBoundingClientRect();

        let startX, startY, endX, endY;
        startX = origin.left - parent.left;
        startY = origin.top - parent.top + origin.height / 2;
        endX = destiny.left - parent.left + destiny.width;
        endY = destiny.top - parent.top + destiny.height / 2;


        const line = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'line',
        );
    const color = v.color || this._getVar('--accent-color', '#143b83');
        line.setAttribute('x1', startX);
        line.setAttribute('y1', startY);
        line.setAttribute('x2', endX);
        line.setAttribute('y2', endY);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', checkLine ? '4' : '2');
        this.svg.appendChild(line);
        return line;
    }
}

const draw = new Draw();
export default draw;
export { draw };
