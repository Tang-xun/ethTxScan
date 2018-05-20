const fs = require('fs');

// ########## net acount config start ###########
var g_config = fs.readFileSync('./config/gconfig.json');

var config = JSON.parse(g_config);

function getMainAccount(env) {
    if (env == "prd") {
        return config.prd.accounts[0];
    } else {
        return config.stg.accounts[0];
    }
}

function getPlayAccounts(env) {
    if (env === "prd") {
        return config.env.accounts.slice(1);
    } else {
        return config.env.accounts.slice(4);
    }
}

// ########## net acount config start ###########


exports.MainAccount = getMainAccount;
exports.PlayAccounts = getPlayAccounts;

