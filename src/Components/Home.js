import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Swal from 'sweetalert2';
import List from './List';
import contractData from './abi';

function Home() {
    const [walletAddress, setWalletAddress] = useState('');
    const [provider, setProvider] = useState({});
    const [contract, setContract] = useState({});
    const [data, setData] = useState({ walletAddress: '', amount: 0 });
    const [allTransactions, setAllTransactions] = useState([]);
    const [refresh, setRefresh] = useState(0);

    const PORT = process.env.REACT_APP_PORT;

    useEffect(() => {
        if (provider) {
            connectWallet();
        }
    }, [refresh]);

    async function handelSubmit(e) {
        try {
            e.preventDefault();
            document.getElementById('submitBtn').disabled = true;

            if (!walletAddress) {
                displayPopUp(
                    'Attention!',
                    'Please connect your metamask wallet',
                    'info'
                );
                return;
            }

            if (data.walletAddress.length == 0) {
                displayPopUp('Error!', 'Please enter wallet address!', 'error');
                return;
            }
            if (!data.amount) {
                displayPopUp('Error!', 'Please enter some amount!', 'error');
                return;
            }

            var currentFee = 0;
            const owner = await contract.owner();
            const currentLimitInWei = await contract.max_mint_limit();
            const currentLimitInEth =
                ethers.utils.formatEther(currentLimitInWei);
            console.log(
                '🚀 ~ file: Home.js:51 ~ handelSubmit ~ currentLimitInEth',
                currentLimitInEth
            );

            if (
                data.amount > Number(currentLimitInEth) &&
                data.walletAddress.toLowerCase() != owner.toLowerCase()
            ) {
                currentFee = await contract.fee();
            }

            let gasEstimated = await contract.estimateGas.mint(
                data.walletAddress,
                data.amount,
                {
                    value: currentFee,
                }
            );
            console.log('gas := ', Number(gasEstimated._hex));

            let txn = await contract.mint(data.walletAddress, data.amount, {
                value: currentFee,
            });
            console.log('txn ', txn);

            fetch(`http://localhost:${PORT}/createTransaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sWalletAddress: data.walletAddress,
                    sTransactionHash: txn.hash,
                    nAmount: data.amount,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    setRefresh(1);
                    Swal.fire({
                        title: 'Attention!',
                        html:
                            `Transaction has been initiated!</br> ` +
                            `View your txn on <a href="https://testnet.bscscan.com/tx/${txn.hash}" target="_blank">BscScan</a>`,
                        icon: 'info',
                        confirmButtonText: 'Ok',
                    });
                    document.getElementById('submitBtn').disabled = false;
                })
                .catch((error) => {
                    console.log('error := ', error);
                    displayPopUp('Error!', 'Internal server error!', 'error');
                });

            let receipt = await txn.wait();
            console.log('receipt := ', receipt);
            if (receipt.status) {
                fetch(`http://localhost:${PORT}/updateTransactionStatus`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sWalletAddress: data.walletAddress,
                        sTransactionHash: receipt.transactionHash,
                        nStatus: 1,
                    }),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        setRefresh(0);
                        displayPopUp(
                            'Success!',
                            'Transaction done successfully!',
                            'success'
                        );
                    })
                    .catch((error) => {
                        console.log('error := ', error);
                        displayPopUp(
                            'Error!',
                            'Internal server error!',
                            'error'
                        );
                    });
            } else {
                fetch(`http://localhost:${PORT}/updateTransactionStatus`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sWalletAddress: data.walletAddress,
                        sTransactionHash: receipt.transactionHash,
                        nStatus: -1,
                    }),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        setRefresh(0);
                        displayPopUp('Error!', 'Transaction failed!', 'error');
                    })
                    .catch((error) => {
                        console.log('error := ', error);
                        setRefresh(0);
                        displayPopUp(
                            'Error!',
                            'Internal server error!',
                            'error'
                        );
                    });
            }
        } catch (error) {
            console.log('catch error := ', error);
            if (
                error.error &&
                error.error.data &&
                error.error?.data?.message.includes('execution reverted:')
            ) {
                let errorMessage = error.error?.data?.message;
                let message = errorMessage.replace('execution reverted: ', '');
                displayPopUp('Error!', message, 'error');
            } else {
                let message;
                if (error.code == 'ACTION_REJECTED') {
                    message = 'User rejected the transaction!';
                } else {
                    message = 'Something went wrong, Please try again later!';
                }
                displayPopUp('Error!', message, 'error');
            }
        }
    }

    async function connectWallet() {
        if (window.ethereum) {
            // A Web3Provider wraps a standard Web3 provider, which is
            // what MetaMask injects as window.ethereum into each page
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            setProvider(provider);
            // MetaMask requires requesting permission to connect users accounts
            // await provider.send("eth_requestAccounts", []);

            let network = await provider.getNetwork();
            console.log('ChainId := ', network.chainId);

            if (network.chainId != 97) {
                Swal.fire({
                    title: 'Invalid Chain',
                    text: 'You are on another chain, Please switch to BSC Testnet.',
                    icon: 'error',
                    confirmButtonText: 'Ok',
                });
                return;
            }
            // @TODO: Check if user connected to specific network

            // The MetaMask plugin also allows signing transactions to
            // send ether and pay to change state within the blockchain.
            // For this, you need the account signer...
            const signer = provider.getSigner();

            let accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            });
            console.log('Connected to := ', accounts[0]);
            setWalletAddress(accounts[0]);

            // Creating contract instance
            let contractObj = new ethers.Contract(
                contractData.contractAddress,
                contractData.abi,
                signer
            );
            console.log('contractObj := ', contractObj);
            setContract(contractObj);

            fetch(`http://localhost:${PORT}/getUserTransactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sWalletAddress: accounts[0],
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    let aTransactions = data.data;
                    setAllTransactions(aTransactions);
                    // allTransactions = aTransactions;
                })
                .catch((error) => {
                    console.log('error := ', error);
                    displayPopUp('Error!', 'Internal server error!', 'error');
                });
        }
    }

    function displayPopUp(msgTitle, msgBody, iconType) {
        Swal.fire({
            title: msgTitle,
            text: msgBody,
            icon: iconType,
            confirmButtonText: 'Ok',
        });
        document.getElementById('submitBtn').disabled = false;
    }

    return (
        <>
            <nav className="navbar navbar-expand-lg bg-light">
                <div className="container-fluid">
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarTogglerDemo01"
                        aria-controls="navbarTogglerDemo01"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div
                        className="collapse navbar-collapse"
                        id="navbarTogglerDemo01"
                    >
                        <a className="navbar-brand" href="#">
                            RAW Token
                        </a>
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0"></ul>
                        <button
                            className="btn btn-outline-success"
                            type="submit"
                            id="connectButton"
                            onClick={connectWallet}
                            disabled={walletAddress ? true : false}
                        >
                            {walletAddress || 'Connect'}
                        </button>
                    </div>
                </div>
            </nav>
            <div className="container-fluid w-50 mt-5">
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
                    <button
                        type="submit"
                        className="btn btn-primary"
                        id="submitBtn"
                    >
                        Mint
                    </button>
                </form>

                <div style={{ height: '500px', marginTop: '60px' }}>
                    <h3>Your Transactions</h3>

                    <div className="h-75 w-100 overflow-auto d-inline-block">
                        <table className="table table-striped table-hover">
                            <thead>
                                <tr className="table-dark">
                                    <th scope="col">Amount</th>
                                    <th scope="col">Txn Hash</th>
                                    <th scope="col">Status</th>
                                </tr>
                            </thead>
                            {walletAddress ? (
                                <List allTransactions={allTransactions} />
                            ) : (
                                <h3 className="text-center fw-lighter">
                                    Wallet not connected!
                                </h3>
                            )}
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Home;
