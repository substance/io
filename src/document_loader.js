"use strict";

var Article = require("substance-article");
var _ = require("underscore");
var util = require("substance-util");
var Chronicle = require("substance-chronicle");


var DocumentLoader = function() {
};

DocumentLoader.Prototype = function() {

  var HTTP = /http:(.+)/;
  var LOCAL = /local:(.+)/;

  this.loadFromServer = function(url, cb) {
    console.log('loading document');
    $.get(url)
    .done(function(data) {
        var doc;
        if (typeof data == 'string') data = $.parseJSON(data);

        doc = Article.fromSnapshot(data);
        cb(null, doc);
      })
    .fail(function(err) {
      console.error(err);
      cb(err);
    });
  };

  this.load = function(documentId, url, cb) {
    this.loadFromServer(url, cb);
    return;
  };

};

DocumentLoader.prototype = new DocumentLoader.Prototype();

module.exports = DocumentLoader;