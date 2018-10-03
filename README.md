# Tate backend challenge

  
Un API di un nostro partner ritorna dei dati in formato csv, i dati vengono aggiornati ogni notte.

L'url dell'API è: [GET] http://challenges.tate.cloud/back2018/CLIENTI

L'API potrebbe non essere sempre disponibile e ritornare randomicamente errori 500 o nessun contenuto.

I dati cambieranno ogni notte quindi va predisposto un sistema per archiviarli in modo da sfruttarli in futuro ed evitare che vadano persi.

  

#### SPECIFICHE:

1. Una volta realizzato il sistema che archivia i tuoi dati, crea un'unica API che permetta di fruire questi dati in JSON.

2. L'API deve disporre di alcuni parametri per poter filtrare o manipolare i dati e ritornare una collezione di entità.

3. Ogni entità deve includere tutti i dati forniti dal partner, le chiavi devono essere rappresentate in camelCase (lowercase), i valori come stringhe.

**Filtra i dati ritornando solo le righe in cui il campo indicato è uguale al valore fornito**

filter=campo:query

  

**Limita il numero di risultati tornati**

size=number

  

**Ritorna la pagina richiesta di risultati (salta i primi page-1*size result)**

page=number

  

**[Bonus] Ordina i dati in ordine crescente o decrescente (asc|desc)**

sort=campo:order

  

5. Allega un file README in cui spieghi il perchè di certe scelte tecniche e gli step necessari per avviare e/o deployare il tuo codice.

  

#### BONUS:

- Serverless? We like serverless

- L'API usa GraphQL

- Implementi un sistema di cache per velocizzare i tempi di risposta.

# SOLUZIONE

  
App: http://tate-backend-challenge.herokuapp.com/api/customer

Vengono impiegati principalmente due servizi distinti:

1. Provider: ha come scopo quello di prelevare dei dati forniti da una API, modificarne il contenuto restituito ed allocarli, tramite un'altra API, su un database.

2. App: espone i metodi http POST e GET per la ricezione, la manipolazione e l'invio dei dati ricevuti dal provider e persistenti sul database.
### Stack:

- Nodejs
- Express.js
- Redis
- MongoDB
- Heroku (serverless) e/o in locale.
## PROVIDER
Il servizio provider effettua ciclicamente una chiamata all’API [http://challenges.tate.cloud/back2018/CLIENTI](http://challenges.tate.cloud/back2018/CLIENTI) , converte il formato dei dati ricevuti da CSV a JSON, modificando i campi da snake_case a chiavi in camelCase, ed invia i dati a [POST] [http://tate-backend-challenge.herokuapp.com/api/customer](http://tate-backend-challenge.herokuapp.com/api/customer) per l'allocazione sul database.

La richiesta dei dati all'API avviene in un intervallo di tempo costante e determinato:

    provider/service_provider.js
    
    const client = new provider(tateAPI);
    
    setInterval( ()=> {
	    debug('try to update db.. ')
	    client.updateDb(appAPI);
	    if(! client.hasResponsOK){
		    client.updateDb(appAPI);
	    }else{
		    debug('Db updated!')
	    }
    }, time)

Per ogni record CSV ricevuto ne viene ritornato un equivalente in JSON tramite le interfacce della libreria [csvtojson](https://www.npmjs.com/package/csvtojson).  L'oggetto è uno stream che emette un evento per ogni JSON restituito , gestendo i dati in ingresso in modo asincrono ed indipendente dalla quantità; rendendo il parsing dei dati discretamente efficiente.

    provider/provider.js
    
    const csv = require('csvtojson')
    
    request.get(..url)
    .pipe(
	    csv({output:  'json', delimiter:';'})
	    
	    // When 'data' event is emitted a single csv line is parsed in json.
	    
	    .on('data', (jsonBuffer) => {
	    
		    // send json buffer, line by line.
		    
		    var  json  =  this._keysInCamelCase(jsonBuffer);
		    this._http_post(json);
	    })

    

Una volta ottenuti i dati in JSON ne vengono modificate le chiavi di cui è composto: dove, tramite espressioni regolari, viene riscontrato il pattern snake_case del CSV e trasformato in camelCase nella funzione _keysInCamelCase():
   
    Object.keys(index).forEach(key  => {
	    var  lowerKey = key.toLowerCase();
	    
	    let  newKey = lowerKey.replace(/(\_\w)/g, (m) =>  m[1].toUpperCase());
	    
	    if (newKey  !=  key){
		    index[newKey] =  index[key];
		    delete  index[key];
	    }
    }

## APP

### Esempio POST:
http://tate-backend-challenge.herokuapp.com/api/customer

### Esempio GET:
http://tate-backend-challenge.herokuapp.com/api/customer?filter=chiave&value=valore&size=number&sort=desc

L' API si basa su [Express](https://expressjs.com/it/) per esporre interfacce HTTP.



### Querying:
L' url si compone di parametri opzionali, i quali, una volta verificati in input, vengono utilizzare per effettuare le query sul database mediante le interfacce messe a disposizione dalla libreria [mongoose.js](https://mongoosejs.com/).

    const customer  =  require('../models/customer');
    
    customer.find().where(request.query.filter).equals( checkFilterValue(request.query.value) )


### Caching:

L' App si avvale di una cache per memorizzare i valori richiesti, inizialmente non presenti in memoria, per fornire tempi di risposta più rapidi una volta richiamata.

    routes/api.js
    
    const cache  =  redis.createClient(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
    
    cache.get(request.originalUrl, (error, cacheValue) => {
	    if(error) throw(error);
	    if(cacheValue){
		    response.send( JSON.parse(cacheValue) );
		    debug('Data received from cache!');
	    }else{
	    database.find().then( (docs) =>{
		    res.send(docs);

Effettuata una chiamata GET all'API, se il dato richiesto non è presente all'interno della cache, viene interrogato il database; se e solo se la query specificata nell'url genera un risultato, quest'ultimo viene restituito al chiamante dell'API per poi essere allocato nella cache insieme ad una relativa chiave rappresentata dalla query stessa. 

*Chiave*: /api/customer?filter=chiave&value=valore&size=number&sort=asc
*Valore*: entità restituite dal database.

Il dato all'interno della cache ha una durata di persistenza definita in fase di allocazione tramite le interfacce della libreria [redis](https://www.npmjs.com/package/redis).

    // esempio: request.originalUrl = /api/customer?filter=canoneRai&value=SI&size=3 
    // esempio: const TIME_PERSISTANCE = 6 ore.
     
    cache.set(request.originalUrl, JSON.stringify(docs), 'EX', TIME_PERSISTENCE , (error) => {
	    if(error) throw error;
    })





