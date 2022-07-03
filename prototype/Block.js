const prototypeHash = (data) => {
    return data + "*"
}

class Block{
    constructor(data, hash, lastHash) {
        this.data = data;
        this.hash = hash;
        this.lastHash = lastHash;
    }
}

exports.Block = Block;
exports.prototypeHash = prototypeHash;