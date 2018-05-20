var http = require('http');
var Router = require('routes');
var url = require('url')

var SmartGuess = require('./smart-guess.js');

var router = new Router();

router.addRoute('/bet', bet);
router.addRoute('/checkWinner', checkWinner);
router.addRoute('/latestBlock', latestBlock);
router.addRoute('/queryBalance', queryBalance);

if (global.web3 == undefined) {
    SmartGuess.initWeb3();
}

function start() {
    function onRequest(request, response) {

        var path = url.parse(request.url).pathname;
        if (path == "/favicon.ico") {
            return;
        }
        console.log("Request for " + path + " received.");

        var match = router.match(path);

        if (match == undefined) {
            response.write('noting you getted ...');
            response.statusCode = 404;
            response.end();
            return;
        }

        match.fn(request, response, match);

    }

    http.createServer(onRequest).listen(8080);
}

// for '/checkWinner'
function checkWinner(req, res, match) {
    console.log('checkWinner ... ');
    res.write('you have call checkWinner');
    res.statusCode = 200;
    res.end();
}

// for '/bet'
function bet(req, res, match) {
    console.log('bet ... ');
    res.write('you have call bet');
    res.statusCode = 200;
    res.end();
}

function latestBlock(req, res, match) {

    if (global.web3 != undefined) {
        setInterval(function () {
            console.log('will query latest block ...');
            var last = web3.eth.blockNumber;
            console.log('latest block is ' + last);
            var block = web3.eth.getBlock(last);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write('<h3>当前最新区块信息</h3>');
            res.write('<ul>');
            res.write('<li>number : ' + block.number + "</li>");
            res.write('<li>miner : ' + block.miner + "</li>");
            res.write('<li>gasLimit : ' + block.gasLimit + "</li>");
            res.write('<li>hash : ' + block.hash + "</li>");
            res.write('<li>timestamp : ' + block.timestamp + "</li>");
            res.write('<li>transactions : ' + block.transactions + "</li>");
            res.write('<li>nonce : ' + block.nonce + "</li>");
            res.write('</ul>');
            res.statusCode = 200;
        }, 2000);

    } else {
        res.write('chain net has some error');
        res.statusCode = 500;
        res.end();
    }
}

function queryBalance(req, res, match) {
    if (global.web3 != undefined) {
        var web3 = global.web3;
        var accounts = web3.eth.accounts;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<h3>当前链账户余额信息</h3>');
        res.write('<table style=\'margin:10px, 100px\'>');
        accounts.forEach(account => {
            res.write('<tr>');
            res.write('<td>' + account + '<td>');
            res.write('<td>' + web3.fromWei(web3.eth.getBalance(account)) + '</td>');
            res.write('</tr>');
        });
        res.write('</table>');
        res.statusCode = 200;
        res.end();

    } else {
        res.write('chain net has some error');
        res.statusCode = 500;
        res.end();
    }
}

console.log('welcome to bc.paxunke.com , it\'s our blockchain fist app in game ');

exports.start = start;
