import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { ethers } from 'ethers';

function Body(props) {
    const [data, setData] = useState({ walletAddress: '', amount: 0 });
    const [allTransactions, setAllTransactions] = useState([]);
    const [refresh, setRefresh] = useState(0);

    const PORT = process.env.REACT_APP_PORT;

    function displayPopUp(msgTitle, msgBody, iconType) {
        Swal.fire({
            title: msgTitle,
            text: msgBody,
            icon: iconType,
            confirmButtonText: 'Ok',
        });
        document.getElementById('submitBtn').disabled = false;
    }

    useEffect(() => {
        console.log('props := ', props);

        // if (props.walletAddress != '') {
            fetch(`http://localhost:${PORT}/getUserTransactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sWalletAddress: "0x9e483a7bde866c9a0681a63cf83206f2104f4fa3",
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    let aTransactions = data.data;
                    setAllTransactions(aTransactions);
                })
                .catch((error) => {
                    console.log('error := ', error);
                    displayPopUp('Error!', 'Internal server error!', 'error');
                });
        // }
    }, [refresh]);

    async function handelSubmit(e) {
        try {
            e.preventDefault();
            document.getElementById('submitBtn').disabled = true;

            if (!Object.keys(props.contractObj).length) {
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

            let contract = props.contractObj;

            var currentFee = 0;
            const owner = await contract.owner();
            const currentLimitInWei = await contract.max_mint_limit();
            const currentLimitInEth =
                ethers.utils.formatEther(currentLimitInWei);

            if (
                data.amount > currentLimitInEth &&
                data.walletAddress.toLowerCase() != owner.toLowerCase()
            )
                currentFee = await contract.fee();

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
                    displayPopUp(
                        'Attention!',
                        'Transaction has been initiated!\n' + txn.hash,
                        -'info'
                    );
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

    return (
        <>

        </>
    );
}

export default Body;
