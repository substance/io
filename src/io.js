var fs = require('fs');
var _ = require('underscore');

var Converter = require("substance-converter");
var extendArticle = require("./extend_article");

// Serve the Substance Converter
// Provides on the fly conversion for different markup formats
// --------

var converter = new Converter();


// The IO tool
// --------------------

var IO = function() {

};

IO.LIBRARY_BASEDIR = process.cwd();

// From a document repository, extracts a library.json file
// --------------------
//

IO.extractLibrary = function() {
  var library = {
    "nodes": {
      "library": {
        "collections": [],
        "name": "Your documents"
      }
    }
  };

  var collections = fs.readdirSync(IO.LIBRARY_BASEDIR);

  _.each(collections, function(c) {
    var cStat = fs.statSync(IO.LIBRARY_BASEDIR+ "/"+ c);
    if (c === ".git") return; // Ignore .git folder
    if (cStat.isFile()) return; // only consider directories

    var meta = JSON.parse(fs.readFileSync(IO.LIBRARY_BASEDIR +"/"+c+"/index.json", "utf8"));

    library.nodes[c] = {
      "id": c,
      "name": meta.name,
      "description": meta.description,
      "image": meta.image,
      "updated_at": meta.updated_at,
      "type": "collection",
      "records": []
    };

    if (meta.published) {
      library.nodes.library.collections.push(c);
    }

    var documents = fs.readdirSync(IO.LIBRARY_BASEDIR+ "/"+c);
    _.each(documents, function(d) {
      if (d === ".DS_Store" || d === "index.json") return;

      // TODO: Read index.json for meta information
      var meta = JSON.parse(fs.readFileSync(IO.LIBRARY_BASEDIR+ "/"+c+"/"+d+"/index.json", "utf8"));

      library.nodes[d] = {
        "id": d,
        "url": meta.url ? meta.url : "docs/"+c+"/"+d+"/content.json",
        "authors": _.pluck(meta.collaborators, 'name'),
        "title": meta.title,
        "published_on": meta.published_on
      };

      if (meta.published) {
        library.nodes[c].records.push(d);
      }
    });
  });
  return library;
};


// Compile a single document from markdown, resources and metadata.
// --------
//

IO.compileDocument = function(collection, docId, cb) {

  try {
    var filename = IO.LIBRARY_BASEDIR+"/"+collection+"/"+docId+"/content.md";
    var inputData = fs.readFileSync(filename, 'utf8');

    var metaFile = IO.LIBRARY_BASEDIR+"/"+collection+"/"+docId+"/index.json";
    var meta = null;

    if (fs.existsSync(metaFile)) {
      var metaData = fs.readFileSync(metaFile, 'utf8');
      meta = JSON.parse(metaData);
    }

    var resourcesFile = IO.LIBRARY_BASEDIR+"/"+collection+"/"+docId+"/resources.json";
    var resources = null;

    if (fs.existsSync(resourcesFile)) {
      var resourcesData = fs.readFileSync(resourcesFile, 'utf8');
      resources = JSON.parse(resourcesData);
    };

    converter.convert(inputData, 'markdown', 'substance', function(err, doc) {
      if (err) return cb(err);

      extendArticle(doc, resources, meta);

      var output = doc.toJSON();
      output.id = docId;
      output.nodes.document.guid = docId;

      cb(null, output);
    });
  } catch (err) {
    // Just record entries
    var filename = IO.LIBRARY_BASEDIR+"/"+collection+"/"+docId+"/index.json";
    var inputData = JSON.parse(fs.readFileSync(filename, 'utf8'));
    cb(null, inputData);
  }
};

module.exports = IO;
