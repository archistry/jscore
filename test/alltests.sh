#! /bin/sh -x
#
# Created: Fri Nov 18 12:01:08 SAST 2016

# MINIFY=-m

# run the console tests
(cd ..;jspkg $MINIFY)
(cd ..;jspkg jester.list $MINIFY)
#jspkg $MINIFY rhinotests.list
#rhino jester.js

# run the web tests
jspkg $MINIFY webtests.list
open webtests.html
