"use strict";

var _ = require("underscore");
var util = require("substance-util");
var Controller = require("substance-application").Controller;
var SubstanceView = require("./substance_view");
var Library = require("substance-library");
var LibraryController = Library.Controller;
var CollectionController = Library.Collection.Controller;
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

  // Library instance
  // --------
  // will be loaded by initialize
  this.library = null;

  // State: 'library'
  // --------
  //
  var libraryCtrl = null;

  // State: 'collection'
  // --------
  //
  var collectionCtrl = null;
  var collectionId = null;

  // State: 'reader'
  // --------
  //
  var readerCtrl = null;
  // var collectionId = null // shared with 'collection'
  var docId = null;
  var document = null;
};

SubstanceController.Prototype = function() {

  // TODO:
  // - transfer the current state to the `Meditation on App States`
  //    - state `START` ~ initialize / dispose
  // - Describe how the application would use this to switch states
  //    - hierarchical state object
  //    - dispatching to controller hierarchy
  // - Make States more convenient
  //    - name + attributes + childControllers
  //    - dispose method
  // - we should not trigger state changes here.
  //   instead this should be done in the general Controller implementation,
  //   and delivered to the app for communication/firing events.

  var __super__ = Controller.prototype;

  // Aplication state handling
  // -------

  // Note: every Controller needs its own transition map
  this.transitions = _.({}, __super__.transitions);

  // Transition from inital state to a specific state
  // ----

  this.initialize = function(newState, args) {
    var self = this;
    this.loadLibrary(this.config.library_url, function(error) {
      if (error) {
        console.error(error);
        return;
      }
      this.__switchTo(newState, args);
    });
  };

  // Transition from a specific state to the inital state (or something 'clean')
  // ----

  this.dispose = function() {
    __super__.dispose.call(this);
  };

  // Transition from 'library' state
  // ----

  this.transitions["library"] = function(newState, args) {
    // reflexive transition
    if (newState === "library") {
      return;
    }

    this.libraryCtrl.dispose();
    this.libraryCtrl = null;
    this.__switchTo(newState, args);
  };

  // Transition from 'collection' state
  // ----

  this.transitions["collection"] = function(newState, args) {
    // reflexive transition: do nothing if the right collection is already open
    if (newState === "collection" && this.collectionId === args["collectionId"]) {
      return;
    }

    this.collectionCtrl.dispose();
    this.collectionCtrl = null;
    this.collectionId = null;
    this.__switchTo(newState, args);
  };

  // Transition from 'reader' state
  // ----

  this.transitions["reader"] = function(newState, args) {
    if (newState === "reader" && this.documentId === args["documentId"]) {
      return;
    }

    this.readerCtrl.dispose();
    this.readerCtrl = null;
    this.collectionId = null;
    this.documentId = null;
    this.document = null;
    this.__switchTo(newState, args);
  };

  // Helper function that dispatches the state switch
  // TODO: that could be done via convention, e.g., `open<Statename>(args)`
  this.__switchTo = function(newState, args) {
    switch (newState) {
    case "library":
      this.openLibrary(args);
      break;
    case "collection":
      this.openCollection(args);
      break;
    case "reader":
      this.openReader(args);
      break;
    };
  };


  this.openReader = function(args) {
    var self = this;

    var docId = args["documentId"];
    var record = this.library.get(docId);

    this.documentLoader.load(docId, url, function(error, doc) {
      if (error) {
        console.error(error);
        return;
      }
      self.collectionId = args["collectionId"];
      self.documentId = args["documentId"];
      self.document = doc;
      self.readerCtrl = new ReaderController(doc);
      self.children["reader"] = self.readerCtrl;
      self.state = "reader";
      self.trigger('state-changed', "reader");
    });
  };

  this.openLibrary = function() {
    this.libraryCtrl = new LibraryController(this.library);
    this.children["library"] = this.libraryCtrl;
    this.state = "library";
    this.trigger('state-changed', "library");
  };

  this.openCollection = function(args) {
    this.collectionId = args["collectionId"];
    this.collectionCtrl = new CollectionController(this.library.getCollection(this.collectionId));
    this.children["collection"] = this.collectionCtrl;
    this.state = "collection";
    this.trigger('state-changed', "collection");
  };

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
};


// Exports
// --------

SubstanceController.Prototype.prototype = Controller.prototype;
SubstanceController.prototype = new SubstanceController.Prototype();
_.extend(SubstanceController.prototype, util.Events);

module.exports = SubstanceController;
