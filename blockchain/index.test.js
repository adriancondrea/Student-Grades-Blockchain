const Blockchain = require('./index');
const Block = require('./block');
const {cryptoHash} = require('../util');
const Wallet = require("../wallet");
const Transaction = require("../wallet/transaction");

describe('Blockchain', () => {
    let blockchain, newChain, errorMock, originalChain;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();
        errorMock = jest.fn();

        originalChain = blockchain.chain;
        global.console.error = errorMock;
    })

    it('contains a `chain` Array instance', () => {
        expect(blockchain.chain instanceof Array).toEqual(true);
    });

    it('starts with the genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block to the chain', () => {
        const newData = 'test_data';
        blockchain.addBlock({data: newData});

        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
    });

    describe('isValidChain()', () => {
        describe('when the chain does not start with the genesis block', () => {
            it('returns false', () => {
                blockchain.chain[0] = {data: 'invalid-block'};

                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('when the chain starts with the genesis block and has multiple blocks', () => {
            beforeEach(() => {
                blockchain.addBlock({data: 'block1'});
                blockchain.addBlock({data: 'block2'});
                blockchain.addBlock({data: 'block3'});
                blockchain.addBlock({data: 'block4'});
            });

            describe('and a lastHash reference has changed', () => {
                it('returns false', () => {
                    blockchain.chain[3].lastHash = 'invalid-lastHash';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with an altered field', () => {
                it('returns false', () => {
                    blockchain.chain[2].data = 'altered_data'
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            })

            describe('and the chain contains a block with a jumped difficulty', () => {
                it('returns false', () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length - 1];
                    const lastHash = lastBlock.hash;
                    const timestamp = Date.now();
                    const nonce = 0;
                    const data = [];
                    const difficulty = lastBlock.difficulty - 3;

                    const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);

                    const badBlock = new Block({
                        timestamp, lastHash, hash, nonce, difficulty, data
                    });

                    blockchain.chain.push(badBlock);

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });
            describe('and the chain does not contain invalid blocks', () => {
                it('returns true', () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });
        });
    });

    describe('replaceChain()', () => {
        let logMock;

        beforeEach(() => {
            logMock = jest.fn();

            global.console.log = logMock;
        });

        describe('when the new chain is not longer', () => {
            beforeEach(() => {
                newChain.chain[0] = {data: 'data'};

                blockchain.replaceChain(newChain.chain);
            });

            it('does not replace the chain', () => {
                expect(blockchain.chain).toEqual(originalChain);
            });

            it('logs an error', () => {
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('when the new chain is longer', () => {
            beforeEach(() => {
                newChain.addBlock({data: 'block1'});
                newChain.addBlock({data: 'block2'});
                newChain.addBlock({data: 'block3'});
                newChain.addBlock({data: 'block4'});
            });

            describe('and the chain is invalid', () => {
                beforeEach(() => {
                    newChain.chain[newChain.chain.length - 1].hash = 'invalidHash';

                    blockchain.replaceChain(newChain.chain);
                });

                it('does not replace the chain', () => {
                    expect(blockchain.chain).toEqual(originalChain);
                });

                it('logs an error', () => {
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('and the chain is valid', () => {
                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);
                });

                it('replaces the chain', () => {
                    expect(blockchain.chain).toEqual(newChain.chain);
                });

                it('logs the chain replacement', () => {
                    expect(logMock).toHaveBeenCalled();
                });
            });
        });

        describe('and the validateTransactions flag is true', () => {
            it('calls validTransactionData', () => {
                const validTransactionDataMock = jest.fn();

                blockchain.validTransactionData = validTransactionDataMock;

                newChain.addBlock({data: 'fake-data'});
                blockchain.replaceChain(newChain.chain, true);

                expect(validTransactionDataMock).toHaveBeenCalled();
            });
        });
    });

    describe('validTransactionData()', () => {
        let transaction, rewardTransaction, wallet;

        beforeEach(() => {
            wallet = new Wallet();
            transaction = wallet.createTransaction({
                recipient: 'test-recipient',
                amount: 10
            });
            rewardTransaction = Transaction.rewardTransaction({minerWallet: wallet});
        });

        describe('and the transaction data is valid', () => {
            it('returns true', () => {
                newChain.addBlock({data: [transaction, rewardTransaction]});

                expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(true);
                expect(errorMock).not.toHaveBeenCalled();
            });
        });

        describe('and the transaction data has multiple rewards', () => {
            it('returns false and logs an error', () => {
                newChain.addBlock({data: [transaction, rewardTransaction, rewardTransaction]});

                expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('and the transaction data has at least one malformed output map', () => {
            describe('and the transaction is not a reward transaction', () => {
                it('returns false and logs an error', () => {
                    transaction.outputMap[wallet.publicKey] *= 10;

                    newChain.addBlock({data: [transaction, rewardTransaction]});

                    expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('and the transaction is a reward transaction', () => {
                it('returns false and logs an error', () => {
                    rewardTransaction.outputMap[wallet.publicKey] *= 100;

                    newChain.addBlock({data: [transaction, rewardTransaction]});

                    expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
        });

        describe('and the transaction data has at least one malformed input', () => {
            it('returns false and logs an error', () => {
                wallet.balance = 10000;

                const malformedOutputMap = {
                    [wallet.publicKey]: 9900,
                    testRecipient: 100
                };

                const malformedTransaction = {
                    input: {
                        timestamp: Date.now(),
                        amount: wallet.balance,
                        address: wallet.publicKey,
                        signature: wallet.sign(malformedOutputMap)
                    },
                    outputMap: malformedOutputMap
                }

                newChain.addBlock({data: [malformedTransaction, rewardTransaction]});

                expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('and a block contains multiple identical transactions', () => {
            it('returns false and logs an error', () => {
                newChain.addBlock({
                    data: [transaction, transaction, transaction, rewardTransaction]
                });

                expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });
    });
});