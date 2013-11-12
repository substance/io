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

  // Library instance will be loaded by initialize
  this.library = null;
};

SubstanceController.Prototype = function() {

  var __super__ = Controller.prototype;

  // Aplication state handling
  // -------

  this.transitions = {};

  // Transition from inital state to a specific state
  // ----

  this.initialize = function(newState, args, cb) {
    var self = this;
    this.loadLibrary(this.config.library_url, function(error, library) {
      if (error) return cb(error);
      self.library = library;
      self.openState(newState, args, cb);
    });
  };

  // Transition from a specific state to the inital state (or something 'clean')
  // ----

  this.dispose = function() {
    __super__.dispose.call(this);
    this.view.dispose();
  };

  // Transition from 'library' state
  // ----

  this.transitions["library"] = function(newState, args, cb) {
    // reflexive transition
    if (newState === "library") {
      console.log("no state change needed");
      return cb(null);
    }
    this.childController.dispose();
    this.openState(newState, args, cb);
  };

  // Transition from 'collection' state
  // ----

  this.transitions["collection"] = function(newState, args, cb) {
    // reflexive transition: do nothing if the right collection is already open
    if (newState === "collection" && this.state.data["collectionId"] === args["collectionId"]) {
      console.log("no state change needed");
      return cb(null);
    }
    this.childController.dispose();
    this.openState(newState, args, cb);
  };

  // Transition from 'reader' state
  // ----

  this.transitions["reader"] = function(newState, args, cb) {
    if (newState === "reader" && this.state.data["documentId"] === args["documentId"]) {
      console.log("no state change needed");
      return cb(null);
    }
    this.childController.dispose();
    this.openState(newState, args, cb);
  };

  // Helper function that dispatches the state switch
  // TODO: that could be done via convention, e.g., `open<Statename>(args)`
  this.openState = function(newState, args, cb) {
    var self = this;

    function _after(err) {
      if (err) return cb(err);
      self.view.onStateChanged();
      cb(null);
    }

    switch (newState) {
    case "library":
      this.openLibrary();
      _after();
      break;
    case "collection":
      this.openCollection(args);
      _after();
      break;
    case "reader":
      this.openReader(args, _after);
      break;
    }
  };

  this.openReader = function(args, cb) {
    var self = this;

    var docId = args["documentId"];
    var record = this.library.get(docId);

    this.documentLoader.load(docId, url, function(error, doc) {
      if (error) return cb(error);

      self.childController = new ReaderController(doc);
      self.setState("reader", {
        "collectionId": args["collectionId"],
        "documentId": args["documentId"],
        "document": doc
      });

      cb(null);
    });
  };

  this.openLibrary = function() {
    this.childController = new LibraryController(this.library);
    this.setState("library");
  };

  this.openCollection = function(args) {
    this.childController = new CollectionController(this.library.getCollection(args["collectionId"]));
    this.setState("collection", {
      "collectionId": args["collectionId"]
    });
  };

  // Initial view creation
  // ===================================

  this.createView = function() {
    if (!this.view) this.view = new SubstanceView(this);
    return this.view;
  };

  // Loaders
  // --------

  this.loadLibrary = function(url, cb) {
    var that = this;
    if (this.__library) return cb(null);

    $.getJSON(url, function(data) {
      var library = new Library({
        seed: data
      });
      cb(null, library);
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
