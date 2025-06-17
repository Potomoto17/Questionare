var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var questionSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);