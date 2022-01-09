import styled from 'styled-components';
import { Blockchain, Block, Miner, Mesh, Wallet } from './bcsim';
import { Form, Input, Button, Checkbox } from 'antd';
import { Card, Col, Row } from 'antd';
import { BlockVisual } from './components/BlockVisual';
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import Collapsible from 'react-collapsible';

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination"
import SwiperCore, {
  Pagination
} from 'swiper';
SwiperCore.use([Pagination]);


const SHA256 = require("crypto-js/sha256");
const bcsim = require('./bcsim');
let mesh = new Mesh("mesh");
let minerList = [];


minerList.push(
  new Miner(1, "Adam", 100),
  new Miner(2, "Norman", 150),
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

function mineBlock(miner) {
    var date = new Date(Date.now());
    function getDate() {
      return date.getDate()
        + "/" + date.getMonth() + 1
        + "/" + date.getFullYear()
        + " " + date.getHours()
        + ":" + date.getMinutes()
        + ":" + date.getSeconds();
    }
    let newBlock = new Block(miner.id, getDate(), blockchain.getLastBlock().hash);

    if (miner.wallet.getBalance() > 0) {
      miner.wallet.removeFromWallet((miner.power / blockchain.miningReward) * 0.1);
      blockchain.addBlock(newBlock, miner, mesh);
      setBlocks({ ...blocks, ...blockchain.chain });
      // console.log(blockchain.chain);

    } else {
      mesh.removePeer(miner);
      //render a notification that the miner has been removed
      minerList.splice(minerList.indexOf(miner), 1);
      return
    }
  }

  function startMining() {
    for (var i = 0; i < minerList.length; i++) {
      setInterval(mineBlock, (blockchain.difficulty / minerList[i].power) * 1000000, minerList[i]);
    }
  }
  function ClearAllIntervals() {
    for (var i = 1; i < 99999; i++)
      window.clearInterval(i);
  }

  let i = 0;
  return (
    <div style={{ display: 'flex' }}>
      <SidebarContainer>
        <Button onClick={() => { startMining() }}>START</Button>
        <Button onClick={() => { ClearAllIntervals() }}>STOP</Button>
        <Button onClick={() => { ClearAllIntervals() }}>SETTINGS</Button>
      </SidebarContainer>
      
      <Content>
        <Swiper
          slidesPerView={3}
          spaceBetween={30}
          pagination={{
            clickable: true
          }}
          style={{height:'40vh'}}
        >
          {blockchain.chain.map(
            block => {
              i++;
              return <SwiperSlide><BlockVisual block={block} number={i} /></SwiperSlide>
            }
          )}
        </Swiper>

        <Info>

          <Miners>

          </Miners>

          <Transactions>
          <div style={{display:'flex', flexDirection:'column'}}>
              <h2>Transaction queue:</h2>
              {blockchain.pendingTransactions.map(
                transaction => {
                  return (
                    <>
                    <Collapsible trigger={transaction.id} open={false}>
                    <p>{transaction.from}</p>
                    <p>{transaction.to}</p>
                    <p>{transaction.amount}</p>
                    </Collapsible>
                  </>
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
                    <> 
                    <Collapsible trigger={transaction.id} open={false}>
                    <p>{transaction.from}</p>
                    <p>{transaction.to}</p>
                    <p>{transaction.amount}</p>
                    </Collapsible>
                    
                    </>
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


    </div>
  );


}
const SidebarContainer = styled.div`
  height: 100vh;
  background-color: teal;
  width: 15%;
  display: flex;
  flex-direction: column;

`
const Content = styled.div`
  width:100%;
  height:100vh;
  flex:1;
  overflow-x:hidden;
  background-color: gray;
`

const Info = styled.div`
  width: 100%;
  background-color: green;
  display:flex;
  height:60vh;
  flex-direction: row;
  flex:1;
  justify-content: space-around;
  padding:20px;

`

const Miners = styled.div`
  flex:0.2;
  border:1px solid black;
  border-radius:20px;
  background-color: red;
`
const CurrentBlock = styled.div`
  flex:0.4;
  background-color: teal;
  padding:20px;
  display:flex;
  border:1px solid black;
  border-radius:20px;
  flex-direction:column;
  justify-content: center;
  `

const Transactions = styled.div`
  display:flex;
  justify-content:space-around;
  flex-direction:row;
  flex:0.3;
  border:1px solid black;
  border-radius:20px;
  background-color: orange;
  padding:20px;

`
export default App;
