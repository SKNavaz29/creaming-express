const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const cors = require('./cors.js');

const Items = require('../models/items');

const itemRouter = express.Router();

itemRouter.use(bodyParser.json());

itemRouter.route('/')

//.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200);})

.get((req,res,next) => {
    Items.find(req.query)
    .populate('comments.author')
    .then((items) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(items);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post((req, res, next) => {
    Items.create(req.body)
    .then((Item) => {
        console.log('Dish Created ', Item);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(Item);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /items');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Items.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

itemRouter.route('/:itemId')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200);})
.get(cors.cors,(req,res,next) => {
    Items.findById(req.params.itemId)
    .populate('comments.author')
    .then((Item) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(Item);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /items/'+ req.params.itemId);
})
.put(cors.corsWithOptions, (req, res, next) => {
    Items.findByIdAndUpdate(req.params.itemId, {
        $set: req.body
    }, { new: true })
    .then((Item) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(Item);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    Items.findByIdAndRemove(req.params.itemId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

itemRouter.route('/:itemId/comments')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200);})
.get(cors.cors,(req,res,next) => {
    Items.findById(req.params.itemId)
    .populate('comments.author')
    .then((Item) => {
        if (Item != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(Item.comments);
        }
        else {
            err = new Error('Dish ' + req.params.itemId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
    Items.findById(req.params.itemId)
    .then((Item) => {
        if (Item != null) {
            req.body.author = req.user._id;
            Item.comments.push(req.body);
            Item.save()
            .then((Item) => {
                Items.findById(Item._id)
                    .populate('comments.author')
                    .then((Item)=>{
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(Item);  
                    })                            
            }, (err) => next(err));
        }
        else {
            err = new Error('Dish ' + req.params.itemId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})


.put(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /items/'
        + req.params.itemId + '/comments');
})
.delete(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    Items.findById(req.params.itemId)
    .then((Item) => {
        if (Item != null) {
            for (var i = (Item.comments.length -1); i >= 0; i--) {
                Item.comments.id(Item.comments[i]._id).remove();
            }
            Item.save()
            .then((Item) => {                
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(Item);                
            }, (err) => next(err));
        }
        else {
            err = new Error('Dish ' + req.params.itemId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));    
});

itemRouter.route('/:itemId/comments/:commentId')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200);})
.get(cors.cors,(req,res,next) => {
    Items.findById(req.params.itemId)
    .populate('comments.author')
    .then((Item) => {
        if (Item != null && Item.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(Item.comments.id(req.params.commentId));
        }
        else if (Item == null) {
            err = new Error('Dish ' + req.params.itemId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /items/'+ req.params.itemId
        + '/comments/' + req.params.commentId);
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Items.findById(req.params.itemId).then((Item) => {
        if (Item != null && Item.comments.id(req.params.commentId)) {
            if (Item.comments.id(req.params.commentId).author.toString() != req.user._id.toString()) {
                err = new Error('You are not authorized to edit this comment');
                err.status = 403;
                return next(err);
            }
            if (req.body.rating) {
                Item.comments.id(req.params.commentId).rating = req.body.rating;
            }

            if (req.body.comment) {
                Item.comments.id(req.params.commentId).comment = req.body.comment;
            }
            Item.save().then((Item) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(Item);
            }, (err) => next(err)).catch((err) => next(err));
        } else if (Item == null) {
            err = new Error('Dish ' + req.params.itemId + ' not found');
            err.status = 404;
            return next(err);
        } else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err)).catch((err) => next(err));
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Items.findById(req.params.itemId).then((Item) => {
        if (Item != null && Item.comments.id(req.params.commentId)) {
            if (Item.comments.id(req.params.commentId).author.toString() != req.user._id.toString()) {
                err = new Error('You are not authorized to edit this comment');
                err.status = 403;
                return next(err);
            }
            Item.comments.id(req.params.commentId).remove();
            Item.save().then((Item) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(Item);
            }, (err) => next(err)).catch((err) => next(err));
        } else if (Item == null) {
            err = new Error('Dish ' + req.params.itemId + ' not found');
            err.status = 404;
            return next(err);
        } else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err)).catch((err) => next(err));
});



module.exports = itemRouter;