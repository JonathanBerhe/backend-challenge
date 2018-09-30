const request=require('request')
const csv=require('csvtojson')
const fs = require('fs').createWriteStream('result.txt');

module.exports = class Provider
{
    constructor(from_url)
    {
        this.from_url = from_url;

        this.hasResponsOK = null;
        this.hasCompliteLoadData = null;

        this.options = {
            uri: null,
            body: null,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    }

    updateDb(to_url){
        this.options.uri = to_url;
        // 1. Get stream data from API.
        request.get(this.from_url, (error, Response) => {
            this._response_handler(error, Response);
            if(! this.hasResponsOK) return;
        })
        // Send csv buffer throught a pipe.
        .pipe(
            csv({
            output: 'json',
            delimiter:';'
        })
        // When 'data' event is emitted a single csv line is parsed in json.
        .on('data', (jsonBuffer) =>
        {
            // send json buffer, line by line.
            var json = this._keysInCamelCase(jsonBuffer);
            this._http_post(json);
            
        })
        .on('done', (error) => {
            if(error)
            {
                this.hasCompliteLoadData = false;
                return;
            }
            else
            {
                console.log('Import complited.');
            }
        }))
    }

    _http_post(json) {
        // send json through url provided by constructor.
        this.options.body = json;
        request(this.options, (error, response) => {
            this._response_handler(error, response);
            if(this.hasResponsOK) this.hasCompliteLoadData = true;
        });
    }

    // "ID_UTENTE" -> input
    // output return -> "idUtente"
    _keysInCamelCase(jsonBuffer)
    {
        let jsonArray =[];
        var json=  JSON.parse(jsonBuffer.toString('utf8'));
        jsonArray.push(json);

        jsonArray.forEach(index => {
            Object.keys(index).forEach(key => {
              
                // current line: idUtente: '233'
                // array Index[idUtente]= 233
                // key == Index[idUtente]
                let lowerKey= key.toLowerCase();
                let newK = lowerKey.replace(/(\_\w)/g, (m) => m[1].toUpperCase());
         
                //newk = userID
                //k = user_id
                if (newK != key){
                    index[newK] = index[key];
                    delete index[key];
                }
            });
        });
        console.log('finale: ', JSON.stringify(jsonArray[0]))
        return JSON.stringify(jsonArray[0]);
    }

    _response_handler(error, response){
        if(error){
            this.hasResponsOK = false;
            console.log(error);
            return;
        }
        if(response.statusCode !== 200){
            console.log('http status code: ', response.statusCode);
            console.log('http header: ', JSON.stringify(response.headers));
            this.hasResponsOK = false;
            return;
        }
        this.hasResponsOK = true;
        return;
    }

}