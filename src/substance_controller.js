"use strict";

var _ = require("underscore");
var util = require("substance-util");
var Controller = require("substance-application").Controller;
var SubstanceView = require("./substance_view");
var Library = require("substance-library");
var LibraryController = Library.Controller;
var CollectionController = Library.Collection.Controller;
var Article = require("substance-article");
var ReaderController = require("substance-reader").Controller;
var DocumentLoader = require("./document_loader");

// Substance.Controller
// -----------------
//
// Main Application Controller

var SubstanceController = function(config) {
  Controller.call(this);

  this.config = config;
  this.documentLoader = new DocumentLoader();

  // Library instance will be loaded by initialize
  this.library = null;
};


SubstanceController.Prototype = function() {
  var __super__ = Controller.prototype;

  var that = this;

  // Aplication state handling
  // -------

  // Transition from inital state to a specific state
  // ----

  this.initialize = function(newState, cb) {
    var self = this;
    this.loadLibrary(this.config.library_url, function(error, library) {
      if (error) return cb(error);
      self.library = library;
      cb(null);
    });
  };


  // Transition to a specific state
  // ----

  this.transition = function(newState, cb) {

    // handle reflexiv transitions
    if (newState.id === this.state.id) {
      var skipTransition;
      switch (this.state.id) {
      case "library":
        skipTransition = true;
        break;
      case "collection":
        skipTransition = (this.state["collectionId"] === newState["collectionId"]);
        break;
      case "reader":
        skipTransition = (this.state["collectionId"] === newState["collectionId"] &&
                          this.state["documentId"] === newState["documentId"]);
        break;
      case "testcenter":
        skipTransition = true;
        break;
      }
      if (skipTransition) {
        return cb(null, skipTransition);
      }
    }

    if (this.childController) {
      this.childController.dispose();
      this.childController = null;
    }

    // HACK: Test center does not fit into the current

    switch (newState.id) {
    case "library":
      this.openLibrary();
      
      return cb(null);
    case "collection":
      this.openCollection(newState);
      return cb(null);
    case "reader":
      this.openReader(newState, cb);
      break;
    case "testcenter":
      this.openTestCenter(newState);
      return cb(null);
    default:
      throw new Error("Illegal application state " + newState);
    }
  };


  this.afterTransition = function() {
    if (this.view) {
      this.view.transition(this.state);
    }
  };


  // Initial view creation
  // ===================================

  this.createView = function() {
    var view = new SubstanceView(this);
    this.view = view;
    return view;
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
        if(typeof data == 'string') data = $.parseJSON(data);
        doc = Article.fromSnapshot(data);

        _onDocumentLoad(err, doc);  
      })
    .fail(function(err) {
      console.error(err);
    });
  };


  this.openReader = function(args, cb) {
    var docId = args["documentId"];

    var self = this;
    var collectionId = args["collectionId"];
    var record = this.library.get(docId);
    this.documentLoader.load(docId, record.url, function(err, doc) {
      if (err) return cb(err);
      self.__openReader(doc, collectionId, cb);
    });
  };

  this.__openReader = function(doc, collectionId, cb) {
    var self = this;
    var options = {
      back: function() {
        // update the library record
        var libRecord = self.library.get(doc.id);

        self.switchState({
          id: "collection",
          collectionId: collectionId
        });
      }
    };

    self.childController = new ReaderController(doc, options);
    cb(null);
  };


  // Obsolete?
  // 
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


  this.openLibrary = function() {
    this.childController = new LibraryController(this.library);
  };


  this.openCollection = function(args) {
    var collection = this.library.getCollection(args["collectionId"]);
    this.childController = new CollectionController(collection, {
      "import": this.importDocument.bind(this),
      "delete": this.deleteDocument.bind(this)
    });
  };

  // Loaders
  // --------

  this.loadLibrary = function(url, cb) {
    var that = this;
    $.getJSON(url, function(data) {
      var library = new Library({
        seed: data
      });
      cb(null, library);
    }).error(cb);
  };

  this.importDocument = function(collectionId, docData, cb) {
    var self = this;
    this.library.__backend__.seedDocument(collectionId, docData, function(error) {
      if (error) return cb(error);
      var state = [];
      state.push({id: "reader", collectionId: collectionId, documentId: docData.id});
      state.push({id: "main", contextId: "toc"});
      self.switchState(state, {updateRoute: true, replace: true}, cb);
    });
  };

  this.deleteDocument = function(collectionId, docId, cb) {
    this.library.__backend__.deleteDocument(collectionId, docId, cb);
  };

};

// Exports
// --------

SubstanceController.Prototype.prototype = Controller.prototype;
SubstanceController.prototype = new SubstanceController.Prototype();
_.extend(SubstanceController.prototype, util.Events);

module.exports = SubstanceController;
