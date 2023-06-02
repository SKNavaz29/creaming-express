const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;


const itemSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },    
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Currency,
        required: true,
        min: 0
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    }
});


var Items = mongoose.model('Item', itemSchema);

module.exports = Items