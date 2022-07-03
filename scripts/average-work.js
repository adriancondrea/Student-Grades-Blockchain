/*
Script to test the average time it takes to add a block to the chain
 */
const Blockchain = require('../blockchain');

const blockchain = new Blockchain();

blockchain.addBlock({data: 'initial block data'});

let previousTimestamp, nextTimestamp, nextBlock, timeDifference, averageTime;

const times = [];

for (let i = 0; i < 10000; i++) {
    previousTimestamp = blockchain.chain[blockchain.chain.length - 1].timestamp;

    blockchain.addBlock({data: `block ${i}`});
    nextBlock = blockchain.chain[blockchain.chain.length - 1];

    nextTimestamp = nextBlock.timestamp;
    timeDifference = nextTimestamp - previousTimestamp;
    times.push(timeDifference);

    averageTime = times.reduce((total, item) => (total + item)) / times.length;

    console.log(`Iteration ${i}. Time to mine block: ${timeDifference}ms. Difficulty: ${nextBlock.difficulty}. Average time: ${averageTime.toFixed(0)}ms`);
}