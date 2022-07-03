const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain = require("../blockchain");

describe('TransactionPool', () => {
    let transactionPool, transaction, senderWallet;

    beforeEach(() => {
        transactionPool = new TransactionPool();
        senderWallet = new Wallet();
        transaction = new Transaction({
            senderWallet,
            recipient: 'testRecipient',
            amount: 10
        });
    });

    describe('setTransaction()', () => {
        it('adds a transaction', () => {
            transactionPool.setTransaction(transaction);

            expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
        });
    });

    describe('existingTransaction()', () => {
        it('returns an existing transaction given an input address', () => {
            transactionPool.setTransaction(transaction);

            expect(transactionPool.existingTransaction({inputAddress: senderWallet.publicKey}))
                .toBe(transaction);
        });
    });

    describe('validTransactions()', () => {
        let validTransactions, errorMock;

        beforeEach(() => {
            validTransactions = [];
            errorMock = jest.fn();
            global.console.error = errorMock;

            for (let i = 0; i < 10; i++) {
                transaction = new Transaction({
                    senderWallet,
                    recipient: 'test-recipient',
                    amount: 10
                });

                // alter a few transactions
                switch (i % 3) {
                    case 0:
                        transaction.input.amount *= 2;
                        break;
                    case 1:
                        transaction.input.signature = new Wallet().sign('fake-test-data');
                        break;
                    default:
                        validTransactions.push(transaction);
                        break;
                }
                transactionPool.setTransaction(transaction);
            }
        });

        it('logs errors in case of invalid transactions', () => {
            transactionPool.validTransactions();
            expect(errorMock).toHaveBeenCalled();
        });
    });

    describe('clear()', () => {
        it('clears the transactions', () => {
            transactionPool.clear();

            expect(transactionPool.transactionMap).toEqual({});
        })
    });

    describe('clearBlockchainTransactions()', () => {
        it('clears the pool of any existing blockchain transactions', () => {
            const blockchain = new Blockchain();
            const expectedTransactionMap = {};

            for (let i = 0; i < 10; i++) {
                const transaction = new Wallet().createTransaction({
                    recipient: 'test-recipient', amount: 20
                });

                transactionPool.setTransaction(transaction);

                if (i % 2 === 0) {
                    blockchain.addBlock({data: [transaction]});
                } else {
                    expectedTransactionMap[transaction.id] = transaction;
                }
            }

            transactionPool.clearBlockchainTransactions({chain: blockchain.chain});

            expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
        });
    });
});