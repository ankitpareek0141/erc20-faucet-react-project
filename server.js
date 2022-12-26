require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const corsOptions = {
    origin: '*',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200,
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

app.post('/getUserTransactions', async (req, res) => {
    try {
        console.log('body := ', req.body);
        let aTransaction = await Transaction.find({
            sWalletAddress: req.body.sWalletAddress
        }, {
            sTransactionHash: 1,
            nAmount: 1,
            nStatus: 1
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            data: aTransaction
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error!"
        });
    }
});

app.post('/createTransaction', async (req, res) => {
    try {
        console.log("body: ", req.body);
        const { nAmount, sWalletAddress, sTransactionHash } = req.body;

        await new Transaction({
            nAmount,
            sTransactionHash,
            sWalletAddress,
            nStatus: 0
        }).save();

        return res.status(200).json({
            message: "Transaction created successfully!"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error!"
        });
    }
});

app.post('/updateTransactionStatus', async (req, res) => {
    try {
        const {
            sWalletAddress,
            sTransactionHash,
            nStatus
        } = req.body;

        let oTransaction = await Transaction.findOne({
            sWalletAddress,
            sTransactionHash
        });
        console.log("oTransaction := ", oTransaction);

        if (oTransaction) {
            oTransaction.nStatus = nStatus;
            await oTransaction.save();
        } else {
            await new Transaction({
                sTransactionHash,
                sWalletAddress,
                nStatus
            }).save();
        }

        return res.status(200).json({
            message: "Transaction updated successfully!"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error!"
        });
    }
});

app.listen(PORT, () => {
    console.log("Spinning on PORT := ", PORT);
});