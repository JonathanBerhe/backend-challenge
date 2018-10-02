
const provider  = require('./provider');
const debug     = require('debug') ('SERVICE_PROVIDER')
const env       = require('./enviroment')

debug('Init env: ', env)
const tateAPI= env.tate_endpoint;
const appAPI = env.test_endpoint.app_service_endpoint;
const client = new provider(tateAPI);

debug('Init obj provider')

// 6h
const time = 3600000 * 6


// every x time try to update db
setInterval( ()=> {

    debug('try to update db.. ')
    client.updateDb(appAPI);
    if(! client.hasResponsOK){
        client.updateDb(appAPI);
    }else{
        debug('Db updated!')
    }

}, time)

console.log(`wait ${time} for sending new data to db...`)
