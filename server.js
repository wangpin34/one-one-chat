const os = require('os');
const nodeStatic = require('node-static');
const http = require('http');;

const PORT = 8080;

const fileServer = new nodeStatic.Server('./static');
const app = http.createServer(function(req, res){
  fileServer.serve(req, res);
}).listen(PORT);
