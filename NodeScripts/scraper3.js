const puppeteer = require('puppeteer');
const fs = require('fs');
(async() => {
const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.woolworths.com.au/shop/productdetails/365190', {waitUntil: 'networkidle0'});
  const html = await page.content();
//save our html in a file
fs.writeFile('page.html', html, _ => console.log('HTML saved'));
//... do some stuff
  await browser.close();
  })();