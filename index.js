const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// connect to mongodb
mongoose.connect('mongodb://localhost:27017', {useNewUrlParser: true});
mongoose.Promise = global.Promise;


app.use(bodyparser.json());

console.log('Import routes')
app.use('/api', require('./routes/api'));
console.log('finish import route')

// error handling
app.use((err, request, response, next) => {
    response.status(422).send({error: err.message});
})

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`listening on http://localhost:${port}`));
