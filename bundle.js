#!/usr/bin/env node

var http = require('http');
var path = require('path');
var _ = require("underscore");
var fs = require("fs");
var IO = require("./src/io");

// Source dir (optional)
IO.LIBRARY_BASEDIR = process.argv[2]; // || process.cwd();
var TARGET_DIR = process.argv[3]; // || process.cwd() + "/dist";

deleteFolderRecursive = function(path) {
  var files = [];
  if( fs.existsSync(path) ) {
    files = fs.readdirSync(path);
    files.forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.statSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

// TODO: Activate app bundle here

function bundle() {

}

// Make clean
// --------------

function cleanup() {
  console.log('clearing library.json and docs folder ...');
  fs.unlink(TARGET_DIR + "/library.json");
  deleteFolderRecursive(TARGET_DIR + "/docs");
}

var library;

// Generate library file
// --------------

function generateLibrary() {
  library = IO.extractLibrary();
  console.log('writing "TARGET_DIR/library.json"');
  fs.writeFileSync(TARGET_DIR + "/library.json", JSON.stringify(library, null, '  '));
}


// Generate collection, including compiled documents
// --------------

function generateCollection(cid) {
  var collection = library.nodes[cid];
  console.log('Generating collection: ', cid);
  fs.mkdirSync(TARGET_DIR + "/docs/"+cid);
  
  _.each(collection.records, function(docId) {
    // Create folders for document
    fs.mkdirSync(TARGET_DIR + "/docs/"+cid+"/"+docId);

    // Generate actual doc
    // --------------

    // We're entering the async arena here (ensure proper error handling!)
    IO.compileDocument(cid, docId, function(err, doc) {
      var targetFile = TARGET_DIR + "/docs/"+cid+"/"+docId+"/content.json";
      fs.writeFileSync(targetFile, JSON.stringify(doc, null, '  '));
      console.log('Generated document:' , targetFile);
    });
  });
}


function generateCollections(cb) {
  // Create docs folder
  fs.mkdirSync(TARGET_DIR + "/docs");

  var collections = library.nodes.library.collections;
  
  _.each(collections, function(cid) {
    generateCollection(cid);
  });
  cb(null);
}


// Make clean
// -------------

cleanup();

// Generate library
// -------------

generateLibrary();

// Compile documents etc.
// -------------

generateCollections(function(err) {
  console.log('all done?');
});
