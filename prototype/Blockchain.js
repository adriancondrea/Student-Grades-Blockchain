const {Block, prototypeHash} = require("./Block");

class Blockchain{
    constructor() {
        const genesis = new Block('genesis-data', 'genesis-hash', 'genesis-lastHash');
        this.chain = [genesis];
    }

    /**
     * creates a Block with given data and adds it to the chain
     * @param data - the data to be added to the chain
     */
    addBlock(data) {
        const lastHash = this.chain[this.chain.length - 1].hash;
        const hash = prototypeHash(data + lastHash);
        const block = new Block(data, hash, lastHash);

        this.chain.push(block);
    }
}

module.exports = Blockchain