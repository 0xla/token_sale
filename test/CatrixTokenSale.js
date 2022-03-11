var CatrixTokenSale = artifacts.require("./CatrixTokenSale.sol");

contract("CatrixTokenSale", function (accounts){

    var tokenInsance;

    it("initializes the contract with correct address", function(){
        return CatrixTokenSale.deployed().then(function (instance){
            tokenInsance = instance;
            return tokenInsance.address;
        }).then(function (address){
            assert.notEqual(address, 0x0, "has the correct contract address");
        });
    });
});