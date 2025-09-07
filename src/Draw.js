import { color, max, text } from 'd3';
import { Vector } from './Vector.js';
import { sv } from '@faker-js/faker';
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

    // Uses d3 to draw a square at (x, y) with given size, fill color and stroke color
    // moves the square to some (x, y) coordinates (if provided)
    // and then returns the x and y coordinates of the square
    #drawSquare(x, y, size, fill = '#181c1f', stroke = '#168344ff') {
        const rect = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'rect',
        );
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', size);
        rect.setAttribute('height', size);
        rect.setAttribute('fill', fill);
        rect.setAttribute('stroke', stroke);
        rect.setAttribute('background-color', '#181c1f');
        rect.setAttribute('class', 'bf-bit');
        return rect;
    }

    #drawBitValue(x, y, value, size, fontColor = '#b6fcd5') {
        const text = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'text',
        );
        text.setAttribute('x', x);
        text.setAttribute('y', y);
        text.setAttribute('font-family', 'sans-serif');
        text.setAttribute('font-size', size);
        text.setAttribute('fill', fontColor);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('alignment-baseline', 'middle');
        text.setAttribute('class', 'bf-bit-text');
        text.textContent = value;
        return text;
    }

    renderBitList(bits) {
        this.bitBoxes.forEach(({ square, text }) => {
            this.svg.removeChild(square);
            this.svg.removeChild(text);
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

            let fill = bit === '1' ? '#b6fcd5' : '#181c1f';
            let fillText = bit === '1' ? '#181c1f' : '#b6fcd5';
            let square = this.#drawSquare(x, y, size, fill);

            square.setAttribute('id', `bit-${i}`);
            let text = this.#drawBitValue(x + (size / 2), y + (size / 6) * 4, bit, size / 2, fillText);
            text.setAttribute('id', `bit-text-${i}`);

            let index = this.#drawBitValue(x - (size / 2), y + size, i, size / 3, '#b6fcd5');
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

    drawCheckBox(item) {

        if (this.checkBox) {
            this.checkBox.textElem.textContent = item;
        }
        else {
            let x = this.svg.clientWidth / 2;
            let y = 0;//this.svg.style.height/2 - 100;
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
            rect.setAttribute('fill', '#ffffffff');
            rect.setAttribute('stroke', '#000000');
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
            textElem.setAttribute('fill', '#000000');
            textElem.setAttribute('text-anchor', 'middle');
            textElem.setAttribute('alignment-baseline', 'middle');
            textElem.setAttribute('class', 'bf-text-box-text');
            textElem.setAttribute('id', 'item-check-text-' + item);
            textElem.textContent = item;

            this.svg.appendChild(rect);
            this.svg.appendChild(textElem);

            this.checkBox.rect = rect;
            this.checkBox.textElem = textElem;
            this.checkBox.color = '#ffffffff';
        }
    }

    drawCheckLine(hash, value, item) {
        let color = value ? '#11ff00ff' : '#ff0000ff';
        let line = this.#drawLine({ div1: `check-box`, div2: `bit-${hash}`, color: color }, true);
        line.setAttribute('id', `check-line-${item}-bit-${hash}`);
        this.checkLines.push(line);
        this.svg.appendChild(line);
    }

    clearCheckLines() {
        this.checkBox = null;
        if (document.getElementById('check-box')) {
            this.svg.removeChild(document.getElementById('check-box'));
        }

        this.checkLines.forEach(line => {
            this.svg.removeChild(line);
        });
        this.checkLines = [];
    }

    drawTextBox(item, hashPosition) {
        let x = 0;
        let y = 0;//this.svg.style.height/2 - 100;
        let width = 200;
        let height = 40;
        let fontSize = 20;
        let bit = this.bitBoxes[hashPosition].square;

        if (!this.itemBoxes.find(b => b.textElem.textContent === item)) {

            const rect = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'rect',
            );
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', width);
            rect.setAttribute('height', height);
            rect.setAttribute('fill', '#ffffffff');
            rect.setAttribute('stroke', '#000000');
            rect.setAttribute('class', 'bf-text-box');
            rect.setAttribute('id', 'item-box-' + item);

            const textElem = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'text',
            );
            textElem.setAttribute('x', x + width / 2);
            textElem.setAttribute('y', (y + height / 2));
            textElem.setAttribute('font-family', 'sans-serif');
            textElem.setAttribute('font-size', fontSize);
            textElem.setAttribute('fill', '#000000');
            textElem.setAttribute('text-anchor', 'middle');
            textElem.setAttribute('alignment-baseline', 'middle');
            textElem.setAttribute('class', 'bf-text-box-text');
            textElem.setAttribute('id', 'item-box-text-' + item);
            textElem.textContent = item;

            this.svg.appendChild(rect);
            this.svg.appendChild(textElem);

            let itemBox = { rect, textElem, bits: [] };
            itemBox.bits.push(bit);

            this.itemBoxes.push(itemBox);
        }
        else {
            let itemBox = this.itemBoxes.find(b => b.textElem.textContent === item);
            itemBox.bits.push(bit);
        }

        this.repositionItemBoxes();
    }

    repositionItemBoxes() {
        if (this.itemBoxes.length === 0) return;

        let givenX = this.svg.clientWidth - 250;
        let gap = 4 * this.svg.clientHeight / 100;
        let lastYPosition = 50;
        this.itemBoxes.forEach(({ rect, textElem }) => {
            let newY = lastYPosition + parseInt(rect.getAttribute('height')) + gap;
            let fontSize = textElem.getAttribute('font-size');
            let textOffsetY = parseInt(fontSize) / 2 + parseInt(rect.getAttribute('height')) / 2;
            let textOffsetX = parseInt(rect.getAttribute('width')) / 2;

            rect.setAttribute('x', givenX);
            rect.setAttribute('y', newY);
            textElem.setAttribute('x', givenX + textOffsetX);
            textElem.setAttribute('y', newY + textOffsetY);
            lastYPosition = newY;
        });

        this.drawItemLines();
    }

    drawItemLines() {
        this.clearAllLines();

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

    clearAllLines() {
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
        const color = v.color || '#143b83ff';
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
