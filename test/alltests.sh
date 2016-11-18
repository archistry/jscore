#! /bin/sh -x
#
# Created: Fri Nov 18 12:01:08 SAST 2016

# run the console tests
(cd ..;jspkg -m)
jspkg -m rhino.list
jspkg -m rhinotests.list
rhino jrunner.js

# run the web tests
jspkg -m webtests.list
open webtests.html
