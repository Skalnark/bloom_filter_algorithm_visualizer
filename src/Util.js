import { faker } from '@faker-js/faker';

export class Util {
    static getLoremWords(n) {
        let words = [];
        for (let i = 0; i < n; i++) {
            words.push(faker.word.noun());
        }
        return words;
    }

    static stringToColor(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xFF;
            color += value.toString(16).padStart(2, '0');
        }
        return color;
    }
}
