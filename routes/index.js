var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');

var ACCESS_TOKEN = 'ubrRcUkNB93YS5y7UByZ4WjWAq7HzuGj'

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Orve Home' });
});

/* GET Show list page. */
router.get('/showlist', function(req, res) {
  var db = req.db;
  var collection = db.get('shows');
  collection.find({},{},function(e,docs){
    res.render('showlist', {
        "showlist" : docs
    });
  });
});

/* GET Ticket list page. */
router.get('/ticketlist', function(req, res) {
  var db = req.db;
  var collection = db.get('tickets');
  collection.find({},{},function(e,docs){
    res.render('ticketlist', {
        "ticketlist" : docs
    });
  });
});

router.get('/venmo_update', function(req, res) {
  var db = req.db;
  var collection = db.get('tickets');

  var venmoChallenge = req.query.venmo_challenge;

  res.render('venmo_update', { venmo_challenge : venmoChallenge });
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
  var db = req.db;
  var collection = db.get('shows');
  collection.find({},{},function(e,docs){
      res.render('admin', {
          "showEntries" : docs,
          title: 'Administrator Control Panel'
      });
  });
    
});

/* GET seller page page. */
router.get('/seller', function(req, res) {
  var db = req.db;
  var collection = db.get('shows');

  collection.find({},{},function(e,docs){
      res.render('seller', {
          "showEntries" : docs,
          title: 'Sell Tickets'
      });
  });
});

/* POST to Update Shows Service */
router.post('/updateshows', function(req, res) {
  var db = req.db;
  var collection = db.get('shows');

  var acceptingName;
  var availableNum

  collection.find({}, function(err, cursor) {
    for(i = 0; i < cursor.length; i++){

      acceptingName = 'acceptingTickets-' + cursor[i].date;
      availableNum = 'tixAvail-' + cursor[i].date;

      collection.update(
        { date: cursor[i].date },
        {
          $set: {
            acceptingTickets: req.body[acceptingName],
            tixAvail: req.body[availableNum]
          }
        },
        {
          upsert: true
        }
      );
    }
  });

  var formResponse = "Update submitted successfully.";
  res.redirect('admin');

});

router.post('/cashsale', function(req, res) {
  
  var db = req.db;
  var sellerCollection = db.get('shows');
  var userShow = req.body.show;

  var formResponse = "Cash sale submitted.";

    sellerCollection.find({},{},function(e,docs){
        res.render('seller', {
            "showEntries" : docs,
            formResult: formResponse
        });
    });

  sellerCollection.find({ date: userShow }, function(e,doc){
    var ticketNumber;
    ticketNumber = doc[0].tixSold + 1;

    sellerCollection.update(
      { date: userShow },
      {
        $set: {
          tixSold: ticketNumber
        }
      },
      {
        upsert: true
      }
    );
  });

});

/* POST to Charge Customer Service */
router.post('/chargecustomer', function(req, res) {

  // Set our internal DB variable
  var db = req.db;
  var sellerCollection = db.get('shows');

  // Get our form values. These rely on the "name" attributes
  var userFirstName = req.body.firstname;
  var userLastName = req.body.lastname;
  var userPhone = req.body.telephone;
  var userAmt = req.body.amount;
  var userShow = req.body.show;

  var newAmt = "-" + userAmt;
  var prettyShow = new Date(userShow).toLocaleString();
  var message = "Mask and Wig " + prettyShow + " Show";
  var formResponse = "Venmo Charge for " + userFirstName + " " + userLastName + " at phone number " + userPhone + " for show " + prettyShow + " for $" + userAmt + " was successful.";

  sellerCollection.find({},{},function(e,docs){
      res.render('seller', {
          "showEntries" : docs,
          formResult: formResponse
      });
  });

  // Set our collection
  var collection = db.get('tickets');

  //var TXN = PostChargeRequest(ACCESS_TOKEN, userPhone, newAmt, message);

  // Submit to the DB
  collection.insert({
      "firstname" : userFirstName,
      "lastname": userLastName,
      "phone" : userPhone,
      "amount" : userAmt,
      //"transID" : TXN,
      "status" : "pending",
      "showDate" : userShow
  }, function (err, doc) {
      if (err) {
      }
      else {
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