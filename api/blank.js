const router = require('express').Router()

const { Api, JsonRpc, RpcError } = require('eosjs');
const numeric = require('eosjs/dist/eosjs-numeric');
const { signatureProvider } = require('eosjs/dist/eosjs-jssig');      // development only
const fetch = require('node-fetch');                                    // node only; not needed in browsers
const { TextEncoder, TextDecoder } = require('util');                   // node only; native TextEncoder/Decoder
//const { TextEncoder, TextDecoder } = require('text-encoding');          // React Native, IE11, and Edge Browsers only

const rpc = new JsonRpc('http://127.0.0.1:8899', { fetch });
const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
const request = require('request');
const inm = require('../config/blank');


router.get('/', (req, res) => {
    // res.send('this is a blank.'
    const a = 'as';
    const b = 'we can';
    console.log('henlo friend');
    try {
        request({url: 'http://127.0.0.1:3000/api/blank/foo/', method: 'POST', header: 'application/json', body: JSON.stringify([a, b])},
            (error, response, body) => {
                if (error) throw new Error(error);
                console.log(body);
            }
        );
    } catch(e) {
        console.log(e);
    }
})

router.post('/foo', (req, res) => {
    console.log('may i acuqire a bespo');
    console.log(req.body);
    //res.send('this is a blank.')
})

router.get('/inm', (req, res) => {
    let a = 1;
    a = a + 1;
    console.log('now a is ' + a);
    console.log('yjsnpi is' + inm.yjsnpi);
    inm.yjsnpi += 1;
    inm.akys = 26;
    console.log(inm);
    const cookie = require('../config/blank');
    console.log(cookie);
    res.send('ok');
})

router.get('/cookie', (req, res) => {
    let a = 1;
    a = a + 1;
    console.log('now a is ' + a);
    console.log('yjsnpi is' + inm.yjsnpi);
    inm.yjsnpi += 1;
    inm.akys = 26;
    console.log(inm);
    const cookie = require('../config/blank');
    console.log(cookie);
    res.send('ok');
})

router.post('/front', (req, res) => {
    //console.log(req);
    console.log(req.body);
    console.log('////')
    if (req.body.wtf != null) {
        console.log('-----------');
        console.log(req.body.wtf);
    }
    //res.addHeader( "Access-Control-Allow-Origin", "*" );
    console.log('************')
    //res.status(200).send('hello');
    res.status(200).send({
        status: 200,
        message: 'ok'
    });
})

router.get('/num', (req, res) => {
    const result = numeric.convertLegacyPublicKey("EOSSB");
    console.log(result);
    res.send(result);
})

router.post('/save', (req, res) => {
    console.log(req);
    const result = req.body.foo;
    //res.cookie('wtf', result);
    inm.wtf = result;
    res.send({
        status: 200,
        message: 'saved'
    });
})

router.get('/load', (req, res) => {
    if (inm.wtf === null || typeof(inm.wtf) === 'undefined') {
        console.log('No cookies!');
        res.send({
            status: 500,
            message: 'no'
        }).end();

    } else {
        console.log('my cookie:' + inm.wtf);
        res.send({
            status: 200,
            message: inm.wtf
        });
    }

})

router.post('/short', (req, res) => {
    if (!req.body.wtf) {
        console.log('route1');
        res.send({
            status: 200,
            message: 'qqqxx'
        }).end();
        return;
    }
    console.log('route2');
    res.send({
        status: 500,
        message: 'xxqqq'
    }).end();
    return;
})


router.post('/error', (req, res) => {
    try {
        return new Promise((res, rej) => {
            request({
                url: 'http://127.0.0.1:3001/inminminm',
                method: 'POST'
            }, (error, response, body) => {
                if (error) {
                    console.log('============');
                    console.log(error);
                    throw new Error('route1');
                }
                throw new Error('route2');
            })
        }).catch(value => {
            console.log(value);
            throw new Error('route3');
        })
    } catch (e) {
        console.log(e);
        console.log('++++++++++++++++++++++++++');
        res.send({
            status: 500,
            message: 'no'
        })
    }
})

router.get('/iter', (req, res) => {
    const params = {
        a: '1',
        b: '4',
        c: '114514',
        yjsnpi: '810',
        mur: '21',
    }
    const names = ['a', 'b', 'c', 'mur', 'yjsnpi'];
    names.forEach(r => {
        console.log('logging: ' + params[r]);
    })
})

router.post('/pic', (req, res) => {
    const a = req.body.base64[100];
    res.send({
        status: 300,
        message: a
    });
    return;
})

module.exports = router
