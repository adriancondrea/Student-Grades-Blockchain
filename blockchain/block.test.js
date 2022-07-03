const hexToBinary = require('hex-to-binary')
const Block = require("./block");
const {GENESIS_DATA, MINE_RATE_MILLISECONDS} = require("../config");
const {cryptoHash} = require("../util");

describe('Block', () => {
    const timestamp = 1000;
    const lastHash = 'testLastHash';
    const hash = 'testHash';
    const data = ['one', 'two', 'three'];
    const nonce = 1;
    const difficulty = 1;
    const block = new Block({data, lastHash, hash, timestamp, nonce, difficulty});

    it('has all the fields (timestamp, lastHash, hash, data, nonce, difficulty)', () => {
        expect(block).toEqual({timestamp, lastHash, hash, data, nonce, difficulty});
    });


    describe('genesis()', () => {
        const genesisBlock = Block.genesis();

        it('returns a Block instance', () => {
            expect(genesisBlock instanceof Block).toEqual(true);
        });

        it('returns the genesis data', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA)
        })
    });

    describe('mineBlock()', () => {
        const lastBlock = Block.genesis();
        const data = 'mined data';
        const minedBlock = Block.mineBlock({lastBlock, data});

        it('returns a Block instance', () => {
            expect(minedBlock instanceof Block).toEqual(true);
        });

        it('sets `lastHash` to the `hash` of the lastBlock', () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);
        });

        it('sets the `data` field', () => {
            expect(minedBlock.data).toEqual(data);
        });

        it('sets the `timestamp` field', () => {
            expect(minedBlock.timestamp).toBeDefined();
        });

        it('creates a `hash` based on inputs', () => {
            expect(minedBlock.hash)
                .toEqual(cryptoHash(minedBlock.timestamp, minedBlock.nonce, minedBlock.difficulty, lastBlock.hash, data));
        });

        it('sets a `hash` that meets the difficulty criteria', () => {
            expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty))
                .toEqual('0'.repeat(minedBlock.difficulty));
        });

        it('adjusts the difficulty', () => {
            const possibleResults = [lastBlock.difficulty - 1, lastBlock.difficulty + 1];

            expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
        });
    });

    describe('adjustDifficulty()', () => {
        it('raises the difficulty for a block mined too fast', () => {
            expect(Block.adjustDifficulty({
                originalBlock: block,
                timestamp: block.timestamp + MINE_RATE_MILLISECONDS - 100
            })).toEqual(block.difficulty + 1);
        });

        it('lowers the difficulty for a block mined too slow', () => {
            expect(Block.adjustDifficulty({
                originalBlock: block,
                timestamp: block.timestamp + MINE_RATE_MILLISECONDS + 100
            })).toEqual(block.difficulty - 1);
        });

        it('has a lower limit of 1', () => {
            block.difficulty = -1;

            expect(Block.adjustDifficulty({originalBlock: block})).toEqual(1);
        });
    });
});