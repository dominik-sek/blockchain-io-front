import styled from "styled-components";
export const Transaction = (params) => {
    return(
        
        <Container>
            <h2>Transaction id:{params.transaction.id}</h2>
            <h3>{params.transaction.from+ "     ---sent--->     " + params.transaction.to} </h3>
            <p>transaction amount: {params.transaction.amount}</p>
            {params.transaction.from === "SYSTEM" ? <p style={{color:'lightgreen'}}>transaction fees for previous block: {params.transaction.feeColected}</p> : <p style={{color:'red'}}>transaction fee: {params.transaction.fee}</p>}
        </Container>
        
    )
};
const Container = styled.div`
    display: flex;
    flex-direction: column;
    border: 1px solid black;
    padding: 10px;
    
`


export default Transaction;