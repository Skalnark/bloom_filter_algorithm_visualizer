import draw from "./Draw.js";
import { Util } from "./Util.js";

class BloomFilter {
    constructor(size = 30) {
        if (BloomFilter._instance) {
            return BloomFilter._instance;
        }

        this.initialize(size);
        BloomFilter._instance = this;
    }

    initialize(size, hashCount = 3) {
        this.hashCount = hashCount;
        this.bitArray = Array.from({ length: size }, () => []);
        this.bitArray.fill(false);
        this.elements = [];
        draw.renderBitList(this.bitArray);
        draw.clearItemBoxes();
        draw.clearItemLines();
    }

    clear() {
        this.bitArray.fill(false);
        this.elements = [];
        draw.renderBitList(this.bitArray);
        draw.clearItemBoxes();
        draw.clearItemLines();
        draw.clearCheckLines();
    }

    // hashes the item, uses the index to generate a salt
    hash(item, index) {
        let salt = index * 31;
        let hash = 0;
        for (let i = 0; i < item.length; i++) {
            hash = (hash * 31 + item.charCodeAt(i) + salt) % this.bitArray.length;
        }
        return hash;
    }
    
    calculateFPR() {
        const m = this.bitArray.length;
        const k = this.hashCount;
        const n = this.elements.length;
        return (1 - Math.exp((-k * n) / m)) ** k;
    }
}

export default BloomFilter;
export { BloomFilter };
