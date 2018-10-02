const express       = require('express');
const bodyparser    = require('body-parser');
const mongoose      = require('mongoose');
const debug         = require('debug') ('INDEX.js')

const app = express();

// connect to mongodb
mongoose.connect(process.env.MONGODB_URI ||'mongodb://localhost:27017', {useNewUrlParser: true});
mongoose.Promise = global.Promise;


app.use(bodyparser.json());

app.use('/api', require('./routes/api'));
debug('Import routes')

// error handling
app.use((err, request, response, next) => {
    response.status(422).send({error: err.message});
})

const port = process.env.PORT || 4000;
app.listen(port, () => debug(`listening on http://localhost:${port}`));
