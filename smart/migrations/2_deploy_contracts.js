const WalletEscrow = artifacts.require("WalletEscrow");

module.exports = function (deployer) {
  deployer.deploy(WalletEscrow);
};
