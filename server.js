var express = require('express'),
    cors = require('cors'),
    app = express();
//var router = express.Router();
var bodyParser = require('body-parser');
var Web3 = require('web3');

var Tx = require('ethereumjs-tx');
var _ = require('lodash');

var SolidityFunction = require('web3/lib/web3/function');
var keythereum = require("keythereum");

var request = require('request');

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

//session configs
var expressSession = require('express-session');
var cookieParser = require('cookie-parser'); // the session is stored in a cookie, so we use this to parse it


app.use(cookieParser());

app.use(expressSession({
    secret: 'test_session',
    resave: false,
    saveUninitialized: true
}));


//For enabling CORS
app.use(cors());


var web3;
if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.HttpProvider("http://10.0.0.8:8545"));
    //console.log(web3.net.peerCount);
}

var Web3EthAccounts = require('web3-eth-accounts');

var account = new Web3EthAccounts('ws://10.0.0.8:8546');


//web3.eth.defaultAccount = 0xaf148d7e9c5a1f6ee493f0a808fdc877953bf273;
web3.eth.defaultAccount = web3.eth.accounts[0];

//contract data
var datacoinTokenContractABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"value","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"multisig","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"tokensaleSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_buyer","type":"address"},{"name":"_seller","type":"address"},{"name":"_shareG","type":"address"},{"name":"_totalSessionCost","type":"uint256"},{"name":"_unusedTokens","type":"uint256"},{"name":"_sellerPercentage","type":"uint256"}],"name":"processSessionPayment","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"who","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"PRICE","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getPrice","outputs":[{"name":"result","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"who","type":"address"},{"name":"requiredToken","type":"uint256"}],"name":"checkAvailableTokan","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"recipient","type":"address"}],"name":"tokensale","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"_tokensaleSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"who","type":"address"}],"name":"holdBalanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_buyer","type":"address"},{"name":"_value","type":"uint256"}],"name":"holdTokenForSessionPayment","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_decimals","type":"uint256"},{"name":"_initalSupply","type":"uint256"},{"name":"_multisig","type":"address"},{"name":"_tokenPrice","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"HoldToken","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"buyer","type":"address"},{"indexed":true,"name":"seller","type":"address"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"shareGvalue","type":"uint256"}],"name":"SessionPayment","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"}];

// Kovan Network
var datacoinTokenContractAddress = "0xa144766e18fe48352bfc36a0dc2431a18fc476b9";

// Main Network
//var datacoinTokenContractAddress = "0x44e8052A7cfdBaA497244363C6BfeD93740a2B0c";

var datacoinTokenContract = web3.eth.contract(datacoinTokenContractABI).at(datacoinTokenContractAddress);

//contract data
var datacoinContractABI = [{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"sessionValues","outputs":[{"name":"sid","type":"string"},{"name":"limit","type":"uint256"},{"name":"totalSessionCost","type":"uint256"},{"name":"totalDataConsumed","type":"uint256"},{"name":"totalSessionTime","type":"string"},{"name":"startedAt","type":"string"},{"name":"stoppedAt","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_id","type":"string"}],"name":"isStartSessionAvailable","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"string"},{"name":"_unitsForPrice","type":"string"},{"name":"_unitPrice","type":"string"},{"name":"_deviceId","type":"string"},{"name":"_sessionType","type":"string"},{"name":"_isStop","type":"bool"},{"name":"_buyer","type":"address"},{"name":"_seller","type":"address"}],"name":"addSession","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_index","type":"uint256"}],"name":"getSessionDetail","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"string"},{"name":"_limit","type":"uint256"},{"name":"_totalSessionCost","type":"uint256"},{"name":"_totalDataConsumed","type":"uint256"},{"name":"_totalSessionTime","type":"string"},{"name":"_startedAt","type":"string"},{"name":"_stoppedAt","type":"string"}],"name":"addSessionValue","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_id","type":"string"}],"name":"getStartSessionDetail","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getSessionCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_index","type":"uint256"}],"name":"getSessionValue","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"sessions","outputs":[{"name":"sid","type":"string"},{"name":"unitsForPrice","type":"string"},{"name":"unitPrice","type":"string"},{"name":"deviceId","type":"string"},{"name":"sessionType","type":"string"},{"name":"isStop","type":"bool"},{"name":"buyer","type":"address"},{"name":"seller","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_id","type":"string"}],"name":"isEndSessionAvailable","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];

// Kovan Network
var datacoinContractAddress = "0xf2e097e1f1f57652a47ccefe0942d038dc64a41f";

// Main Network
//var datacoinContractAddress = "0xe105074e1fa7c2b7000aefe4990b5b9a2fbacc59";

var datacoinContract = web3.eth.contract(datacoinContractABI).at(datacoinContractAddress);

app.get('/', function(req, res) {
    res.send("This is the API server developed for DataCoin Token Contract");
});

app.get('/getEvents', function(req, res) {
  var event = datacoinTokenContract.SessionPayment({_from:web3.eth.coinbase},{fromBlock: 0, toBlock: 'latest'}).get(function(error, result){
      if (error) {
        console.log ("Error="+ error);
      }
      if (result) {
        console.log (result);
        res.end(JSON.stringify(result));
      }
    });
});

app.post('/createAccount', function(req, res) {
    var password = req.body._password;
    var result = account.create();
    var address = result.address;
    var privateKey = result.privateKey;

    var encryptedResult = account.encrypt(privateKey, password);

    res.json({"Address" : address, "PrivateKey" : privateKey, "Keystore" : encryptedResult});
});

app.post('/accessAccountUsingKeystore', function(req, res) {
    var Keystore = req.body.Keystore;
    var password = req.body._password;
    var result = account.decrypt(Keystore, password);

    var address = result.address;
    var privateKey = result.privateKey;

    res.json({"Address" : address, "PriateKey" : privateKey});
});

app.post('/accessAccountUsingPrivateKey', function(req, res) {
    var privateKey = req.body._privateKey;
    var result = account.privateKeyToAccount(privateKey);

    var address = result.address;
    var privateKey = result.privateKey;
    res.json({"Address" : address, "PriateKey" : privateKey});
});

app.post('/myTokenBalance', function(req, res) {
  var address = req.body._address;
  datacoinTokenContract.balanceOf.call(address, function(err, result) {
      //console.log(result);
      if (!err) {
          res.json({"balance":result});
      } else
          res.status(401).json("Error" + err);
  });
});

app.post('/transferToken', function(req, res) {
  var fromaddress = req.body._fromaddress;
  var toaddress = req.body._toaddress;
  var amount = req.body._amount;
  var privatekey = req.body._privatekey;

  // step 1
  var solidityFunction = new SolidityFunction('', _.find(datacoinTokenContractABI, { name: 'transfer' }), '');

  //console.log(solidityFunction);

  // Step 2
  var payloadData = solidityFunction.toPayload([toaddress, amount]).data;

  //console.log(payloadData);

  // Step 3
  gasPrice = web3.eth.gasPrice;
  gasPriceHex = web3.toHex(gasPrice);
  gasLimitHex = web3.toHex(300000);

  nonce =  web3.eth.getTransactionCount(fromaddress) ;
  nonceHex = web3.toHex(nonce);

  var rawTx = {
      nonce: nonceHex,
      gasPrice: gasPriceHex,
      gasLimit: gasLimitHex,
      to: datacoinTokenContractAddress,
      from: fromaddress,
      value: '0x00',
      data: payloadData
  };

  // Step 4
  var key = Buffer.from(privatekey, 'hex');
  var tx = new Tx(rawTx);
  tx.sign(key);

  var serializedTx = tx.serialize();

  web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function (err, hash) {
      if (err) {
          res.status(401).json("" + err);
      }
      else {
          res.json({"status":true, "hash" : hash});
      }
  });
});

app.post('/buyToken', function(req, res) {
  var fromaddress = req.body._fromaddress;
  var amount = req.body._amount;
  var privatekey = req.body._privatekey;

  // Step 1
  var payloadData = web3.toHex(web3.toWei(amount, 'ether'));

  // Step 2
  gasPrice = web3.eth.gasPrice;
  gasPriceHex = web3.toHex(gasPrice);
  gasLimitHex = web3.toHex(300000);

  nonce =  web3.eth.getTransactionCount(fromaddress) ;
  nonceHex = web3.toHex(nonce);

  var rawTx = {
      nonce: nonceHex,
      gasPrice: gasPriceHex,
      gasLimit: gasLimitHex,
      to: datacoinTokenContractAddress,
      from: fromaddress,
      value: payloadData,
      data: '0x00'
  };

  // Step 3
  var key = Buffer.from(privatekey, 'hex');
  var tx = new Tx(rawTx);
  tx.sign(key);

  var serializedTx = tx.serialize();

  web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function (err, hash) {
      if (err) {
          res.status(401).json("" + err);
      }
      else {
          res.json({"status":true, "hash" : hash});
      }
  });
});

app.get('/getArgEncoded', function(req, res) {
  var abi = require('ethereumjs-abi')

  //var parameterTypes = ["string", "string", "uint", "uint", "address", "uint"];
  //var parameterValues = ["datacoin", "datacoin",  8, 100000000000, "0x23c2a45Ad4C02Ba8EEa334c974986B2edA5659C6", 200];

  var parameterTypes = ["uint256", "uint256", "address", "uint"];
  //var parameterValues = [1504517400000, 1505122200000, "0x895324D4d8E9Bf08db6C78d828B8498291e7AB4c", 50];
  //var parameterValues = [1504521000000, 1505730600000, "0x895324D4d8E9Bf08db6C78d828B8498291e7AB4c", 250];
  var parameterValues = [1504790580000, 1506518430000, "0x895324D4d8E9Bf08db6C78d828B8498291e7AB4c", 100];

  //var parameterTypes = ["uint256", "uint256", "address"];
  //var parameterValues = [1504594800000, 1506668400000, "0x895324D4d8E9Bf08db6C78d828B8498291e7AB4c"];

  var encoded = abi.rawEncode(parameterTypes, parameterValues);

  var result = encoded.toString('hex');

  res.json({"result" : result});
});

app.post('/availableBalance', function(req, res) {
  var address = req.body._address;
  datacoinTokenContract.balanceOf.call(address, function(err, result) {
      //console.log(result);
      if (!err) {
          res.json({"balance":result});
      } else
          res.status(401).json("Error" + err);
  });
});

app.post('/isRequiredTokanAvailable', function(req, res) {
  var address = req.body._address;
  var requiredTokan = req.body._requiredTokan;
  datacoinTokenContract.balanceOf.call(address, function(err, result) {
      //console.log(result);
      if (!err) {
          var status = false;
          if (result >= requiredTokan) {
            status = true;
          }
          res.json({"status":status});
      } else
          res.status(401).json("Error" + err);
  });
});

app.get('/getSessionCount', function(req, res) {
  datacoinContract.getSessionCount.call(function(err, result) {
      //console.log(result);
      if (!err) {
          res.json({"sessionCount":result});
      } else
          res.status(401).json("Error" + err);
  });
});

app.post('/getSessionDetail', function(req, res) {
    var index = req.body._index;
    datacoinContract.sessions.call(index, function (err, result) {
      if (!err) {
        datacoinContract.sessionValues.call(index, function(err2, result2) {
          if (!err2) {
            res.status(200).json({"status":true, "sid" : result[0], "unitsForPrice" : result[1], "unitPrice" : result[2], "deviceId" : result[3], "sessionType" : result[4], "isStop" : result[5], "buyer" : result[6], "seller" : result[7],
                                  "limit" : result2[1], "totalSessionCost" : result2[2], "totalDataConsumed" : result2[3], "totalSessionTime": result2[4], "startedAt" : result2[5], "stoppedAt" : result2[6]});
          } else {
            res.status(200).json({"status":false, "message" : "Session detail not found!"});
          }
        });
      } else {
        res.status(200).json({"status":false, "message" : "Session detail not found!"});
      }
    });
});

app.post('/addStartSession', function(req, res) {
  var id = req.body._id;
  var unitsForPrice = req.body._unitsForPrice;
  var unitPrice = req.body._unitPrice;
  var deviceId = req.body._deviceId;
  var sessionType = req.body._sessionType;
  var isStop = req.body._isStop;
  var limit = req.body._limit;
  var totalSessionCost = req.body._totalSessionCost;
  var totalDataConsumed = req.body._totalDataConsumed;
  var totalSessionTime = req.body._totalSessionTime;
  var startedAt = req.body._startedAt;
  var stoppedAt = req.body._stoppedAt;
  var buyer = req.body._buyer;
  var seller = req.body._seller;

  datacoinContract.isStartSessionAvailable.call(id, function(err, result) {
    if (!err) {
      if (result) {
        res.status(200).json({"status":false, "message" : "Session with Id available already!"});
      } else {
        datacoinContract.addSession.sendTransaction(id, unitsForPrice, unitPrice, deviceId, sessionType, isStop, buyer, seller, {
           from: web3.eth.defaultAccount,gas:4712388
        }, function(err1, result1) {
           if (!err1) {
               datacoinContract.addSessionValue.sendTransaction(id, limit, totalSessionCost, totalDataConsumed, totalSessionTime, startedAt, stoppedAt, {
                  from: web3.eth.defaultAccount,gas:4712388
               }, function(err2, result2) {
                  if (!err2) {
                      datacoinTokenContract.holdTokenForSessionPayment.sendTransaction(buyer, totalSessionCost, {
                         from: web3.eth.defaultAccount,gas:4712388
                      }, function(err3, result3) {
                        if (!err3) {
                            res.status(200).json({"status":true, transaction : result3});
                        } else
                          res.status(200).json({"status":false, error : err3});
                      });
                  } else
                      res.status(200).json({"status":false, error : err2});
               });
           } else
               res.status(200).json({"status":false, error : err1});
        });
      }
    }
  });
});

app.post('/addEndSession', function(req, res) {
  var id = req.body._id;
  var unitsForPrice = req.body._unitsForPrice;
  var unitPrice = req.body._unitPrice;
  var deviceId = req.body._deviceId;
  var sessionType = req.body._sessionType;
  var isStop = req.body._isStop;
  var limit = req.body._limit;
  var totalSessionCost = req.body._totalSessionCost;
  var totalDataConsumed = req.body._totalDataConsumed;
  var totalSessionTime = req.body._totalSessionTime;
  var startedAt = req.body._startedAt;
  var stoppedAt = req.body._stoppedAt;
  var buyer = req.body._buyer;
  var seller = req.body._seller;
  var shareG = req.body._shareG;
  var sellerPercentage = req.body._sellerPercentage;

  datacoinContract.isEndSessionAvailable.call(id, function(err, result) {
    if (!err) {
      console.log(result);
      if (result >= 2) {
        res.status(200).json({"status":false, "message" : "End Session is added already!"});
      } else if (result == 0) {
        res.status(200).json({"status":false, "message" : "Start Session is not available with the session id!"});
      } else {
        datacoinContract.addSession.sendTransaction(id, unitsForPrice, unitPrice, deviceId, sessionType, isStop, buyer, seller, {
           from: web3.eth.defaultAccount,gas:4712388
        }, function(err1, result1) {
           if (!err1) {
               datacoinContract.addSessionValue.sendTransaction(id, limit, totalSessionCost, totalDataConsumed, totalSessionTime, startedAt, stoppedAt, {
                  from: web3.eth.defaultAccount,gas:4712388
               }, function(err2, result2) {
                  if (!err2) {

                      datacoinContract.getStartSessionDetail.call(id, function(err3, result3) {
                        if (!err3) {
                          var unusedTokens = result3 - totalSessionCost;
                          datacoinTokenContract.processSessionPayment.sendTransaction(buyer, seller, shareG, totalSessionCost, unusedTokens, sellerPercentage, {
                             from: web3.eth.defaultAccount,gas:4712388
                          }, function(err4, result4) {
                            if (!err4) {
                              res.status(200).json({"status":true, transaction : result4});
                            } else
                              res.status(200).json({"status":false, error : err3});
                          });
                        } else
                          res.status(200).json({"status":false, error : err3});
                      });

                  } else
                      res.status(200).json({"status":false, error : err2});
               });
           } else
               res.status(200).json({"status":false, error : err1});
        });
      }
    }
  });
});

app.listen(3003, function() {
    console.log('app running on port : 3003');
});
