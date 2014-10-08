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
router.get('/showlist', function(req, res) {
    var db = req.db;
    var collection = db.get('shows');
    collection.find({},{},function(e,docs){
        res.render('showlist', {
            "showlist" : docs
        });
    });
});

/* GET addshow page */
router.get('/addshow', function(req, res) { 
    res.render('addshow', { title: 'Add a Show' });
    // Add show
});

/* POST to Add Shows Service */
router.post('/showcreate', function(req, res) {
  var db = req.db;
  var collection = db.get('shows');

  var showDateTime = req.body.showDate + 'T' + req.body.showTime;

  collection.update(
    { date: showDateTime },
    {
      $set: {
        acceptingTickets: req.body.showUnavailable,
        tixAvail: req.body.ticketNumber,
        tixSold: 0
      }
    },
    {
      upsert: true
    }
  );

  var formResponse = "Show created successfully."
  res.render('addshow', { title: 'Add a Show', formResult: formResponse });
});

/* GET admin page */
router.get('/admin', function(req, res) {
    // DO DATABASE CHECK FOR SHOW ENABLED/DISABLED

    var db = req.db;
    var collection = db.get('shows');
    collection.find({},{},function(e,docs){
        res.render('admin', {
            "showEntries" : docs
        });
    });
    
});

/* GET seller page page. */
router.get('/seller', function(req, res) {
    var db = req.db;
    var collection = db.get('shows');
    var avail1015800;
    var avail1016730;
    var avail1016900;
    var avail1017730;
    var avail1017900;
    var avail1018730;
    var avail1018900;

    collection.findOne({ date: "10_15-800PM" }, function(err, doc) {
          if (err) throw err
          avail1015800 = doc.acceptingTickets

          collection.findOne({ date: "10_16-730PM" }, function(err, doc) {
            if (err) throw err
            avail1016730 = doc.acceptingTickets
            
            collection.findOne({ date: "10_16-900PM" }, function(err, doc) {
              if (err) throw err
              avail1016900 = doc.acceptingTickets
              


            });

          });

        });

    collection.findOne({ date: "10_17-730PM" }, function(err, doc) {
          if (err) throw err
          avail1017730 = doc.acceptingTickets
          console.log(avail1017730)
        });

    collection.findOne({ date: "10_17-900PM" }, function(err, doc) {
          if (err) throw err
          avail1017900 = doc.acceptingTickets
          console.log(avail1017900)
        });

    collection.findOne({ date: "10_18-730PM" }, function(err, doc) {
          if (err) throw err
          avail1018730 = doc.acceptingTickets
          console.log(avail1018730)
        });

    collection.findOne({ date: "10_18-900PM" }, function(err, doc) {
          if (err) throw err
          avail1018900 = doc.acceptingTickets
          console.log(avail1018900)
          res.render('seller', { title: 'Ticketing Control Panel',
                        disabled1015800: avail1015800,
                        disabled1016730: avail1016730,
                        disabled1016900: avail1016900,
                        disabled1017730: avail1017730,
                        disabled1017900: avail1017900,
                        disabled1018730: avail1018730,
                        disabled1018900: avail1018900 })
        });
});

/* POST to Update Shows Service */
router.post('/updateshows', function(req, res) {
  var db = req.db;
  var collection = db.get('shows');

  var formResponse = "Update submitted successfully."
  res.render('admin', { title: 'Ticketing Control Panel', formResult: formResponse });

  // for()
  // {

  // }
  
  // collection.update(
  //   { date: "10_15-800PM" },
  //   {
  //     $set: {
  //       acceptingTickets: show1015800,
  //       tixAvail: avail1015800
  //     }
  //   },
  //   {
  //     upsert: true
  //   }
  // );

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