import { useState } from 'react';
import Swal from 'sweetalert2';

function Body(props) {
    const [data, setData] = useState({ walletAddress: '', amount: 0 });

    function displayPopUp(msgTitle, msgBody, iconType) {
        Swal.fire({
            title: msgTitle,
            text: msgBody,
            icon: iconType,
            confirmButtonText: 'Ok'
        });  
    }

    async function handelSubmit(e) {
        try {
            e.preventDefault();
            document.getElementById("submitBtn").disabled = true;
            // console.log('=> ', data);
            if(!Object.keys(props.contractObj).length) {
                displayPopUp(
                    "Attention!",
                    'Please connect your metamask wallet',
                    'info' 
                );
                document.getElementById("submitBtn").disabled = false;
                return;
            }

            let contract = props.contractObj;

            let gasEstimated = await contract.estimateGas.mint(
                data.walletAddress,
                data.amount
            );
            console.log('gas := ', Number(gasEstimated._hex));

            let txn = await contract.mint(data.walletAddress, data.amount);
            console.log('txn ', txn);
            displayPopUp(
                "Attention!",
                'Transaction has been initiated!\n' + txn.transactionHash,
                'info' 
            )

            let receipt = await txn.wait();
            if(receipt.status) {
                displayPopUp(
                    "Success!",
                    'Transaction done successfully!',
                    'success' 
                );
            } else {
                displayPopUp(
                    "Error!",
                    'Transaction failed!',
                    'error' 
                );
            }
            document.getElementById("submitBtn").disabled = false;
        } catch (error) {
            console.log('catch error := ', error);
            let errorMessage= error.error?.data?.message;
            if(errorMessage.includes("execution reverted:")) {
                let message = errorMessage.replace('execution reverted: ', '');
                displayPopUp(
                    "Error!",
                    message,
                    'error' 
                );
            } else {
                alert("Something went wrong, Please try again later!");
            }
            document.getElementById("submitBtn").disabled = false;
        }
    }

    return (
        <>
            <form onSubmit={handelSubmit}>
                <div className="mb-3">
                    <label htmlFor="walletAddress" className="form-label">
                        Wallet Address
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="walletAddress"
                        value={data.walletAddress}
                        onChange={(e) => {
                            data.walletAddress = e.target.value;
                            setData({
                                walletAddress: e.target.walletAddress,
                                ...data,
                            });
                        }}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="amountToMint" className="form-label">
                        Token Amount
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        id="amountToMint"
                        value={data.amount}
                        onChange={(e) => {
                            setData({ ...data, amount: e.target.value });
                        }}
                    />
                </div>
                <button type="submit" className="btn btn-primary" id='submitBtn'>
                    Mint
                </button>
            </form>

            <div style={{ height: '500px', marginTop: '60px' }}>
                <h3>Your Transactions</h3>

                <div className="h-75 w-100 overflow-auto d-inline-block">
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr className='table-dark'>
                                <th scope="col">Amount</th>
                                <th scope="col">Txn Hash</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="table-light">
                                <td>10000</td>
                                <td>0x1511a5fce941cf6724d449c10227fdb8450ec5cd884a8973eaeb82e43d960626</td>
                            </tr>
                            <tr className="table-light">
                                <td>200</td>
                                <td>0x1511a5fce941cf6724d449c10227fdb8450ec5cd884a8973eaeb82e43d960626</td>
                            </tr>
                            <tr className="table-light">
                                <td>45000</td>
                                <td>0x1511a5fce941cf6724d449c10227fdb8450ec5cd884a8973eaeb82e43d960626</td>
                            </tr>
                            <tr className="table-light">
                                <td>45000</td>
                                <td>0x1511a5fce941cf6724d449c10227fdb8450ec5cd884a8973eaeb82e43d960626</td>
                            </tr>
                            <tr className="table-light">
                                <td>45000</td>
                                <td>0x1511a5fce941cf6724d449c10227fdb8450ec5cd884a8973eaeb82e43d960626</td>
                            </tr>
                            <tr className="table-light">
                                <td>45000</td>
                                <td>0x1511a5fce941cf6724d449c10227fdb8450ec5cd884a8973eaeb82e43d960626</td>
                            </tr>
                            <tr className="table-light">
                                <td>45000</td>
                                <td>0x1511a5fce941cf6724d449c10227fdb8450ec5cd884a8973eaeb82e43d960626</td>
                            </tr>
                            <tr className="table-light">
                                <td>45000</td>
                                <td>0x1511a5fce941cf6724d449c10227fdb8450ec5cd884a8973eaeb82e43d960626</td>
                            </tr>
                            <tr className="table-light">
                                <td>45000</td>
                                <td>0x1511a5fce941cf6724d449c10227fdb8450ec5cd884a8973eaeb82e43d960626</td>
                            </tr>
                            <tr className="table-light">
                                <td>45000</td>
                                <td>0x1511a5fce941cf6724d449c10227fdb8450ec5cd884a8973eaeb82e43d960626</td>
                            </tr>
                            <tr className="table-light">
                                <td>45000</td>
                                <td>0x1511a5fce941cf6724d449c10227fdb8450ec5cd884a8973eaeb82e43d960626</td>
                            </tr>
                            <tr className="table-light">
                                <td>45000</td>
                                <td>0x1511a5fce941cf6724d449c10227fdb8450ec5cd884a8973eaeb82e43d960626</td>
                            </tr>
                            <tr className="table-light">
                                <td>45000</td>
                                <td>0x1511a5fce941cf6724d449c10227fdb8450ec5cd884a8973eaeb82e43d960626</td>
                            </tr>
                            <tr className="table-light">
                                <td>45000</td>
                                <td>0x1511a5fce941cf6724d449c10227fdb8450ec5cd884a8973eaeb82e43d960626</td>
                            </tr>
                            <tr className="table-light">
                                <td>45000</td>
                                <td>0x1511a5fce941cf6724d449c10227fdb8450ec5cd884a8973eaeb82e43d960626</td>
                            </tr>
                            <tr className="table-light">
                                <td>45000</td>
                                <td>0x1511a5fce941cf6724d449c10227fdb8450ec5cd884a8973eaeb82e43d960626</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default Body;
