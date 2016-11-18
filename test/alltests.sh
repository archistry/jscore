#! /bin/sh -x
#
# Created: Fri Nov 18 12:01:08 SAST 2016

MINIFIY=-m

# run the console tests
(cd ..;jspkg $MINIFY)
jspkg $MINIFY rhino.list
jspkg $MINIFY rhinotests.list
rhino jrunner.js

# run the web tests
jspkg $MINIFY webtests.list
open webtests.html