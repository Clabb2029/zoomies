var express = require('express');
var router = express.Router();
const stripe = require('stripe')('sk_test_51KHnbnFtQlYQY59hMroOKjc56ddpk31QwlbBibWscibmpFd1M6hZZVNLGtQvbkgCu6sa5GTGNdZbudLx0aGE30Rb00Fapi0C6x');

var dataZoomies = [
  {"name" : "Zoomie1", "price" : 20, "image" : "/images/plush-1.png"},
  {"name" : "Zoomie2", "price" : 20, "image" : "/images/plush-2.png"},
  {"name" : "Zoomie3", "price" : 20, "image" : "/images/plush-3.png"},
  {"name" : "Zoomie4", "price" : 20, "image" : "/images/plush-4.png"},
  {"name" : "Zoomie5", "price" : 20, "image" : "/images/plush-5.png"}
];

// req.query -> get 
// req.body -> post

/* GET home page. */
router.get('/', function(req, res, next) {

  if (!req.session.dataCardZoomies) {
    req.session.dataCardZoomies = [];
  }

  res.render('index', {title: "Zoomies", dataCardZoomies:req.session.dataCardZoomies, dataZoomies:dataZoomies});
});


router.get('/basket', function(req, res, next) {

  var alreadyExists = false;

  for (var i=0 ; i<req.session.dataCardZoomies.length ; i++) {
    if (req.session.dataCardZoomies[i].name == req.query.zoomieNameFromFront) {
      req.session.dataCardZoomies[i].quantity ++;
      alreadyExists = true;
    }
  }

  if (alreadyExists == false && req.query.zoomieNameFromFront) {
    req.session.dataCardZoomies.push(
      {"name" : req.query.zoomieNameFromFront, "price" : req.query.zoomiePriceFromFront, "image" : req.query.zoomieImageFromFront, "quantity" : 1}
    );
  }

  res.render('basket', { title: 'Zoomies', dataCardZoomies:req.session.dataCardZoomies});
});


router.get('/delete-basket', function(req, res, next) {

  req.session.dataCardZoomies.splice([req.query.position], 1);

  res.render('basket', {title: "Zoomies", dataCardZoomies:req.session.dataCardZoomies});
});


router.post('/update-basket', function(req, res, next) {

  req.session.dataCardZoomies[req.body.position].quantity = req.body.quantity;

  res.render('basket', {title: "Zoomies", dataCardZoomies:req.session.dataCardZoomies});
});


router.post('/create-checkout-session', async (req, res) => {

  if (!req.session.dataCardZoomies) {
    req.session.dataCardZoomies = [];
  }

  var stripeItems = [];

  for (var i=0 ; i<req.session.dataCardZoomies.length ; i++) {
    stripeItems.push(
      {price_data: {
        currency: 'eur',
        product_data: {
          name: req.session.dataCardZoomies[i].name,
        },
        unit_amount: req.session.dataCardZoomies[i].price * 100,
      },
      quantity: req.session.dataCardZoomies[i].quantity
    })
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: stripeItems,
    mode: 'payment',
    success_url: 'http://localhost:3000/success-payment',
    cancel_url: 'http://localhost:3000/cancel-payment',
  });

  res.redirect(303, session.url);
});


router.get('/success-payment', function(req, res, next) {
  res.render('success-payment', {title: "Zoomies"});
});


router.get('/cancel-payment', function(req, res, next) {
  res.render('cancel-payment', {title: "Zoomies"});
});

module.exports = router;