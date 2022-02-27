const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url,(res) => {
      let body = "";
  
      res.on("data", (chunk) => {
        body += chunk;
      });
  
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          console.error(error.message);
        };
      });
    }).on("error", reject);
  })
}

module.exports = fetchJson;