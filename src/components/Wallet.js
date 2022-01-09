import React from 'react';
import styled from 'styled-components';
import { useState } from 'react';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons/lib/icons';

// Miner {
//     id: 5,
//     name: 'Adrian',
//     power: 450,
//     currHeader: null,
//     address: '0x84f3aee943dece50ff09',
//     wallet: Wallet { walletAddress: '1x060b2c22d1fd2b0fc5', balance: 1 }
//   }


const Box = styled.div`
    display: flex;
    flex:1;
    flex-wrap: wrap;
    justify-content: center;
    overflow: hidden;
    padding:5px;
    margin: 10px;
    border: 1px solid black;
    align-items: center;
    height: ${(props) => props.height} ;)}
`;


export const Wallet = (params) => {
    const [isShowing, setIsShowing] = useState(false);
    const toggle = () => setIsShowing(!isShowing);

    if(isShowing) {
        return (
            <Box height="10vh">
                <div style={{display:'flex', flex:1,justifyContent:'flex-end'}}>
                <CaretUpOutlined onClick={toggle}/>  
            </div>
            </Box>

        );
    } else {
        return (
            <Box height="10vh">
            <p>0x84f3aee943dece50ff09</p>
            <div style={{display:'flex', flex:1,justifyContent:'flex-end'}}>
                <CaretDownOutlined onClick={toggle}/>  
            </div>
            </Box>
        );

        
    }
};
export default Wallet;


