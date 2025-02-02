const mongoose = require("mongoose");
const AutoIncrementFactory = require('mongoose-sequence');
const AutoIncrement = AutoIncrementFactory(mongoose);

const lotSchema = new mongoose.Schema(
    {
        lotId: { type: Number }, // Unique identifier
        tradeId: { type: Number },
        // trade_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Trade', required: true }, // Reference to trade that created this lot
        stockName: { type: String, required: true }, // e.g., Apple, Tesla, etc.
        lotQuantity: { type: Number, required: true }, // Total quantity in the lot
        realizedQuantity: { type: Number, default: 0 }, // Quantity that has been sold from this lot
        realizedTradeId: { type: Number },
        // realized_trade_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Trade' }, // Trade ID of the trade that realized this lot
        lotStatus: { type: String, enum: ['OPEN', 'PARTIALLY REALIZED', 'FULLY REALIZED'], default: 'OPEN' } // OPEN / PARTIALLY REALIZED / FULLY REALIZED
    },
    { 
        timestamps: true
    }
);

lotSchema.plugin(AutoIncrement, { inc_field: "lotId", start_seq: 1, inc_amount: 1 });

lotSchema.index({ lotId: 1 }, { unique: true });

module.exports = Lot = mongoose.model("Lot", lotSchema);