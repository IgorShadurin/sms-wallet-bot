# SMS Wallet Bot

[![Project preview](https://img.youtube.com/vi/WpLx_6xfDeY/0.jpg)](https://youtu.be/WpLx_6xfDeY)

## How it works?

This application is the server which receives SMS/USSD messages
from [Africastalking API](https://developers.africastalking.com/) and manage user's finance for ordering
batteries/water.

Application connected with the smart contract which stores all information about users, their finances and escrow
operations.

User can add finances to his wallet via USSD and manage it via SMS. After every funding operation received sum recorded
to smart contract deployed to [xDai network](https://www.xdaichain.com/).

Supported multi-languages.

## How to setup project?

Deploy `smart/WalletEscrow.sol` to xDai network.

Copy `example.env` to `.env`. Fill it with africastalking API key, username and contract owner private key.

Clone this repo to your server, install Node.js 16, run `yarn` for installing dependencies.

Start this project as a daemon via [pm2](https://pm2.keymetrics.io/).

## How to configure multi-language?

Copy `languages/ENG.json` to new file inside `languages` directory and translate it to required language. Define
application's language in `.env`.

## Testing application

Set testing mode to `true` in `.env` and start the server with command `node index.js`. 

You could test dialog scenarios via Telegram bot. Just define `APP_TEST_TELEGRAM_TOKEN` key from test-bot.

Open `http://localhost:8080/debug` in your browser for sending test USSD requests.

## How to deploy smart contract?

Put `.env` into `smart` folder. Add line with private key from wallet which will deploy contracts `PRIVATE_KEY=`.

`truffle deploy --reset --network poa` deploy to POA

`truffle deploy --reset --network xdai` deploy to xDai

Use [instruction](https://www.xdaichain.com/for-developers/developer-resources/smart-contract-deployment).
