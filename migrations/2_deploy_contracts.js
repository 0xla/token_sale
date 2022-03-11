var CatrixToken = artifacts.require("./CatrixToken.sol");
var CatrixTokenSale = artifacts.require("./CatrixTokenSale.sol");
module.exports = function (deployer) {
  deployer.deploy(CatrixToken, 1000000).then(function() {
    // Token price is 0.001 Ether
    var tokenPrice = 1000000000000000;
    return deployer.deploy(CatrixTokenSale, CatrixToken.address, tokenPrice);
  });
};
