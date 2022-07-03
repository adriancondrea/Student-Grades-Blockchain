const uuid = require('uuid/v1');
const {verifySignature} = require("../util");
const {REWARD_INPUT, MINING_REWARD} = require("../config");

class Transaction {
    constructor({courseId, senderWallet, recipient, amount, outputMap, input}) {
        this.id = uuid();
        this.outputMap = outputMap || this.createOutputMap({senderWallet, recipient, amount});
        this.input = input || this.createInput({courseId, senderWallet, outputMap: this.outputMap});
    }

    static validTransaction(transaction) {
        const {input: {address, signature}, outputMap} = transaction;
        if (!verifySignature({publicKey: address, data: outputMap, signature})) {
            console.error(`Invalid signature from ${address}`);
            return false;
        }
        return true;
    }

    static rewardTransaction({minerWallet}) {
        return new this({
            input: { ...REWARD_INPUT, timestamp: Date.now() },
            outputMap: {[minerWallet.publicKey]: MINING_REWARD}
        });
    }

    createOutputMap({recipient, amount}) {
        const outputMap = {};

        outputMap[recipient] = amount;

        return outputMap;
    }

    createInput({courseId, senderWallet, outputMap}) {
        return {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            courseId: courseId,
            signature: senderWallet.sign(outputMap)
        };
    }

    update({senderWallet, recipient, amount}) {
        if (!this.outputMap[recipient]) {
            this.outputMap[recipient] = amount;
        } else {
            this.outputMap[recipient] += amount;
        }
        this.input = this.createInput({senderWallet, outputMap: this.outputMap});
    }
}

module.exports = Transaction;