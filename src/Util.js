import { faker } from '@faker-js/faker';
import { managerInstance } from './Manager.js';

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
        let offset = 100;
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

    static updateContext(original, updates) {
        for (let key in updates) {
            if (updates[key] === undefined || updates[key] === null) {
            } else {
                original[key] = updates[key];
            }
        }
        return original;
    }

    static async delay(ms) {
        if (managerInstance.fastForward)
            ms = 0;
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static async scroll(elementId) {
        if (managerInstance.fastForward) return;
        this.scrollToElementById(elementId);
    }

    static deleteElementById(id) {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = '';
            el.remove();
        }
    }
}
