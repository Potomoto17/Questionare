const mongoose = require('mongoose');

exports.create = async function (req, res) {
    const questionId = req.params.questionId;

    // ✅ Preverimo, če je ID veljaven
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
        return res.status(400).json({ error: 'Invalid question ID' });
    }

    try {
        // Tvoja obstoječa logika:
        const answer = new Answer({
            text: req.body.text,
            question: questionId,
            author: req.session.userId
        });

        await answer.save();

        // Lahko še dodaš odgovor v seznam odgovorov vprašanja, če to uporabljaš
        await Question.findByIdAndUpdate(questionId, { $push: { answers: answer._id } });

        res.redirect(`/questions/${questionId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving the answer');
    }
};
