const {ethers, providers} = require('ethers');
const {Transaction} = require('@ethereumjs/tx');
const fs = require('fs');
const Common = require('@ethereumjs/common');

const privateKey = process.env.APP_CONTRACT_OWNER_PRIVATE_KEY;
const abi = JSON.parse(fs.readFileSync('smart/build/contracts/WalletEscrow.json'));
// console.log('addr', abi.networks[77].address);

//https://sokol.poa.network
//77

//https://rpc.xdaichain.com/
//100
const chainId = 77;
const provider = new providers.JsonRpcProvider('https://sokol.poa.network');
const signer = new ethers.Wallet(privateKey).connect(provider);
// const contractInstanceRead = new ethers.Contract(abi.networks[chainId].address, abi.abi, provider);
const contractInstanceRW = new ethers.Contract(abi.networks[chainId].address, abi.abi, signer)

const sendEths = async ({
                            to,
                            from,
                            fromPrivateKey,
                            value,
                            gasPrice = null,
                            gasLimit = ethers.utils.hexlify(21000),
                        }) => {

    // console.log('METHODS contractInstance', await contractInstance.orderId());
    // const instance = await appContract.deployed();
    // console.log('instance', instance);
    // 0x64e604787cbf194841e7b68d7cd28786f6c9a0a3ab9f8b0a0e87cb4387ab0107 - 123

    let data = null;
    try {
        data = await contractInstanceRW.createOrder(
            '0x64e604787cbf194841e7b68d7cd28786f6c9a0a3ab9f8b0a0e87cb4387ab0107',
            '0x7464bd924e765ce487910dde7cf78faee47c96a6328f88a0cd374cd7c2491abd',
            ethers.utils.parseEther('10'),
            ethers.utils.parseEther('5'),
            '0x589be49821419c9c2fbb26087748bf3420a5c13b45349828f5cac24c58bbaa7b');

        // data = await contractInstanceRW.fundPhoneWallet(
        //     '0x64e604787cbf194841e7b68d7cd28786f6c9a0a3ab9f8b0a0e87cb4387ab0107',
        //     '0x589be49821419c9c2fbb26087748bf3420a5c13b45349828f5cac24c58bbaa7b',
        //     ethers.utils.parseEther('10')
        // );

        const waitData = await provider.waitForTransaction(data.hash);
        console.log('waitData', waitData);

    } catch (e) {
        console.log('catch error');
    }

    console.log('RESULT DATA', data);
    return;

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
        fromPrivateKey: privateKey,
        value: '0.00001'
    });
};


// bytes32 phone, bytes32 orderType, uint totalDeposit, uint endSum, bytes32 currency
module.exports.createOrder = async (phone, orderType, totalDeposit, endSum, currency) => {
    const data = await contractInstanceRW.createOrder(
        ethers.utils.keccak256(phone),
        ethers.utils.keccak256(orderType),
        ethers.utils.parseEther(totalDeposit.toString()),
        ethers.utils.parseEther(endSum.toString()),
        ethers.utils.keccak256(currency),
    );

    return provider.waitForTransaction(data.hash);
};

//uint _orderId
module.exports.releaseDeposit = async (orderId) => {
    const data = await contractInstanceRW.fundPhoneWallet(
        orderId
    );

    return provider.waitForTransaction(data.hash);
};

//bytes32 phone, bytes32 currency, uint sum
module.exports.fundPhoneWallet = async (phone, currency, sum) => {
    const data = await contractInstanceRW.fundPhoneWallet(
        ethers.utils.keccak256(phone),
        ethers.utils.keccak256(currency),
        ethers.utils.parseEther(sum.toString()),
    );

    return provider.waitForTransaction(data.hash);
};
