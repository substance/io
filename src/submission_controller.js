"use strict";

var _ = require("underscore");
var Controller = require("substance-application").Controller;
var SubmissionView = require("./submission_view");
var util = require("substance-util");


// Substance.Submission.Controller
// -----------------
//

var SubmissionController = function(state) {
  this.state = state;
  Controller.call(this);
  
  // Create submission view
  // this.view = new SubmissionView(this);
};


SubmissionController.Prototype = function() {

  this.createView = function() {
    var view = new SubmissionView(this);
    return view;
  };

  // Transitions
  // ==================================

  this.getActiveControllers = function() {
    return [];
  };
};


// Exports
// --------

SubmissionController.Prototype.prototype = Controller.prototype;
SubmissionController.prototype = new SubmissionController.Prototype();
_.extend(SubmissionController.prototype, util.Events);


module.exports = SubmissionController;
