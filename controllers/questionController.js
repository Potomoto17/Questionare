const QuestionModel = require('../models/questionModel.js');
const AnswerModel = require('../models/answerModel.js');
const { validationResult } = require('express-validator');

/**
 * questionController.js
 *
 * @description :: Server‑side logic for managing questions.
 */
module.exports = {
    /* ------------------------------------------------ list */
    list(req, res, next) {
        QuestionModel.find()
            .sort({ createdAt: -1 })                // novejša vprašanja najprej
            .populate('postedBy', 'username profilePicture')       // doda samo username avtorja
            .lean()                                 // plain JS objects → Handlebars friendly
            .exec((err, questions) => {
                if (err) return next(err);
                res.render('question/list', { title: 'Vprašanja', questions });
            });
    },

    /* ------------------------------------------------ show */
    show(req, res, next) {
        const id = req.params.id;

        // 1. poiščemo vprašanje
        QuestionModel.findById(id)
            .populate('postedBy', 'username profilePicture')
            .lean()
            .exec((err, question) => {
                if (err) return next(err);
                if (!question) return res.status(404).render('error', { message: 'No such question' });

                // 2. nato naložimo odgovore – sprejeti na vrh, ostali po času
                AnswerModel.find({ question: id })
                    .populate('postedBy', 'username profilePicture')
                    .sort({ isAccepted: -1, createdAt: 1 })
                    .lean()
                    .exec((err, answers) => {
                        if (err) return next(err);

                        res.render('question/show', {
                            title: question.title,
                            question,  // celoten objekt vprašanja
                            answers,   // urejeni odgovori
                            userId: req.session.userId,
                            csrfToken: req.csrfToken()
                        });
                    });
            });
    },

    /* ------------------------------------------------ publish (GET) */
    publish(req, res) {
        if (!req.session.userId) {
            return res.redirect('/users/login?error=You must be logged in to publish a question');
        }
        res.render('question/publish', { title: 'Objavi vprašanje' });
    },

    /* ------------------------------------------------ create (POST) */
    create(req, res, next) {
        if (!req.session.userId) {
            return res.redirect('/users/login?error=You must be logged in to publish a question');
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('question/publish', {
                title: 'Objavi vprašanje',
                error: errors.array().map(e => e.msg).join(', '),
                question: req.body
            });
        }

        const question = new QuestionModel({
            title: req.body.title,
            description: req.body.description,
            postedBy: req.session.userId
        });

        question.save(err => {
            if (err) return next(err);
            // po uspešnem shranjevanju preusmerimo na seznam
            res.redirect('/questions');
        });
    }
};
