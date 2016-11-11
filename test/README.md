README for the Archistry JS Core Tests
======================================

All of the tests here are written using the Jester framework.  Anyone
who has written tests using [Testy](https://github.com/ahoward/testy)
can pretty-much see how to write and understand the Jester tests.

There are two modes of running the tests:

	1) in a browser using the alltests.html file, and
	2) on the command line using Rhino

NodeJS didn't really exist when I wrote this stuff originally, and
rhino is still probably good enough to validate the functionality.
Therefore, you also need to be able to run the Rhino environment.
This means you need a JRE and Rhino installed on your platforms.

In order to run these tests, you first need to have created all of the
dependency bundles.  To do this, you must first build the distibution
file for the library in the top level directory:

	$ (cd ..; jspkg)

You also need to build the Jester library in a similar manner:

	$ (cd ..; jspkg jester.list)

Once this is done, you need to finally build the Rhino support files
required to run the tests:

	$ jspkg rhino.list

Now, all of the tests can be run using the following command:

	$ rhino rhino.js
