// const rp = require('request-promise');
// const cheerio = require('cheerio');

// const options = {
//     uri: `https://www.woolworths.com.au/shop/productdetails/365190`,
//     transform: function (body) {
//       return cheerio.load(body);
//     }
//   };

//   const rp = require('request-promise');
// const cheerio = require('cheerio');
// const options = {
//   uri: `http://www.recreo.com.au`,
//   transform: function (body) {
//     return cheerio.load(body);
//   }
// };

// rp(options)
//   .then(($) => {
//     $().html()
//     //console.log($);
//   })
//   .catch((err) => {
//     console.log(err);
//   });


const rp = require('request-promise');
const $ = require('cheerio');
//const url = 'https://en.wikipedia.org/wiki/List_of_Presidents_of_the_United_States';
const url = 'https://www.woolworths.com.au/shop/productdetails/365190';

rp(url)
  .then(function(html){
    //success!
    console.log($('.price-dollars', html).length);
    console.log($('.price-dollars', html).text());
  })
  .catch(function(err){
    //handle error
  });