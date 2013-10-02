The Github Repository
=====================

The VVVV.js source code repository is hosted on Github at
[github.com/zauner/vvvv.js](http://github.com/zauner/vvvv.js). When
considering porting nodes, it's a good idea to fork the project, no
matter if you're planning to push your code back into the main repo or
decide to keep it for yourself.

If you're new to Git and Github, there's some good advice in the [Github
Help Section](http://help.github.com/).

Get your hands dirty
====================

Diving into the Source Code
---------------------------

Once you have cloned the repository to your machine, navigate to the
project directory, where you will find a subdirectory called *nodes*. As
you might have guessed, this is where all the nodes go. There is one
JavaScript file per category (which might allow some kind of smart
script loading someday ...). Open one file and make yourself
comfortable. For example, have a look at the `Add (Value)` node in
*nodes/VVVV.Nodes.Value.js.* Things might get clear really quick then.

Once you have chosen a lucky node you want to introduce to VVVV.js, open
the according category file. Only "first level categories" get own
files, so e.g. `IOBox (Value Advanced)` goes into the same file as
`Add (Value)` and `Add (Value Spectral)`.

**Note:** if there is no file for your node's category yet, create one
following the *VVVV.Nodes.{Categoryname}.js* pattern, and add it to the
list of files in*vvvv\_js/vvvv.js*.

After you have found a suitable place, you could either start coding
right away, or use the Porting Wizard, which will be explained in the
next section.

Starting off with the Wizard
----------------------------

Propably the quickest and most painless way to get your nodes ported is
using the Porting Wizard at
[http://vvvvjs.quasipartikel.at/beta/porting\_wizard](http://vvvvjs.quasipartikel.at/beta/porting_wizard).
This little tool uses information about VVVV nodes from VVVV's
nodelist.xml and prepares a template for the corresponding VVVV.js
JavaScript code.

Just choose a node, fill out some meta data and select the pins you are
goint to implement. The generated source code will follow every single
move.

Copy the template to the JavaScript file you chose while reading Section
2.1, and you are ready to start coding.

The VVVV.Core.Node Object
-------------------------

Looking at you're template code, or the code of any other ported node,
the last line always is like

    VVVV.Nodes.{YourNodesName}.prototype = new VVVV.Core.Node();

Object-oriented (and very simplified) speaking, this makes your node
derive from VVVV.Core.Node. Every node object holds several
VVVV.Core.Pin objects, being input pins, output pins, and invisible
(config) pins. Learn more about those objects in the [API
Reference](http://substance.io/zauner/vvvvjs-api-reference), or read on
to get a more human readable overview.

Node Setup
----------

Taking the wizard's template code for, let's say,
`UniformScale (Transform)`, have a look at the first lines:

    /*
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    NODE: UniformScale (Transform)
    Author(s): 'Your Name'
    Original Node Author(s): 'VVVV Group'
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    */
    VVVV.Nodes.UniformScaleTransform = function(id, graph) {
      this.constructor(id, "UniformScale (Transform)", graph);
      this.meta = {
        authors: ['Your Name'],
        original_authors: ['VVVV Group'],
        credits: [],
        compatibility_issues: []
      };
      ...
    }

So the object we are creating is `VVVV.Nodes.UniformScaleTransform`. In
Line 9, we are calling its "base classe's" constructor, providing the
node name "UniformScale (Transform)".

The next few lines fill the object's meta hash. This is your name as the
node author, the author(s) of the original VVVV node, and some credits,
if you are using code or knowledge from some external resource.

The `compatibility issues` attribute holds all the information you think
there should be noted regarding differences to the original VVVV node,
as e.g. not yet implemented nodes, or different behaviour.

**Note, that all the attributes are arrays,**so multiple
authors/credits/compatibility issues should go in multipe array
elements.

Auto-evaluation
---------------

The next line is

    this.auto_evaluate = false;

and determines, if the node should be evaluated every frame (*true*), or
only if input pin values changed (*false*). In our case, UniformScale
should only be evaluated if there have been changes at the input pins,
so we are just leaving it to *false*.

Pin Creation
------------

The following listing shows the lines of code, which create the node's
input and output pins

    // input pins
    var transforminIn = this.addInputPin('Transform In', [], this);
    var xyzIn = this.addInputPin('XYZ', [1], this);

    // output pins
    var transformoutOut = this.addOutputPin('Transform Out', [], this); 

We are creating the two input pins "Transform In" and "XYZ" using
`addInputPin()`, and one output pin "Transform Out" using
`addOutputPin()`.

The arguments of those function calls are:

1.  **Pin name**
2.  **Default Value:** is the value, the pin has on node creation, or if
    no other values are specified by incoming links or inside the .v4p
    file. Note, that this is always an array, no matter if there is only
    one slice or multiple.
3.  **Node:** now that I am writing this, I have no idea, why one should
    pass the node object here. This should definitly vanish as soon as
    possible. Until then, just pass `this` here.
4.  **Reset on Disconnect (optional, default: false)**: The fourth,
    optional argument lets you control, whether an input pin should
    reset to its default, if an incoming link gets disconnected. This is
    particularly true for "non primitive" VVVV types, e.g. `Transform`,
    `EX9.Texture`, `EX9.Layer`, etc.

As mentioned in the descripton of the fourth argument, we should set the
"Reset on Disconnect" argument of the "Transform In" pin to true, so it
gets reset to `[]` after disconnecting incoming links. Doing this, we
get

    // input pins
    var transforminIn = this.addInputPin('Transform In', [], this, true);
    var xyzIn = this.addInputPin('XYZ', [1], this);

    // output pins
    var transformoutOut = this.addOutputPin('Transform Out', [], this); 

We end up with three scope variables, `transforminIn`, `xyzIn` and
`transformoutOut`, which we can use later on to access the pins.

Note, that during node creation is not the only time you can add pins.
If you feel like it, you can dynamically add pins at any point.

The initialize() function
-------------------------

Each node has an `initialize()` function, which will be invoked
immediatly after creating the node, before the first evaluation.
Override this function, if you have some setup to do, e.g. dynamically
creating pins. UniformScale (Value), however doesn't need any further
initialization, so we just leave the function empty, or delete it.

The evaluate() function
-----------------------

The `evaluate()` function is the function which is invoked every frame,
or everytime any input pins changed (depending on the `auto_evaluate`
attribute). This is, where the node's actual logic goes.

Accessing Pin Values
--------------------

The wizard already made a pretty good guess about what we are going to
do in `evaluate()`. First thing is finding out maximum number of input
slices, because in this case (and in many others too) this determines
the number of output slices. We do so by calling

    var maxSize = this.getMaxInputSliceCount();

After that, we are looping through and retreiving input slices using
`VVVV.Core.Pin.getValue()` on our input pin objects like this:

    for (var i=0; i<maxSize; i++) {
      var transformin = transforminIn.getValue(i);
      var xyz = xyzIn.getValue(i);
      ...
    }

The nice thing here is, "Transform In" and "XYZ In" don't need to have
the same number of slices. The getValue() function implicitly moduloes
the indices for you. Read more about the beautiful concept of spreads
and slices in [VVVV Documentation: Of Spreads and
Slices](http://vvvv.org/documentation/of-spreads-and-slices).

Next thing to do is creating a new scale matrix and - if the "Transform
In" pin has an upstream connection - multiply it.

    for (var i=0; i<maxSize; i++) {
      ...
      var t = mat4.create();
      mat4.identity(t);
      mat4.scale(t, [xyz, xyz, xyz]);
      
      if (transforminIn.isConnected()) {
        mat4.multiply(transformin, t, t);
      }
      ...
    }

Finally, we set the output pin like this:

    transformoutOut.setValue(i, t);

Before we leave `evaluate()` until next time, we set the output slice
count of our output pin by calling

    transformoutOut.setSliceCount(maxSize);

This turns out to be very important, when input slice counts decrease
dynamically during runtime. If you don't set the output slice count
manually, it won't match the input slice count.

Analogous to this, you can retreive the slice counts of individual pins
by using

    var transformSliceCount = transforminIn.getSliceCount();

To wrap things up, here's the complete `evaluate()` code:

    this.evaluate = function() {
      var maxSize = this.getMaxInputSliceCount();
      
      for (var i=0; i<maxSize; i++) {
        var transformin = transforminIn.getValue(i);
        var xyz = xyzIn.getValue(i);
        
        var t = mat4.create();
        mat4.identity(t);
        mat4.scale(t, [xyz, xyz, xyz]);
              
        if (transforminIn.isConnected()) {
          mat4.multiply(transformin, t, t);
        }
        
        transformoutOut.setValue(i, t);
      }
      transformoutOut.setSliceCount(maxSize);
    }

Creating VVVV.js-only Nodes
===========================

There might be some VVVV.js nodes, that don't exist in pure VVVV (for
example the whole Canvas category). To be able to create those nodes in
VVVV, we use (dummy) modules.

If you write a node which doesn't have an original VVVV counterpart,
create a module with the full nodename as filename (e.g. "BezierCurve
(Canvas VVVVjs).v4p"), and place it into the
*vvvv\_js\_modules*directory, you created when installing the VVVV.js
SDK (see [Patching
VVVV.js](http://substance.io/zauner/patching-vvvvjs)). Add the input and
output pins, named just like in the javascript code. You can leave the
module empty, or add some dummy behaviour. For example, the BezierCurve
(Canvas VVVVjs) node, uses the original VVVV's BezierLine (GDI) node, to
get at least *some* output for developing purposes.