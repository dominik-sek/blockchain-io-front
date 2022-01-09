import styled from 'styled-components';
import { Blockchain, Block, Miner, Mesh, Wallet } from './bcsim';
import { Form, Input, Button, Checkbox } from 'antd';
import { Card, Col, Row } from 'antd';
import { BlockVisual } from './components/BlockVisual';
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
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
      setInterval(mineBlock, (blockchain.difficulty / minerList[i].power) * 100000, minerList[i]);
    }
  }
  function ClearAllIntervals() {
    for (var i = 1; i < 99999; i++)
      window.clearInterval(i);
  }

  let i = 0;
  return (
    <Container>
    <BlockchainContainer>
    <Swiper
      slidesPerView={3}
      spaceBetween={30}
      pagination={{
          clickable: true
        }}
    >
        {blockchain.chain.map(
          block => {
            i++;
            return <SwiperSlide><BlockVisual block={block} number={i} /></SwiperSlide>
          }
        )}
      </Swiper>
      </BlockchainContainer>
      <Button onClick={() => { startMining() }}>START</Button>
      <Button onClick={() => { ClearAllIntervals() }}>STOP</Button>
          todo: wallets and transactions, fix the first slide
    </Container>
  );


}
const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
`;
const BlockchainContainer = styled.div`
  display: flex;
  flex-direction: row;
  background-color: red;
  height:40vh;
  width:100%;
`;
export default App;
