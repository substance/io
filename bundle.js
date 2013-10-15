#!/usr/bin/env node

var http = require('http');
var path = require('path');
var _ = require("underscore");
var fs = require("fs");
var IO = require("./src/io");

var util = require("substance-util");
var exec = require('child_process').exec;

// Source dir (optional)
IO.LIBRARY_BASEDIR = process.argv[2]; // || process.cwd();
var TARGET_DIR = process.argv[3]; // || process.cwd() + "/dist";

if (!TARGET_DIR) {
  console.log('usage: io-bundle document_dir target_dir');
  process.exit();
}

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

// Make clean
// --------------

function cleanup() {
  // fs.unlink(TARGET_DIR);
  // deleteFolderRecursive(TARGET_DIR);
  // fs.mkdirSync(TARGET_DIR);

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

function generateCollection(cid, cb) {
  var collection = library.nodes[cid];
  console.log('Generating collection: ', cid);

  fs.mkdirSync(TARGET_DIR + "/docs/"+cid);

  var funcs = [];
  _.each(collection.records, function(docId) {

    // Create folders for document
    fs.mkdirSync(TARGET_DIR + "/docs/"+cid+"/"+docId);

    // Generate actual doc
    // --------------

    funcs.push(function(cb) {
      IO.compileDocument(cid, docId, function(err, doc) {
        if (err) return cb(err);
        var targetFile = TARGET_DIR + "/docs/"+cid+"/"+docId+"/content.json";
        fs.writeFileSync(targetFile, JSON.stringify(doc, null, '  '));
        console.log('Generated document:' , targetFile);
        cb(null);
      });
    });
  });

  util.async.sequential(funcs, cb);
}


function generateCollections(cb) {
  // Create docs folder
  fs.mkdirSync(TARGET_DIR + "/docs");

  var collections = library.nodes.library.collections;
  
  // _.each(collections, function(cid) {
  //   generateCollection(cid, cb);
  // });
  
  var funcs = _.map(collections, function(cid) {
    return function(cb) {
      generateCollection(cid, cb);
    }
  });

  // Run all collection generators sequentially
  util.async.sequential(funcs, cb);

  // cb(null);
}





// function __pandocAvailable(cb) {
//   var test = spawn('pandoc', ['--help']);
//   test.on('error', function() {
//     console.error('Pandoc not found');
//     cb('Pandoc not found');
//   });
//   test.on('exit', function() { cb(null); });
//   test.stdin.end();
// }



function run(command, cb) {
  console.log('running... '+ command);
  exec(command, function (error, stdout, stderr) {
    if (error) return cb(err);
    if (stderr) {
      console.error(stderr);
    }
    if (stdout) {
      console.log(stdout);  
    }
    cb(null);
  });
}

run("cp -r " + __dirname + "/dist/* " + TARGET_DIR, function() {

  // Make clean
  // -------------

  cleanup();

  // Generate library
  // -------------

  generateLibrary();

  // Compile documents etc.
  // -------------

  generateCollections(function(err) {
    console.log('--------------');
    console.log('Find your package at: '+TARGET_DIR+ ' and upload to a webserver.');
  });
});
