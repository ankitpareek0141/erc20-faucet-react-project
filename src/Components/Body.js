import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { ethers } from 'ethers';

function Body(props) {
    const [data, setData] = useState({ walletAddress: '', amount: 0 });
    const [allTransactions, setAllTransactions] = useState([]);
    const [refresh, setRefresh] = useState(0);

    function displayPopUp(msgTitle, msgBody, iconType) {
        Swal.fire({
            title: msgTitle,
            text: msgBody,
            icon: iconType,
            confirmButtonText: 'Ok'
        });
        document.getElementById("submitBtn").disabled = false;
    }

    useEffect(() => {
        fetch('http://localhost:8000/getUserTransactions')
            .then((response) => response.json())
            .then((data) => {
                let aTransactions = data.data;
                setAllTransactions(aTransactions);
            })
            .catch((error) => {
                console.log("error := ", error);
                displayPopUp(
                    "Error!",
                    "Internal server error!",
                    'error'
                );
            })
    }, [refresh]);

    async function handelSubmit(e) {
        try {
            e.preventDefault();
            document.getElementById("submitBtn").disabled = true;

            if (!Object.keys(props.contractObj).length) {
                displayPopUp(
                    "Attention!",
                    'Please connect your metamask wallet',
                    'info'
                );
                return;
            }

            if(data.walletAddress.length == 0) {
                displayPopUp(
                    "Error!",
                    'Please enter wallet address!',
                    'error'
                );
                return;
            }
            if(!data.amount) {
                displayPopUp(
                    "Error!",
                    'Please enter some amount!',
                    'error'
                );
                return;
            }

            let contract = props.contractObj;

            var currentFee = 0;
            const owner = await contract.owner();
            const currentLimitInWei = await contract.max_mint_limit();
            const currentLimitInEth = ethers.utils.formatEther(currentLimitInWei);

            if(data.amount > currentLimitInEth && data.walletAddress.toLowerCase() != owner.toLowerCase()) currentFee = await contract.fee();

            let gasEstimated = await contract.estimateGas.mint(
                data.walletAddress,
                data.amount, {
                    value: currentFee
                }
            );
            console.log('gas := ', Number(gasEstimated._hex));

            let txn = await contract.mint(data.walletAddress, data.amount, {
                value: currentFee
            });
            console.log('txn ', txn);

            fetch('http://localhost:8000/createTransaction', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sWalletAddress: data.walletAddress,
                    sTransactionHash: txn.hash,
                    nAmount: data.amount
                })
            })
                .then((response) => response.json())
                .then((data) => {
                    setRefresh(1);
                    displayPopUp(
                        "Attention!",
                        'Transaction has been initiated!\n' + txn.hash, -
                    'info'
                    );
                })
                .catch((error) => {
                    console.log("error := ", error);
                    displayPopUp(
                        "Error!",
                        "Internal server error!",
                        'error'
                    );
                })

            let receipt = await txn.wait();
            console.log("receipt := ", receipt);
            if (receipt.status) {
                fetch('http://localhost:8000/updateTransactionStatus', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sWalletAddress: data.walletAddress,
                        sTransactionHash: receipt.transactionHash,
                        nStatus: 1
                    })
                })
                    .then((response) => response.json())
                    .then((data) => {
                        setRefresh(0);
                        displayPopUp(
                            "Success!",
                            'Transaction done successfully!',
                            'success'
                        );
                    })
                    .catch((error) => {
                        console.log("error := ", error);
                        displayPopUp(
                            "Error!",
                            "Internal server error!",
                            'error'
                        );
                    })
            } else {
                fetch('http://localhost:8000/updateTransactionStatus', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sWalletAddress: data.walletAddress,
                        sTransactionHash: receipt.transactionHash,
                        nStatus: -1,
                    })
                })
                    .then((response) => response.json())
                    .then((data) => {
                        setRefresh(0);
                        displayPopUp(
                            "Error!",
                            'Transaction failed!',
                            'error'
                        );
                    })
                    .catch((error) => {
                        console.log("error := ", error);
                        setRefresh(0);
                        displayPopUp(
                            "Error!",
                            "Internal server error!",
                            'error'
                        );
                    })
            }
        } catch (error) {
            console.log('catch error := ', error);
            if (error.error && error.error.data && error.error?.data?.message.includes("execution reverted:")) {
                let errorMessage = error.error?.data?.message;
                let message = errorMessage.replace('execution reverted: ', '');
                displayPopUp(
                    "Error!",
                    message,
                    'error'
                );
            } else {
                let message;
                if(error.code == 'ACTION_REJECTED') {
                    message = "User rejected the transaction!";
                } else {
                    message = "Something went wrong, Please try again later!";
                }
                displayPopUp(
                    "Error!",
                    message,
                    'error'
                );
            }
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
                                <th scope="col">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                allTransactions.length == 0 ? (
                                    <h3 className="text-center fw-lighter">
                                        No transactions yet!
                                    </h3>
                                ) : (
                                    allTransactions.map((transaction) => {
                                        if (transaction.nStatus == 1) {
                                            return (
                                                <tr className='table-success'>
                                                    <td scope="col">{transaction.nAmount}</td>
                                                    <td scope="col">{transaction.sTransactionHash}</td>
                                                    <td scope="col">Success</td>
                                                </tr>
                                            );
                                        } else if (transaction.nStatus == 0) {
                                            return (
                                                <tr className='table-warning'>
                                                    <td scope="col">{transaction.nAmount}</td>
                                                    <td scope="col">{transaction.sTransactionHash}</td>
                                                    <td scope="col">Pending</td>
                                                </tr>
                                            );
                                        } else if (transaction.nStatus == -1) {
                                            return (
                                                <tr className='table-danger'>
                                                    <td scope="col">{transaction.nAmount}</td>
                                                    <td scope="col">{transaction.sTransactionHash}</td>
                                                    <td scope="col">Failed</td>
                                                </tr>
                                            );
                                        }
                                    })
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default Body;
