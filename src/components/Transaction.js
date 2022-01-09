export const Transaction = (params) => {
    return(
        <div>
            <div>
                <h1>Transaction</h1>
            </div>
            <div>
                <h2>Transaction From: {params.transaction.from}</h2>
            </div>
            <div>
                <h2>Transaction To: {params.transaction.to}</h2>
            </div>
            <div>
                <h2>Transaction Amount: {params.transaction.amount}</h2>
            </div>
        </div>
        
    )
};
export default Transaction;