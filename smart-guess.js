var gc = require('./gconfig.js');

const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');

const env = "stg";

var web3;

function initWeb3() {
    // var web3 = new Web3(new Web3.providers.HttpProvider('http://47.106.130.147:7755'));
    if(web3 == undefined) {
        web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7755'));
        if(web3.isConnected()) {
            console.log('connected ' + web3);
            global.web3 = web3;
        } else{
            console.log("not connected ...");
        }
    }
}

// if (!web3.isConnected()) {

//     console.log("unable to connect to smart-guess net");
// } else {

//     compileContract('./contract/SmartGuess.sol', 'SmartGuess');

//     console.log('bytecode : ' + global.bytecode);

//     console.log('abi : ' + JSON.stringify(global.abi, undefined, 2));

//     var account = gc.MainAccount(env);
//     console.log(JSON.stringify(account, undefined, 2));

//     unLockAccount(account.address, account.pwd);

//     deployContract();

// }

/**
 * 这里的utf-8一定要带，否则编译回报错（no intput source）
 */
function compileContract(path, contractName) {
    let source = fs.readFileSync('./contract/SmartGuess.sol', 'utf-8');

    console.log('compiling contract ...');

    let compiledContract = solc.compile(source);

    console.log('done');

    global.bytecode = compiledContract.contracts[':' + contractName].bytecode;
    global.abi = JSON.parse(compiledContract.contracts[':' + contractName].interface);

}

// 打印 coinbase 余额
function printCoinBaseBalance() {
    let coinbase = web3.eth.coinbase;
    let balance = web3.eth.getBalance(coinbase);
    console.log("balance: " + web3.fromWei(balance, "ether") + "ETH");

    res.statusCode = 200;
    res.msg = "balance: " + web3.fromWei(balance, "ether") + "ETH";
    res.end();
}

// 解锁账户
function unLockAccount(address, pwd) {
    console.log("will unlock " + address + "\t" + pwd);

    var unlock = web3.personal.unlockAccount(address, pwd);
    if (unlock) {
        console.log(account.address + "\t has unlocked ");
    } else {
        console.log(account.address + "\t unlocked failed ");
    }
    return unlock;
}

// deploy 

function deployContract() {
    let estimateGas = web3.eth.estimateGas({data:'0x' + global.bytecode});

    console.log('gas : ' + estimateGas);

    let SmartGuess = web3.eth.contract(global.abi);

    console.log('deploying contract... ');

    let SmartGuessInstance = SmartGuess.new([1000, 100], {
        from:account.address,
        data:'0x' + bytecode,
        gas:estimateGas
    }, function(err, _contract) {
        if(!err) {
            if(!_contract.address) {

                console.log('SmartGuess.transactionHash = '+ _contract.transactionHash);
            } else{

                console.log('SmartGuess.address = '+ _contract.address);
                global.SmartGuess_address = SmartGuess.address;

            }
        } else {
            console.error(err);
        }
    });
}

exports.initWeb3 = initWeb3;

exports.compileContract = compileContract;

exports.unlockAccount = unLockAccount;

exports.deployContract = deployContract;

exports.printCoinBaseBalance  = printCoinBaseBalance;