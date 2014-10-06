var express = require('express');
var router = express.Router();
var gCollection;

//
var querystring = require('querystring');
// var http = require('https');
// http.post = require('http-post');
var fs = require('fs');
//
var request = require('request');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
    res.render('helloworld', { title: 'Hello, World!' })
});

/* GET Hello World page. */
router.get('/control', function(req, res) {
    res.render('control', { title: 'Control!' });
    var db = req.db;
    gCollection = db.get('usercollection');
    setInterval(function(){checkChargeCompletion("YqNFqWY4q9v5neJ82euPbdFSNtCQ28n4")},10*1000);
    //checkChargeCompletion("YqNFqWY4q9v5neJ82euPbdFSNtCQ28n4", collection);
});

/* GET Userlist page. */
router.get('/userlist', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');

    collection.find({},{},function(e,docs){
        res.render('userlist', {
            "userlist" : docs
        });
    });
});

/* GET New User page. */
router.get('/newuser', function(req, res) {
    res.render('newuser', { title: 'Add New User' });
});

/* POST to Add User Service */
router.post('/addpayment', function(req, res) {
     res.render('helloworld', { title: 'Hello' });
    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.name;
    var userPhone = req.body.telephone;
    var userAmt = req.body.amount;

    var newAmt = "-" + userAmt;

    // Set our collection
    var collection = db.get('usercollection');

    var message = "Chamber_Orchestra_Concert_Tickets";

    var TXN = PostChargeRequest("YqNFqWY4q9v5neJ82euPbdFSNtCQ28n4", userPhone, newAmt, message);

    // Submit to the DB
    collection.insert({
        "name" : userName,
        "phone" : userPhone,
        "amount" : userAmt,
        "transID" : TXN,
        "status" : "pending",
        "showDate" : "2014-09-30T04:31:22-05:00"
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // If it worked, set the header so the address bar doesn't still say /adduser
            //res.location("userlist");
            // And forward to success page
            //res.redirect("userlist");
        }
    });

});

// inputs: an accesstoken for an authenticated user (the group getting paid), a phone number for the customer, an amount, and a note
// requires that note is a valid url string and the userPhone is a 10-digit US phone number with no punctuation
// return: a valid link to charge the user an amount with the given note

function PostChargeRequest(accessToken, userPhone, amount, note) {
  var post_options = {
  	host: 'api.venmo.com',
  	port: '443',
  	path: '/v1/payments'
  }

  var r = request.post('https://api.venmo.com/v1/payments', function(err, httpResponse, body) {
      var transaction = JSON.parse(body);
      var transactionID = transaction.data.payment.id;
      return transactionID;
  });

  var form = r.form();
  form.append('access_token', accessToken);
  form.append('phone', userPhone);
  form.append('amount', amount);
  form.append('note', note);
}

function checkChargeCompletion(accessToken) {
  console.log(gCollection);
  //we get a collection of all the pending transactions
  var pending = gCollection.find({"status" : "pending"});
  console.log(pending);
  //iterate through the transactions
  for (var i = 0, len = pending.length; i < len; ++i){
    console.log('some pending. checking');
    var transactionID = pending[i].transID; //NB: we may need to change this name depending what database calls it
    //process that transaction
    var transURL = 'https://api.venmo.com/v1/payments/' + transactionID;
    console.log('check log:', transURL)
    //actually perform the request
    var r = request.get(transURL, function(err, httpResponse, body) {
      //console.log("made it into the request");
      var transactionDetails = JSON.parse(body); //should be a list of Payment objects, we'll extract ids from them
      console.log(transactionDetails);
      
      //we could also in the future when we cover multiple performances include information
      //about itemization so that we can decrement ticket counter of the right performance
      
      //it should look something like this
      var transactionIDs = [];
      var transactionStatuses = [];
      // transactionIDs[i] = transactionsDetails[i].data[7]; //stored in json in weird way 
      transactionStatus = transactionsDetails.data.status; //only checks one status
      //if this transaction is settled according to venmo but not our database, update the database
      if((gCollection.count({ "transID" : transactionID}, {"status" : "settled"}) == 0) && (transactionStatus == "settled")) { //it has to be settled too
        gCollection.insert({ "transID" : transactionID}, {"status" : "settled"}); //also add other info like which showing it was once we have that
        console.log('it worked');
      }
    });
    var form = r.form();
    form.append('access_token', accessToken);
  }
}

// setInterval(checkChargeCompletion("YqNFqWY4q9v5neJ82euPbdFSNtCQ28n4", collectionGlobal),30*1000);

module.exports = router;