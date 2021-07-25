const {ethers, providers} = require('ethers');
const {Transaction} = require('@ethereumjs/tx');
const fs = require('fs');
const Common = require('@ethereumjs/common');

const abi = JSON.stringify(fs.readFileSync('smart/build/contracts/WalletEscrow.json'));

//https://sokol.poa.network
//77

//https://rpc.xdaichain.com/
//100
const chainId = 77;
const provider = new providers.JsonRpcProvider('https://sokol.poa.network');

const sendEths = async ({
                            to,
                            from,
                            fromPrivateKey,
                            value,
                            gasPrice = null,
                            gasLimit = ethers.utils.hexlify(21000),
                        }) => {
    const txCount = await provider.getTransactionCount(from);
    console.log('txcount', txCount);
    if (!gasPrice) {
        gasPrice = (await provider.getGasPrice()).toHexString();
        console.log('gasPrice', gasPrice);
    }

    const common = Common.default.custom({chainId});
    const pk = Buffer.from(fromPrivateKey, 'hex');
    // build the transaction
    const txParams = {
        nonce: ethers.utils.hexlify(txCount),
        gasPrice,
        gasLimit,
        to,
        value: ethers.utils.parseEther(value).toHexString(),
        // data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
    }

    const tx = Transaction.fromTxData(txParams, {common})
    const signedTx = tx.sign(pk);
    const serializedTx = signedTx.serialize();
    // send the transaction
    const {hash} = await provider.sendTransaction('0x' + serializedTx.toString('hex'))
    return await provider.waitForTransaction(hash);
}

module.exports.test = async () => {
    const data = await sendEths({
        to: '0x980F5aC0Fe183479B87f78E7892f8002fB9D5401',
        from: '0x5928f91b1A4Fd3D6C6Eda4222814f51Ab0615975',
        fromPrivateKey: 'b438bb3a182fa4fa1dea371877fcdd89e31f859ce67c2cad4d644ca59ee6d61b',
        value: '0.00001'
    });
    console.log('data answer', data);
};


// bytes32 phone, bytes32 orderType, uint totalDeposit, uint endSum, bytes32 currency
module.exports.createOrder = () => {

};

//uint _orderId
module.exports.releaseDeposit = () => {

};

//bytes32 phone, bytes32 currency, uint sum
module.exports.fundPhoneWallet = () => {

};
