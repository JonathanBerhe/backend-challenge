const mongoose = require('mongoose');
var json_config = require('./model_customer');
const schema = mongoose.Schema;

// create customer Schema & model
const customer_schema = new schema(json_config);

const MongoCollection = mongoose.connection.useDb('customers');
const Customer = MongoCollection.model('customer', customer_schema);

module.exports = Customer;
