"use strict";

var _ = require("underscore");
var util = require("substance-util");
var Controller = require("substance-application").Controller;
var SubstanceView = require("./substance_view");
var Library = require("substance-library");
var LibraryController = Library.Controller;
var CollectionController = Library.Collection.Controller;
// var LensArticle = require("lens-article");
var Article = require("substance-article");
var ReaderController = require("substance-reader").Controller;
// var Converter = require("lens-converter");


// Substance.Controller
// -----------------
//
// Main Application Controller

var SubstanceController = function(config) {
  Controller.call(this);

  this.config = config;

  // Main controls
  this.on('open:reader', this.openReader);
  this.on('open:library', this.openLibrary);
  this.on('open:login', this.openLogin);
};


SubstanceController.Prototype = function() {

  var that = this;

  // Initial view creation
  // ===================================

  this.createView = function() {
    var view = new SubstanceView(this);
    this.view = view;
    return view;
  };

  // Loaders
  // --------

  this.loadLibrary = function(url, cb) {
    var that = this;
    if (this.__library) return cb(null);

    $.getJSON(url, function(data) {
      that.__library = new Library({
        seed: data
      });
      cb(null);
    }).error(cb);
  };

  // Update Hash fragment
  // --------
  // 

  this.updatePath = function(state) {
    var path = [this.state.collection, this.state.document];

    path.push(state.context);

    if (state.node) {
      path.push(state.node);
    } else {
      path.push('all');
    }

    if (state.resource) {
      path.push(state.resource);
    }

    if (state.fullscreen) {
      path.push('fullscreen');
    }

    window.app.router.navigate(path.join('/'), {
      trigger: false,
      replace: false
    });
  };

  // Transitions
  // ===================================

  var _LOCALSTORE_MATCHER = new RegExp("^localstore://(.*)");

  var _open = function(state, documentId) {

    var that = this;
    var _onDocumentLoad = function(err, doc) {
      if (err) {
        console.log(err.stack);
        throw err;
      }

      that.reader = new ReaderController(doc, state, {
        // This needs better names indeed
        collection: {
          name: that.__library.get(that.state.collection).name,
          url: "#"+that.state.collection
        }
      });

      // Trigger URL Fragment update on every state change
      that.reader.on('state-changed', function() {
        that.updatePath(that.reader.state);
      });

      that.modifyState({
        context: 'reader'
      });
    };

    // HACK: for activating the NLM importer ATM it is not possible
    // to leave the loading to the library as it needs the Lens Converter for that.
    // Options:
    //  - provide the library with a document loader which would be constructed here
    //  - do the loading here
    // prefering option2 as it is simpler to achieve...

    var record = this.__library.get(documentId);

    $.get(record.url)
    .done(function(data) {
        var doc, err;

        // Determine type of resource
        // var xml = $.isXMLDoc(data);

        // // Process XML file
        // if(xml) {
        //   var importer = new Converter.Importer();
        //   doc = importer.import(data);

        //   // Hotpatch the doc id, so it conforms to the id specified in the library file
        //   doc.id = documentId;
        //   console.log('ON THE FLY CONVERTED DOC', doc.toJSON());

        //   // Process JSON file
        // } else {
        if(typeof data == 'string') data = $.parseJSON(data);

        doc = Article.fromSnapshot(data);
        
        // if (data.schema && data.schema[0] === "lens-article") {
        //   doc = LensArticle.fromSnapshot(data);
        // } else {
          
        // }
        // }
        _onDocumentLoad(err, doc);  
      })
    .fail(function(err) {
      console.error(err);
    });
  };

  this.openAbout = function() {
    this.openReader("substance", "about", "toc");
    app.router.navigate('substance/about', false);
  };

  this.openReader = function(collectionId, documentId, context, node, resource, fullscreen) {
    console.log('Controller#openReader');

    // The article view state
    var state = {
      context: context || "toc",
      node: node,
      resource: resource,
      fullscreen: !!fullscreen,
    };

    var prevDocument = this.state.document;

    // Substance Controller state
    this.state = {
      collection: collectionId,
      document: documentId,
    };

    // If state change happens within a document context,
    // just trigger a state update
    // TODO: This implementation is rather hacky, we need a better solution for maintaining
    // the current app state.

    if (documentId === prevDocument) {
      this.reader.modifyState(state);
      // HACK: monkey patch alert
      if (state.resource) this.reader.view.jumpToResource(state.resource);
    } else {
      if (collectionId === "substance" && documentId === "article") {
        return this.openArticle(state);
      }
      this.loadLibrary(this.config.library_url, _open.bind(this, state, documentId));
    }
  };


 this.openArticle = function(state) {
    var that = this;
    var doc = Article.describe();
    this.reader = new ReaderController(doc, state);

    // Trigger URL Fragment update on every state change
    that.reader.on('state-changed', function() {
      that.updatePath(that.reader.state);
    });

    this.modifyState({
      context: 'reader'
    });

    // Substance Controller state
    this.state = {
      collection: "substance",
      document: "article"
    };
  };


  // Open Library
  // --------

  this.openLibrary = function(collectionId) {
    var that = this;

    function open() {
      // Defaults to lens collection
      var state = {
        context: 'library'
        // collection: collectionId || that.__library.collections[0].id
      };

      that.library = new LibraryController(that.__library, state);
      that.modifyState(state);
    }

    // Ensure the library is loaded
    this.loadLibrary(this.config.library_url, open);
  };


  this.openCollection = function(collectionId) {
    var that = this;

    function open() {
      // Defaults to lens collection
      var state = {
        context: 'collection',
        collection: collectionId
      };

      that.collection = new CollectionController(that.__library.getCollection(collectionId), state);
      that.modifyState(state);
    }

    // Ensure the library is loaded
    this.loadLibrary(this.config.library_url, open);
  };


  this.openSubmission = function() {
    console.log('NOT YET IMPLEMENTED');
  };


  // Provides an array of (context, controller) tuples that describe the
  // current state of responsibilities
  // --------
  //
  // E.g., when a document is opened:
  //    ["application", "document"]
  // with controllers taking responisbility:
  //    [this, this.document]
  //
  // The child controller (e.g., document) should itself be allowed to have sub-controllers.
  // For sake of prototyping this is implemented manually right now.
  // TODO: discuss naming

  this.getActiveControllers = function() {
    var result = [ ["sandbox", this] ];

    var context = this.state.context;

    if (context === "article") {
      result = result.concat(this.article.getActiveControllers());
    } else if (context === "library") {
      result = result.concat(["library", this.library]);
    }
    return result;
  };
};


// Exports
// --------

SubstanceController.Prototype.prototype = Controller.prototype;
SubstanceController.prototype = new SubstanceController.Prototype();
_.extend(SubstanceController.prototype, util.Events);

module.exports = SubstanceController;
