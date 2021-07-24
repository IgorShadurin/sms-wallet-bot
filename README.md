# SMS Wallet Bot

## How it works?

This application is the server which receives SMS/USSD messages
from [Africastalking API](https://developers.africastalking.com/) and manage user's finance for ordering
batteries/water.

User can add finances to his wallet via USSD and manage it via SMS. After every funding operation received sum recorded
to smart contract deployed to [xDai network](https://www.xdaichain.com/).

## How to setup project?

Copy `example.env` to `.env`. Fill it with
