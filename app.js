const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const {okResult} = require('./utils');
const TelegramBot = require('node-telegram-bot-api');
const WalletEscrow = require("./wallet-escrow");
const {fundPhoneWallet} = require("./wallet-escrow");

const envPathFirst = `${process.env.PWD}/../.env`;
const envPathSecond = `${process.env.PWD}/.env`;
const envPath = fs.existsSync(envPathFirst) ? envPathFirst : envPathSecond;
require('dotenv').config({path: envPath});
const isTestMode = process.env.APP_IS_TEST;

const langPath = `${process.env.PWD}/languages/${process.env.APP_DEFAULT_LANGUAGE}.json`;
const lang = JSON.parse(fs.readFileSync(langPath));

const balances = {0: 0};

const orderType = {
    'water': '0x7464bd924e765ce487910dde7cf78faee47c96a6328f88a0cd374cd7c2491abd',
    'battery': '0xa3dff00f6f863c6e9712ee43c469b14000a9f63073ae34afaa647763cb18c186'
};

const currencyKeys = {
    // US Dollar
    'USD': '0xc4ae21aac0c6549d71dd96035b7e0bdb6c79ebdba8891b666115bc976d16a29e',
    // Nigerian naira
    'NGN': '0xc86df68658952a08317197d7ef595a27d44b37f41622030c813206b26f675349',
    // Djiboutian franc
    'DJF': '0xd76a95916688d85014953105a5437b5ae053924ac2b269cafe3cd6e453fac815',
    // West African CFA franc
    'XOF': '0xe14aac48809d86944f63c7c241c81173d25cd5dda2a1535c2025343eadea00ef',
    // Indonesian rupiah
    'IDR': '0xc681c4652bae8bd4b59bec1cdb90f868d93cc9896af9862b196843f54bf254b3',
    // Kenyan shilling
    'KES': '0x589be49821419c9c2fbb26087748bf3420a5c13b45349828f5cac24c58bbaa7b',
};

let bot = null;

if (isTestMode) {
    bot = new TelegramBot(process.env.APP_TEST_TELEGRAM_TOKEN, {polling: true});

    bot.on('message', async (msg) => {
        const {text} = msg;
        const chatId = msg.chat.id;
        console.log('chatId', chatId);
        const response = await smsHandler(text, 0, true);
        await bot.sendMessage(chatId, response);
    });
}

async function sendSms(toNumber, text) {

}

async function fundPhone(phoneNumber, amount, currency) {
    await fundPhoneWallet(phoneNumber, currency, amount);
}

function getCurrencyByNumber(phoneNumber, isTest) {
    // todo detect currency by phone number. if test - usd
    return 'USD';
}

async function getBalance(phoneNumber) {
    // todo get balance from contract
    return balances[phoneNumber];
}

async function createOrder(phone, currency, type) {
    // await WalletEscrow.createOrder(phone, orderType.water, 10, 5, currency);
    return 753;
}

// async function getPrice(item, currency) {
//     // todo get price from contract by currency. Item could be 'battery' and 'water'
// }

async function smsHandler(message, phoneNumber, isTest = false) {
    // const currency = getCurrencyByNumber(phoneNumber, isTest);
    const currency = lang.currency;
    // todo validate phone number is registered in smart contract
    let result = lang.unrecognized_sms;
    // start message
    if (message === '#') {
        const balance = await getBalance(phoneNumber);
        if (balance > 0) {
            result = lang.start;
        } else {
            result = lang.start_no_fund;
        }
        // want to rent a battery
    } else if (message === '1') {
        // const price = await getPrice('battery', currency);
        result = lang.service_1.replace('{price}', lang.price_service_1).replace('{currency}', currency);
        // want to buy water
    } else if (message === '2') {
        // const price = await getPrice('water', currency);
        result = lang.service_2.replace('{price}', lang.price_service_2).replace('{currency}', currency);
        // renting accepted
    } else if (message === '3') {
        // todo put order to contract, get id
        const id = await createOrder(phoneNumber, currency, 'battery');
        if (id > 0) {
            result = lang.order_1_success.replace('{id}', id);
        } else {
            result = lang.order_fail_funds;
        }
        // buying accepted
    } else if (message === '4') {
        const id = await createOrder(phoneNumber, currency, 'water');
        if (id > 0) {
            result = lang.order_2_success.replace('{id}', id);
        } else {
            result = lang.order_fail_funds;
        }
        // ready to return
    } else if (message === '31') {
        // todo send notification about renting complete
        result = lang.ready_to_return_1;
        // water is ok. unlock funds
    } else if (message === '41') {
        // todo unlock funds for company
        result = lang.complete_2;
        // no conflict with renting. unlock funds
    } else if (message === '311') {
        // todo unlock funds for company
        result = lang.complete_1;
    }

    return result;
}

function validateEnv() {
    // todo do some startup validation
}

validateEnv();

const app = express();

app.use(function (req, res, next) {
    console.log(`[${Date.now()}] ${req.method} ${req.originalUrl}`);
    next();
});

const bodyParse = bodyParser.json();

app.use((req, res, next) => {
    if (req.originalUrl === '/someurl') next();
    else bodyParse(req, res, next);
});

app.get('/', (req, res) => {
    okResult(res, 'Everything is ok');
});

app.get('/debug', (req, res) => {
    if (isTestMode) {
        // res.text(fs.readFileSync('./view/debug.html'));
        res.sendFile('view/debug.html', {root: process.env.PWD});
    } else {
        okResult(res, 'Debug mode is off');
    }
});

app.post('/sms-received', async (req, res) => {
    const {text, phone} = req.body;
    let sendSmsText = '';

    sendSmsText = await smsHandler(text, phone);

    if (!isTestMode) {
        if (sendSmsText) {
            await sendSms(phone, sendSmsText);
        }
    }

    if (isTestMode) {
        okResult(res, {sms: sendSmsText});
    } else {
        okResult(res);
    }
});

app.post('/ussd-received', async (req, res) => {
    console.log(req.body);
    const {phone, type, amount, currency} = req.body;
    console.log(phone, type, amount, currency)
    if (type === 'fund' && Number(amount) > 0) {
        await fundPhone(phone, amount, currency);

        if (isTestMode) {
            // test bot
            bot?.sendMessage(580489664, `Your balance funded with ${amount} ${currency}`);
            balances[phone] += amount;
        }
    }

    okResult(res);
});

app.use((err, req, res, next) => {
    if (err) console.error(err)
    res.status(403).send(`Some error happened`)
});

app.use('/assets', express.static('assets'));

module.exports = app;
