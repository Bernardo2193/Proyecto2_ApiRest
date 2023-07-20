/* eslint-disable max-lines-per-function */
/* eslint-disable max-statements */
/* eslint-disable function-call-argument-newline */
/* eslint-disable max-lines */
/* eslint-disable array-bracket-newline */
/* eslint-disable eqeqeq */
/* eslint-disable quotes */
/* eslint-disable no-undefined */
/* eslint-disable max-len */
/* eslint-disable require-await */
/* eslint-disable no-shadow */

const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const testCase = { passed: 0, failed: 0 };

function isEqual(params) {
    const text = `\t\u001B[36m${params.subTitle}\u001B[37m: `;
    if (params.result === true) {
        testCase.passed++;
        console.log(`${text}\u001B[32mPASS\u001B[37m`);
    } else {
        testCase.failed++;
        console.log(`${text}\u001B[31mFAILED\u001B[37m`);
    }
}

async function readFile(path) {
    return new Promise((resolve) => {
        fs.readFile(path, 'utf8', (error, content) => {
            if (content) resolve(content.split('\n'));
            else resolve([]);
        });
    });
}

function testEnv() {
    console.log(`TEST N°1.1: Éxito - Variables de entorno (.env)`);
    isEqual({ subTitle: `La variable "SERVER_HOST" debe estar declarada`, result: process.env.SERVER_HOST !== undefined });
    isEqual({ subTitle: `El valor de "SERVER_HOST" debe ser "127.0.0.1"`, result: process.env.SERVER_HOST === '127.0.0.1' });
    isEqual({ subTitle: `La variable "SERVER_PORT" debe estar declarada`, result: process.env.SERVER_PORT !== undefined });
    isEqual({ subTitle: `El valor de "SERVER_PORT" debe ser "3005"`, result: process.env.SERVER_PORT === '3005' });
    isEqual({ subTitle: `La variable "DATABASE_URL" debe estar declarada`, result: process.env.DATABASE_URL !== undefined });
    isEqual({ subTitle: `El valor de "DATABASE_URL" no debe estar vacío`, result: process.env.DATABASE_URL && process.env.DATABASE_URL !== '' });
    isEqual({ subTitle: `La variable "DATABASE_NAME" debe estar declarada`, result: process.env.DATABASE_NAME !== undefined });
    isEqual({ subTitle: `El valor de "DATABASE_NAME" debe ser "muebleria"`, result: process.env.DATABASE_NAME === 'muebleria' });
}

async function testEnvDist() {
    console.log(`TEST N°1.2: Éxito - Variables de entorno (.env.dist)`);
    let data = await readFile(path.join(__dirname, '../.env.dist'));
    data = data.length > 0 ? data.map((element) => element.split('=')) : [];

    const SERVER_HOST = data.find((item) => item[0] === 'SERVER_HOST');
    const SERVER_PORT = data.find((item) => item[0] === 'SERVER_PORT');
    const DATABASE_URL = data.find((item) => item[0] === 'DATABASE_URL');
    const DATABASE_NAME = data.find((item) => item[0] === 'DATABASE_NAME');

    isEqual({ subTitle: `La variable "SERVER_HOST" debe estar declarada`, result: SERVER_HOST !== undefined });
    isEqual({ subTitle: `El valor de "SERVER_HOST" debe ser "127.0.0.1"`, result: (SERVER_HOST && SERVER_HOST[1].trim() === '127.0.0.1') });
    isEqual({ subTitle: `La variable "SERVER_PORT" debe estar declarada`, result: SERVER_PORT !== undefined });
    isEqual({ subTitle: `El valor de "SERVER_PORT" debe ser "3005"`, result: (SERVER_PORT && SERVER_PORT[1].trim() === '3005') });
    isEqual({ subTitle: `La variable "DATABASE_URL" debe estar declarada`, result: DATABASE_URL !== undefined });
    isEqual({ subTitle: `El valor de "DATABASE_URL" debe ser "tu-cadena-de-conexion"`, result: (DATABASE_URL && DATABASE_URL[1].trim() === 'tu-cadena-de-conexion') });
    isEqual({ subTitle: `La variable "DATABASE_NAME" debe estar declarada`, result: DATABASE_NAME !== undefined });
    isEqual({ subTitle: `El valor de "DATABASE_NAME" debe ser "muebleria"`, result: (DATABASE_NAME && DATABASE_NAME[1].trim() === 'muebleria') });
}

async function testGitIgnore() {
    console.log(`TEST N°1.3: Éxito - Archivo .gitignore`);
    let data = await readFile(path.join(__dirname, '../.gitignore'));

    data = data.length > 0 ? data : [];
    const NODE_MODULES = data.find((item) => item.trim() === 'node_modules/');
    const ENV = data.find((item) => item.trim() === '.env');

    isEqual({ subTitle: `El directorio "node_modules/" debe estar declarado`, result: NODE_MODULES.trim() === 'node_modules/' });
    isEqual({ subTitle: `El archivo ".env" debe estar declarado`, result: (ENV.trim() === '.env') });
}

async function testFileConnectionDB() {
    console.log(`TEST N°1.4: Éxito - Archivo connection_db.js`);
    let data = await readFile(path.join(__dirname, '../connection_db.js'));

    isEqual({ subTitle: `El archivo "connection_db.js" debe existir`, result: (data.length > 0) });
}

async function testMethodGET(describe, uri, callBackHTTP, callBacks) {
    console.log(`\n${describe}`);
    await fetch(uri)
        .then((response) => {
            isEqual(callBackHTTP(response));
            return response.json();
        })
        .then((data) => {
            if (Array.isArray(data?.payload)) {
                const muebles = data.payload;
                callBacks.forEach((callBack) => {
                    isEqual(callBack(muebles));
                });
            } else {
                callBacks.forEach((callBack) => {
                    isEqual(callBack(data));
                });
            }
        })
        .catch((error) => console.log(error.message));
}

async function testMethodPUT(describe, uri, body, callBackHTTP, callBacks) {
    console.log(`\n${describe}`);
    await fetch(uri, { method: 'PUT', body: JSON.stringify(body), headers: { "Content-type": "application/json; charset=UTF-8" } })
        .then((response) => {
            isEqual(callBackHTTP(response));
            return response.json();
        })
        .then((data) => {
            callBacks.forEach((callBack) => {
                isEqual(callBack(data));
            });
        })
        .catch((error) => console.log(error.message));
}

async function testMethodPOST(describe, uri, body, callBackHTTP, callBacks) {
    console.log(`\n${describe}`);
    await fetch(uri, { method: 'POST', body: JSON.stringify(body), headers: { "Content-type": "application/json; charset=UTF-8" } })
        .then((response) => {
            isEqual(callBackHTTP(response));
            return response.json();
        })
        .then((data) => {
            callBacks.forEach((callBack) => {
                isEqual(callBack(data));
            });
        })
        .catch((error) => console.log(error.message));
}

async function testMethodDELETE(describe, uri, callBackHTTP, callBacks) {
    console.log(`\n${describe}`);
    await fetch(uri, { method: 'DELETE' })
        .then((response) => {
            isEqual(callBackHTTP(response));
            return response.json();
        })
        .then((data) => {
            callBacks.forEach((callBack) => {
                isEqual(callBack(data));
            });
        })
        .catch((error) => console.log(error.message));
}

async function run() {
    testEnv();

    await testEnvDist();

    await testGitIgnore();

    await testFileConnectionDB();

    await testMethodPOST(
        'TEST N°2.1: Éxito - Método POST',
        'http://127.0.0.1:3005/api/v1/muebles',
        {
            nombre: 'Biblioteca de madera deluxe',
            precio: 1250.55,
            categoria: 'Oficina',
            color: "Blanco"
        },
        (response) => ({ subTitle: `El código HTTP debe ser 201`, result: response.status === 201 }),
        [
            (data) => ({
                subTitle: `El message del método POST debe ser "Registro creado"`,
                result: (data && data.message === 'Registro creado')
            }),
            (data) => ({
                subTitle: `Deben existir los datos del registro con código 16,\n\t   nombre "Biblioteca de madera deluxe", precio 1250.55 y categoría "Comedor"`,
                result: (data && data.payload
                    && data.payload.codigo === 16
                    && data.payload.nombre === 'Biblioteca de madera deluxe'
                    && data.payload.precio === 1250.55
                    && data.payload.categoria == 'Oficina')
            }),
            (data) => ({
                subTitle: `No debe existir la propiedad color en el registro con código 16`,
                result: (data && data.payload && data.payload.color === undefined)
            })
        ]
    );

    await testMethodPOST(
        'TEST N°2.2: Fracaso - Método POST',
        'http://127.0.0.1:3005/api/v1/muebles',
        { nombre: null, precio: null, categoria: null },
        (response) => ({ subTitle: `El código HTTP debe ser 400`, result: response.status === 400 }),
        [(data) => ({
            subTitle: `El message del método POST debe ser "Faltan datos relevantes"`,
            result: (data && data.message === 'Faltan datos relevantes')
        })]
    );

    await testMethodPUT(
        'TEST N°3.1: Éxito - Método PUT',
        'http://127.0.0.1:3005/api/v1/muebles/16',
        {
            nombre: 'Modular metálico deluxe',
            precio: 999.75,
            categoria: 'Oficina',
            color: 'Blanco'
        },
        (response) => ({ subTitle: `El código HTTP debe ser 200`, result: response.status === 200 }),
        [
            (data) => ({
                subTitle: `El message del método PUT debe ser "Registro actualizado"`,
                result: (data && data.message === 'Registro actualizado')
            }),
            (data) => ({
                subTitle: `Deben existir los datos del registro con código 16,\n\t   nombre "Modular metálico deluxe", precio 999.75 y categoría "Oficina"`,
                result: (data && data.payload
                    && data.payload.codigo == 16
                    && data.payload.nombre === 'Modular metálico deluxe'
                    && data.payload.precio == 999.75
                    && data.payload.categoria === 'Oficina')
            }),
            (data) => ({
                subTitle: `No debe existir la propiedad color en el registro con código 16`,
                result: (data && data.payload && data.payload.color === undefined)
            })
        ]
    );

    await testMethodPUT(
        'TEST N°3.2: Fracaso - Método PUT',
        'http://127.0.0.1:3005/api/v1/muebles/25',
        { nombre: 'x', precio: 1, categoria: 'x' },
        (response) => ({ subTitle: `El código HTTP debe ser 400`, result: response.status === 400 }),
        [(data) => ({
            subTitle: `El message del método PUT debe ser\n\t   "El código no corresponde a un mueble registrado"`,
            result: (data && data.message === 'El código no corresponde a un mueble registrado')
        })]
    );

    await testMethodPUT(
        'TEST N°3.3: Fracaso - Método PUT',
        'http://127.0.0.1:3005/api/v1/muebles/16',
        { nombre: null, precio: null, categoria: null },
        (response) => ({ subTitle: `El código HTTP debe ser 400`, result: response.status === 400 }),
        [(data) => ({
            subTitle: `El message del método PUT debe ser "Faltan datos relevantes"`,
            result: (data && data.message === 'Faltan datos relevantes')
        })]
    );

    await testMethodDELETE(
        'TEST N°4.1: Éxito - Método DELETE',
        'http://127.0.0.1:3005/api/v1/muebles/16',
        (response) => ({ subTitle: `El código HTTP debe ser 200`, result: response.status === 200 }),
        [
            (data) => ({
                subTitle: `El message del método DELETE debe ser "Registro eliminado"`,
                result: (data && data.message === 'Registro eliminado')
            })
        ]
    );

    await testMethodDELETE(
        'TEST N°4.2: Fracaso - Método DELETE',
        'http://127.0.0.1:3005/api/v1/muebles/25',
        (response) => ({ subTitle: `El código HTTP debe ser 400`, result: response.status === 400 }),
        [(data) => ({
            subTitle: `El message del método DELETE debe ser\n\t   "El código no corresponde a un mueble registrado"`,
            result: (data && data.message === 'El código no corresponde a un mueble registrado')
        })]
    );

    await testMethodGET(
        'TEST N°5.1: Éxito - Método GET múltiple',
        'http://127.0.0.1:3005/api/v1/muebles',
        (response) => ({ subTitle: `El código HTTP debe ser 200`, result: response.status === 200 }),
        [(muebles) => ({
            subTitle: `La cantidad de muebles debe ser 15`,
            result: muebles.length === 15
        })]
    );

    await testMethodGET(
        'TEST N°5.2: Éxito - Método GET múltiple filtrado y ordenado ascendentemente por categoría "Comedor"',
        'http://127.0.0.1:3005/api/v1/muebles?categoria=Comedor',
        (response) => ({ subTitle: `El código HTTP debe ser 200`, result: response.status === 200 }),
        [
            (muebles) => ({ subTitle: `La cantidad de muebles debe ser 3`, result: muebles.length === 3 }),
            (muebles) => ({
                subTitle: `El orden de códigos debe ser 9, 4 y 6`,
                result: (muebles.map((mueble) => mueble.codigo)).join() === [9, 4, 6].join()
            })
        ]
    );

    await testMethodGET(
        'TEST N°5.3: Sin Resultados - Método GET múltiple filtrado y ordenado ascendentemente por una categoría inexistente "Cocina"',
        'http://127.0.0.1:3005/api/v1/muebles?categoria=Cocina',
        (response) => ({ subTitle: `El código HTTP debe ser 200`, result: response.status === 200 }),
        [(muebles) => ({
            subTitle: `La cantidad de muebles debe ser 0`,
            result: muebles.length === 0
        })]
    );

    await testMethodGET(
        'TEST N°5.4: Éxito - Método GET múltiple filtrado por precio mayor o igual que "799.99" y ordenado por precio ascendentemente',
        'http://127.0.0.1:3005/api/v1/muebles?precio_gte=799.99',
        (response) => ({ subTitle: `El código HTTP debe ser 200`, result: response.status === 200 }),
        [
            (muebles) => ({ subTitle: `La cantidad de muebles debe ser 3`, result: muebles.length === 3 }),
            (muebles) => ({
                subTitle: `El orden de códigos debe ser 3, 8 y 13`,
                result: (muebles.map((mueble) => mueble.codigo)).join() === [3, 8, 13].join()
            })
        ]
    );

    await testMethodGET(
        'TEST N°5.5: Sin Resultados - Método GET múltiple filtrado por precio mayor o igual que "1200.00" y ordenado por precio ascendentemente',
        'http://127.0.0.1:3005/api/v1/muebles?precio_gte=1200',
        (response) => ({ subTitle: `El código HTTP debe ser 200`, result: response.status === 200 }),
        [(muebles) => ({
            subTitle: `La cantidad de muebles debe ser 0`,
            result: muebles.length === 0
        })]
    );

    await testMethodGET(
        'TEST N°5.6: Éxito - Método GET múltiple filtrado por precio menor o igual que "200.00" y ordenado por precio descendentemente',
        'http://127.0.0.1:3005/api/v1/muebles?precio_lte=200.00',
        (response) => ({ subTitle: `El código HTTP debe ser 200`, result: response.status === 200 }),
        [
            (muebles) => ({ subTitle: `La cantidad de muebles debe ser 4`, result: muebles.length === 4 }),
            (muebles) => ({
                subTitle: `El orden de códigos debe ser 5, 1, 14 y 6`,
                result: (muebles.map((mueble) => mueble.codigo)).join() === [5, 1, 14, 6].join()
            })
        ]
    );

    await testMethodGET(
        'TEST N°5.7: Sin Resultados - Método GET múltiple filtrado por precio menor o igual que "79.98" y ordenado por precio descendentemente',
        'http://127.0.0.1:3005/api/v1/muebles?precio_lte=79.98',
        (response) => ({ subTitle: `El código HTTP debe ser 200`, result: response.status === 200 }),
        [(muebles) => ({
            subTitle: `La cantidad de muebles debe ser 0`,
            result: muebles.length === 0
        })]
    );

    await testMethodGET(
        'TEST N°6.1: Éxito - Método GET específico filtrado por el código "6"',
        'http://127.0.0.1:3005/api/v1/muebles/6',
        (response) => ({ subTitle: `El código HTTP debe ser 200`, result: response.status === 200 }),
        [(data) => ({
            subTitle: `El mueble debe ser un objeto`,
            result: (data && data.payload
                && data.payload.codigo == 6
                && data.payload.nombre === 'Silla de comedor metálica'
                && data.payload.precio == 79.99
                && data.payload.categoria === 'Comedor')
        })]
    );

    await testMethodGET(
        'TEST N°6.2: Fracaso - Método GET específico filtrado por un código inxesistente "22"',
        'http://127.0.0.1:3005/api/v1/muebles/22',
        (response) => ({ subTitle: `El código HTTP debe ser 400`, result: response.status === 400 }),
        [(data) => ({
            subTitle: `El mensaje debe ser\n\t   "El código no corresponde a un mueble registrado"`,
            result: (data && data.message
                && data.message === `El código no corresponde a un mueble registrado`)
        })]
    );

    console.log('\nSUMMARY');
    console.log(`\t\u001B[32mTEST CASES PASSED: ${testCase.passed}\u001B[37m`);
    console.log(`\t\u001B[31mTEST CASES FAILED: ${testCase.failed}\u001B[37m`);
}

run();