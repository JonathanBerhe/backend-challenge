const express       = require('express');
const router        = express.Router();
const redis         = require('redis');
const debug         = require('debug') ('API.js')

// imports models
const customer = require('../models/customer');
const customer_util = require('../models/customer_util');

// takes fields from model
var fields = new customer_util();
var list_fields = [];
list_fields = fields.getFields();

// Init redis client
const cache = redis.createClient();

debug('Campi riscontrati per customer_model.js: ', list_fields.length);


// GET method
router.get('/customer/filter=:campo::value', function (request, response, next){
    var campo = request.params.campo.toString('utf8')
    debug('params in url: ', request.params, ' query: ', request.query);

    if(list_fields.includes(campo)){

        // 1. search into cache
        cache.get(request.originalUrl, (error, value) =>{
            if(error) debug(error);
            if(value)
            {
                response.send(JSON.parse(value));
                debug('Data received from cache!');
            }
            else{
                debug('Data not present into cache..')
                // 2. search into db
                customer
                .find()
                .where(request.params.campo)
                .equals(request.params.value)
                .then((result) => {
                    response.send(result);

                    // if status code == 200, then put data into cache.
                    if(response.statusCode == 200){  
                        cache.set(request.originalUrl, JSON.stringify(result), (error) =>{
                            if(error) throw error;
                            debug('Data received from db, try to put data into cache..')
                        });
                    }
                });
            }
        })
    }
    else{
        debug('Not found: ', campo);
        response.sendStatus(404);
    }
});

router.get('/customer/filter=:campo::value/size=:number', function (request, response, next){
    var campo = request.params.campo.toString('utf8')
    debug('params in url: ', request.params, ' query: ', request.query);

    if(list_fields.includes(campo)){
        var size = parseInt(request.params.number, 10);

        var query = customer.find()
        query
        .where(request.params.campo)
        .equals(request.params.value)
        .limit(size)
        .then((result) => {
            response.send(result);
        });
    }
    else{
        debug('Not found: ', campo);
        response.sendStatus(404);
    }
});

router.get('/customer/filter=:campo::value/size=:number/sort=:order', function (request, response, next){
    var campo = request.params.campo.toString('utf8')
    debug('params in url: ', request.params, ' query: ', request.query);

    if(list_fields.includes(campo)){
        var size = parseInt(request.params.number, 10);
        
        const sort= function(){
                switch(request.params.order)
                {
                    case('desc' || -1):
                        return '-'+campo;
                    case('asc' || 1):
                        return campo;
                    default: return campo;
                }
            }
        debug('sort obj: ', sort())

        var query = customer.find()
        query
        .where(request.params.campo)
        .equals(request.params.value)
        .limit(size)
        .sort(sort())
        .then((result) => {
            response.send(result);
        });
    }
    else{
        debug('Not found: ', campo);
        response.sendStatus(404);
    }
});

// POST method
router.post('/customer', function(request, response, next){
    debug(request.body)
    customer.create(request.body).then(function(result){
        response.send({result});
    }).catch(next);
});

function searchFromCacheOrDb(request) {
    // ad cache search

    // query to mongodb
    customer.find().select(request.params.campo).then((result) => {
        return result.toString().toLowerCase();
    });
}


module.exports = router;