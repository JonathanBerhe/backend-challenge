const provider = require('./provider');

var client = new provider('http://challenges.tate.cloud/back2018/CLIENTI');


client.updateDb('http://localhost:4000/api/customer');