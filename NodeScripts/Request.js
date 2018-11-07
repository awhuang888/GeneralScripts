const request = require('request');

// request('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY', { json: true }, (err, res, body) => {
//   if (err) { return console.log(err); }
//   console.log(res.body);
//   console.log(body.url);
//   console.log(body.explanation);
// });

request('https://www.woolworths.com.au/shop/productdetails/365190', { json: false }, (err, res, body) => {
  if (err) { return console.log(err); }
  console.log(res);
  //console.log(body.url);
  //console.log(body.explanation);
});