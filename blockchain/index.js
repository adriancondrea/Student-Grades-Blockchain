const Block = require("./block");
const {cryptoHash} = require("../util");
const {REWARD_INPUT, MINING_REWARD} = require("../config");
const Transaction = require("../wallet/transaction");
const Wallet = require("../wallet");

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    static isValidChain(chain) {
        console.log(`validating chain...`)
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false;
        }

        for (let i = 1; i < chain.length; i++) {
            const {timestamp, lastHash, hash, data, nonce, difficulty} = chain[i];
            const previousBlockHash = chain[i - 1].hash;
            const previousBlockDifficulty = chain[i - 1].difficulty;

            if (lastHash !== previousBlockHash) {
                console.log(`chain is invalid! (lastHash !== previousBlockHash)`)
                return false;
            }

            const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
            if (hash !== validatedHash) {
                console.log(`chain is invalid! (hash !== validatedHash)`)
                return false;
            }

            if (Math.abs(previousBlockDifficulty - difficulty) > 1) {
                console.log(`chain is invalid! (previousBlockDifficulty - difficulty > 1)`)
                return false;
            }
        }

        console.log(`chain is valid!`);
        return true;
    }

    addBlock({data}) {
        console.log(`adding new block...`)
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length - 1],
            data
        });

        this.chain.push(newBlock)
    }

    replaceChain(chain, validateTransactions, onSuccess) {
        if (chain.length <= this.chain.length) {
            console.error('replacement chain must be longer!');
            return;
        }

        if (!Blockchain.isValidChain(chain)) {
            console.error('replacement chain must be valid!');
            return;
        }

        if (validateTransactions && !this.validTransactionData({chain})) {
            console.error('The incoming chain has invalid data!');
            return;
        }

        if (onSuccess) {
            onSuccess();
        }
        console.log(`replacing chain...`);
        this.chain = chain;
    }

    validTransactionData({chain}) {
        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            const transactionSet = new Set();
            let rewardTransactionCount = 0;

            for (let transaction of block.data) {
                if (transaction.input.address === REWARD_INPUT.address) {
                    rewardTransactionCount += 1;

                    if (rewardTransactionCount > 1) {
                        console.error('Miner rewards exceed limit!');
                        return false;
                    }

                    if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
                        console.error('Miner reward amount is invalid!');
                        return false;
                    }
                } else {
                    if (!Transaction.validTransaction(transaction)) {
                        console.error('Invalid Transaction!');
                        return false;
                    }

                    const trueBalance = Wallet.calculateBalance({
                        // it is crucial here to have this.chain, and not the chain received as a parameter,
                        // since that one can also be faked
                        chain: this.chain,
                        address: transaction.input.address,
                        timestamp: chain[i - 1].timestamp
                    });

                    if (transaction.input.amount !== trueBalance) {
                        console.error('Invalid input amount!');
                        console.log('transaction.input.amount: ', transaction.input.amount);
                        console.log('trueBalance: ', trueBalance);
                        return false;
                    }
                }

                if (transactionSet.has(transaction)) {
                    console.error('An identical transaction appears more than once in the block!');
                    return false;
                } else {
                    transactionSet.add(transaction);
                }
            }
        }
        console.log(`valid transaction data...`);
        return true;
    }
}

module.exports = Blockchain