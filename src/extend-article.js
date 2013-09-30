
var _ = require("underscore");

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
  var Figure = require("substance-nodes/src/figure/figure");
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
  // _.each(resources.tables, function(figData) {

  // });

  // citations
  // _.each(resources.tables, function(figData) {

  // });

  // replace links which reference a resource with the specific reference nodes
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
    console.log("...converting reference link", link);
    var url = link.url;
    var resource = resourceMap[url];
    if (resource) {
      var refType = resource.type+"_reference";
      var referenceNode = {
        id: nextId(refType),
        type: refType,
        path: link.path,
        range: link.range,
        target: url
      };
      article.create(referenceNode);
      article.delete(link.id);
    }
  });

  return article;
};

module.exports = extendArticle;
