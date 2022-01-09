import Transaction from "./Transaction";
import styled from "styled-components";
import { Card, Col, Row } from 'antd';
import { SearchOutlined } from "@ant-design/icons/lib/icons";


//{params.block.minerAddress}
//{params.block.hash}
//{params.block.timestamp}
//{params.block.previousHash}
//{params.block.nonce}


export const BlockVisual = (params) => {

    return(

        <Card 
        title={ params.number === 1 ? <>Genesis Block <SearchOutlined /> </> : <>Block no.{params.number} <SearchOutlined /> </>  } 
        style={{ width: 550, height:300, margin:10, borderRadius:20 }}
        >
        <Data>Miner Name: {params.block.minerAddress}</Data>
        <Data>Current Hash: {params.block.hash}</Data>
        <Data>Timestamp: {params.block.timestamp}</Data>
        <Data>Previous Hash: {params.block.previousHash}</Data>
        <Data>Nonce: {params.block.nonce}</Data>
        </Card>
    )
};
const Data = styled.p`
    font-weight: bold;
    borderRadius: '25px';
    padding: '4px 15px 4px'
    `


export default BlockVisual;
