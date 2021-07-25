const app = require('./app');
const {getPhoneBalance,fundPhoneWallet} = require("./wallet-escrow");
const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`Started server at http://localhost:${port}!`));
// getPhoneBalance('123', 'KES').then(console.log)
// fundPhoneWallet('123', 'KES', '10').then(console.log)
