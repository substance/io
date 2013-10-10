#!/usr/bin/env node

var http = require('http');
var express = require('express');
var path = require('path');
var CommonJSServer = require("substance-application/commonjs");
var _ = require("underscore");

var IO = require("./src/io");

IO.LIBRARY_BASEDIR = process.argv[2] || process.cwd();

// Useful general purpose helpers
// --------
//

function getFile(url, cb) {
  var request = require("request");

  request(url, function (err, res, body) {
    if (err || res.statusCode !== 200) return cb(err || 'Nope');
    cb(null, body);
  });
};

var fs = require("fs");

var app = express();
var commonJSServer = new CommonJSServer(__dirname);

commonJSServer.boot({alias: "substance", source: "./src/substance.js"});

var port = process.env.PORT || 5000;
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());

app.get("/",
  function(req, res, next) {

    var config = require("./project.json");
    var template = fs.readFileSync(__dirname + "/index.html", 'utf8');
    var scripts = commonJSServer.list();

    var scriptsTags = scripts.map(function(script) {
      return ['<script type="text/javascript" src="/scripts', script, '"></script>'].join('');
    }).join('\n');

    var styleTags = _.map(config.styles, function(path, alias) {
      return ['<link href="', path, '" rel="stylesheet" type="text/css"/>'].join('');
    }).join("\n");

    var result = template.replace('#####scripts#####', scriptsTags);
    result = result.replace('#####styles#####', styleTags);

    res.send(result);
  }
);

app.use('/lib', express.static(__dirname+'/lib'));
app.use('/lib/substance', express.static(__dirname+'/node_modules'));
app.use('/node_modules', express.static(__dirname+'/node_modules'));
app.use('/styles', express.static(__dirname+'/styles'));
app.use('/src', express.static(__dirname+'/src'));
app.use('/data', express.static(__dirname+'/data'));
app.use('/config', express.static(__dirname+'/config'));
app.use('/images', express.static(__dirname+'/images'));
app.use('/docs', express.static(IO.LIBRARY_BASEDIR));

app.get("/scripts*",
  function(req, res, next) {
    var scriptPath = req.params[0];
    res.type('text/javascript');
    try {
      var script = commonJSServer.getScript(scriptPath);
      res.send(script);
    } catch (err) {
      res.send(err.stack);
    }
  }
);

// Compile document on the fly in dev mode
// -----------

app.get('/docs/:collection/:doc/content.json', function(req, res) {
  var collection = req.params.collection;
  var docId = req.params.doc;

  IO.compileDocument(collection, docId, function(err, doc) {
    if (err) return res.send(500, err);
    res.json(doc);
  });
});

// Dynamically generate library based on `docs` directory structure.
// -----------

app.get('/library.json', function(req, res) {
  var library = IO.extractLibrary();
  res.json(library);
});


app.use(app.router);

http.createServer(app).listen(port, function(){
  console.log("Substance.io running on port " + port);
  console.log("http://127.0.0.1:"+port+"/");
});
