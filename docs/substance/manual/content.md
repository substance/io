This documentation is a work-in-progress. However, it reflects the latest state of Lens development and provides documentation for the new [0.2.x](https://github.com/elifesciences/lens/tree/0.2.x) series of Lens. You can contribute to this manual by making changes to the source [markdown file](https://github.com/elifesciences/lens-manual/blob/master/manual.md).

# Introduction

[eLife Lens](http://elifesciences.org/lens) provides a novel way of looking at content on the web. It is designed to make life easier for researchers, reviewers, authors and readers. For example, have you tried to look at a figure in an online article, while at the same time trying to see what the author says about the figure, jumping all around the article, losing track of what you were looking for in the first place? The reason for this is that most online research articles are published in a fixed digital version of the original paper. With eLife Lens, we take full advantage of the Internet’s flexibility.

## The Big Picture

Lens has a pretty simple architecture. It is a stand-alone web component that 
can be embedded into any web page. Lens can display any NLM XML document and alternatively the Lens-native JSON representation. What's important to note is that Lens doesn't dictate a specific architecture for content hosting. Anyone (even authors) can host their own documents and customized Lens instances.

## The Lens Article Format

The Lens Article Format is an implementation of the [Substance Document Model](http://github.com/substance/document) dedicated to scientific content. It features basic content types such as paragraphs, headings, as well as figure types such as images, tables and videos complete with captions and cross-references.

The document definitions can easily be extended. You can either create your own flavour or contribute to the Lens Article Format directly. We have auto-generated documentation for the latest [Lens Article spec](#lens/lens_article).

Do we really need another spec for scientific documents?  

We believe so for the following reasons:

- XML-based formats such as NLM are hard to consume by web clients.
- Strict separation of content and style is important. Existing formats target print, and thus contain style information which makes them hard to process by computer programs.
- The greatest advantage of Lens Articles is that any of them can be viewed in Lens, a modern web-based interface for consuming science content.


### Nodes

Lens articles are data-centric representations of digital content. Each content element lives as a node in a flat address space, identified by a unique id. Think of it as a database of independent content fragments.

The following graphic shows a sample document containing a heading (`h1`), paragraph (`p1`), and formula (`f1`). It also has an image (`i1`) and a table (`t1`) as well as two citations (`c1` and `c2`).

![](http://f.cl.ly/items/060x2w1f2r1A3y3D3z2w/lens-document-nodes.png)


### Views

Now these building blocks of a document are organized using views. The main body of the document is referenced in the `content` view. Figures (like images and tables) are kept in the `figures` view while citations live in `citations` respectively.

![](http://f.cl.ly/items/0J3m3D3Z2u3E292A1j3T/lens-document-views.png)

## The Lens Converter

Lens can natively read the [JATS](http://jats.nlm.nih.gov/) (formerly NLM)  format, thanks to its built-in [converter](http://github.com/elifesciences/lens-converter). 

![](http://f.cl.ly/items/1S1p1L3s2d0a0T372I0v/Screen%20Shot%202013-09-12%20at%2012.56.21%20AM.png)

Conversion is done on the client side using the browser-native [DOM Parser](http://www.w3.org/TR/2003/WD-DOM-Level-3-LS-20030619/load-save.html#LS-DOMParser). Using it is simle:

    var importer = new LensImporter();
    var doc = importer.import(xmlData);


The converter can handle any NLM-compatible file. Some portions are publisher-specific, like resolving the url's for figures and videos. This is done in configurations. We have implemented configurations for [eLife](https://github.com/elifesciences/lens-converter/blob/0.1.x/src/configurations/elife.js), [Landes Bioscience](https://github.com/elifesciences/lens-converter/blob/0.1.x/src/configurations/landes.js) and [PLOS](https://github.com/elifesciences/lens-converter/blob/0.1.x/src/configurations/plos.js).


# Installation

It's fairly easy to install and run the latest Lens development version locally.

## Prerequisites

- Node.js >=0.8.x
- [Pandoc](http://johnmacfarlane.net/pandoc/installing.html) >= 1.10.x (for on-the-fly generation of the Lens manual from Markdown)

Node.js is just used as a development environment. You'll soon be able to create self-contained packages of individual modules or the main app itself.

## Fresh install

First install the Substance Screwdriver command line utility. It's just a little helper that makes dealing with our many modules easier.

    $ git clone https://github.com/substance/screwdriver.git
    $ cd screwdriver
    $ sudo python setup.py install

Clone the Lens Mothership

    $ git clone https://github.com/elifesciences/lens.git
  
Run the update command, which pulls in all the sub-modules and dependencies

    $ cd lens
    $ substance --update
  
Finally start the server

    $ substance

You can have a look at the example document, by pointing your browser to `http://localhost:4000/#lens/lorem_ipsum`, view the autogenerated Lens.Article documentation here `http://localhost:4000/#lens/lens_article` or the manual `http://localhost:4000/#lens/manual`.
   
## Keep your local version in sync

You may want to pull in updates every now and then, which is simple. In the Lens project root dir do:

    $ substance --update
   
And start the dev environment again.

    $ substance

## Configuration

By default your local Lens installations serves a bunch of example documents plus Lens related documents. However you can easily configure Lens so it fetches content from a different source by adapting `config/config.json` to your needs.


# Contributing

I'm assuming here that you have push access to the repositories, because as a start I'd like to get the Lens core dev team up and running. I'll provide documentation on how to work with a forked version of a module and submit a pull request soon.


Say you've made changes to the Lens.Article module. In order to commit them you simply have to navigate to `node_modules/lens-article` and do:

    $ git add <YOUR STUFF>
    $ git commit -m "Fixed X"
    $ git push
   
Alternatively, if you are working on breaking changes you can switch to a different branch, and submit a pull request using the Github interface. Here's how:

    $ git checkout -b my_feature_branch
    $ git add <YOUR STUFF>
    $ git commit -m "Fixed X"
    $ git push

Then go to [Github](http://github.com) and submit a pull request.


Another hint: To pull in upstream changes from master for the entire project do this:

    $ substance --git -- pull origin master:<feature_branch_name>


## Adjusting styles

Most customization can be done using CSS without interfering with the Lens codebase. You only override styles on the application level.

Say you'd like to like to color citation cards red.

    #my_app .article .citations .resource-header {
      background: red;
    }

You've got the basic idea, now it's on you. It should be easy to pull in changes from the official Lens modules, without breaking your customized app.

## Implement a new node type

It doesn't take much to implement a new node type for Lens. However, make sure there isn't an existing node type that covers your needs. We would prefer that you adjust existing types and contribute back. If we'd all figure out a way to find common ground in our scientific language that would be awesome. :)

Anyway, let's create a new node type now. For the purpose of demonstration only, let's create a `cat` node type that you can reference in the main body of the document. The first thing to do is create a new folder in the `lens-article` repository  `/nodes/cat`. The structure of that folder will be like this:

    index.js
    cat.js
    cat_view.js
    cat.css

Let's start by specifying the type definitions in `cat.js`. 

    var _ = require('underscore');
    var Node = require('substance-document').Node;

    var Cat = function(node, doc) {
      Node.call(this, node, doc);
    };

    // Type definition
    // -----------------
    //

    Cat.type = {
      "id": "cat",
      "parent": "figure",
      "properties": {
        "name": "string",
        "speed": "string",
        "abilities": ["array", "string"],
      }
    };

    Cat.prototype = Node.prototype
    Cat.prototype.constructor = Cat;


    // Auto-generate property getters based on the type definition 
    // --------

    var getters = {};

    _.each(Cat.type.properties, function(prop, key) {
      getters[key] = {
        get: function() {
          return this.properties[key];
        }
      };
    });


    Object.defineProperties(Cat.prototype, _.extend(getters, {
      caption: {
        // Used for 
        heading: function() {
          return this.properties.
        }
      }
    }));

    module.exports = Cat;


That was easy. Now we need to implement a view for the `Cat` model we just defined. Here is `cat_view.js`.

    var NodeView = require("../node").View;

    var CatView = function(node) {
      NodeView.call(this, node);

      this.$el.attr({id: node.id});
      this.$el.addClass("content-node cat");
    };

    CatView.Prototype = function() {

      this.render = function() {
        NodeView.prototype.render.call(this);
        var node = this.node;

        var html = [
          '<div class="name">'+this.cat+'</div>'
          '<div class="speed">'+this.speed+'</div>'
          '<div class="abilities">'+this.abilities.join(', ')+'</div>'
        ].join('\n');

        this.content.innerHTML = html;

        return this;
      }
    };

    // CatView inherits from NodeView
    CatView.Prototype.prototype = NodeView.prototype;
    CatView.prototype = new CatView.Prototype();

    module.exports = CatView;

Add some styles in `cat.css`:

    .content-node.cat .name {
      font-size: 20px;
      color: green;
    }

By convention, there needs to be an `index.js` file in the repo.

    module.exports = {
      Model: require('./cat'),
      View: require('./cat_view')
    };

Finally you have to register your new node type in `nodes/index.js`.

    module.exports = {
      ...
      "cat": require("./cat"),
      ...
    };


Now in your actual document, you can specify and reference `cat` resources. It looks like so:

    {
      id: "example_doc",
      "nodes": {
        ...
        "oliver": {
          "id": "oliver"
          "type": "cat",
          "name": "Oliver",
          "abilities": ["jump high", "eat much", "bite", "hunt mice"],
        },
        "paragraph_1": {
          "id": "paragraph_1",
          "type": "paragraph",
          "content": "Last sunday I had much fun with Oliver the cat."
        },
        "figure_reference_oliver": {
          "id":"figure_reference_oliver",
          "type":"figure_reference",
          "path": ["paragraph_3", "content"],
          "target": "oliver",
          "range":[31,37]
        },
        ...
      }
    }
    