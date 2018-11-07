
const puppeteer = require('puppeteer');
const $ = require('cheerio');
//const url = 'https://www.reddit.com';
const url = 'https://www.woolworths.com.au/shop/productdetails/365190';

puppeteer
  .launch()
  .then(function(browser) {
    return browser.newPage();
  })
  .then(function(page) {
    return page.goto(url).then(function() {
      return page.content();
    });
  })
//   .then(function(html) {
//     $('span.price-cents', html).each(function() {
//       console.log($(this).contents());
//     });
//   })
.then(function(html) {
    console.log(html);
  })
  .catch(function(err) {
    //handle error
  });