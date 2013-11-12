"use strict";

var Application = require("substance-application");
var SubstanceController = require("./substance_controller");
var DEFAULT_CONFIG = require("../config/config.json");
var SubstanceRouter = require("./substance_router");

// The Substance Application
// ========
//

var Substance = function(config) {
  config = config || DEFAULT_CONFIG;
  Application.call(this, config);
  this.controller = new SubstanceController(config);

  // Set up router
  var routes = require("../config/routes.json");
  var router = new SubstanceRouter(this, routes);
  this.setRouter(router);
};

Substance.Article = require("substance-article");
Substance.Reader = require("substance-reader");
Substance.Outline = require("lens-outline");

Substance.Prototype = function() {
  // Start listening to routes
  // --------
  this.render = function() {
    this.view = this.controller.createView();
    this.$el.html(this.view.render().el);
  };
};

Substance.Prototype.prototype = Application.prototype;
Substance.prototype = new Substance.Prototype();
Substance.prototype.constructor = Substance;

// For purpose of Trying, some application state
Substance.state1 = function() {
  var state = [{state: "library"}];
  this.switchState(state);
};

Substance.state2 = function() {
  var state = [{state: "collection", data: {collectionId: "substance"}}];
  this.switchState(state);
};

Substance.state3 = function() {
  var state = [
    {state: "reader", data: {collectionId: "substance", documentId: "about"}},
    {state: "panel", data: {viewId: "content"}},
  ];
  this.switchState(state);
};

Substance.state4 = function() {
  var state = [
    {state: "reader", data: {collectionId: "substance", documentId: "about"}},
    {state: "resource", data: {nodeId: "header_2"}},
  ];
  this.switchState(state);
};


Substance.util = require("substance-util");
// Substance.Test = require("substance-test"),
Substance.Application = require("substance-application");
Substance.Commander = require("substance-commander");
Substance.Document = require("substance-document");
Substance.Operator = require("substance-operator");
Substance.Chronicle = require("substance-chronicle");
Substance.Data = require("substance-data");
Substance.RegExp = require("substance-regexp");
Substance.Surface = require("substance-surface");

module.exports = Substance;
