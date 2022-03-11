var CatrixToken = artifacts.require("./CatrixToken.sol");

contract("CatrixToken", function(accounts){
    var tokenInstance; 

    it("initializes the name, symbol of the token correctly", function (){
        return CatrixToken.deployed().then(function (instance){
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function (name){
            assert.equal(name, "Catrix Coin", "sets the name of the token correctly");
            return tokenInstance.symbol();
        }).then(function (symbol){
            assert.equal(symbol, "CRX", "sets the token symbol");
            return tokenInstance.standard();
        }).then(function (standard){
            assert.equal(standard, "Catrix Coin v1.0", "sets the standard correctly");
        });
    });

    it("sets the total supply upon deployment", function(){
        return CatrixToken.deployed()
        .then(function (instance) {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        })
        .then(function (totalSupply) {
            assert.equal(totalSupply.toNumber(),1000000
            , "sets the total supply to 1000000");
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function (adminBalance){
            assert.equal(adminBalance.toNumber(), 1000000, 
            "allocates the initial supply to the admin main account");
        });
    });

    it("transfers token transfership", function (){
        return CatrixToken.deployed().then(function (instance){
            tokenInstance = instance;
            // using call does not trigger a transaction
            return tokenInstance.transfer.call(accounts[1], 999999999999999);
        }).then(assert.fail).catch(function (error){
            assert(error.message.indexOf("revert") >= 0, "error message must contain revert");
            // not using call does trigger a transaction and hence the receipt
            return tokenInstance.transfer.call(accounts[1], 250000, {from : accounts[0]});
        }).then(function (success){
            assert.equal(success, true, "it returns true");
            return tokenInstance.transfer(accounts[1], 250000, {from : accounts[0]});
        }).then(function (receipt){
            assert.equal(receipt.logs.length, 1, "triggers an event");
            assert.equal(receipt.logs[0].event, "Transfer", "should be the 'Trasfer' event");
            assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferring from ');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account to tokens are being transferred to');
            assert.equal(receipt.logs[0].args._value, 250000, "logs the value of the tokens being transferred");
            return tokenInstance.balanceOf(accounts[1]);
        }).then(function (balance){
            assert.equal(balance.toNumber(), 250000, "adds the amount to the receiving address");
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function (balance) {
            assert.equal(balance.toNumber(), 750000, "subtracts the amount from the sender's address");
        });
    });

    it("Handling Approve", function () {
        return CatrixToken.deployed().then(function (instance){
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 100);
        }).then(function (success){
            assert.equal(success, true, "approve function return true");
            return tokenInstance.approve(accounts[1], 100, {from: accounts[0]});
        }).then(function (receipt){
            assert.equal(receipt.logs.length, 1, "triggers an event");
            assert.equal(receipt.logs[0].event, "Approval", "should be the 'Approval' event");
            assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are being authorized by ');
            assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are being spent by');
            assert.equal(receipt.logs[0].args._value, 100, "logs the value of the tokens being transferred");
            return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then(function (allowance){
            assert.equal(allowance, 100, "stores the allowance of the delegated transfer");
        });
    });
    it("handles delegate transfer", function () {
        return CatrixToken.deployed().then(function (instance){
            tokenInstance = instance;
            return tokenInstance.approve(accounts[1], 100, {from : accounts[0]});
        }).then(function (receipt){
            return tokenInstance.transferFrom.call(accounts[0], accounts[2], 100, {from : accounts[1]});
        }).then(function (success) {
            assert.equal(success, true, "function returns true");
            return tokenInstance.transferFrom(accounts[0], accounts[2], 100, {from: accounts[1]});
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, "triggers an event");
            assert.equal(receipt.logs[0].event, "Transfer", "should be the 'Approval' event");
            assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are being authorized by ');
            assert.equal(receipt.logs[0].args._to, accounts[2], 'logs the account the tokens are being spent by');
            assert.equal(receipt.logs[0].args._value, 100, "logs the value of the tokens being transferred");
        }); 
    });

});