const redis = require('redis');

const CHANNELS = {
    BLOCKCHAIN: 'BLOCKCHAIN',
    TEST: 'TEST',
    TRANSACTION: 'TRANSACTION'
};

class PubSub {
    constructor({blockchain, transactionPool, redisUrl}) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;

        // the PubSub instance can both be a publisher and a subscriber
        this.publisher = redis.createClient(redisUrl);
        this.subscriber = redis.createClient(redisUrl);

        this.subscribeToAllChannels();

        this.subscriber.on('message', (channel, message) => this.handleMessage(channel, message));
    }

    subscribeToAllChannels() {
        Object.values(CHANNELS).forEach(channel => {
            this.subscriber.subscribe(channel);
        });
    }

    publish({channel, message}) {
        //unsubscribe, publish message, subscribe back, in order to avoid receiving own published message
        this.subscriber.unsubscribe(channel, () => {
            this.publisher.publish(channel, message, () => {
                this.subscriber.subscribe(channel);
            });
        });
    }

    handleMessage(channel, message) {
        console.log(`Message received on channel: ${channel}`)

        const parsedMessage = JSON.parse(message);

        switch (channel) {
            case CHANNELS.BLOCKCHAIN:
                this.blockchain.replaceChain(parsedMessage, true, () => {
                    this.transactionPool.clearBlockchainTransactions({
                        chain: parsedMessage
                    });
                });
                break;
            case CHANNELS.TRANSACTION:
                this.transactionPool.setTransaction(parsedMessage);
                break;
            default:
                return;
        }
    }

    broadcastChain() {
        console.log(`broadcasting chain...`);
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        });
    }

    broadcastTransaction(transaction) {
        console.log(`broadcasting transaction...`);
        this.publish({
            channel: CHANNELS.TRANSACTION,
            message: JSON.stringify(transaction)
        });
    }
}

module.exports = PubSub;