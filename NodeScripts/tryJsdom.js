const jsdom = require("jsdom");
const serializeDocument = require("jsdom").serializeDocument;
const { JSDOM } = jsdom;

const dom = new JSDOM(``, {
    url: "https://example.org/",
    referrer: "https://example.com/",
    contentType: "text/html",
    includeNodeLocations: true,
    runScripts: "dangerously",
    storageQuota: 10000000
  });

  //const cHtml = serializeDocument(dom);
  var content = dom.window.document.documentElement.outerHTML;
  console.log(content);