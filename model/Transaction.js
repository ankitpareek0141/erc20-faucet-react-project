const mongoose = require('mongoose');
const { Schema } = mongoose;

const transactionSchema = new Schema(
	{
        sWalletAddress: {
            type: String,
            required: true,
        },
		sTransactionHash: {
			type: String,
            required: true,
		},
		nAmount: {
			type: Number,
            required: true
		},
		nStatus: {
			type: Number,
			enum: [-1, 0, 1] // Failed: -1, Pending: 0, Success: 1
		}
	},
	{ timestamps: true },
)

module.exports = mongoose.model('transaction', transactionSchema); 
