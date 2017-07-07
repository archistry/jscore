README for Archistry Core JavaScript Library
============================================

Last updated: Sat Nov 12 15:54:42 SAST 2016

Getting Started - Command Line
==============================

The Archistry JS library is designed to work with both the
native browser JavaScript engines as well as the Rhino engine
from the command line.

To build the installation packages, you also need to have the
Ruby language installed so that you can run the 'jspkg'
command in the tools directory.

Rhino JavaScript Engine
-----------------------

To use the library from the command line, you need to have the
Mozilla Rhino JavaScript engine available.  Installation on
MacOS X is easy from MacPorts:

    $ sudo port install rhino

On other operating systems, the installation may be more
complex.

Building the Library
--------------------

"Building" the library simply means packaging and optionally
minimizing the library source into a single, installable
JavaScript file.  This requires the 'jspkg' command from the
[tecode-ruby](https://github.com/atownley/tecode-ruby) repository.

To build the unimimized package, execute the following
command:

    $ make cleartext

To build a minimized version of the package, execute the following
command:

    $ make

By default, both the browser bundle and the NPM packages are built.
There are multiple NPM packages for each of the separate packages.

Running the Tests
-----------------

The test cases for the library are written for the Archistry
Jester test framework.  Jester is loosely based on Ara T.
Howard's [Testy test framework for Ruby](https://github.com/ahoward/testy), and will print results
using the YAML format with the command-line runner.

### Running Tests with Rhino

To run the tests, ensure that the deliverables have been built
and execute the following commands (examples assume UNIX-like
shell):

    $ cd test
    $ rhino rhino.js

