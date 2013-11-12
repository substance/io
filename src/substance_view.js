"use strict";

var _ = require("underscore");
var util = require('substance-util');
var html = util.html;
var View = require("substance-application").View;

// Substance.View Constructor
// ==========================================================================

var SubstanceView = function(controller) {
  View.call(this);

  this.controller = controller;
  this.$el.attr({id: "container"});

  // Handle state transitions
  // --------
  //this.listenTo(this.controller, 'state-changed', this.onStateChanged);
};


SubstanceView.Prototype = function() {

  this.onStateChanged = function() {
    var state = this.controller.state;

    switch (state.name) {
    case "library":
      this.openLibrary();
      break;
    case "collection":
      this.openCollection();
      break;
    case "reader":
      this.openReader();
      break;
    default:
      console.error("Illegal application state", state.name);
    }
  };

  // Open Library
  // ----------
  //

  this.openLibrary = function() {
    // Application controller has a editor controller ready
    // -> pass it to the editor view
    // var view = new EditorView(this.controller.editor.view);
    var view = this.controller.childController.createView();
    this.replaceMainView('library', view);
  };


  // Open the reader view
  // ----------
  //

  this.openReader = function() {
    var view = this.controller.childController.createView();
    this.replaceMainView('reader', view);

    // Update browser title
    document.title = this.controller.reader.__document.title;
  };

  // Open the reader view
  // ----------
  //

  this.openSubmission = function() {
    var view = this.controller.childController.createView();
    this.replaceMainView('submission', view);
  };

  // Open collection view
  // ----------
  //

  this.openCollection = function() {
    var view = this.controller.childController.createView();
    this.replaceMainView('collection', view);
  };


  // Rendering
  // ==========================================================================
  //

  this.replaceMainView = function(name, view) {
    $('body').removeClass().addClass('current-view '+name);

    // if (this.mainView && this.mainView !== view) {
    //   console.log('disposing it..');
    //   this.mainView.dispose();
    // }

    this.mainView = view;
    this.$('#main').html(view.render().el);
  };

  this.render = function() {
    this.$el.html(html.tpl('lens', this.controller.session));
    return this;
  };

  this.dispose = function() {
    this.stopListening();
    if (this.mainView) this.mainView.dispose();
  };
};


// Export
// --------

SubstanceView.Prototype.prototype = View.prototype;
SubstanceView.prototype = new SubstanceView.Prototype();

module.exports = SubstanceView;
