const mongoose = require('mongoose');
const ChannelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    messages: {
        type: Array
    }
});

const Channel = mongoose.model('Channel', ChannelSchema);

module.exports = Channel;