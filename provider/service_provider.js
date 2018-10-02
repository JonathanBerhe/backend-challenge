
const provider = require('./provider');

var client = new provider('http://challenges.tate.cloud/back2018/CLIENTI');

try
{
    client.updateDb('http://localhost:4000/api/customer');

}catch (error)
{
    console.log(error);
    throw error;
}
