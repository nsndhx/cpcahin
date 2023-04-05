const router = require('express').Router();
const request = require('request');
const Config = require('../config/basic');

const { Api, JsonRpc, RpcError, Numeric } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');      // development only
const fetch = require('node-fetch');                                    // node only; not needed in browsers
const { TextEncoder, TextDecoder } = require('util');                   // node only; native TextEncoder/Decoder
//const { TextEncoder, TextDecoder } = require('text-encoding');          // React Native, IE11, and Edge Browsers only

const privateKeys = Config.privateKeyList;

const signatureProvider = new JsSignatureProvider(privateKeys);
const rpc = new JsonRpc('http://127.0.0.1:8899', { fetch });
const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

router.post('/', (req, res) => {
    const msg = {
    }
    try {

        if (Config.userName === 'null') {
            console.log('no cookies for username!');
            res.send({
                status: 304,
                message: 'User has not signed in.'
            })
        }

        const options = {
            method: 'POST',
            url: 'http://127.0.0.1:5000/api/query',
            header: {'Content-type': 'applications/json'},
            body: JSON.stringify({name: Config.userName})
        }
        console.log('Querying for private transaction logs. Params username = ' + Config.userName);
        request(options, (error, response, body) => {
            try {
                if (error) {
                    console.log(error);
                    throw new Error('Cannot connect to smart server!');
                }
                if (typeof (body) === 'string' && body[0] === '<') {
                    throw new Error('smart server error!');
                }
                const result = JSON.parse(body);
                console.log(Config.userName + '\'s transaction record: ')
                result.forEach((r, i) => {
                    console.log("the " + i + "th record:");
                    console.log({
                        id: r.id,
                        hash: r.hash,
                        quantity:r.quantity//here
                    })
                });

                res.send({
                    status: 200,
                    message: 'successfully got the user\'s tranaction list.',
                    data: body
                });
                return;
            } catch (e) {
                console.log(e);
                res.send({
                    status: 200,
                    message: e.message
                });
                return;
            }
        })
    } catch (e) {
        console.log(e);
        res.send({
            status: 500,
            message: 'Cannot Excecute operations. Something went wrong.'
        })
    }
})

module.exports = router
