App = {
    web3Provider: null,
    contracts: {}, 
    account : 0x0,
    loading : false,
    tokensSold : 0,
    tokensAvailable : 750000,
    init : function(){
        console.log("App initialized...");
        App.initWeb3();
    },
    initWeb3: function(){

        if (window.ethereum) {
            handleEthereum();
          } else {
            window.addEventListener('ethereum#initialized', handleEthereum, {
              once: true,
            });
          
            // If the event is not dispatched by the end of the timeout,
            // the user probably doesn't have MetaMask installed.
            setTimeout(handleEthereum, 3000); // 3 seconds
          }
          
          function handleEthereum() {
            const { ethereum } = window;
            if (ethereum && ethereum.isMetaMask) {
                App.web3Provider = window.ethereum;
                window.web3 = new Web3(window.ethereum);
                console.log('Ethereum successfully detected!');
                // Access the decentralized web!
            } else {
                console.log('Please install MetaMask!');
            }
          }

        return App.initContracts();
    },
    initContracts: function(){
        $.getJSON("CatrixTokenSale.json", function(catrixTokenSale){
            App.contracts.CatrixTokenSale = TruffleContract(catrixTokenSale);
            App.contracts.CatrixTokenSale.setProvider(App.web3Provider);
            App.contracts.CatrixTokenSale.deployed().then(function(catrixTokenSale){
                console.log("CatrixTokenSale Address:", catrixTokenSale.address);
            });
        }).done(function(){
            $.getJSON("CatrixToken.json", function(catrixToken){
            App.contracts.CatrixToken = TruffleContract(catrixToken);
            App.contracts.CatrixToken.setProvider(App.web3Provider);
            App.contracts.CatrixToken.deployed().then(function(catrixToken){
            console.log("CatrixToken Address:", catrixToken.address);
            });
        });
        })
        return App.render();
    },
    render : async function(){
        if(App.loading){
            return;
        }
        App.loading = true;

        var loader = $('#loader');
        var content= $('#content');
        var catrixTokenSaleInstance;

        loader.show();
        content.hide();

        // const accounts = await web3.eth.getAccounts();
        // console.log(accounts);
        ethereum.request({ method: 'eth_accounts' }).then(function(accounts) {
            if (accounts === undefined) {
              // MetaMask is locked or the user has not connected any accounts
              console.log('Please connect to MetaMask.');
            //   $('#connectAccount').show();
            //   App.render();
            } else if (accounts[0] !== App.account) {
                $('#connectAccount').hide();
              App.account = accounts[0];
              console.log("Account address" + App.account);
              // Do any other work!
              $('#accountAddress').html("Your Account : " + App.account);
            }
            App.contracts.CatrixTokenSale.deployed().then(function(instance){
                catrixTokenSaleInstance = instance;
                return catrixTokenSaleInstance.tokenPrice();
            }).then(function (tokenPrice){
                App.tokenPrice = tokenPrice;
                $('.token-price').html((web3.fromWei(App.tokenPrice, 'ether')).toNumber());
                return catrixTokenSaleInstance.tokensSold();
            })
            .then(function (tokensSold){
                App.tokensSold = tokensSold.toNumber();
                $('.tokens-sold').html(App.tokensSold);
                $('.tokens-available').html(App.tokensAvailable);
                var progressPercent = (App.tokensSold * 100) / App.tokensAvailable;
                $('#progress').css('width', progressPercent + '%');

                App.contracts.CatrixToken.deployed().then(function(instance){
                    catrixTokenInstance = instance;
                    return catrixTokenInstance.balanceOf(App.account);
                }).then(function(balance){
                    console.log(balance);
                    $('.crx-balance').html(balance.toNumber());
                })
           });
          })
        .catch((err) => {
            // Some unexpected error.
            // For backwards compatibility reasons, if no accounts are available,
            // eth_accounts will return an empty array.
            console.error(err);
        })
        .then(function(){
            App.loading = false;
            loader.hide();
            content.show();
        });
    }, 
    listenForEvents : function (){
        App.contracts.CatrixTokenSale.deployed().then(function (instance){
            instance.Sell({},{
                fromBlock : 0,
                toBlock : 'latest',
            }).watch(function(error, event){
                console.log("event triggered", event);
                App.render();
            })
        })
    },
    buyTokens : function (){
        $('#content').hide();
        $('#loader').show();
        var numberOfTokens = $('#numberOfTokens').val();
        // if(App.account === 0x0 ){
        //     $('#connectAccount').show();
        //     $('#content').hide();
        //     $('#loader').hide();
        //     App.render(); 
        // }
        App.contracts.CatrixTokenSale.deployed().then(function(instance){
                return instance.buyTokens(numberOfTokens, {
                    from: App.account,
                    value : numberOfTokens * App.tokenPrice,
                    gas : 500000
                });
             
        }).then(function(result){
            console.log("Tokens bought");
            $('form').trigger('reset');
            App.listenForEvents();
        });
    },
    // showConnectPrompt : function (){
    //     $('#connect').show();
    //     App.render();
    // }
}

$(function() {
    $(window).load(function(){
        App.init();
    })
});