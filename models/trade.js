const mongoose = require("mongoose");
const AutoIncrementFactory = require('mongoose-sequence');
const AutoIncrement = AutoIncrementFactory(mongoose);

const tradeSchema = new mongoose.Schema(
    {
        tradeId: { type: Number }, // Unique identifier
        stockName: { type: String, required: true }, // e.g., Apple, Tesla, etc.
        quantity: { type: Number, required: true }, // Positive for buy, negative for sell
        brokerName: { type: String, required: true }, // Broker through which the trade was made
        price: { type: Number, required: true }, // Price per unit stock
        amount: { type: Number, required: true }, // Total value of trade = price * quantity
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
    },
    { 
        timestamps: true
    }
);

tradeSchema.plugin(AutoIncrement, { inc_field: "tradeId", start_seq: 1, inc_amount: 1 });

tradeSchema.index({ tradeId: 1 }, { unique: true });

module.exports = Trade = mongoose.model("Trade", tradeSchema);
