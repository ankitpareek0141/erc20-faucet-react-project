import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractData from './abi';
import Body from './Body';
import Swal from 'sweetalert2';

function Home() {
    const [walletAddress, setWalletAddress] = useState('');
    const [provider, setProvider] = useState({});
    const [contract, setContract] = useState({});

    useEffect(() => {
        if (provider) connectWallet();
    }, []);

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
        }
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
                        >
                            {walletAddress || 'Connect'}
                        </button>
                    </div>
                </div>
            </nav>
            <div className="container-fluid w-50 mt-5">
                <Body contractObj={contract} walletAddress={walletAddress} />
            </div>
        </>
    );
}

export default Home;
