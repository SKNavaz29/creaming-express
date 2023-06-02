const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;



const orderSchema = new Schema ({

    totalPrice: {
        type: Currency,
        required: true,
        min: 0
    },
    
});