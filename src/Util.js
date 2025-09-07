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
        //uses the hash to generate a color with one dominant RGB channel
        let baseColor = hash >> 24 & 0x03; // 0, 1, or 2
        let r = 0, g = 0, b = 0;
        
        switch(baseColor) {
            case 0:
                r = 255;
                g = (hash >> 8) & 0xFF;
                b = (hash >> 16) & 0xFF;
                break;
            case 1:
                g = 255;
                r = (hash >> 8) & 0xFF;
                b = (hash >> 16) & 0xFF;
                break;
            case 2:
                b = 255;
                r = (hash >> 8) & 0xFF;
                g = (hash >> 16) & 0xFF;
                break;
        }

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

        if(this.isElementOutOfView(updatedElementId)) {
            window.dispatchEvent(new Event('element-out-of-view'));
            this.scrollToElementById(updatedElementId);
        }
    }

    static scrollToPromptTextarea() {
        const scrollButton = document.getElementById('scroll-button');
        scrollButton.style.display = 'none';
        this.scrollToElementById('prompt-textarea');
    }

    static isElementOutOfView(id) {
        const rect = document.getElementById(id)?.getBoundingClientRect();
        if(!rect) return false;
        return (
            rect.bottom < 0 ||
            rect.top > window.innerHeight ||
            rect.right < 0 ||
            rect.left > window.innerWidth
        );
    }
}
