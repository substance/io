
var _ = require("underscore");
var Figure = require("substance-nodes/src/figure/figure");
var Table = require("substance-nodes/src/table/table");
var Collaborator = require("substance-nodes/src/collaborator/collaborator");

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

  // citations
  _.each(resources.citations, function(citationData) {

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



function loadMeta(article, meta) {
  var nodes;

  // Set document title
  article.title = meta.title;

  // var resourceMap = {};
  // collaborators
  var idcount = 0;
  _.each(meta.collaborators, function(c) {
    c.id = "collaborator_" + (++idcount);
    c.type = "collaborator";

    article.create(c);
    article.show("info", c.id);
  });

  // return resourceMap;
}

var extendArticle = function(article, resources, meta) {
  // if (!resources) return;

  if (resources) {
    // create views for figures/tables and citations
    article.create({
      id: "figures",
      type: "view",
      nodes: []
    });

    article.create({
      id: "info",
      type: "view",
      nodes: []
    });

    // article.create({
    //   id: "citations",
    //   type: "view",
    //   nodes: []
    // });

    article.nodes.document.views.push("figures");
    // article.nodes.document.views.push("citations");
    article.nodes.document.views.push("info");

    // create nodes for the given resources
    var resourceMap = loadResources(article, resources);

    // replace all links that reference a resource or a heading node (using source_id)
    replaceReferencedLinks(article, resourceMap);
  }

  if (meta) {
    // enhance article with meta information, such as collaborator, title, publish-date etc.
    loadMeta(article, meta);
  }


};

module.exports = extendArticle;
