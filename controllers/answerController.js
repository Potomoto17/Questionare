var AnswerModel = require('../models/answerModel.js');
var QuestionModel = require('../models/questionModel.js');

/**
 * answerController.js
 *
 * @description :: Server-side logic for managing answers.
 */
module.exports = {
    /**
     * answerController.create()
     */
    create: function (req, res) {
        var answer = new AnswerModel({
            content: req.body.content,
            question: req.params.questionId,
            postedBy: req.session.userId
        });

        answer.save(function (err, answer) {
            if (err) {
                return res.redirect(`/questions/${req.params.questionId}?error=Error creating answer`);
            }
            return res.redirect(`/questions/${req.params.questionId}`);
        });
    },

    /**
     * answerController.accept()
     */
    accept: function (req, res) {
        var answerId = req.params.answerId;
        var questionId = req.params.questionId;

        // Find the question to verify the user is the author
        QuestionModel.findOne({ _id: questionId, postedBy: req.session.userId }, function (err, question) {
            if (err || !question) {
                return res.redirect(`/questions/${questionId}?error=Unauthorized or question not found`);
            }

            // Unmark any previously accepted answer
            AnswerModel.updateMany(
                { question: questionId, isAccepted: true },
                { isAccepted: false },
                function (err) {
                    if (err) {
                        return res.redirect(`/questions/${questionId}?error=Error updating answers`);
                    }

                    // Mark the selected answer as accepted
                    AnswerModel.findByIdAndUpdate(
                        answerId,
                        { isAccepted: true },
                        { new: true },
                        function (err, answer) {
                            if (err || !answer) {
                                return res.redirect(`/questions/${questionId}?error=Answer not found`);
                            }
                            return res.redirect(`/questions/${questionId}`);
                        }
                    );
                }
            );
        });
    }
};