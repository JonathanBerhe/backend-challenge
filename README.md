# Tate backend challenge

### CONTESTO:
Un API di un nostro partner ritorna dei dati in formato csv, i dati vengono aggiornati ogni notte.
L'url dell'API è: [GET] http://challenges.tate.cloud/back2018/CLIENTI
L'API potrebbe non essere sempre disponibile e ritornare randomicamente errori 500 o nessun contenuto.
I dati cambieranno ogni notte quindi va predisposto un sistema per archiviarli in modo da sfruttarli in futuro ed evitare che vadano persi.

### SPECIFICHE:
1. Una volta realizzato il sistema che archivia i tuoi dati, crea un'unica API che permetta di fruire questi dati in JSON. 
2. L'API deve disporre di alcuni parametri per poter filtrare o manipolare i dati e ritornare una collezione di entità. 
3. Ogni entità deve includere tutti i dati forniti dal partner, le chiavi devono essere rappresentate in camelCase (lowercase), i valori come stringhe.
    
    **Filtra i dati ritornando solo le righe in cui il campo indicato è uguale al valore fornito**
        filter=campo:query

    **Limita il numero di risultati tornati**
        size=number

    ** Ritorna la pagina richiesta di risultati (salta i primi page-1*size result) **
        page=number

    ** [Bonus] Ordina i dati in ordine crescente o decrescente (asc|desc) **
        sort=campo:order

5. Allega un file README in cui spieghi il perchè di certe scelte tecniche e gli step necessari per avviare e/o deployare il tuo codice.

### BONUS:
- Serverless? We like serverless
- L'API usa GraphQL
- Implementi un sistema di cache per velocizzare i tempi di risposta.
# SOLUZIONE

Vengono impiegati principalemente due servizi distinti:
1. Provider: Si occupa di richiamare l'API '', convertire il formato da CSV a JSON e storicizzarli su database NoSQL MongoDB.
### Stack:
- Nodejs
- Express
- Redis
- MongoDB
