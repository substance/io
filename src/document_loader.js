"use strict";

var Converter = require("lens-converter");
var LensArticle = require("lens-article");
var Article = require("substance-article");
var Converter = require("lens-converter");

var DocumentLoader = function() {
};

DocumentLoader.Prototype = function() {

  this.load = function(documentId, url, cb) {
    $.get(url)
    .done(function(data) {
        var doc;
        var xml = $.isXMLDoc(data);

        // Process XML file
        if(xml) {
          var importer = new Converter.Importer();
          doc = importer.import(data);

          // Hotpatch the doc id, so it conforms to the id specified in the library file
          doc.id = documentId;
          console.log('ON THE FLY CONVERTED DOC', doc.toJSON());
        }
        // Process JSON file
        else {
          if(typeof data == 'string') data = $.parseJSON(data);
          if (data.schema && data.schema[0] === "lens-article") {
            doc = LensArticle.fromSnapshot(data);
          } else {
            doc = Article.fromSnapshot(data);
          }
        }
        cb(null, doc);
      })
    .fail(function(err) {
      console.error(err);
      cb(err);
    });
  };

};

DocumentLoader.__prototype__ = new DocumentLoader.Prototype();

module.exports = DocumentLoader;
