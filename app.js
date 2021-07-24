const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const {okResult} = require('./utils');
const TelegramBot = require('node-telegram-bot-api');

const envPathFirst = `${process.env.PWD}/../.env`;
const envPathSecond = `${process.env.PWD}/.env`;
const envPath = fs.existsSync(envPathFirst) ? envPathFirst : envPathSecond;
require('dotenv').config({path: envPath});
const isTestMode = process.env.APP_IS_TEST;

const langPath = `${process.env.PWD}/languages/${process.env.APP_DEFAULT_LANGUAGE}.json`;
const lang = JSON.parse(fs.readFileSync(langPath));

if (isTestMode) {
    const bot = new TelegramBot(process.env.APP_TEST_TELEGRAM_TOKEN, {polling: true});

    bot.on('message', async (msg) => {
        const {text} = msg;
        const chatId = msg.chat.id;
        const response = await smsHandler(text, chatId, true);
        await bot.sendMessage(chatId, response);
    });
}


// User texts a # to sign up for a battery rental and/or water purchasing services
// User is created a wallet with a simple code (in these markets reading skills are limited)
// User funds wallet in local currency via USSD (the money in the wallet is represented as local currency)
// User begins rental process by putting the cost of the rental and a deposit into an escrow
// User rents a battery and/or purchases water
// Company receives funds and provisions services based on amount of money sent
// User ends use of services via text message and returns battery
// User account deposit is returned and the cost of the rental and/or purchase of water is kept by the company
// User gets in their wallet 1/3 of the value of the total amount of a carbon credit they saved
// (i.e. 1 Carbon Credit sells for $10 USD per ton. Each rental of a battery from solar power saves .0001 tons of carbon per day. So each user would receive $0.00034 once the carbon credit associated to their usage is sold. This can be kept in eth but needs to be represented in their wallet as the local currency).

async function sendSms(toNumber, text) {

}

async function getBalance(phoneNumber) {
    // todo get balance from contract
    return 0;
}

async function createOrder(phone, type) {
    // todo create new order in smart contract, return new if
    // type === battery or water
    return 123;
}

async function getPrice(item) {
    // todo get price from contract. Item could be 'battery' and 'water'
}

async function smsHandler(message, phoneNumber, isTest = false) {
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
        const price = await getPrice('battery');
        result = lang.service_1.replace('{price}', price).replace('{currency}', lang.currency);
        // want to buy water
    } else if (message === '2') {
        const price = await getPrice('water');
        result = lang.service_2.replace('{price}', price).replace('{currency}', lang.currency);
        // renting accepted
    } else if (message === '3') {
        // todo put order to contract, get id
        const id = await createOrder(phoneNumber, 'battery');
        if (id > 0) {
            result = lang.order_1_success.replace('{id}', id);
        } else {
            result = lang.order_fail_funds;
        }
        // buying accepted
    } else if (message === '4') {
        const id = await createOrder(phoneNumber, 'water');
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
    }else if (message === '41') {
        // todo unlock funds for company
        result = lang.complete_2;
        // no conflict with renting. unlock funds
    }else if (message === '311') {
        // todo unlock funds for company
        result = lang.complete_1;
    }

    return result;
}

function validateEnv() {
    // todo do some validation
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

app.get('/sms-received', async (req, res) => {
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

app.get('/ussd-received', async (req, res) => {
    const {text, phone} = req.body;

    okResult(res);
});

app.use((err, req, res, next) => {
    if (err) console.error(err)
    res.status(403).send(`Some error happened`)
});

app.use('/assets', express.static('assets'));

module.exports = app;
