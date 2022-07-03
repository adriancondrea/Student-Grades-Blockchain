const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const path = require('path');
const cors = require('cors');

const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');
const TransactionMiner = require("./app/transaction-miner");
const database = require("./firebase");

const isDevelopment = process.env.ENV === 'development';

const REDIS_URL = isDevelopment ?
    'redis://127.0.0.1:6379' :
    'redis://:p0c9ab6c4342861bca31555fe1b9666529b7dd585dd49b0eabbbf396a35f995d1@ec2-35-168-129-190.compute-1.amazonaws.com:31769';
const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

async function loadChainFromDatabase() {
    console.log(`loading chain from database...`);
    let remoteChain;
    await database.ref('/chain').once('value', function (snapshot) {
        remoteChain = JSON.parse(snapshot.val());
    })
    if (remoteChain) {
        console.log(`chain from database loaded...`);
        blockchain.replaceChain(remoteChain);
    } else {
        console.log(`no chain instance saved in database..`)
    }
}

function saveChainToDatabase() {
    console.log(`saving chain to database..`)
    database.ref('/chain').set(JSON.stringify(blockchain.chain));
}

function loadUserWalletMappingFromDatabase() {
    database.ref('/users').once('value', function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            const wallet = childSnapshot.val().wallet;
            if (wallet) {
                userWalletMapping[childSnapshot.key] = JSON.parse(wallet);
            }
        });
    });
}

function listenForUserWalletChanges() {
    database.ref('/users').on('child_changed', function (data) {
        userWalletMapping[data.key] = JSON.parse(data.val().wallet);
    });
}


const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const nodeWallet = new Wallet();
const userWalletMapping = {};
const pubsub = new PubSub({blockchain, transactionPool, redisUrl: REDIS_URL});
const transactionMiner = new TransactionMiner({blockchain, transactionPool, nodeWallet, pubsub});

loadChainFromDatabase().catch(() => {
    console.log(`unable to load chain from database!`)
});
loadUserWalletMappingFromDatabase();
listenForUserWalletChanges();


// enable express to use bodyparser
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'client/dist')));

app.use(cors());

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.get('/api/blocks/length', (req, res) => {
    res.json(blockchain.chain.length);
});

app.get('/api/transactions/:userId', (req, res) => {
    const {userId} = req.params;
    const userAddress = userWalletMapping[userId]?.publicKey;
    const transactions = Wallet.getTransactionsGivenAddress({chain: blockchain.chain, address: userAddress});
    res.json(transactions);
});

app.get('/api/blocks/:id', (req, res) => {
    const {id} = req.params;
    const {length} = blockchain.chain;

    const blocksReversed = blockchain.chain.slice().reverse();

    let startIndex = (id - 1) * 5;
    let endIndex = id * 5;

    startIndex = startIndex < length ? startIndex : length;
    endIndex = endIndex < length ? endIndex : length;

    res.json(blocksReversed.slice(startIndex, endIndex));
});

app.post('/api/mine', (req, res) => {
    const {data} = req.body;

    blockchain.addBlock({data});

    pubsub.broadcastChain();

    res.redirect('/api/blocks');
});

app.post('/api/transact', (req, res) => {
    let {amount, userId, courseId, recipient} = req.body;
    //if there is no recipient, means the api call was made from add attendance and we should credit the coins to the user with id uid
    if (!recipient) {
        recipient = userWalletMapping[userId]?.publicKey;
    }
    if (!courseId) {
        courseId = `bonus`;
    }
    if (recipient) {
        try {
            const transaction = nodeWallet.createTransaction({
                courseId,
                amount,
                recipient,
                chain: blockchain.chain
            });

            transactionPool.setTransaction(transaction);

            pubsub.broadcastTransaction(transaction);

            res.json({type: 'success', transaction});
        } catch (exception) {
            return res.status(400).json({type: 'error', message: exception.message});
        }
    } else {
        return res.status(400).json({type: 'error', message: 'could not find recipient!'});
    }
});

app.get('/api/transaction-pool-map', (req, res) => {
    res.json(transactionPool.transactionMap);
});

app.get('/api/mine-transactions', (req, res) => {
    try {
        transactionMiner.mineTransactions();

        saveChainToDatabase();
        res.redirect('/api/blocks');
    } catch (e) {
        res.status(404).json(e);
    }
});

app.post('/api/wallet-info', (req, res) => {
    const uid = req.body.uid;
    let wallet;

    if (userWalletMapping[uid]) {
        wallet = userWalletMapping[uid];
    } else {
        wallet = new Wallet();
        database.ref('/users').child(uid).update({
            wallet: JSON.stringify(wallet)
        });
    }

    const address = wallet.publicKey;

    res.json({
        address,
        balance: Wallet.calculateBalance({chain: blockchain.chain, address})
    });
});

app.get('/api/known-addresses', (req, res) => {
    const knownAddresses = [];
    for (const uid in userWalletMapping) {
        knownAddresses.push(userWalletMapping[uid].publicKey);
    }
    res.json(knownAddresses);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

const syncWithRootState = () => {
    request({url: `${ROOT_NODE_ADDRESS}/api/blocks`}, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const rootChain = JSON.parse(body);

            console.log('Syncing with root state... replacing chain with root chain');
            blockchain.replaceChain(rootChain);
        }
    });

    request({url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map`}, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const rootTransactionPoolMap = JSON.parse(body);

            console.log('Syncing... replacing transaction pool map on a sync');
            transactionPool.setMap(rootTransactionPoolMap);
        }
    });
};

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = process.env.PORT || PEER_PORT || DEFAULT_PORT;

app.listen(PORT, () => {
    console.log(`Application started listening on localhost:${PORT}`);
    if (PORT !== DEFAULT_PORT) {
        syncWithRootState();
    }
});