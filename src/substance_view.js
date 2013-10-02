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
  
  // this.listenTo(this.controller, 'context-changed', this.onContextChanged);
  this.listenTo(this.controller, 'state-changed', this.onStateChanged);
};


SubstanceView.Prototype = function() {

  this.onStateChanged = function() {
    var state = this.controller.state;

    if (state.context === "reader") {
      this.openReader();
    } else if (state.context === "library") {
      this.openLibrary();
    } else if (state.context === "submission") {
      this.openSubmission();
    } else if (state.context === "collection") {
      this.openCollection();
    } else {
      console.log("Unknown application state: " + context);
    }
    this.updateMenu();
  };

  // Session Event handlers
  // ==========================================================================
  //

  // this.onContextChanged = function(context) {
  //   if (context === "reader") {
  //     this.openReader();
  //   } else if (context === "library") {
  //     this.openLibrary();
  //   } else {
  //     console.log("Unknown application state: " + context);
  //   }

  //   this.updateMenu();
  // };

  this.updateMenu = function() {
    var hash = window.location.hash;

    this.$('.toggle-view').removeClass('active');
    if (hash.match(/about/)) {
      this.$('.toggle-view.about').addClass('active')
    } else if (hash.match(/submit/)) {
      this.$('.toggle-view.submit').addClass('active');
    } else if (hash.match(/blog/)) {
      this.$('.toggle-view.blog').addClass('active');
    } else {
      this.$('.toggle-view.explore').addClass('active');
    }
  };

  // Open Library
  // ----------
  //

  this.openLibrary = function() {
    // Application controller has a editor controller ready
    // -> pass it to the editor view
    // var view = new EditorView(this.controller.editor.view);
    var view = this.controller.library.createView();
    this.replaceMainView('library', view);
  };


  // Open the reader view
  // ----------
  //

  this.openReader = function() {
    // Application controller has a editor controller ready
    // -> pass it to the editor view
    // var view = new EditorView(this.controller.editor.view);

    var view = this.controller.reader.createView();
    this.replaceMainView('reader', view);

    // Update browser title
    document.title = this.controller.reader.__document.title;
  };

  // Open the reader view
  // ----------
  //

  this.openSubmission = function() {
    var view = this.controller.submission.createView();
    this.replaceMainView('submission', view);
  };

  // Open collection view
  // ----------
  //

  this.openCollection = function() {
    var view = this.controller.collection.createView();
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
