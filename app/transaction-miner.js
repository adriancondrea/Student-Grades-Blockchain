const Transaction = require("../wallet/transaction");

class TransactionMiner {
    constructor({blockchain, transactionPool, nodeWallet, pubsub}) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.nodeWallet = nodeWallet;
        this.pubsub = pubsub;
    }

    mineTransactions() {
        console.log(`mining transactions...`);
        //get the valid transactions from the transaction pool
        const validTransactions = this.transactionPool.validTransactions();
        if (validTransactions.length > 0) {
            //generate the miner's reward and add it to validTransactions
            validTransactions.push(Transaction.rewardTransaction({minerWallet: this.nodeWallet}));

            //add a block consisting of validTransactions to the blockchain
            this.blockchain.addBlock({data: validTransactions});

            //broadcast the updated blockchain
            this.pubsub.broadcastChain();

            //clear the transaction pool
            this.transactionPool.clear();
        } else {
            throw new Error('No transactions to mine!');
        }
    }
}

module.exports = TransactionMiner;