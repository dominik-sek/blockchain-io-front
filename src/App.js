import styled from 'styled-components';
import { Blockchain, Block, Miner, Mesh, Wallet } from './bcsim';
import { Form, Input, Button, Checkbox } from 'antd';
import { BlockVisual } from './components/BlockVisual';
import React, { useEffect, useState, useRef } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import Collapsible from 'react-collapsible';
import {Select, notification, Modal } from 'antd';




// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination"
import SwiperCore, {
  Pagination
} from 'swiper';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons/lib/icons';
SwiperCore.use([Pagination]);

const _ = require('lodash');
const SHA256 = require("crypto-js/sha256");
const bcsim = require('./bcsim');

let mesh = new Mesh("mesh");
let minerList = [];


minerList.push(
new Miner(1, "Adam", 50),
new Miner(2, "Norman", 50),
new Miner(3, "Jack", 200),
new Miner(4, "Lewis", 300),
new Miner(5, "Adrian", 450),
)

minerList.forEach(miner => {
mesh.addToMesh(miner);
})

let blockchain = new Blockchain();


function App() {


  const [blocks, setBlocks] = useState([]);
  const [miners, setMiners] = useState([]);
  const [latestDeleted, setlatestDeleted] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [historicalMiners, setHistoricalMiners] = useState([]);
  const [deletionTimestamp, setDeletionTimestamp] = useState("");
  const [blockchainReset, setBlockchainReset] = useState(false);


  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), [])


  const openHistory = () => {
      setIsModalVisible(true);
    };
  const handleOk = () => {
      setIsModalVisible(false);
  };
  const handleCancel = () => {
      setIsModalVisible(false);
  };

  let intervals = [];

  const firstUpdate = useRef(true);

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
      openNotification();
    
  }, [latestDeleted]);


  const openError = () => {
    notification['error']({
      message: 'Error',
      description: 'No miners available',
    });
  
};



  const openNotification = () => {
    
      notification['warning']({
        message: `Miner ${latestDeleted.name} has no money!`,
        description: `Miner ${latestDeleted.address} has been deleted from the network, with a balance of ${latestDeleted.wallet !== undefined ? latestDeleted.wallet.balance : 0},
        last seen at ${latestDeleted.currHeader !== undefined ? latestDeleted.currHeader : "N/A"}`,
      });
    
  };


  function mineBlock(miner) {
    if(!minerList.includes(miner)){
      return;
    }

    var date = new Date(Date.now());
    function getDate() {
      return date.getDate()
        + "/" + date.getMonth() + 1
        + "/" + date.getFullYear()
        + " " + date.getHours()
        + ":" + date.getMinutes()
        + ":" + date.getSeconds();
    }
    let newBlock = new Block(miner.address, getDate(), blockchain.getLastBlock().hash);

    

    if (miner.wallet.getBalance() > 0) {
      miner.wallet.removeFromWallet((miner.power / blockchain.miningReward) * 0.1);
      blockchain.addBlock(newBlock, miner, mesh);
      setBlocks({ ...blocks, ...blockchain.chain });

      // console.log(blockchain.chain);
    } else{
      console.log(miner.id + " has no money!");
      setlatestDeleted(miner);
      // setlatestDeletedBalance(miner.wallet.getBalance());
      // setlatestDeletedHead(miner.currHeader);
      setDeletionTimestamp(getDate());
      setHistoricalMiners(historicalMiners => [...historicalMiners, miner]);

      mesh.removePeer(miner);
      //render a notification that the miner has been removed
      minerList = _.reject(minerList, function(el) { return el.address === miner.address; }); // delete from the list
      setMiners({...miners, ...minerList});

      intervals.forEach(interval => {
        if(interval.key === miner.address){
          clearInterval(interval.value);  // clear the interval - without this it bugged out the notification
        }
      });
      return;
    }
      
    
  }

  function startMining() {
    if(minerList.length === 0){
      openError();
      return;
    }
    for (var i = 0; i < minerList.length; i++) {
      intervals.push({
        key:[minerList[i].address],
        value: setInterval(mineBlock, (blockchain.difficulty / minerList[i].power) * 100000, minerList[i])
      });
    }
  }
  function ClearAllIntervals() {
    for (var i = 1; i < 99999; i++)
      window.clearInterval(i);
  }

  function restartSim(){
    
    ClearAllIntervals()
    blockchain = null;
    debugger;
    blockchain = new Blockchain();
    mesh = null;
    mesh = new Mesh("mesh");
    forceUpdate();
    minerList = [];

  }
  console.log(blockchain.chain);

  

  let i = 0;
  return (
    <div style={{ display: 'flex' }}>
      <SidebarContainer>
        <Button onClick={() => { startMining() }}>START</Button>
        <Button onClick={() => { ClearAllIntervals() }}>STOP</Button>
        <Button onClick={() => { restartSim() }}>RESTART</Button>
        <Button onClick={() => { openNotification() }}>SETTINGS</Button>
        <Button onClick={() => { openHistory() }}>HISTORY</Button>

      </SidebarContainer>
      
      <Content
      key={new Date()}>
        <Swiper
          
          slidesPerView={4}
          spaceBetween={30}
          pagination={{
            clickable: true
          }}
          style={{height:'40vh', padding:'20px'}}
        >
          {
            blockchain.chain.map(
            block => {
              i++;
              console.log(blockchain.chain);
              return <SwiperSlide><BlockVisual  block={block} number={i} /></SwiperSlide>
            }
          )}
        </Swiper>

        <Info>
          <Miners>
            <h3>Miners:</h3>
            {minerList.map(miner => {
                return(
                    <React.Fragment key={miner.id}>
                    <Collapsible
                    key={miner.id}
                    trigger={
                    <>
                    {miner.address} 
                    <div style={{display:'flex', width:'100%', justifyContent:'flex-end'}}>
                    <ArrowDownOutlined />
                    </div>

                    </>
                    } 
                    overflowWhenOpen="visible"
                    triggerWhenOpen={
                    <>
                    {miner.address}
                    <div style={{display:'flex', width:'100%', justifyContent:'flex-end'}}>
                    <ArrowUpOutlined />
                    </div>
                    </>
                    }

                    open={false}>
                    <hr></hr>
                    <p>Miner id: {miner.id}</p>
                    <p>Name: {miner.name}</p>
                    <p>Power: {miner.power} MH/s</p>
                    <p>Current Block: {miner.currHeader !== null && miner.currHeader.length > 20 ? miner.currHeader.substring(0,15)+"..." : miner.currHeader} </p>
                    <p>Public Address: {miner.address}</p>
                    <p>Private Address: {miner.wallet.getAddress()}</p>
                    <p>Balance: {miner.wallet.getBalance()}</p>
                    </Collapsible>
                    </React.Fragment>
                  );
                
            })}

          </Miners>

          <Transactions>
          <div style={{display:'flex', flexDirection:'column'}}>
              <h2>Transaction queue:</h2>
              {blockchain.pendingTransactions.map(
                transaction => {
                  return (
                    <React.Fragment key={transaction.id}>
                    <Collapsible 
                    trigger={
                    <>
                    {transaction.id} 
                    <div style={{display:'flex', width:'100%', justifyContent:'flex-end'}}>
                    <ArrowDownOutlined />
                    </div> 
                    </>
                    } 
                    triggerWhenOpen={
                    <>
                    {transaction.id}
                    <div style={{display:'flex', width:'100%', justifyContent:'flex-end'}}>
                    <ArrowUpOutlined />
                    </div>
                    </>
                    }

                    open={false}>
                    
                    <p>From:{transaction.from}</p>
                    <p>To:{transaction.to}</p>
                    <p>Amount:{transaction.amount}</p>
                    <p style={{color:'red'}}>Fee:{transaction.fee}</p>
                    </Collapsible>
                  </React.Fragment>
                  );
                }
              )}
            </div>


            <div style={{display:'flex', flexDirection:'column'}}>
              <h2>Transactions in block {i}:</h2>
              {
                blockchain.getLastBlock().transactions.map(
                  transaction => {
                    return (
                    <React.Fragment key={transaction.id}>
                    <Collapsible 
                    
                    trigger={
                    <>
                    {transaction.id} 
                    <div style={{display:'flex', width:'100%', justifyContent:'flex-end'}}>
                    <ArrowDownOutlined />
                    </div> 
                    </>
                    } 
                    triggerWhenOpen={
                    <>
                    {transaction.id}
                    <div style={{display:'flex', width:'100%', justifyContent:'flex-end'}}>
                    <ArrowUpOutlined />
                    </div>
                    </>
                    }

                    open={false}>
                    
                    <p>From:{transaction.from}</p>
                    <p>To:{transaction.to}</p>
                    <p>Amount:{transaction.amount}</p>
                    <p style={{color:'red'}}>Fee:{transaction.fee}</p>
                    </Collapsible>
                  </React.Fragment>
                  );
                    
                  }
                )


              }
            </div>


          </Transactions>

          <CurrentBlock>
            <h1>Last Block mined:</h1>
            <BlockVisual block={blockchain.getLastBlock()} number={i} />
          </CurrentBlock>


        </Info>


      </Content>

      <Modal title={"Network History"} width={750} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} cancelButtonProps={{ style: { display: 'none' } }}>
          {historicalMiners.map(
            miner => {
              if(minerList.includes(miner)){
                return(
                <div key={miner.id}>
                <hr/>
                <h1 style={{color:'green'}}>ADDITION</h1>
                <p>Miner id: {miner.id}</p>
                    <p>Name: {miner.name}</p>
                    <p>Power: {miner.power} MH/s</p>
                    <p>Current Block: {miner.currHeader}</p>
                    <p>Public Address: {miner.address}</p>
                </div>
              )
              }else{
                return(
                <div key={miner.id}>
                <h1 style={{color:'red'}}>DELETION</h1>
                <h2 style={{color:'red'}}>Time of deletion: {deletionTimestamp}</h2>
                <p>Miner id: {miner.id}</p>
                    <p>Name: {miner.name}</p>
                    <p>Power: {miner.power} MH/s</p>
                    <p>Current Block: {miner.currHeader}</p>
                    <p>Public Address: {miner.address}</p>
                    <p>Balance at time of deletion: {miner.wallet.balance}</p>
                </div>
              )
              }
              
            })}
      </Modal>

    </div>
  );


}
const SidebarContainer = styled.div`
  height: 100vh;
  width: 10%;
  padding:20px;
  border-right: 1px solid black;
  display: flex;
  flex-direction: column;

`
const Content = styled.div`
  width:100%;
  height:100vh;
  background-color: gray;
  flex:1;
  overflow-x:hidden;
`

const Info = styled.div`
  width: 100%;
  display:flex;
  height:60vh;
  flex-direction: row;
  shadow: 0 0 10px black;
  flex:1;
  justify-content: space-around;
  padding:20px;


   `

const Miners = styled.div`
  flex:0.2;
  border-radius:20px;
  padding:20px;
  backdrop-filter: blur(25px) saturate(177%);
    -webkit-backdrop-filter: blur(25px) saturate(177%);
    background-color: rgba(15, 15, 18, 0.66);
    border: 1px solid rgba(255, 255, 255, 0.125)
  
  `

const CurrentBlock = styled.div`
  flex:0.3;
  padding:20px;
  display:flex;
  border:1px solid black;
  border-radius:20px;
  flex-direction:column;
  justify-content: center;
  backdrop-filter: blur(25px) saturate(177%);
    -webkit-backdrop-filter: blur(25px) saturate(177%);
    background-color: rgba(15, 15, 18, 0.66);
    border: 1px solid rgba(255, 255, 255, 0.125)
  `

const Transactions = styled.div`
  display:flex;
  justify-content:space-around;
  flex-direction:row;
  flex:0.4;
  border:1px solid black;
  border-radius:20px;
  padding:20px;
  backdrop-filter: blur(25px) saturate(177%);
    -webkit-backdrop-filter: blur(25px) saturate(177%);
    background-color: rgba(15, 15, 18, 0.66);
    border: 1px solid rgba(255, 255, 255, 0.125)

`
export default App;
