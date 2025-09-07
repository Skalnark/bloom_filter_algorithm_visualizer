import draw from "./Draw.js";
import { prompt } from "./PromptController.js";

class BloomFilter {
    constructor(size=30) {
        if(BloomFilter._instance) {
            return BloomFilter._instance;
        }
        
        this.initialize(size);
        BloomFilter._instance = this;
    }

    initialize(size) {
        this.hashCount = 3;
        this.size = size;
        this.bitArray = Array.from({ length: size }, () => []);
        this.bitArray.fill(false);
        this.elements = [];
        draw.renderBitList(this.bitArray);
        draw.clearItemBoxes();
        draw.clearAllLines();
    }

    clear() {
        this.bitArray.fill(false);
        this.elements = [];
        draw.renderBitList(this.bitArray);
        draw.clearItemBoxes();
        draw.clearAllLines();
        draw.clearCheckLines();
    }

    async stepByStepHash1(item, index, currentHash) {
        if(index == 0)
            prompt.printVerbose(`hash1 formula = ∑ i = 0 to item.size - 1 => (hash * 31 + charCode(item[i])) % bitArraySize`);
        let hash = currentHash;
        hash = (hash * 31 + item.charCodeAt(index)) % this.size;
        return hash;
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
