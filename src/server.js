const express = require('express');
const path = require('path');
const { connectToCollection, desconnect, generarCodigo } = require('../connection_db.js');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const server = express();

const messageNotFound = JSON.stringify({ message: 'El código no corresponde a un mueble registrado' });
const messageMissingData = JSON.stringify({ message: 'Faltan datos relevantes' });
const messageErrorServer = JSON.stringify({ message: 'Se produjo un error en el server' });

// Middlewares
server.use(express.json());
server.use(express.urlencoded({ extended: true }));


const ascendente = 1;

const descendente = -1;


// me resuelve los primeros 4 endpoints

server.get('/api/v1/muebles', async (req, res) => {
    const {categoria, precio_lte, precio_gte } = req.query;

    let muebles = [];

    try {
        const collection = await connectToCollection('muebles');


        if (categoria) muebles = await collection.find({categoria}).sort({nombre: ascendente}).toArray();
        else if (precio_gte) muebles = await collection.find({ precio: { $gte: Number(precio_gte) } }).sort({precio: ascendente}).toArray();
        else if (precio_lte) muebles = await collection.find({ precio: { $lte: Number(precio_lte) } }).sort({precio: descendente}).toArray();
        else muebles = await collection.find().toArray();

        res.status(200).send(JSON.stringify({ payload: muebles }));
    } catch (error) {
        console.log(error.message);
        res.status(500).send(messageErrorServer);
    } finally {
        await desconnect();
    }
});


// me trae un mueble en especifico por codigo
server.get('/api/v1/muebles/:codigo', async (req, res) => {
    const { codigo } = req.params;

    try {
        const collection = await connectToCollection('muebles');
        const mueble = await collection.findOne({ codigo: { $eq: Number(codigo) } });

        if (!mueble) return res.status(400).send(messageNotFound);

        res.status(200).send(JSON.stringify({ payload: mueble}));
    } catch (error) {
        console.log(error.message);
        res.status(500).send(messageErrorServer);
    } finally {
        await desconnect();
    }
});

server.post('/api/v1/muebles', async (req, res) => {
    const { nombre, precio, categoria } = req.body;

    if (!nombre && !precio && !categoria) return res.status(400).send(messageMissingData);

    try {
        const collection = await connectToCollection('muebles');
        const mueble = { codigo: await generarCodigo(collection), nombre, precio, categoria };

        await collection.insertOne(mueble);
        res.status(201).send(JSON.stringify({ message: 'Registro creado', payload: mueble }));
    } catch (error) {
        console.log(error.message);
        res.status(500).send(messageErrorServer);
    } finally {
        await desconnect();
    }
});

//  Me modifica un mueble

server.put('/api/v1/muebles/:codigo', async (req, res) => {
    const { codigo } = req.params;
    const { nombre, categoria, precio } = req.body;

    if (!nombre && !categoria && !precio) return res.status(400).send(messageMissingData);

    try {
        const collection = await connectToCollection('muebles');
        let mueble = await collection.findOne({ codigo: { $eq: Number(codigo) } });

        if (!mueble) return res.status(400).send(messageNotFound);

        if (nombre) mueble.nombre = nombre;
        if (categoria) mueble.categoria = categoria;
        if (precio) mueble.precio = precio;

        await collection.updateOne({ codigo: Number(codigo) }, { $set: mueble });
        res.status(200).send(JSON.stringify({ message: 'Registro actualizado', payload: { codigo, ...mueble} }));
    } catch (error) {
        console.log(error.message);
        res.status(500).send(messageErrorServer);
    } finally {
        await desconnect();
    }
});

//  Me elimina un mueble
server.delete('/api/v1/muebles/:codigo', async (req, res) => {
    const { codigo } = req.params;

    try {
        const collection = await connectToCollection('muebles');
        const mueble = await collection.findOne({ codigo: { $eq: Number(codigo) } });

        if (!mueble) return res.status(400).send(messageNotFound);

        await collection.deleteOne({ codigo: { $eq: Number(codigo) } });
        res.status(200).send(JSON.stringify({ message: 'Registro eliminado' }));
    } catch (error) {
        console.log(error.message);
        res.status(500).send(messageErrorServer);
    } finally {
        await desconnect();
    }
});


// Control de rutas inexistentes
server.use('*', (req, res) => {
    res.status(404).send(`<h1>Error 404</h1><h3>La URL indicada no existe en este servidor</h3>`);
});

// Método oyente de solicitudes
server.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, () => {
    console.log(`Ejecutandose en http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`);
});