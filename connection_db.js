const { MongoClient } = require('mongodb');
const path = require('path');

// Se establece manualmente la ubicación del archivo .env
require('dotenv').config({ path: path.join(__dirname, '.env') });

const client = new MongoClient(process.env.DATABASE_URL);

async function connect() {
    let connection = null;
    console.log('Conectando...');

    try {
        connection = await client.connect();
        console.log('Conectado');
    } catch (error) {
        console.log(error.message);
    }

    return connection;
}

async function desconnect() {
    try {
        await client.connect();
        console.log('Desconectado');
    } catch (error) {
        console.log(error.message);
    }
}

async function connectToCollection(collectionName) {
    const connection = await connect();
    const db = connection.db(process.env.DATABASE_NAME);
    const collection = db.collection(collectionName);

    return collection;
}

async function generarCodigo(collection) {
    const ultimoCodigo = await collection.find().sort({ codigo : -1 }).limit(1).toArray();
    const nuevoCodigo = (ultimoCodigo[0]?.codigo ?? 0) + 1 ;

    return nuevoCodigo;
}

module.exports = { connect, connectToCollection, desconnect, generarCodigo};