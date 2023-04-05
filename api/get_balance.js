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
    try{
        const msg = {
            username:Config.userName
        }

        if (Config.userName === 'null') {
            console.log('no cookies for username!');
            res.send({
                status: 304,
                message: 'User has not signed in.'
            })
        }

        const options = {
            method: 'POST',
            url: 'http://127.0.0.1:8899/v1/chain/get_currency_balance',
            header: {'Content-type' : 'application/json'},
            body: JSON.stringify({name: Config.userName})
        }

        console.log('Querying for account balance logs. Params username = ' + Config.userName);

        request(options, (error, response, body) => {
            if (error) {
                reject(error);
                return;
            }
            msg.balance = body;
        });

        res.send({
            status: 200,
            message: 'successfully got the user\'s account balance.',
            data: msg
        });
        return;

    }catch(e) {
        console.log(e);
        res.send({
            status: 500,
            msg:'Can\'t execute opreations. Something unexpected happend.'
        })
    }
})
module.exports = router