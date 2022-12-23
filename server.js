require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const corsOptions = {
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}
const app = express();
app.use(express.json());
app.use(cors(corsOptions));

const Transaction = require('./model/Transaction');
const PORT = process.env.PORT || 8000;

mongoose
    .connect(process.env.DB_URL)
    .then(() => {
        console.log('Database connected');
    })
    .catch((error) => {
        throw error;
    });


app.get('/getUserTransactions', async (req, res) => {
    
    let sWalletAddress = req.body.sWalletAddress;
    let aTransaction = await Transaction.find({});

    return res.status(200).json({
        data: aTransaction
    })
});

app.listen(PORT, () => {
    console.log("Spinning on PORT := ", PORT);
});