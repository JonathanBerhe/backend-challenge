var json_config = require('./model_customer');


module.exports = class CustomerUtil{

    constructor(){}

    getFields(){
        let fields = [];
        for(let field in json_config)
            fields.push(field);
        return fields;
    }
}



