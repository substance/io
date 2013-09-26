"use strict";

var _ = require("underscore");
var util = require('substance-util');
var html = util.html;
var View = require("substance-application").View;
var $$ = require("substance-application").$$;

// Substance.Submission.View
// ==========================================================================
//
// The Substance Collection display

var SubmissionView = function() {
  View.call(this);

  this.$el.addClass('collection');
  // this.libraryCtrl = libraryCtrl;
};

SubmissionView.Prototype = function() {

  // Rendering
  // --------
  //
  // .collection
  //   .title

  this.render = function() {
    this.el.innerHTML = 'SUBMISSION PAGE COMES HERE';
    return this;
  };

  this.dispose = function() {
    this.stopListening();
  };
};

SubmissionView.Prototype.prototype = View.prototype;
SubmissionView.prototype = new SubmissionView.Prototype();

module.exports = SubmissionView;
