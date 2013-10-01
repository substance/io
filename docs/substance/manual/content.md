*This documentation is a work-in-progress. However, it reflects the latest state of Substance development and provides information about most modules. You can contribute to this manual by making changes to the source [markdown file](https://github.com/substance/io/blob/master/docs/substance/manual/content.md).*

# Introduction

With Substance, we would like to contribute an extensive content creation and annotation framework built on web infrastructure. It is designed to be customized and integrated into existing workflows.

Since 2010, the Substance platform has managed to solve many of the core problems associated with web-based editing tools.

Its features include:

- A JSON-based document model, that can be customized (Substance.Document)
- Support for incremental changes (Substance.Operator)
- Versioning (Substance.Chronicle)
- A building block for displaying and editing documents (Substance.Surface)
- A plugin system for customized content types (Substance.Nodes)



# Modules

Substance modules can be used independenly. You can install them using NPM, or use the Substance Screwdriver.

    npm install <module-name>

In your Javascript files, you can simply require your modules.

    var Data = require('substance-data');


## Substance.Data

### Design Goals

With Substance.Data you can model your domain data using a simple graph-based object model that can be serialized to JSON. It's easy to manipulate and query data on the client (browser) or on the server (Node.js) by using exactly the same API.

### Usage

First, start define a schema.

    var schema = {
      "person": {
        "type": "person",
        "name": "Person",
        "properties": {
          "name": "string",
          "origin": "location"
        }
      },
      "location": {
        "type": "location",
        "name": "Location",
        "properties": {
          "name": "string",
          "citizens": ["array", "person"]
        }
      }
    };

Create a new `Data.Graph`.

    var graph = new Data.Graph(schema);
    

Add some objects.

    graph.create({
      id: "bart",
      type: "person",
      name: "Bart Simpson"
    });

    graph.set({
      id: "springfield",
      name: "Springfield",
      type: "location",
      citizens: ["bart"]
    });

Set properties.

    graph.set(["bart", "origin"], "springfield");


Querying is easy too. With `get` you can either look up a node by id or specify a path that is used to traverse the graph.

    // Return a node
    graph.get('bart');
    // => {
      id: "bart",
      type: "person",
      name: "Bart Simpson",
      "location": "springfield"
    }
    
    // Return a property
    graph.get(["springfield", "citizens"]);
    // => ["springfield"]
    
You can even do smart querying and have the correct objects returned instead of ids.

    // Return a property
    graph.query(["springfield", "citizens"]);
    // => [{id: "springfield", type: "location", citizens: ["bart"]}]

To get an overview of the full API please have a look at our commented [testsuite](https://github.com/substance/data/tree/master/tests).



## Substance.Document

**Substance Document** is an open standard for manipulating structured digital documents. It helps with the creation and transformation of digital documents. It ensures consistency, separates content from presentation and provides an easy to use API. It depicts the heart of the Substance platform and serves as an interface for custom document models.

A Substance Document can range from loosly structured content involving headings and text, such as reports or articles to more complex things that you wouldn’t consider a traditional document anymore. The format is designed to be extensible, so you can create your own flavors of documents. We put a lot of thought into the design of this module. It is the result of three years of research and development.


### Design Goals

- A document consists of a sequence of content nodes of different types (e.g. heading, text, image)
- A document is manipulated through atomic operations
- The history is tracked, so users reconstruct previous document states at any time
- Support for incremental text updates, using a protocol similar to Google Wave
- Support for text annotations that are not part of the content, but stored as an overlay
- Support for comments to have dicussions that can stick on content elements or annotations.



### Nodes

Substance documents are data-centric representations of digital content. Each content element lives as a node in a flat address space, identified by a unique id. Think of it as a database of independent content fragments.

The following graphic shows a sample document containing a heading (`h1`), paragraph (`p1`), and formula (`f1`). It also has an image (`i1`) and a table (`t1`) as well as two citations (`c1` and `c2`).

![](http://f.cl.ly/items/060x2w1f2r1A3y3D3z2w/lens-document-nodes.png)


### Views

Now these building blocks of a document are organized using views. The main body of the document is referenced in the `content` view. Figures (like images and tables) are kept in the `figures` view while citations live in `citations` respectively.

![](http://f.cl.ly/items/0J3m3D3Z2u3E292A1j3T/lens-document-views.png)


## Substance.Article

The Substance.Article is our reference implementation of the Substance Document model. It features basic content types such as paragraphs, headings, images and code blocks. Use this as a starting point for rolling your own Substance based document-format. We've created a different flavor for scientific content, the [Lens.Article](http://lens.substance.io/#lens/lens_article).


### Usage

This section is intended to be a step to step guide on how to use the module to programmatically create and transform digital documents of any kind.

Start tracking a new document.

    var doc = new Substance.Article({ id: "my_doc" });

Add a first heading to the document.

    doc.create({
      "id": "h1",
      "type": "heading",
      "content": "Heading 1"
    });

Now let's add another node, this time a text node.

This operation is pretty similar to the previous one, except this time we specify `text` as the content type.

    doc.create({
      "id": "t1",
      "type": "text",
      "content": "Text 1"
    });

Nodes can be shown in different views. 
  
    var opC = [
      "position", "content", {"nodes": ["h1", "t1"], "target": 0}
    ];

    doc.show("content", ["h1", "t1"], 0);

Update an existing node

There's a special API for incrementally updating existing nodes. This works by specifying a delta operation describing only what's changed in the text.

  
    doc.update(["h1", "content"], [4, "ING", -3]);
    doc.get('h1').content; // => "HeadING 1"

Inspect the document state

Now after executing a bunch of operations, it is a good time to inspect the current state of the document.

    doc.toJSON();
    
This is how the JSON serialization looks like:

    {
      "id": "my_document",
      "schema": ["substance-article", "0.1.0"],
      "nodes": {
        "document": {
          "title": "",
          "views": ["content"]
        },
        "h1": {
          "content": "HeadING 1",
          "id": "h1",
          "type": "heading"
        },
        "t1": {
          "content": "Hey there.",
          "id": "t1",
          "type": "text"
        },
        "content": {
          "nodes": ["h1", "t1"]
        }
      }
    }

As you can see there are two nodes registered, which can be directly accessed by their `id`. In order to reflect the order of our nodes we keep a view node `content` that has a `nodes` property reflecting the node order in the document.


### Annotations

So far, we have a bare-metal digital document, containing two different types of content nodes. Now we'd also like to store additional contextual information, relevant to a particular portion of text within the document.

Unlike in other systems with Substance annotations are not part of the content itself. They're completely separated from the text. Most text editors offer the ability to emphasize portions of text using markup. E.g. in HTML it looks like this.

    <em>Emphasized term</em> in a text body.

In Substance however, we keep annotations external and remember the position of the first character, as well as an offset (how many characters are effected). An annotation emphasizing the "Hey" in "Hey there." looks like so:


Here's how you create an annotation.
    
    doc.create({
      "id": "a1",
      "type": "emphasis",
      "path": ["t1", "content"],
      "range": {start: [0,1], end: [0, 5]}
    });

## Substance.Operator

Substance.Operator provides Operational Transformations for strings, arrays and objects. Operations can be inverted and transformed.
Particularly we use Operations extensively in Substance.Chronicle for versioning changes.

### Usage

Strings can be modified via incremental insertions and deletions.

    var text = "Sun";
    var op1 = Operator.TextOperation.Delete(2, "n");
    var op2 = Operator.TextOperation.Insert(2, "bstance");
    text = op2.apply(op1.apply(text));
    console.log(text);
    > Substance

Arrays can be modified via insertions, deletions, and moves.

    var arr = [1,3];
    var op1 = Operator.ArrayOperation.Insert(1, 2);
    var op2 = Operator.ArrayOperation.Move(0, 2);
    var op3 = Operator.ArrayOperation.Delete(1, 3);
    op3.apply(op2.apply(op1.apply(arr)));
    console.log(arr)
    > [2, 1]

With ObjectOperations you can create, delete, set, and update object properties.

Updates are done using Text-, Array-, or ObjectOperations.
Properties are specified by a path which is an array of strings.

    var obj = { bla: "blupp", foo: { bar: [] } };
    var op1 = Operator.ObjectOperation.Create(["a"], "b");
    var op2 = Operator.ObjectOperation.Delete(["bla"], "blupp");
    var op3 = Operator.ObjectOperation.Set(["foo", "bar"], [1,3]);
    var op4 = Operator.ObjectOperation.Update(["foo", "bar"], Operator.ArrayOperation.Insert(1, 2));
    op4.apply(op3.apply(op2.apply(op1.apply(obj))));
    console.log(obj);
    > { a: "b", foo: { bar: [1, 2, 3] } }
      
 Compounds allow to pack several Operations of the same type into a single one.
 
    var compound = Operator.ObjectOperation.Compound([op1, op2, op3, op4]);
    compound.apply(obj);
 
Find more examples in the [testsuite](https://github.com/substance/operator/tree/master/tests).

## Substance.Chronicle

Substance.Chronicle is a git-inspired versioning API based on [Operational Transformations](http://interior.substance.io/modules/operator.html). The actual content to be versioned or a persistence mechanism is not addressed in this module. Instead one would create an adapter which is implementing an OT interface.

### Getting Started

Consider a simple collaborative editing session of John and Jane.

John starts writing a text (Commit `John - 1`).

    Hsta la vista.

Jane receives the update and instantly fixes John's typo (Commit `Jane`).

    Hasta la vista.
    
In the very same moment John continues writing (Commits `John - 2` and `John - 3`).

    Hsta la vista, baby!

This leads to a situation with concurrent changes which are merged into a common result (Commit `Merge`).

    Hasta la vista, baby!

Substance.Chronicle allows to view versions and resolve more complex version deviations via merging.

### Getting Really Started

Substance.Chronicle can be considered a low-level API. Some integration and glueing is necessary to get things moving.

Installation is easy.

  $ npm install substance-chronicle
    
In your Node.js script:

  var Chronicle = require('substance-chronicle');

Basically it is necessary to define some kind of `Change` type and an adapter that can deal with that:

    function YourVersioningAdapter() {
    
      // applies the change to your data
      this.apply = function(change) {};

      // inverts a change
          this.invert = function(change) {};

      // transforms changes according to operational transformation
          this.transform = function(a, b, options) {}

      // resets your document
      this.reset = function() {}
    };

The difficult part is to specify `Change` types that are invertible and transformable. Here, Substance.Operator comes in providing basic operations for text, arrays, and objects.

Having your adapter you can begin chronicling using

    var chronicle = Chronicle.create();
    chronicle.manage(yourAdapter);
    
To get things recorded you need to tell the Chronicle to do so:

    chronicle.record(someChange);

For more sophisticated examples see the [testsuite](https://github.com/substance/chronicle/tree/master/tests).



# Installation

It's fairly easy to install and run the latest Substance development version locally.

## Prerequisites

- Node.js >=0.10.x
- [Pandoc](http://johnmacfarlane.net/pandoc/installing.html) >= 1.12.x (for on-the-fly generation of documents using Markdown as an input)

Node.js is just used as a development environment. You'll soon be able to create self-contained packages of individual modules or the main app itself.

## Fresh install

First install the Substance Screwdriver command line utility. It's just a little helper that makes dealing with our many modules easier.

    $ git clone https://github.com/substance/screwdriver.git
    $ cd screwdriver
    $ sudo python setup.py install

Clone the Substance Mothership

    $ git clone https://github.com/substance/substance.git
  
Run the update command, which pulls in all the sub-modules and dependencies

    $ cd substance
    $ substance --update
  
Finally start the server and navigate to `http://localhost:3000`.

    $ substance
   
## Keep your local version in sync

You may want to pull in updates every now and then, which is simple. In the Substance project root dir do:

    $ substance --update
   
And start the dev environment again.

    $ substance

# Contributing

I'm assuming here that you have push access to the repositories, because as a start I'd like to get the Lens core dev team up and running. I'll provide documentation on how to work with a forked version of a module and submit a pull request soon.


Say you've made changes to the Substance.Article module. In order to commit them you simply have to navigate to `node_modules/substance-article` and do:

    $ git add <YOUR STUFF>
    $ git commit -m "Fixed X"
    $ git push

Alternatively, if you are working on breaking changes you can switch to a different branch, and submit a pull request using the Github interface. Here's how:

    $ git checkout -b my_feature_branch
    $ git add <YOUR STUFF>
    $ git commit -m "Fixed X"
    $ git push

Then go to [Github](http://github.com) and submit a pull request.