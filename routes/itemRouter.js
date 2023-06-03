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




module.exports = itemRouter;