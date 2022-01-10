const SHA256 = require("crypto-js/sha256");
const _ = require('lodash');

class Wallet{
    constructor(miner){
        this.walletAddress = this.generateAddress(miner);
        this.balance = 1;
    }
    createWallet(){
        return new Wallet();
    }
    getBalance(){
        return this.balance;
    }
    getAddress(){
        return this.walletAddress;
    }
    addToWallet(amount){
        this.balance += amount;
    }
    removeFromWallet(amount){
        this.balance -= amount;
    }
    generateAddress(miner){
        let stringAddress = miner.power + miner.address;
        let hash = SHA256(stringAddress).toString().substring(0,17);
        return "1x0"+hash;
    }

}

class Mesh{

    constructor(id){
        this.id = id;
        this.peerList = []; 
    }
    
    addToMesh(miner){
        this.peerList.push(miner);
    }

    showMesh(){
        console.log("Peer List: ");
        for(var i = 0; i < this.peerList.length; i++){
            console.log(this.peerList[i].id);
        }
    }



    checkIfExsits(miner){
        for(var i = 0; i < this.peerList.length; i++){
            if(this.peerList[i].id === miner.id){
                return true;
            }
        }
        return false;
    }

    removePeer(miner){
        for(var i = 0; i < this.peerList.length; i++){
            if(this.peerList[i].id === miner.id){
                this.peerList.splice(i, 1);
                console.log("Miner " + miner.id + " has been removed from the mesh network");
            }
        }
    }




}

class Miner{
    constructor(id, name, power, address, wallet){
        this.id = id;
        this.name = name;
        this.power = power;
        this.currHeader = null;
        this.address = this.generateAddress(this);
        this.wallet = new Wallet(this);
    }
    
    generateAddress(miner){
        let stringAddress = miner.id + miner.name + miner.power;
        let hash = SHA256(stringAddress).toString().substring(0,20);
        return "0x"+hash;
    }
}

class Block{ 
    constructor(minerAddress,timestamp, transactions, previousHash = '') {

        this.minerAddress = minerAddress;
        this.timestamp = timestamp; 
        this.previousHash = previousHash; 
        this.nonce = 0; 
        this.hash = this.calculateHash(); 
        this.transactions = [];
        }

    calculateHash(){
        return SHA256(this.index + this.previousHash + this.timestamp
             + JSON.stringify(this.data) + this.nonce).toString(); 
    }

    proofOfWork(difficulty){

        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }
    }
}

let date = new Date(Date.now());


class Blockchain {

constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2; 
        this.miningReward = 15; // 15 reward seems balanced
        this.pendingTransactions = [];
        this.pendingTransactionFees = 0;
        this.tax = 0.12;
    }

    createGenesisBlock(){
        return new Block(
            "SYSTEM",
            this.getDate(),
            {
                    id:"0x0",
                    from: "SYSTEM",
                    to: "0x0",
                    amount: 0,
                    fees: 0
            },
            "0"
        );
    }
    addBlockArtificial(){
        this.chain.push(new Block(
            "SYSTEM",
            this.getDate(),
            [
                {
                    from: "0x0",
                    to: "0x0",
                    amount: 0
                },
                {
                    from: "0x0",
                    to: "0x0",
                    amount: 0
                }
            ],
            "0"

        ));
    }


    getDate(){
        if(date !== new Date(Date.now())){
            date = new Date(Date.now());
        }
        return date.getDate() 
        + "/" + date.getMonth()+1 
        + "/" + date.getFullYear() 
        + " " + date.getHours() 
        + ":" + date.getMinutes() 
        + ":" + date.getSeconds();
    }
    getLastBlock(){
        return this.chain[this.chain.length - 1];
    }

    broadcastBlock(broadcaster, block, meshNetwork){
        for(var i = 0; i < meshNetwork.peerList.length; i++){
            meshNetwork.peerList[i].currHeader = block.hash;
    }

    }
       
    
    rewardMiner(miner,meshNetwork, newBlock){
        if(this.pendingTransactions.length > 0){
            this.pendingTransactions.forEach(transaction => {
                newBlock.transactions.push(transaction);
            });
            // newBlock.balances.push(this.pendingTransactions);
            this.pendingTransactions = [];
        }


        let randomTransactions = this.generateTransactions(meshNetwork);
        randomTransactions.forEach(transaction => {
            this.pendingTransactions.push(transaction);
        });


        for(let i = 0; i < meshNetwork.peerList.length; i++){
            if(meshNetwork.peerList[i].id === miner.id){
                miner.wallet.addToWallet(this.miningReward);
                miner.wallet.addToWallet(this.pendingTransactionFees); // need to check the validity of this, idk if this miner should be rewarded or if the fees work as intended
                
                this.pendingTransactions.push({
                    id: SHA256(miner.address+this.miningReward).toString().substring(0,10),
                    from: "SYSTEM",
                    to: miner.address,
                    amount: this.miningReward,
                    feeColected: this.pendingTransactionFees //  fees for all the transactions go to the miner
                });
            }
        }
        this.pendingTransactionFees = 0;
    }
    setTax(number){
        this.tax = number;
    }
    getTax(){
        return this.tax;
    }
    
    generateTransactions(meshNetwork){
        let miner = "";
        let miner2 = "";
        let sample = [];
        
        while(sample.length < 4){
            miner = _.sample(meshNetwork.peerList);
            miner2 = _.sample(meshNetwork.peerList);

            if(miner.id === miner2.id){
                miner = _.sample(meshNetwork.peerList);
                miner2 = _.sample(meshNetwork.peerList);
            }
            
            let amount = _.random(1, (miner.wallet.getBalance())*0.50)
            if(amount < 0){
                amount = 0;
            }
            sample.push({
                id: SHA256(miner.address+miner2.address+amount).toString().substring(0,10),
                from: miner.address,
                to: miner2.address,
                amount: amount,
                fee: amount*this.tax // fee for one transaction
            })

            miner.wallet.removeFromWallet(amount + (amount*this.tax));
            miner2.wallet.addToWallet(amount);
            this.pendingTransactionFees += (amount*this.tax);
        }
        return sample;
    }


    addBlock(newBlock, miner, meshNetwork){
        newBlock.previousHash = this.getLastBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        newBlock.proofOfWork(this.difficulty); //TODO: include the reward in the calculation
        this.rewardMiner(miner,meshNetwork,newBlock);
        this.chain.push(newBlock);
        this.broadcastBlock(miner,newBlock,meshNetwork); //broadcast to all peers
    }
   

    isChainValid(){
        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }
            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
        }
        return true;
    }

}

// let meshNetwork = new Mesh("meshNetwork");
// let minerList = [];

// minerList.push(
//     new Miner(1, "Adam", 100),
//     new Miner(2, "Norman", 150),
//     new Miner(3, "Jack", 200),
//     new Miner(4, "Lewis", 300),
//     new Miner(5, "Adrian", 450),
//     );

// minerList.forEach(miner=>{
//     meshNetwork.addToMesh(miner);
// })



// let testBlockchain = new Blockchain();
// console.log(minerList);

// function mineBlock(miner){
    
//     var date = new Date(Date.now());
//     function getDate(){
//         return date.getDate() 
//         + "/" + date.getMonth()+1 
//         + "/" + date.getFullYear() 
//         + " " + date.getHours() 
//         + ":" + date.getMinutes() 
//         + ":" + date.getSeconds();
//     }
//     let newBlock = new Block(miner.id,getDate(), testBlockchain.getLastBlock().hash);

//     if(miner.wallet.getBalance() > 0){
//         miner.wallet.removeFromWallet((miner.power/testBlockchain.miningReward)*0.1);
//         testBlockchain.addBlock(newBlock, miner, meshNetwork);

        
//     }else{
//         meshNetwork.removePeer(miner);
//         minerList.splice(minerList.indexOf(miner),1);
//         return
//     }
//         // testBlockchain.chain.map(
//         //     block => {
//         //         console.log(block);
//         //     }
//         // )
    

// }

// const startMining = () =>{
//     for(var i = 0; i < minerList.length; i++){
//             setInterval(mineBlock, (testBlockchain.difficulty/minerList[i].power)*1000000, minerList[i]);
//     }
// }

module.exports ={

    Mesh,
    Miner,
    Block,
    Blockchain,
    Wallet

}
