class BloomFilter {
    constructor(size = 10) {
        this.size = size;
        this.hashCount = 3;
        this.elements = [];
        this.bitArray = new Array(size).fill(false);

        window.dispatchEvent(new Event('refreshUI'));
    }

    static hash1(item, size) {
        let hash = 0;
        for (let i = 0; i < item.length; i++) {
            hash = (hash * 31 + item.charCodeAt(i)) % size;
        }
        return hash;
    }

    static hash2(item, size) {
        let hash = 5381;
        for (let i = 0; i < item.length; i++) {
            hash = (hash << 5) + hash + item.charCodeAt(i);
        }
        return Math.abs(hash) % size;
    }

    static hash3(item, size) {
        let hash = 7;
        for (let i = 0; i < item.length; i++) {
            hash = (hash * 17 + item.charCodeAt(i)) % size;
        }
        return hash;
    }

    calculateFPR() {
        const m = this.size;
        const k = this.hashCount;
        const n = this.elements;
        return Math.pow(1 - Math.exp((-k * n) / m), k);
    }
}

export default BloomFilter;
export { BloomFilter };
