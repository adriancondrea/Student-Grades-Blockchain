const INITIAL_DIFFICULTY = 3;
const MINE_RATE_MILLISECONDS = 1000;

const GENESIS_DATA = {
    timestamp: Date.parse('08 July 2000 13:13:13'),
    lastHash: 'genesisLastHash',
    hash: 'genesisHash',
    difficulty: INITIAL_DIFFICULTY,
    nonce: 0,
    data: []
};

const STARTING_BALANCE = 0;

const REWARD_INPUT = {
    address: '*authorized_reward*'
};

const MINING_REWARD = 10;

module.exports = {
    GENESIS_DATA,
    MINE_RATE_MILLISECONDS,
    STARTING_BALANCE,
    REWARD_INPUT,
    MINING_REWARD
};