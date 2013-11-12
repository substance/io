"use strict";

var _ = require("underscore");
var Router = require("substance-application").Router;

var SubstanceRouter = function(app, routes) {
  Router.call(this);

  this.app = app;

  _.each(routes, function(route) {
    if (!this[route.command]) {
      console.error("Unknown route handler: ", route.command);
    } else {
      this.route(route.route, route.name, _.bind(this[route.command], this));
    }
  }, this);
};

SubstanceRouter.Prototype = function() {

  this.start = function() {
    Router.history.start();
  };

  this.openState = function() {
    // If no state is specified via query string
    // open the library view
    if (window.location.search === "") {
      this.openLibrary();
    } else {
      var state = this.app.extractStateFromURL(window.location.search);
      this.app.switchState(state);
    }
  };

  this.openLibrary = function() {
    var data = [];

    data.push({id: "library"});

    this.app.switchState(data);
  };

  this.openCollection = function(collectionId) {
    var data = [];

    data.push({id: "collection", collectionId: collectionId});

    this.app.switchState(data);
  };

  this.openReader = function(collectionId, documentId) {
    var data = [];

    data.push({id: "reader", collectionId: collectionId, documentId: documentId});

    // TODO: add data to specify the ReaderController state

    this.app.switchState(data);
  };

};

SubstanceRouter.Prototype.prototype = Router.prototype;
SubstanceRouter.prototype = new SubstanceRouter.Prototype();

module.exports = SubstanceRouter;
