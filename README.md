# Getting Started with the ERC20 Faucet Project

This Dapp provides the ERC20 token as per your need which you can use in your projects or for any other testing purpose,
You can add your wallet address and amount of token to want to get and click on submit button to intiate the transaction. Make sure
the Dapp have a some limit for withdrawing the tokens so if you want to withdraw above than that then you will be charged some fee amount eg:- 0.001 ETH which can also be change by the admin also.

### What you need to do before running the project

You need to setup the environment variables in '.env' file which reside in the project root folder.
```sh
PORT = Enter the server port number, it should be different from the react server
DB_URL = Enter your DB URL
PVT_KEY = Enter account private key
BINANCE_RPC_URL = Enter binance RPC URL
REACT_APP_PORT = Enter the server port again to access in the react client
```

### Now your project has setup, follow the commands below to run the project
### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `node server.js`

Runs the express server which will listen to the PORT 8000. Make sure to run the command on another terminal window.