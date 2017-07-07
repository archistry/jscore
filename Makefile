######################################################################
#
# Copyright (c) 2009-2017 Archistry Limited
# All rights reserved.
# 
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions
# are met:
# 
#     * Redistributions of source code must retain the above
#     copyright notice, this list of conditions and the following
#     disclaimer.
# 
#     * Redistributions in binary form must reproduce the above
#     copyright notice, this list of conditions and the following
#     disclaimer in the documentation and#or other materials provided
#     with the distribution.
# 
#     * Neither the name Archistry Limited nor the names of its
#     contributors may be used to endorse or promote products derived 
#     from this software without specific prior written permission.  
# 
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
# "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
# LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
# FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
# COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
# INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
# SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
# HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
# STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
# ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
# OF THE POSSIBILITY OF SUCH DAMAGE.
#
# File:  	Makefile
# Create:	Fri Jul  7 11:11:06 AST 2017
# Description:
#	This is the makefile for building the jscore
#	distribution.  The following targets are supported:
#
#	all: builds the archistry-core.min.js file suitable
#	     for use in web browser environments
#
#	npm: builds the archistry-core npm package that can be
#	     installed locally
#
#######################################################################

CWD		= $(shell pwd)
PKG		= package.list
JSFILES 	= $(shell find js -name \*.js -print)
YUIC		= --yui-jar $(CWD)/tools/yuicompressor-2.4.5.jar
DISTDIR 	= $(CWD)/dist
JSPKG 		= $(CWD)/tools/jspkg
JSPKG_FLAGS	= --output $(DISTDIR)
JSDOC		= $(CWD)/tools/jsdoc
NPM		= npm
RM		= rm
RMDIR		= rmdir
PKGNAME		= archistry-core
JSCORE		= $(DISTDIR)/$(PKGNAME).min.js
NPMPKG		= $(DISTDIR)/$(PKGNAME).npm
NPMCOREDIR	= $(CWD)/npm/$(PKGNAME)


all: distdir package.list browserjs npm

distdir:
	- mkdir $(DISTDIR)

browserjs: JSPKG_FLAGS += -m $(YUIC)
browserjs: $(PKG) $(JSCORE) $(JSCORE)

npm: distdir $(NPMCOREDIR)/package.json $(NPMCOREDIR)/index.js $(JSFILES)
	cd $(NPMCOREDIR) && $(JSPKG) -m $(YUIC)
	(cd $(NPMCOREDIR)/.. && tar -cvf $(NPMPKG) \
		$(PKGNAME)/package.json \
		$(PKGNAME)/index.js \
		$(PKGNAME)/core.min.js )

cleartext: distdir $(JSCORE)

$(JSCORE): $(JSFILES)
	$(JSPKG) $(JSPKG_FLAGS) $(PKG)

clean:
	- $(RM) $(JSCORE)
	- $(RM) $(NPMPKG)
	- $(RMDIR) $(DISTDIR)
	- $(RM) $(NPMCOREDIR)/core.min.js
