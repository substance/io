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
  
  this.listenTo(this.controller, 'loading:started', this.startLoading);
};


SubstanceView.Prototype = function() {


  this.startLoading = function(msg) {
    if (!msg) msg = "Loading article";
    $('.spinner-wrapper .message').html(msg);
    $('body').addClass('loading');
  };

  this.stopLoading = function() {
    $('body').removeClass('loading');
  };

  // Main state transition
  // ----------
  //

  this.transition = function(state) {
    var state = this.controller.state;

    switch (state.id) {
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
      console.error("Illegal application state", state.id);
    }
  };

  // Open Library
  // ----------
  //

  this.openLibrary = function() {
    var libraryCtrl = this.controller.childController;
    var view = libraryCtrl.view;
    this.replaceMainView('library', view);

    this.updateTitle("Library: " + this.controller.library.name);
  };




  // Open the reader view
  // ----------
  //

  this.openReader = function() {
    var readerCtrl = this.controller.childController;
    var view = readerCtrl.view;
    this.replaceMainView('reader', view);

  //   that.startLoading("Typesetting");
  //   this.$('#main').css({opacity: 0});

  //   _.delay(function() {
  //     that.stopLoading();
  //     that.$('#main').css({opacity: 1});
  //   }, 1000);

    this.updateTitle(readerCtrl.document.title);
  };

  // Open collection view
  // ----------
  //

  this.openCollection = function() {
    var collectionCtrl = this.controller.childController;
    var view = collectionCtrl.view;
    this.replaceMainView('collection', view);

    this.updateTitle("Collection: " + collectionCtrl.collection.name);
  };


  // Rendering
  // ==========================================================================
  //

  this.replaceMainView = function(name, view) {
    $('body').removeClass().addClass('current-view '+name);

    this.mainView = view;
    this.$('#main').html(view.el);
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
