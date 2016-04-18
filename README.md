**This project is deprecated**.

[substance]: https://github.com/substance/substance

# Substance IO

A minimal publishing solution based on Pandoc Markdown and Substance.

## Development Status

Development of [substance.io](http://substance.io)
has been delegated to [another repository][substance].

This repository is deprecated.

## Prerequisites

- Node.js >=0.10.x
- Pandoc >= 1.12.02 (for Markdown cross-compiling)

## Install (Deprecated)

Substance.IO comes as a ready-to-use NPM module:

    $ sudo npm install -g substance-io

To view a document library (such as [Substance Documents](https://github.com/substance/docs))
call:

    $ cd /path/to/library
    $ io

Or alternatively you can point to that folder using:

    $ io <path-to-library-folder>


## Managing collections and documents

Documents are managed by convention in a directory structure having folders for collections
and subfolders for documents. For example:

    mylibrary/substance                    # collection folder
    mylibrary/substance/index.json         # collection metadata
    mylibrary/substance/about              # document folder
    mylibrary/substance/about/index.json   # document metadata
    mylibrary/substance/about/content.md   # source markdown

This would define a library with one collection with id `substance` having one document with id `about`.

## Development Environment

For development we use a setup based on our Screwdriver command line utility. It's just a little helper that makes dealing with our many modules easier.

    $ git clone https://github.com/substance/screwdriver.git
    $ cd screwdriver
    $ sudo python setup.py install

Clone the io repo.

    $ git clone https://github.com/substance/io.git

Run the update command, which pulls in all the sub-modules and dependencies.

    $ cd io
    $ substance --update

Finally start the server and point your browser to `http://localhost:5000`.

    $ substance <path-to-library-folder>
