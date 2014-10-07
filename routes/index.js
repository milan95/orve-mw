var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');

var ACCESS_TOKEN = 'ubrRcUkNB93YS5y7UByZ4WjWAq7HzuGj'

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Orve Home' });
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

/* GET admin page */
router.get('/admin', function(req, res) {
    // DO DATABASE CHECK FOR SHOW ENABLED/DISABLED
    res.render('admin', { title: 'Administrator Control Panel',
                          tix1015800: 10,
                          tix1016730: 20,
                          tix1016900: 30,
                          tix1017730: 40,
                          tix1017900: 50,
                          tix1018730: 60,
                          tix1018900: 70,
                          sold1015800: 1,
                          sold1016730: 2,
                          sold1016900: 3,
                          sold1017730: 4,
                          sold1017900: 5,
                          sold1018730: 6,
                          sold1018900: 7,
                          disabled1015800: false,
                          disabled1016730: false,
                          disabled1016900: false,
                          disabled1017730: false,
                          disabled1017900: false,
                          disabled1018730: false,
                          disabled1018900: false });
    
});

/* GET seller page page. */
router.get('/seller', function(req, res) {
    // DO DATABASE CHECK FOR SHOW ENABLED/DISABLED
    res.render('seller', { title: 'Ticketing Control Panel',
                            disabled1015800: false,
                            disabled1016730: false,
                            disabled1016900: false,
                            disabled1017730: false,
                            disabled1017900: false,
                            disabled1018730: false,
                            disabled1018900: false });
});

/* POST to Update Shows Service */
router.post('/updateshows', function(req, res) {
  var db = req.db;

  var show1015800 = req.body.disabled1015800;
  var show1016730 = req.body.disabled1016730;
  var show1016900 = req.body.disabled1016900;
  var show1017730 = req.body.disabled1017730;
  var show1017900 = req.body.disabled1017900;
  var show1018730 = req.body.disabled1018730;
  var show1018900 = req.body.disabled1018900;

  var avail1015800 = req.body.num1015800;
  var avail1016730 = req.body.num1016730;
  var avail1016900 = req.body.num1016900;
  var avail1017730 = req.body.num1017730;
  var avail1017900 = req.body.num1017900;
  var avail1018730 = req.body.num1018730;
  var avail1018900 = req.body.num1018900;

  db.shows.update(
    { date: "10_15-800PM" },
    {
      $set: {
        acceptingTickets: show1015800,
        tixAvail: avail1015800
      }
    },
    {
      upsert: true
    }
  );

  db.shows.update(
    { date: "10_16-730PM" },
    {
      $set: {
        acceptingTickets: show1016730,
        tixAvail: avail1016730
      }
    },
    {
      upsert: true
    }
  );

  db.shows.update(
    { date: "10_16-900PM" },
    {
      $set: {
        acceptingTickets: show1016900,
        tixAvail: avail1016900
      }
    },
    {
      upsert: true
    }
  );

  db.shows.update(
    { date: "10_17-730PM" },
    {
      $set: {
        acceptingTickets: show1017730,
        tixAvail: avail101730
      }
    },
    {
      upsert: true
    }
  );

  db.shows.update(
    { date: "10_17-900PM" },
    {
      $set: {
        acceptingTickets: show1017900,
        tixAvail: avail1017900
      }
    },
    {
      upsert: true
    }
  );

  db.shows.update(
    { date: "10_18-730PM" },
    {
      $set: {
        acceptingTickets: show1018730,
        tixAvail: avail1018730
      }
    },
    {
      upsert: true
    }
  );

  db.shows.update(
    { date: "10_18-900PM" },
    {
      $set: {
        acceptingTickets: show1018900,
        tixAvail: avail1018900
      }
    },
    {
      upsert: true
    }
  );
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

    res.render('seller', { title: 'Ticketing Control Panel', formResult: formResponse });

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
            // All worked. Do something?
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