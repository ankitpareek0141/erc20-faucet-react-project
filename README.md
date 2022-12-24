# Getting Started with the ERC20 Faucet Project

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### What you need to do before running the project

You need to setup the environment variables in '.env' file which reside in the project root folder.
```sh
PORT = Enter the server port number, it should be different from the react server
DB_URL = Enter your DB URL
PVT_KEY = Enter account private key
BINANCE_RPC_URL = Enter binance RPC URL
```

### Now your project has setup, follow the commands below to run the project
### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `node server.js`

Runs the express server which will listen to the PORT 8000. Make sure to run the command on another terminal window.