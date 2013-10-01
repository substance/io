var http = require('http');
var express = require('express');
var path = require('path');
var CommonJSServer = require("substance-application/commonjs");
var ConverterServer = require("substance-converter/src/server");
var _ = require("underscore");

var extendArticle = require("./src/extend-article");

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

// var Converter = require("substance-converter");

var Handlebars = require("handlebars");
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

    console.log('YOYO');
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

app.use('/lib', express.static('lib'));
app.use('/lib/substance', express.static('node_modules'));
app.use('/node_modules', express.static('node_modules'));
app.use('/styles', express.static('styles'));
app.use('/src', express.static('src'));
app.use('/data', express.static('data'));
app.use('/config', express.static('config'));
app.use('/images', express.static('images'));
app.use('/docs', express.static('docs'));

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


// Serve the Substance Converter
// Provides on the fly conversion for different markup formats
// --------

var converter = new ConverterServer(app);
// converter.serve();


app.get('/:collection/:doc/content.json', function(req, res) {
  var collection = req.params.collection;
  var docId = req.params.doc;

  try {
    var filename = __dirname + "/docs/"+collection+"/"+docId+"/content.md";
    var inputData = fs.readFileSync(filename, 'utf8');

    var resourcesFile = __dirname + "/docs/"+collection+"/"+docId+"/resources.json";
    var resources = null;
    if (fs.existsSync(resourcesFile)) {
      var resourcesData = fs.readFileSync(resourcesFile, 'utf8');
      resources = JSON.parse(resourcesData);
    };

    converter.convert(inputData, 'markdown', 'substance', function(err, doc) {
      if (err) {
        console.error(err);
        return res.send(500, err);
      }

      extendArticle(doc, resources);

      var output = doc.toJSON();
      output.id = docId;
      output.nodes.document.guid = docId;

      // console.log('writing file to "/docs/'+collection+'/'+docId+'/content.json"');
      // fs.writeFileSync(__dirname + "/docs/"+collection+"/"+docId+"/content.json", JSON.stringify(output, null, '  '));

      res.send(output);
    });
  } catch (err) {
    var filename = __dirname + "/docs/"+collection+"/"+docId+"/index.json";
    var inputData = fs.readFileSync(filename, 'utf8');
    res.send(inputData);
  }
});


// Dynamically generate library based on `docs` directory structure.
// -----------

app.get('/library.json', function(req, res) {
  var library = {
    "nodes": {
      "library": {
        "collections": [],
        "name": "Your documents"
      }
    }
  };

  var collections = fs.readdirSync(__dirname + "/docs");

  _.each(collections, function(c) {
    var cStat = fs.statSync(__dirname + "/docs/"+ c);
    if (cStat.isFile()) return; // only consider directories

    var meta = JSON.parse(fs.readFileSync(__dirname + "/docs/"+c+"/index.json", "utf8"));
    console.log('COLLECTION', meta);

    library.nodes[c] = {
      "id": c,
      "name": meta.name,
      "description": meta.description,
      "type": "collection",
      "records": []
    };

    if (meta.published) {
      library.nodes.library.collections.push(c);
    }

    var documents = fs.readdirSync(__dirname + "/docs/"+c);
    _.each(documents, function(d) {
      if (d === ".DS_Store" || d === "index.json") return;

      // TODO: Read index.json for meta information
      var meta = JSON.parse(fs.readFileSync(__dirname + "/docs/"+c+"/"+d+"/index.json", "utf8"));

      library.nodes[d] = {
        "id": d,
        "url": meta.url ? meta.url : c+"/"+d+"/content.json",
        "authors": _.pluck(meta.authors, 'name'),
        "title": meta.title
      };

      if (meta.published) {
        library.nodes[c].records.push(d);
      }
    });
  });

  res.json(library);
});


app.use(app.router);

http.createServer(app).listen(port, function(){
  console.log("Substance.io running on port " + port);
  console.log("http://127.0.0.1:"+port+"/");
});
