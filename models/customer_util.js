var json_config = require('./customer_model');


module.exports = class CustomerUtil{

    constructor(){}

    getFields(){
        let fields = [];
        for(let field in json_config)
            fields.push(field);
        return fields;
    }
}



