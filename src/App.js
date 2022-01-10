import styled from 'styled-components';
import { Blockchain, Block, Miner, Mesh, Wallet } from './bcsim';
import { Form, Input, Button, Checkbox } from 'antd';
import { BlockVisual } from './components/BlockVisual';
import React, { useEffect, useState, useRef } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import Collapsible from 'react-collapsible';
import {Slider, notification, Modal, InputNumber, Space, Drawer } from 'antd';
import {EditOutlined,ExclamationCircleTwoTone,CheckCircleTwoTone} from '@ant-design/icons';



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
  const [areSettingsVisible, setAreSettingsVisible] = useState(false);
  const [historicalMiners, setHistoricalMiners] = useState([]);
  const [deletionTimestamp, setDeletionTimestamp] = useState("");
  const [addMiners, setAddMinersVisible] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1000);

  const [recentlyRestarted, setRecentlyRestarted] = useState(false);

  const [simSpeedSlider, setSimSpeedSlider] = useState(3);



  //used for blockchain settings
  const [diff, setDiff] = useState(0);
  const [reward,setReward] = useState(0);
  const [tax, setTax] = useState(0);
  //adding a new miner
  const [id, setId] = useState(0);
  const [name,setName] = useState("");
  const [power, setPower] = useState(0);

  const [addButtonVisible, setAddButtonVisible] = useState(true);
  

  const [input, setInput] = useState([]);

  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), [])


  const openHistory = () => {
      setIsModalVisible(true);
    };
  const handleOkCancel = () => {
      setIsModalVisible(false);
  };


  const openSettings = () => {
    setAreSettingsVisible(true);
  };
  const settingsOkCancel = () => {
    setShowConfirmation(true);
    setAreSettingsVisible(false);
  };
  const settingsCancel = () =>{
    setAreSettingsVisible(false);
  }
  const confirmationCancel = () => {
    setShowConfirmation(false);
  };

  const openMiners = () => {
    setAddMinersVisible(true);
  };
  const minersOk = (minerList) => {
    setAddMinersVisible(false);
  };
  const minersCancel = () => {
    setInput([]);
    setAddMinersVisible(false);
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
  const openInfo = () => {
    notification['info']({
      message: 'Blockchain reset',
      description: 'Your blockchain has been reset, please add miners again',
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
      miner.wallet.removeFromWallet( (miner.power / blockchain.miningReward) * 0.01);
      blockchain.addBlock(newBlock, miner, mesh);
      setBlocks({ ...blocks, ...blockchain.chain });

    } else{
      setlatestDeleted(miner);
      setDeletionTimestamp(getDate());
      setHistoricalMiners(historicalMiners => [...historicalMiners, miner]);
      mesh.removePeer(miner);
      minerList = _.reject(minerList, function(el) { return el.address === miner.address; }); // delete from the list
      setMiners({...miners, ...minerList});

      intervals.forEach(interval => {
        if(interval.key === miner.address){
          clearInterval(interval.value);  // clear the interval - without this it bugged out the notification
          //turns out this is not needed, but im too afraid to remove it
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
    debugger;
    for (var i = 0; i < minerList.length; i++) {
      intervals.push({
        key:[minerList[i].address],
        value: setInterval(mineBlock, (blockchain.difficulty / minerList[i].power) * simulationSpeed, minerList[i])
      });
    }
  }
  function ClearAllIntervals() {
    for (var i = 1; i < 99999; i++)
      window.clearInterval(i);
  }
  function onChangeDiff(value) {

      setDiff(value);
    
  }
  function onChangeReward(value) {

      setReward(value);
    
  }
  function onChangeTax(value) {

      setTax(value);
    
  }

  function handleSliderChange(value){
    setSimSpeedSlider(value);
  }
  
  const simulationTable ={
    6: 1000,
    5: 10000,
    4: 100000, //default value
    3: 1000000, 
    2: 10000000,
    1: 100000000,
    0: 1000000000
  }

  function changeBlockchain() {
    setSimulationSpeed(simulationTable[simSpeedSlider]);
    console.log(simulationSpeed);
    blockchain = new Blockchain();
    setBlocks({});
    if(diff === 0){
      blockchain.difficulty = 2;
    }
    if(tax === 0){
      blockchain.tax = 0.12;
    }
    if(reward === 0){
      blockchain.miningReward = 15;
    }

    blockchain.difficulty=diff;
    blockchain.tax=tax;
    blockchain.reward=reward;
    setShowConfirmation(false)
  }

  function restartSim(){
    setSimulationSpeed(simulationTable[6]);
    setRecentlyRestarted(true)
    openInfo();
    ClearAllIntervals();
    blockchain = null;
    setHistoricalMiners([]);
    blockchain = new Blockchain();
    mesh = null;
    mesh = new Mesh("mesh");
    forceUpdate();
    minerList = [];

  }

  function insertMiner(id, name, power){
    if(id === 0){
      id = minerList.length + 1;
    }
    if(name === ""){
      name = "Miner " + id;
    }
    if(power === 0){
      power = 100;
    }


    setAddButtonVisible(true);
    let newMiner = new Miner(id, name, power);
    setHistoricalMiners(historicalMiners => [...historicalMiners, newMiner]);

    minerList.push(newMiner);

    mesh.addToMesh(newMiner);


    setMiners({...miners, ...minerList});
    setInput([]);
    openMiners();
  }

  function addInput() {
    setAddButtonVisible(false);

    setInput(input.concat(
    <Collapsible transitionTime={100} trigger={"Miner"} open={true}>
      <Space>
        <Input style={{width:200}} disabled={true} min={1} max={999} defaultValue={minerList.length+1} placeholder='id' onChange={e=>setId(e.target.value)} />
        <Input style={{width:200}}  placeholder="name" onChange={e=>setName(e.target.value)} />
        <Input style={{width:200}} min={50} max={999} defaultValue={100} placeholder="power" onChange={e=>setPower(e.target.value) } />

        <Button type="primary" onClick={()=>insertMiner(id,name,power)}>Add</Button>
      </Space>
    </Collapsible>
      ) )

  }



  const marks = {
    0: 'ultra-slow',
    1: 'very-slow',
    2: 'slow',
    3: 'normal',
    4: 'fast',
    5: 'very-fast',
    6: {
      style: {
        color: '#f50',
      },
      label: <strong>ultra-fast</strong>,
    }
  };

  let i = 0;
  return (
    <div style={{ display: 'flex' }}>
      <SidebarContainer>
        <Button onClick={() => { startMining() }}>START</Button>
        <Button onClick={() => { ClearAllIntervals() }}>STOP</Button>
        <Button onClick={() => { restartSim() }}>CLEAR</Button>
        <Button onClick={() => { openSettings() }}>SETTINGS</Button>
        <Button onClick={() => { openHistory() }}>HISTORY</Button>
        <Button onClick={() => { openMiners() }}>ADD MINERS</Button>
      </SidebarContainer>
      
      <Content
      key={new Date()}>
        <Swiper
          slidesPerView={3}
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
              return <SwiperSlide><BlockVisual  block={block} number={i} /></SwiperSlide>
            }
          )}
        </Swiper>

        <Info>
          <Miners>
            <h3>Miners: <EditOutlined onclick={{openMiners}} /></h3> 
            {minerList.map(miner => {
                return(
                    <React.Fragment key={miner.id}>
                    <Collapsible
                    key={miner.id}
                    trigger={
                    <>
                    {miner.address+"\n"}
                    B:{miner.wallet.balance}
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
                    
                    <p>From: {transaction.from}</p>
                    <p>To: {transaction.to}</p>
                    <p>Amount: {transaction.amount}</p>
                    <p style={{color:'red'}}>Fee: {transaction.fee}</p>
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
            <h2>blockchain difficulty: {blockchain.difficulty}</h2>
            <h1>Last Block mined:</h1>
            <BlockVisual block={blockchain.getLastBlock()} number={i} />
            
          </CurrentBlock>


        </Info>


      </Content>

      <Modal title={"Network History"} width={750} visible={isModalVisible} onOk={handleOkCancel} onCancel={handleOkCancel} cancelButtonProps={{ style: { display: 'none' } }}>
          {historicalMiners.map(
            miner => {
              if(minerList.includes(miner)){
                return(
                <div key={miner.id}>
                <hr/>
                <h3 style={{color:'green'}}>ADDITION</h3>
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
                <h3 style={{color:'red'}}>DELETION</h3>
                <h3 style={{color:'red'}}>Time of deletion: {deletionTimestamp}</h3>
                <p>Miner id: {miner.id}</p>
                    <p>Name: {miner.name}</p>
                    <p>Power: {miner.power} MH/s</p>
                    <p>Last block: {miner.currHeader}</p>
                    <p>Public Address: {miner.address}</p>
                    <p>Balance at time of deletion: {miner.wallet.balance}</p>
                </div>
              )
              }
              
            })}
      </Modal>

      <Modal title={"Blockchain Settings"} width={750} visible={areSettingsVisible} onOk={settingsOkCancel} onCancel={settingsCancel} cancelButtonProps={{ style: { display: 'none' } }}>
        
        <div style={{display:'flex', flexDirection:'column'}}>
        <h2>Mining difficulty: <InputNumber min={1} max={10.00} step={1} defaultValue={blockchain.difficulty} onChange={onChangeDiff} /></h2>
        <h2>Mining Reward: <InputNumber min={1} max={100} step={1} defaultValue={blockchain.miningReward} onChange={onChangeReward} /></h2>
        <h2>Current tax: <InputNumber min={0.01} max={1.00} step={0.01} defaultValue={blockchain.tax} onChange={onChangeTax} /></h2>

        <h2>Simulation speed:</h2><Slider min={0} max={6} marks={marks} defaultValue={6} onChange={handleSliderChange}/>
        {/* e=>setSimSpeedSlider(e.target.value) */}
        </div>

      </Modal>
      <Modal title={"Blockchain reset"} width={750} visible={showConfirmation} onOk={changeBlockchain} onCancel={confirmationCancel} cancelButtonProps={{ style: { display: 'none' } }}>
        
        <div style={{display:'flex', flexDirection:'column'}}>
        <h2><ExclamationCircleTwoTone twoToneColor={'red'} /> This requires a blockchain reset, are you sure you want to continue? </h2>
        </div>
        </Modal>

      <Modal title={"Add Miners"} width={750} visible={addMiners} onOk={minersOk} onCancel={minersCancel}>
        
        <div style={{display:'flex', flexDirection:'column'}}>
        <h2>Add a new miner:</h2>
        {input}
        <Button style={addButtonVisible ? {display:''} : {display: 'none'}} onClick={addInput} >Add Miner</Button>
        
        

{/* minerList.push(
new Miner(1, "Adam", 50),
new Miner(2, "Norman", 50),
new Miner(3, "Jack", 200),
new Miner(4, "Lewis", 300),
new Miner(5, "Adrian", 450),
)

minerList.forEach(miner => {
mesh.addToMesh(miner);
}) */}


          
        </div>

      </Modal>

    </div>
  );


}
const SidebarContainer = styled.div`
  height: 100vh;
  width: 12%;
  padding:20px;
  border-right: 1px solid black;
  display: flex;
  flex-direction: column;

`
const Content = styled.div`
  width:100%;
  height:100vh;
  background-color: #f0f2f5;
  flex:1;
  overflow-x:hidden;
`

const Info = styled.div`
  width: 100%;
  display:flex;
  height:auto;
  min-heigh:60vh;
  flex-direction: row;
  shadow: 0 0 10px black;
  flex:1;
  justify-content: space-around;
  padding:20px;

   `

const Miners = styled.div`
  flex:0.2;
  padding:20px;
  background: rgba( 142, 140, 140, 0.6 );
box-shadow: 0 8px 32px 0 rgba( 31, 38, 135, 0.37 );
backdrop-filter: blur( 11.5px );
-webkit-backdrop-filter: blur( 11.5px );
border-radius:20px;
border: 1px solid rgba( 255, 255, 255, 0.18 );
  
  `

const CurrentBlock = styled.div`
  flex:0.3;
  padding:20px;
  display:flex;
  border:1px solid black;
  flex-direction:column;
  justify-content: center;
  background: rgba( 142, 140, 140, 0.6 );
box-shadow: 0 8px 32px 0 rgba( 31, 38, 135, 0.37 );
backdrop-filter: blur( 11.5px );
-webkit-backdrop-filter: blur( 11.5px );
border-radius:20px;
border: 1px solid rgba( 255, 255, 255, 0.18 );
  `

const Transactions = styled.div`
  display:flex;
  justify-content:space-around;
  flex-direction:row;
  flex:0.4;
  border:1px solid black;
  padding:20px;
  background: rgba( 142, 140, 140, 0.6 );
box-shadow: 0 8px 32px 0 rgba( 31, 38, 135, 0.37 );
backdrop-filter: blur( 11.5px );
-webkit-backdrop-filter: blur( 11.5px );
border-radius:20px;
border: 1px solid rgba( 255, 255, 255, 0.18 );

`
export default App;
