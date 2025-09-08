import { faker } from '@faker-js/faker';
import Journey from './Journey.js';
import { stack } from 'd3';

export class Util {

    static getLoremWords(n) {
        let words = [];
        for (let i = 0; i < n; i++) {
            words.push(faker.word.noun());
        }
        return words;
    }

    static strToColor(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }

        let b = 255;
        let r = (hash >> 8) & 0xFF;
        let g = (hash >> 16) & 0xFF;

        return `rgb(${r}, ${g}, ${b})`;
    }

    static scrollToElementById(id) {
        let offset = 60;
        console.log("Scrolling to element: " + id);
        const el = document.getElementById(id);
        if (el) {
            const y = el.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }

    static scrollToNextElement(updatedElementId, fastForward = false) {
        if (fastForward) return;

        if (this.isElementOutOfView(updatedElementId)) {
            window.dispatchEvent(new Event('element-out-of-view'));
            this.scrollToElementById(updatedElementId);
        }
    }

    static scrollToPromptTextarea() {
        const scrollButton = document.getElementById('scroll-button');
        scrollButton.style.display = 'none';
        this.scrollToElementById('prompt-simulator');
    }

    static isElementOutOfView(id) {
        const rect = document.getElementById(id)?.getBoundingClientRect();
        if (!rect) return false;
        return (
            rect.bottom < 0 ||
            rect.top > window.innerHeight ||
            rect.right < 0 ||
            rect.left > window.innerWidth
        );
    }

    static getTextWidth(text, font) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = font;
        return context.measureText(text).width;
    }
}
