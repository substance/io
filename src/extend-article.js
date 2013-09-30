
var _ = require("underscore");
var Figure = require("substance-nodes/src/figure/figure");
var Table = require("substance-nodes/src/table/table");

var extendArticle = function(article, resources) {

  if (!resources) return article;

  article.create({
    id: "figures",
    type: "view",
    nodes: []
  });
  article.create({
    id: "citations",
    type: "view",
    nodes: []
  });
  article.nodes.document.views.push("figures");
  article.nodes.document.views.push("citations");

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
  // _.each(resources.tables, function(figData) {

  // });

  // replace links which reference a resource
  var linksIndex = article.addIndex( "links", {
    types: ["link"]
  });
  var links = linksIndex.get();

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
    } else if (article.get(target)) {
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

  return article;
};

module.exports = extendArticle;
