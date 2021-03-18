const mongoose = require('mongoose');
const ChannelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    messages: {
        type: Array,
        required: true
    }
});

const Channels = mongoose.model('Channel', ChannelSchema);

module.exports = Channels;