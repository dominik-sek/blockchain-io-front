import Transaction from "./Transaction";
import styled from "styled-components";
import { Card, Col, Row } from 'antd';
import { PropertySafetyFilled, SearchOutlined } from "@ant-design/icons/lib/icons";
import {useState} from "react";

import { Modal, Button, Space } from 'antd';

//{params.block.minerAddress}
//{params.block.hash}
//{params.block.timestamp}
//{params.block.previousHash}
//{params.block.nonce}



export const BlockVisual = (params) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const showModal = () => {
        setIsModalVisible(true);
      };
    const handleOk = () => {
        setIsModalVisible(false);
    };
    const handleCancel = () => {
        setIsModalVisible(false);
    };



    return(
        <>
        <Card 
        title={params.number === 1 ? <>Genesis Block <SearchOutlined onClick={showModal} /> </> : <>Block no.{params.number} <SearchOutlined onClick={showModal} /> </>  } 
        style={{ width: 550, height:300, margin:10, borderRadius:20 }}
        headStyle={{display:'flex !important', justifyContent:'space-between'}}
        >
        <Data>Miner Name: {params.block.minerAddress}</Data>
        <Data>Current Hash: {params.block.hash}</Data>
        <Data>Timestamp: {params.block.timestamp}</Data>
        <Data>Previous Hash: {params.block.previousHash}</Data>
        <Data>Nonce: {params.block.nonce}</Data>
        </Card>

        <Modal title={"Block " + params.block.hash} width={750} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} cancelButtonProps={{ style: { display: 'none' } }}
>
            <DataModal>Miner Name: {params.block.minerAddress}</DataModal>
            <DataModal>Current Hash: {params.block.hash}</DataModal>
            <DataModal>Timestamp: {params.block.timestamp}</DataModal>
            <DataModal>Previous Hash: {params.block.previousHash}</DataModal>
            <DataModal>Nonce: {params.block.nonce}</DataModal>
            <DataModal>Transactions:</DataModal>
            <Transactions>
                {params.block.transactions.map((transaction, index) => (
                    <Transaction key={transaction.id} transaction={transaction}/>
                ))}
            </Transactions>


        </Modal>

</>
        
    )
};
const Data = styled.p`
    font-weight: bold;
    borderRadius: '25px';
    padding: '4px 15px 4px'
    `
const DataModal = styled.p`
    font-weight: bold;
    borderRadius: '25px';
    padding: '4px 15px 4px'
    font-size: 20px;
`
const Transactions = styled.div`
    display: flex;
    flex-direction: column;
    `


export default BlockVisual;
