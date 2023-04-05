const router = require('express').Router();
const request = require('request');

const Config = require('../config/basic');

const { Api, JsonRpc, RpcError, Numeric } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');      // development only
const fetch = require('node-fetch');                                    // node only; not needed in browsers
const { TextEncoder, TextDecoder } = require('util');                   // node only; native TextEncoder/Decoder
//const { TextEncoder, TextDecoder } = require('text-encoding');          // React Native, IE11, and Edge Browsers only


const rpc = new JsonRpc('http://127.0.0.1:8899', { fetch });

router.post('/', (req, res) => {
    const msg = {
        //sourceUser: req.from,
        //quantity: req.body.quantity,//here
        destUser: req.body.to,
        copyrightID: req.body.id
    };

    const options = {
        method: 'POST',
        url: 'http://127.0.0.1:8888/v1/wallet/list_keys',
        header: {'Content-type': 'application/json'}
    }
    let tranInfo = {};

    if (Config.userName === null || Config.walletKey === null) {
        res.send({
            status: 500,
            message: 'The user has not signed in. Please first signed in to unlock the wallet.'
        });
    }
    msg.sourceUser = Config.userName;
    options.body = JSON.stringify([msg.sourceUser, Config.walletKey]);
    console.log(Config.userName);
    console.log(Config.walletKey);
    
    try {
        return new Promise((resolve, reject) => {
            console.log('Fetching keys. Params: ');
            console.log(options.body);
            request(options, (error, response, body) => {
                if (error) {
                    console.log(error);
                    reject('Can\'t get the keys.Please checkout if you are signed in.')
                    return;
                }
                console.log('blockchain response: ');
                console.log(body);
                if (typeof(body) === 'string' && body[0] === '<'){
                    reject('smart server error!');
                    return;
                }
                tranInfo.publicKey = JSON.parse(body)[0][0];
                tranInfo.privateKey = JSON.parse(body)[0][1];
                resolve();
            })
        }).then(() => {
       /*     const act = {
                account: 'copyright',
                name: 'cptrans',
                authorization: [{
                    actor: msg.destUser,//
                    permission: 'active'
                }],
                data: {
                    from: msg.destUser, // here
                    to: msg.sourceUser,
                    id: msg.copyrightID
                }
            }
            console.log('Trying to excute copyright transmition. Params: ');
            console.log(JSON.stringify(act));
            return new Api({
                rpc,
                signatureProvider: new JsSignatureProvider([tranInfo.privateKey]),
                textEncoder: new TextEncoder(),
                textDecoder: new TextDecoder()
            }).transact({
                actions:[act]
            }, {
                blocksBehind: 3,
                expireSeconds: 30,
            });*/
        }).then((value) => {
            console.log('blockchain response 2:');
            console.log(value);
            console.log('---------------------------');
            // todo: check the return value. Value should be success/fail.

            options.url = 'http://127.0.0.1:5000/api/transaction';
            options.header = {'Content-type' : 'application/json; charset=utf-8'};
            options.body = JSON.stringify({
                id: msg.copyrightID,
                to: msg.sourceUser//msg.destUser //here
            })

            console.log('Saving transaction to database. Params: ');
            console.log(options.body);
            request(options, (error, response, body) => {
                try {
                    if (error) {
                        console.log(error);
                        throw new Error('Can\'t execute transactions on smart backends.');
                    }
                    console.log(body);
                    if (typeof (body) === 'string' && body[0] === '<') {
                        throw new Error('smart server error!');
                    }
                    const ret = JSON.parse(body);
                    if (ret.result == '1') {
                        res.send({
                            status: 200,
                            message: 'successfully transacted copyright.'
                        }).end();
                    } else if (ret.result == '0') {
                        res.send({
                            status: 400,
                            message: 'failed to transact copyright.Something went wrong.'
                        }).end();
                    } else {
                        console.log('unexpected end.');
                        throw new Error('Unhandled result value!');
                    }
                } catch (e) {
                    console.log(e);
                    res.send({
                        status: 500,
                        message: e.message
                    })
                }
            })


        })/*.then(() => { // here
            console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@');
            console.log('blockchain response 3:');
            
            const options = {
                method : 'POST',
                url : 'http://127.0.0.1:5000/api/quantity',
                header : { 'Content-type' : 'application/json'},
                body : JSON.stringify({id: msg.copyrightID})
            }
            request(options, (error, response, body) => {
                try {
                    if (error) {
                        console.log(error);
                        throw new Error('Can\'t execute quantity on smart backends.');
                    }
                    //const ret = JSON.parse(body);
                    msg.quantity = '0.0001 SYSBOL';//ret.result;
                } catch (e) {
                    console.log(e);
                    res.send({
                        status: 500,
                        message: e.message
                    })
                }
            })
       })*/.then(() => { // here
            console.log(msg.quantity);
            const act = {
                account: 'eosio.token',
                name: 'transfer',
                authorization: [{
                    actor: msg.sourceUser,
                    permission: 'active'
                }],
                data: {
                    from: msg.sourceUser, // here
                    to: msg.destUser,
                    quantity: '0.0001 SYSBOL',
                    memo: msg.copyrightID
                }
            }
            console.log('Trying to excute transmition token. Params: ');
            console.log(JSON.stringify(act));
            return new Api({
                rpc,
                signatureProvider: new JsSignatureProvider([tranInfo.privateKey]),
                textEncoder: new TextEncoder(),
                textDecoder: new TextDecoder()
            }).transact({
                actions:[act]
            }, {
                blocksBehind: 3,
                expireSeconds: 30,
            });


        }).catch(error => {
            console.log(error);
            res.send({
                status: 500,
                message: error
            })
        });
    } catch(e) {
        console.log('Exceptions: ');
        console.log(e);
        res.send({
            status: 500,
            message: 'Cannot deal operations. Exceptions happend.'
        })
    }
})

module.exports = router

