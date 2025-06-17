var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var answerSchema = new Schema({
    content: { type: String, required: true },
    question: {
        type: Schema.Types.ObjectId,
        ref: 'question',
        required: true
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    isAccepted: { type: Boolean, default: false }},
    { timestamps:true });


module.exports = mongoose.model('answer', answerSchema);