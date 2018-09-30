const express       = require('express');
const router        = express.Router();

// imports models
const customer = require('../models/customer');
const customer_util = require('../models/customer_util');

var fields = new customer_util();

var list_fields = [];
list_fields = fields.getFields();

console.log('Campi riscontrati per customer_model.js: ', list_fields.length);


// GET method
router.get('/customer/filter=:campo::value', function (request, response, next){
    var campo = request.params.campo.toString('utf8')
    console.log('params in url: ', request.params, ' query: ', request.query);

    if(list_fields.includes(campo)){
        customer.find()
        .where(request.params.campo)
        .equals(request.params.value)
        .then((result) => {
            response.send(result);
        });
    }
    else{
        console.log('Not found: ', campo);
        response.sendStatus(404);
    }
});

router.get('/customer/filter=:campo::value/size=:number', function (request, response, next){
    var campo = request.params.campo.toString('utf8')
    console.log('params in url: ', request.params, ' query: ', request.query);

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
        console.log('Not found: ', campo);
        response.sendStatus(404);
    }
});

router.get('/customer/filter=:campo::value/size=:number/sort=:order', function (request, response, next){
    var campo = request.params.campo.toString('utf8')
    console.log('params in url: ', request.params, ' query: ', request.query);

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
        console.log('sort obj: ', sort())

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
        console.log('Not found: ', campo);
        response.sendStatus(404);
    }
});

// POST method
router.post('/customer', function(request, response, next){
    console.log(request.body)
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