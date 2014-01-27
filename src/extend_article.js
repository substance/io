
var _ = require("underscore");
var Figure = require("substance-nodes/src/figure/figure");
var Table = require("substance-nodes/src/table/table");
var Index = require("substance-data").Graph.Index;


function loadResources(article, resources) {
  var nodes;
  var resourceMap = {};
  // figures
  _.each(resources.figures, function(figData) {
    nodes = Figure.create(figData);
    _.each(nodes, function(node) {
      article.create(node);
    });
    var figId = figData.id;
    article.show("figures", figId);
    resourceMap[figId] = article.get(figId);
  });

  // tables
  _.each(resources.tables, function(tableData) {
    nodes = Table.create(tableData);
    _.each(nodes, function(node) {
      article.create(node);
    });
    var tableId = tableData.id;
    article.show("figures", tableId);
    resourceMap[tableId] = article.get(tableId);
  });

  return resourceMap;
}

function replaceReferencedLinks(article, resourceMap) {
  // replace links which reference a resource or a labeled heading
  var linksIndex = article.addIndex( "links", {
    types: ["link"]
  });
  var links = linksIndex.get();
  var anchorsIndex = article.addIndex( "headings", {
    types: ["heading"]
  });
  var crossRefAnchors = {};
  _.each(anchorsIndex.get(), function(n) {
    crossRefAnchors[n.properties.source_id] = n;
  });

  var ids = {};
  var nextId = function(type) {
    ids[type] = ids[type] || 0;
    ids[type]++;
    return type +"_"+ids[type];
  };

  _.each(links, function(link) {
    var target = link.url;
    var resource = resourceMap[target];

    var refType;
    if (resource) {
      switch(resource.type) {
      case "figure":
      case "table":
        refType = "figure_reference";
        break;
      }
    } else if (crossRefAnchors[target]) {
      var anchor = crossRefAnchors[target];
      target = anchor.id;
      refType = "cross_reference";
    }
    if (!refType) {
      // not an internal ref
      return;
    }
    var referenceNode = {
      id: nextId(refType),
      type: refType,
      path: link.path,
      range: link.range,
      target: target
    };
    article.create(referenceNode);
    article.delete(link.id);
  });
}


var addCoverNode = function(article, meta) {
  var coverNode = {
    id: "cover",
    type: "cover",
    image: meta["cover_image"]
  };

  article.create(coverNode);
  article.show("content", coverNode.id, 0);
};

function loadMeta(article, meta, docId) {
  // Set document title
  article.setTitle(meta.title);

  // Contributors
  var idcount = 0;

  var authors = [];
  _.each(meta.contributors, function(c) {
    c.id = "contributor_" + (++idcount);
    c.type = "contributor";
    authors.push(c.id);
    article.create(c);
    article.show("info", c.id);
  });

  // Set some article level properties
  // -----------

  article.setId(docId);
  article.setPublishedOn(meta.published_on);
  article.setAuthors(authors);
}

var extendArticle = function(article, resources, meta, docId) {
  addCoverNode(article, meta);

  if (meta) {
    // enhance article with meta information, such as authors, title, publish-date etc.
    loadMeta(article, meta, docId);
  }

  if (resources) {
    // create nodes for the given resources
    var resourceMap = loadResources(article, resources);
    // replace all links that reference a resource or a heading node (using source_id)
    replaceReferencedLinks(article, resourceMap);
  }
};

module.exports = extendArticle;
