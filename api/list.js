const router = require('express').Router();
const request = require('request');

router.get('/', (req, res) => {
    try {
        const options = {
            method: 'GET',
            url: 'http://127.0.0.1:5000/api/list'
        }
        console.log('Querying for anycast transactions. No params.');
        request(options, (error, response, body) => {
            try {
                if (error) {
                    console.log(error);
                    throw new Error('Cannot connect to smart Servers. Please checkout connection.');
                }
                if (typeof (body) === 'string' && body[0] === '<') {
                    throw new Error('smart server error!');
                }
                if (typeof (JSON.parse(body)) != 'object') {
                    console.log(typeof (JSON.parse(body)));
                    console.log(JSON.parse(body));
                    throw new Error('Cannot get valid results from smart Servers!');
                }
                console.log('blockchain response: ');
                const result = JSON.parse(body);
                result.forEach((r, i) => {
                    console.log('record ' + i + ':');
                    console.log({
                        id: r.id,
                        owner: r.owner,
                        hash: r.hash,
                        quantity:r.quantity//here
                    });
                })
                res.send({
                    status: 200,
                    message: 'Successfully get the list!',
                    data: body
                })
            } catch (e) {
                console.log(e);
                res.send({
                    status: 500,
                    message: e.message
                })
            }
        })
    } catch(e) {
        console.log(e);
        res.send({
            status: 500,
            message: 'Can\'t execute opreations. Something unexpected happend.'
        })
    }

});

module.exports = router;
