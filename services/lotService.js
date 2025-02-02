const Lot = require('../models/lot');
const Trade = require('../models/trade');

async function processTrade(trade) {
    if (trade.quantity > 0) {
        // Buy Trade - Create new lot
        await Lot.create({
            stock_name: trade.stock_name,
            trade_id: trade._id,
            lot_quantity: trade.quantity
        });
    } else {
        // Sell Trade - Process FIFO or LIFO
        await processSellTrade(trade, 'FIFO');  // Change to 'LIFO' for LIFO processing
    }
}

async function processSellTrade(trade, method) {
    let remainingQuantity = Math.abs(trade.quantity);
    let lots = await Lot.find({ stock_name: trade.stock_name, lot_status: { $ne: 'FULLY REALIZED' } })
        .sort(method === 'FIFO' ? { _id: 1 } : { _id: -1 });

    for (let lot of lots) {
        let availableQuantity = lot.lot_quantity - lot.realized_quantity;
        let usedQuantity = Math.min(remainingQuantity, availableQuantity);

        lot.realized_quantity += usedQuantity;
        if (lot.realized_quantity === lot.lot_quantity) lot.lot_status = 'FULLY REALIZED';
        else lot.lot_status = 'PARTIALLY REALIZED';

        await lot.save();
        remainingQuantity -= usedQuantity;
        if (remainingQuantity === 0) break;
    }
}

module.exports = { processTrade };
