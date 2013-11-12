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

  // Transition from a specific state to the inital state (or something 'clean')
  // ----

  this.dispose = function() {
    __super__.dispose.call(this);
    this.view.dispose();
  };

  // Transition to a specific state
  // ----

  this.transition = function(newState, cb) {

    // handle reflexiv transitions
    if (newState.name === this.state.name) {
      var skipTransition;
      switch (state.name) {
      case "library":
        skipTransition = true;
      case "collection":
        skipTransition = (this.state.data["collectionId"] === newState.data["collectionId"]);
        break;
      case "reader":
        skipTransition = (this.state.data["collectionId"] === newState.data["collectionId"] &&
                          this.state.data["documentId"] === newState.data["documentId"]);
        break;
      }
      if (skipTransition) return cb(null, skipTransition);
    }

    if (this.childController) {
      this.childController.dispose();
      this.childController = null;
    }

    switch (newState.name) {
    case "library":
      this.openLibrary();
      return cb(null);
    case "collection":
      this.openCollection(newState.data);
      return cb(null);
    case "reader":
      this.openReader(newState.data, cb);
      break;
    default:
      throw new Error("Illegal application state "+newState);
    }
  };

  this.afterTransition = function() {
    this.view.onStateChanged();
  };

  this.openReader = function(args, cb) {
    var self = this;

    var docId = args["documentId"];
    var record = this.library.get(docId);

    this.documentLoader.load(docId, url, function(error, doc) {
      if (error) return cb(error);
      self.childController = new ReaderController(doc);
      cb(null);
    });
  };

  this.openLibrary = function() {
    this.childController = new LibraryController(this.library);
  };

  this.openCollection = function(args) {
    this.childController = new CollectionController(this.library.getCollection(args["collectionId"]));
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
