class Journey {
  constructor() {}

  /*    add(item) {
        this.elements.push(item);
        const hashes = [
            BloomFilter.hash1(item, this.size),
            BloomFilter.hash2(item, this.size),
            BloomFilter.hash3(item, this.size)
        ];
        hashes.forEach(hash => {
            this.bitArray[hash] = true;
        });

        
        window.dispatchEvent(new Event('refreshUI'));
    } */
  addItemToBloomFilter(bf, item) {
    this.bf = bf;
    this.item = item;
  }
}
