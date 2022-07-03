const {STARTING_BALANCE, REWARD_INPUT} = require('../config');
const {ec, cryptoHash} = require('../util');
const Transaction = require("./transaction");

class Wallet {
    constructor() {
        this.balance = STARTING_BALANCE;

        this.keyPair = ec.genKeyPair();

        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    static getTransactionsGivenAddress({chain, address}) {
        const transactions = [];
        for (let i = chain.length - 1; i > 0; i--) {
            for (const transaction of chain[i].data) {
                const addressOutput = transaction.outputMap[address];
                if (addressOutput) {
                    transactions.push({
                        points: transaction.outputMap[address],
                        timestamp: transaction.input.timestamp,
                        courseId: transaction.input.courseId
                    })
                }
            }
        }

        return transactions;
    }

    static calculateBalance({chain, address, timestamp}) {
        let outputsTotal = 0;
        let hasConductedTransaction = false;
        let lessThanTimestamp = false;
        for (let i = chain.length - 1; i > 0; i--) {
            lessThanTimestamp = chain[i].timestamp <= timestamp;
            for (const transaction of chain[i].data) {
                // we only compute the balance up to the timestamp given as parameter
                if (transaction.input.timestamp >= timestamp && transaction.input.address !== REWARD_INPUT.address) {
                    break;
                }

                if (transaction.input.address === address) {
                    hasConductedTransaction = true;
                }

                const addressOutput = transaction.outputMap[address];

                if (addressOutput) {
                    outputsTotal += addressOutput;
                }
            }
            if (hasConductedTransaction) {
                return outputsTotal;
            }
        }

        return STARTING_BALANCE + outputsTotal;
    }

    sign(data) {
        return this.keyPair.sign(cryptoHash(data));
    }

    createTransaction({courseId, amount, recipient, chain}) {
        if (chain) {
            this.balance = Wallet.calculateBalance({chain, address: this.publicKey});
        }
        return new Transaction({courseId, senderWallet: this, amount, recipient});
    }
}

module.exports = Wallet;