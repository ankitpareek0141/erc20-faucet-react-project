require("dotenv").config({ path: "../.env"});
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-abi-exporter");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",

  networks: {

    bscTestnet: {
      url: process.env.BINANCE_RPC_URL,
      chainId: 97,
      gas: "auto",
      accounts: [
        `${process.env.PVT_KEY}`,
      ],
    },

    matic: {
      url: "https://matic-testnet-archive-rpc.bwarelabs.com",
      chainId: 80001,
      accounts: [
        `${process.env.PVT_KEY}`
      ],
    },
  }
};
