
const puppeteer = require('puppeteer');
const $ = require('cheerio');
//const url = 'https://www.reddit.com';
const url = 'https://www.woolworths.com.au/shop/productdetails/365190';
var lhtml ='';

//var newbrowser;
puppeteer
  .launch()
  .then(function(browser) {
    newbrowser = brower;
    return browser.newPage();
  })
  .then(function(page) {
    return page.goto(url, {waitUntil: 'networkidle0'}).then(function() {
      return page.content();
    });
  })
  .then(function(html) {
    // $('span.price-cents', html).each(function() {
    //   console.log();
    //});
    lhtml = html;
    console.log($('span.price-dollars', lhtml).text());
    console.log($('span.price-cents', lhtml).text());
  })
  //.then(()=> newbrowser.close())
  .catch(function(err) {
    //handle error
  });

//   console.log($('span.price-dollars', lhtml).text());
//   console.log($('span.price-cents', lhtml).text());