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
        this.size = size;
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
            hash = (hash * 31 + item.charCodeAt(i) + salt) % this.size;
        }
        return hash;
    }

    async journeyHash1(context) {
        let hash = this.hash1(context.item);
        let output = { position: hash, hash1: hash };
        return { next: null, context: Util.updateContext(context, output) };
    }

    async journeyHash2(context) {
        let hash = this.hash2(context.item);
        let output = { position: hash, hash2: hash };
        return { next: null, context: Util.updateContext(context, output) };
    }

    async journeyHash3(context) {
        let hash = this.hash3(context.item);
        let output = { position: hash, hash3: hash };
        return { next: null, context: Util.updateContext(context, output) };
    }

    async journeyContains(context) {
        let found = this.elements.includes(context.item);
        let output = { predicate_result: found };
        return { next: null, context: Util.updateContext(context, output) };
    }

    hash1(item) {
        let hash = 0;
        for (let i = 0; i < item.length; i++) {
            hash = (hash * 31 + item.charCodeAt(i)) % this.size;
        }
        return hash;
    }

    hash2(item) {
        let hash = 5381;
        for (let i = 0; i < item.length; i++) {
            hash = (hash << 5) + hash + item.charCodeAt(i);
        }
        return Math.abs(hash) % this.size;
    }

    hash3(item) {
        let hash = 7;
        for (let i = 0; i < item.length; i++) {
            hash = (hash * 17 + item.charCodeAt(i)) % this.size;
        }
        return hash;
    }

    calculateFPR() {
        const m = this.size;
        const k = this.hashCount;
        const n = this.elements.length;
        return Math.pow(1 - Math.exp((-k * n) / m), k);
    }
}

export default BloomFilter;
export { BloomFilter };
