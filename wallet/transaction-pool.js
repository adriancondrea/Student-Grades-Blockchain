const Transaction = require('./transaction');

class TransactionPool {
    constructor() {
        this.transactionMap = {};
    }

    setTransaction(transaction) {
        this.transactionMap[transaction.id] = transaction;
    }

    setMap(rootTransactionPoolMap) {
        this.transactionMap = rootTransactionPoolMap;
    }

    existingTransaction({inputAddress}) {
        const transactions = Object.values(this.transactionMap);

        return transactions.find(transaction => transaction.input.address === inputAddress)
    }

    validTransactions() {
        const validTransactions = Object.values(this.transactionMap).filter(transaction => Transaction.validTransaction(transaction));
        console.log(`transactions count: ${Object.keys(this.transactionMap).length}`);
        console.log(`valid transactions count: ${validTransactions.length}`);
        return validTransactions;
    }

    clear() {
        console.log(`clearing transaction pool...`);
        this.transactionMap = {};
    }

    clearBlockchainTransactions({chain}) {
        for (let block of chain) {
            for (let transaction of block.data) {
                if (this.transactionMap[transaction.id]) {
                    delete this.transactionMap[transaction.id];
                }
            }
        }
    }
}

module.exports = TransactionPool;