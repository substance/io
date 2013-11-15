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

  this.route(/^state=.*$/, "state", _.bind(this.openState, this));

};

SubstanceRouter.Prototype = function() {

  this.start = function() {
    Router.history.start();
  };

  var DEFAULT_OPTIONS = {
    updateRoute: false,
    replace: false
  }

  this.openState = function() {
    var fragment = Router.history.getFragment();
    var state = this.app.stateFromFragment(fragment);
    this.app.switchState(state, DEFAULT_OPTIONS);
  };

  this.openLibrary = function() {
    var state = [];
    state.push({id: "library"});
    this.app.switchState(state, DEFAULT_OPTIONS);
  };

  this.openCollection = function(collectionId) {
    var state = [];
    state.push({id: "collection", collectionId: collectionId});
    this.app.switchState(state, DEFAULT_OPTIONS);
  };

  this.openReader = function(collectionId, documentId) {
    var state = [];
    state.push({id: "reader", collectionId: collectionId, documentId: documentId});
    // TODO: if we do not know the context, we should not set it...
    state.push({id: "context", contextId: "toc"});
    this.app.switchState(state, DEFAULT_OPTIONS);
  };

  this.navigate = function(route, options) {
    Router.history.navigate(route, options);
  };
};

SubstanceRouter.Prototype.prototype = Router.prototype;
SubstanceRouter.prototype = new SubstanceRouter.Prototype();

module.exports = SubstanceRouter;
