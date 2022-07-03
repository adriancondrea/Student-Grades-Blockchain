const cryptoHash = require("./crypto-hash");
const EC = require('elliptic').ec;

// initialize ec with the elliptic curve cryptography instance used by bitcoin (secp256k1)
const ec = new EC('secp256k1');

const verifySignature = ({publicKey, data, signature}) => {
    const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');

    return keyFromPublic.verify(cryptoHash(data), signature);
};

module.exports = {ec, verifySignature, cryptoHash};