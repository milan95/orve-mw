var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');

var ACCESS_TOKEN = 'ubrRcUkNB93YS5y7UByZ4WjWAq7HzuGj'

router.get('/', function(req, res) {
  res.render('index', { title: 'Orve Home' });
});

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Orve Home' });
});

/* GET Hello World page. */
router.get('/control', function(req, res) {
    // DO DATABASE CHECK FOR SHOW ENABLED/DISABLED
    res.render('control', { title: 'Ticketing Control Panel',
                            disabled10158: false,
                            disabled1016730: false,
                            disabled10169: false,
                            disabled1017730: false,
                            disabled10179: false,
                            disabled1018730: false,
                            disabled10189: false });
    db.usercollection.drop();
});

/* POST to Charge Customer Service */
router.post('/chargecustomer', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userFirstName = req.body.firstname;
    var userLastName = req.body.lastname;
    var userName = userFirstName + userLastName;
    var userPhone = req.body.telephone;
    var userAmt = req.body.amount;
    var userShow = req.body.show;

    var newAmt = "-" + userAmt;
    var message = "Mask%20and%20Wig%20" + userShow + "Show";
    var formResponse = "Venmo Charge for " + userName + " at phone number " + userPhone + " for show " + userShow + " for $" + userAmt + " was successful.";

    res.render('control', { title: 'Ticketing Control Panel', formResult: formResponse });

    // Set our collection
    var collection = db.get('usercollection');



    //var TXN = PostChargeRequest(ACCESS_TOKEN, userPhone, newAmt, message);

    // Submit to the DB
    collection.insert({
        "name" : userName,
        "phone" : userPhone,
        "amount" : userAmt,
        //"transID" : TXN,
        "status" : "pending",
        "showDate" : userShow
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            //res.send("There was a problem processing the charge request.");
        }
        else {
            //document.getElementById("responseMessage").innerHTML = "New text!";
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