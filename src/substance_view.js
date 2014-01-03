"use strict";

var _ = require("underscore");
var util = require('substance-util');
var html = util.html;
var View = require("substance-application").View;
var $$ = require("substance-application").$$;


// Substance.View Constructor
// ==========================================================================

var SubstanceView = function(controller) {
  View.call(this);

  this.controller = controller;
  this.$el.attr({id: "container"});

  // Handle state transitions
  // --------
  
  this.listenTo(this.controller, 'state-changed', this.onStateChanged);
  this.listenTo(this.controller, 'loading:started', this.startLoading);
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
  };

  this.startLoading = function(msg) {
    if (!msg) msg = "Loading article";
    $('.spinner-wrapper .message').html(msg);
    $('body').addClass('loading');
  };

  this.stopLoading = function() {
    $('body').removeClass('loading');
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
    var that = this;
    var view = this.controller.reader.createView();
    this.replaceMainView('reader', view);

    that.startLoading("Typesetting");
    this.$('#main').css({opacity: 0});

    _.delay(function() {
      that.stopLoading();
      that.$('#main').css({opacity: 1});
    }, 1000);

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
    this.el.innerHTML = "";

    // Browser not supported dialogue
    // ------------

    this.el.appendChild($$('.browser-not-supported', {
      text: "Sorry, your browser is not supported.",
      style: "display: none;"
    }));

    // Spinner
    // ------------  

    this.el.appendChild($$('.spinner-wrapper', {
      children: [
        $$('.spinner'),
        $$('.message', {html: 'Loading article'})
      ]
    }));

    // Main container
    // ------------

    this.el.appendChild($$('#main'));
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
