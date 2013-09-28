# io

A minimal publishing solution based on Pandoc Markdown and Substance.

## Install

It's fairly easy to install and run io locally.

### Prerequisites

- Node.js >=0.8.x
- Pandoc >= 1.12.x (for Markdown cross-compiling)

### Fresh install

First install the Substance Screwdriver command line utility. It's just a little helper that makes dealing with our many modules easier.

    $ git clone https://github.com/substance/screwdriver.git
    $ cd screwdriver
    $ sudo python setup.py install
    
Clone the io repo.

    $ git clone https://github.com/substance/io.git

Run the update command, which pulls in all the sub-modules and dependencies.

    $ cd io
    $ substance --update

Finally start the server and point your browser to `http://localhost:5000`.

    $ substance

## Managing collections and documents

Documents live under the `docs` directory and are organized in collections using a simple folder structure:

    docs/substance                    # collection folder
    docs/substance/index.json         # collection metadata
    docs/substance/about              # document folder
    docs/substance/about/index.json   # document metadata 
    docs/substance/about/content.md   # source markdown
    
