const contentType = require('../constants/contentType');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/weltou';
const clients = [{
    name: 'Weltou',
    clientId: '5a02e8121652c75396dd33ad',
    clientSecret: '5a02ea4e1652c75396dd33ae',
}];

let db;
let Clients;
const errorHandler = (e) => {
    console.error(e);
    process.exit(1);
};

(async () => {
    try {
        db = await MongoClient.connect(url);
        Clients = db.collection(contentType.CLIENT);
    } catch (e) {
        errorHandler(e);
    }
    try {
        await Clients.remove();
    } catch (e) {
        errorHandler(e);
    }
    try {
        await Clients.insert(clients);
        console.log('Clients were successfully created');
    } catch (e) {
        errorHandler(e);
    }
})();
