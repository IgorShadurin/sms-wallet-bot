const app = require('./app');
const {test} = require("./wallet-escrow");
const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`Started server at http://localhost:${port}!`));
test().then(console.log)
