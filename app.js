const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const {okResult} = require("./utils");

const envPathFirst = `${process.env.PWD}/../.env`;
const envPathSecond = `${process.env.PWD}/.env`;
const envPath = fs.existsSync(envPathFirst) ? envPathFirst : envPathSecond;
require('dotenv').config({path: envPath});

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

app.get('/sms-received', async (req, res) => {
    const {secret, text} = req.body;

    okResult(res);
});

app.get('/ussd-received', async (req, res) => {
    const {secret, text} = req.body;

    okResult(res);
});

app.use((err, req, res, next) => {
    if (err) console.error(err)
    res.status(403).send(`Some error happened`)
})

module.exports = app;
