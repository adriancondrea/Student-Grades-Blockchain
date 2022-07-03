const Blockchain = require("./Blockchain");

blockchain = new Blockchain();
for(let i = 0; i<5; i++){
    blockchain.addBlock("data" + i);
}
console.log(blockchain)