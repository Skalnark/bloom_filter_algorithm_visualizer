import { faker } from "@faker-js/faker";

export class Util {
  static getLoremWords(n) {
    let words = [];
    for (let i = 0; i < n; i++) {
      words.push(faker.word.noun());
    }
    return words;
  }
}
