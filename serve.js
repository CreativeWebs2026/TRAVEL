var http = require("http");
var fs = require("fs");
var path = require("path");

var root = __dirname;
var port = process.env.PORT || 5173;

var mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon"
};

var server = http.createServer(function (req, res) {
  var reqPath = req.url.split("?")[0];
  if (reqPath === "/") reqPath = "/index.html";
  var filePath = path.join(root, decodeURIComponent(reqPath));
  if (filePath.indexOf(root) !== 0) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, function (err, data) {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found: " + reqPath);
      return;
    }
    var ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mime[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(port, function () {
  console.log("TravelAI dev server running at http://localhost:" + port);
});
