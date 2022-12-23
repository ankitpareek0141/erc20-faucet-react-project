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
		}
	},
	{ timestamps: true },
)

module.exports = mongoose.model('transaction', transactionSchema); 
