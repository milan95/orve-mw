var express = require('express');
var router = express.Router();

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


module.exports = router;