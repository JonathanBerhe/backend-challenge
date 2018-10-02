const express       = require('express');
const router        = express.Router();
const redis         = require('redis');
const debug         = require('debug') ('API.js')

// imports models
const customer = require('../models/customer');
const customer_util = require('../models/service_customer');

// takes fields from model
var fields = new customer_util();
var list_fields = [];
list_fields = fields.getFields();

// Init redis client
const cache = redis.createClient(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

debug('Campi riscontrati per customer_model.js: ', list_fields.length);


// GET /customer?filter=canoneRai&value=SI&size=3&sort=desc
router.get('/customer', function (request, response, next){
    
    debug('originalUrl: ', request.originalUrl, ', params in url: ', request.params, ', query: ', request.query);

    if(Object.keys(request.query).length === 0)
    {
        // return all docs from cache
        cache.get(request.originalUrl, (error, cacheValue) => {
            if(error) throw error;
            if(cacheValue){
                response.send( JSON.parse(cacheValue));
                debug('Data received from cache!');
            }
            else
            {
                // return all docs from db
                customer.find().then( (docs) => {
                    response.send(docs);

                    if(response.statusCode == 200){
                        // put data into cache for 1h
                        cache.set(request.originalUrl, JSON.stringify(docs), 'EX', 3600000, (error) => {
                            if(error) throw error;
                            debug('Data received from db, try to put data into cache..')
                        })
                    }
                });
            }
        })
    }
    else
    {
        if( request.query.filter !== null && list_fields.includes(request.query.filter) ){

            // 1. search into cache
            cache.get(request.originalUrl, (error, cacheValue) => {
                if(error) debug(error);
                if(cacheValue)
                {
                    response.send( JSON.parse(cacheValue) );
                    debug('Data received from cache!');
                }
                else
                {
                    debug('Data not present into cache..')

                    // 2. search in db
                    customer.find()
                    .where(request.query.filter)
                    .equals( checkFilterValue(request.query.value) )
                    .limit( checkSize(request.query.size) )
                    .sort( request.query.sort )
                    .then((dbValue) => {
                        response.send(dbValue);

                        // if status code == 200 put data into cache.
                        if(response.statusCode == 200){  

                            // key: string url, value: json document
                            cache.set(request.originalUrl, JSON.stringify(dbValue),'EX', 3600000 ,  (error) =>{
                                if(error) throw error;
                                debug('Data received from db, try to put data into cache..')
                            });
                        }

                    });
                }
            })

        }
        else{
            debug('Not found: ', request.query.filter);
            response.sendStatus(404);
        }
    }
});

// POST method
router.post('/customer', function(request, response, next){
    debug(request.body)
    customer.create(request.body).then(function(result){
        response.send({result});
    }).catch(next);
});

function checkFilterValue(value){
    if(value !== null ){
        return value;
    }
}

function checkSize(querySize){
    if(querySize !== null){
        return size = parseInt(querySize, 10);
    }
}



module.exports = router;