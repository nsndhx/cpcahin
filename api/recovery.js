const router = require('express').Router();
const request = require('request');
const Config = require('../config/basic');
//const Error = require('error');

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
        id: req.body.id,
        base: req.body.base
    }
    try {
        msg.base = encodeURIComponent(msg.base);
        const options = {
            method: 'POST',
            url: 'http://127.0.0.1:5000/api/hash',
            header: {'Content-type' : 'application/json'},
            body: JSON.stringify({base: msg.base})
        }
        const picInfo = {}
        const accountInfo = {}
        if (Config.userName === null || Config.walletKey === null) {
            console.log('User has not login. Refused to serve.');
            res.send({
                status: 403,
                message: 'Please sign in before any other operations.'
            });
            return;
        }

        return new Promise((resolve, reject) => {
            console.log('Fetching informations of the picture. Params=BASE64(picture)');
            request(options, (error, response, body) => {
                if (error) {
                    console.log(error);
                    reject('Cannot get the hash value of picture');
                    return;
                    //throw new Error('Cannot get the hash value of picture');
                }
                console.log('backend response: ');
                console.log(body);
                if (typeof(body) === 'string' && body[0] === '<'){
                    reject('smart server error!');
                    return;
                }
                picInfo.hash = JSON.parse(body).hash;
                resolve();
            })
        }).then(() => {
            return new Promise( (resolve, reject) => {
                options.url = 'http://127.0.0.1:5000/api/check'
                options.body = JSON.stringify({
                    id: msg.id,
                    base: msg.base
                })
                console.log('Checking if the picuture is edited. Param id = ' + msg.id);
                request(options, (error, response, body) => {
                    if (error) {
                        console.log(error);
                        reject('Cannot detect whether the picture is edited!');
                        return;
                    }
                    console.log('backend response 2:');
                    console.log(body);
                    if (typeof(body) === 'string' && body[0] === '<'){
                        reject('smart server error!');
                        return;
                    }
                    resolve(JSON.parse(body).result);
                })
            });
        }).then((value) => {
            if (value === 1) {
                // no change
                res.send({
                    status: 304,
                    message: 'The picture is not violating copyright.'
                });
                return;
            } else if (value === 0) {
                options.url = 'http://127.0.0.1:5000/api/recovery';
                options.body = JSON.stringify({
                    tested: msg.base
                })
                console.log('Trying to recover the picture.');
                request(options, (error, response, body) => {
                    try {
                        if (error) {
                            console.log(error);
                            throw new Error('Cannot connect to smart server.');
                        }
                        console.log('backend response 3 :');
                        console.log(body);
                        if (typeof (body) === 'string' && body[0] === '<') {
                            throw new Error('smart server Errors!');
                        }
                        if (JSON.parse(body).base64) {
                            res.send({
                                status: 201,
                                message: 'successfully recovered the picture.',
                                data: {
                                    base64: JSON.parse(body).base64
                                }
                            });
                            return;
                        } else {
                            res.send({
                                status: 205,
                                message: 'Cannot operate recovery. Something went wrong.'
                            })
                        }
                    } catch(e) {
                        console.log(e);
                        res.send({
                            status: 500,
                            message: e.message
                        })
                    }
                })
            } else {
                console.log('Unexpected return value');
                res.send({
                    status: 500,
                    message: 'Cannot understand backend\'s reply.'
                })
            }
        }).catch(error => {
            res.send({
                status: 500,
                message: error
            });
            return;
        })

        /*
        return new Promise((resolve, reject) => {
            request(options, (error, response, body) => {
                if (error) {
                    console.log(error);
                    throw new Error('Cannot get the hash value of picture');
                }
                console.log(body);
                picInfo.hash = JSON.parse(body).hash;
                resolve();
            })
        }).then(() => {
            options.url = 'http://127.0.0.1:6666/v1/wallet/list_keys';
            options.body = JSON.stringify([Config.userName, Config.walletKey]);
            return new Promise((resolve, reject) => {
                request(options, (error, response, body) => {
                    if (error) {
                        console.log(error);
                        throw new Error('Cannot get account keys from wallet!');
                    }
                    accountInfo.publicKey = JSON.parse(body)[0][0];
                    accountInfo.privateKey = JSON.parse(body)[0][1];
                    resolve();
                })
            })
        }).then(() => {
            return new Api({
                rpc,
                signatureProvider: new JsSignatureProvider([accountInfo.privateKey]),
                textDecoder:  new TextDecoder(),
                textEncoder: new TextEncoder()
            }).transact({
                actions:[{
                    account: 'admin',
                    name: 'cpcheck',
                    authorization: [{
                        actor: Config.userName,
                        permission: 'active'
                    }],
                    data: {
                        hash: picInfo.hash
                    }
                }]
            }, {
                blocksBehind: 3,
                expireSeconds: 30,
            });
        }).catch((value) => {
            console.log(value);
            console.log(value.json.error.details);
            console.log('------------------------------');
            if (value.json.error.details[0].message === "assertion failure with message: copyright exist. ") {
                options.method = 'POST';
                options.url = 'http://127.0.0.1:5000/api/recovery';
                options.body = JSON.stringify({
                    id: msg.id,
                    base: msg.base
                })
                request(options, (error, response, body) => {
                    if (error) {
                        console.log(error);
                        throw new Error('Cannot operate recovery. Something went wrong.');
                    }
                    const ret = JSON.parse(body).base64;
                    if (typeof(ret) === 'undefined') {

                    }
                    res.send({
                        status: 200,
                        message: 'successfully recovered the image!',
                        data: JSON.stringify({
                            base64: ret
                        })
                    }).end();
                })
            } else {
                // todo: check the value, and excecute operations when the copyright has conflicts.
                console.log(value);
                throw new Error('can\'t understand the chain\'s return value.');
            }
            return 
        }).then(() => {
            res.send({
                status: 304,
                message: 'the picture is not violating the copyright.'
            }).end();
            return
        })
        */
    } catch(e) {
        console.log(e);
        res.send({
            status: 500,
            msg:'Can\'t execute opreations. Something unexpected happend.'
        })
    }
})

module.exports = router
