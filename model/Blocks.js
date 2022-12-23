const mongoose = require('mongoose');

const BlockSchema = mongoose.Schema(
    {
        nLastBlock: Number,
    },
    { timestamps: { createdAt: 'dCreatedDate', updatedAt: 'dUpdatedDate' } }
);

module.exports = mongoose.model('Block', BlockSchema);