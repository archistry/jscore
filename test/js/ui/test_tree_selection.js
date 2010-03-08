//////////////////////////////////////////////////////////////////////
//
// Copyright (c) 2010 Archistry Limited
// All rights reserved.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 
//     * Redistributions of source code must retain the above
//     copyright notice, this list of conditions and the following
//     disclaimer.
// 
//     * Redistributions in binary form must reproduce the above
//     copyright notice, this list of conditions and the following
//     disclaimer in the documentation and/or other materials provided
//     with the distribution.
// 
//     * Neither the name Archistry Limited nor the names of its
//     contributors may be used to endorse or promote products derived 
//     from this software without specific prior written permission.  
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
// COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
// HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
// OF THE POSSIBILITY OF SUCH DAMAGE.
//
// Name:		test_tree_selection.js
// Created:		Sun Feb 28 19:29:00 GMT 2010
//
///////////////////////////////////////////////////////////////////////

Jester.testing("TreeSelectionRange functionality", {
    setup: function() {
        this.tree = buildTestTree(false);
    },
	tests: [
		{
			what: "Select a single node in the tree",
			how: function(result)
			{
                var selection = new TreeSelection(this);
                var node = this.tree.firstChild();
                node.selected(true);
                selection.add(node);
                var range = [];
                selection.each(function() {
                    range.add(this);
                });

                result.check("There should only be one selection range", {
                    actual: range.length,
                    expect: 1
                });
               
                result.check("The range should have 1 element", {
                    actual: range[0].length(),
                    expect: 1
                });

                result.check("The correct node is the start of the range", {
                    actual: range[0].start(),
                    expect: node.path()
                });
                
                result.check("The correct node is the end of the range", {
                    actual: range[0].end(),
                    expect: node.path()
                });
			}
		},
		{
			what: "Select a node range",
			how: function(result)
			{
                var selection = new TreeSelection(this);
                var node = this.tree.firstChild();
                for(var i = 0; i < node.childCount(); ++i)
                {
                    var child = node.child(i);
                    println("selecting node: " + child.path().join(","));
                    child.selected(true);
                    selection.add(child);
                }
                
                var range = [];
                selection.each(function() {
                    range.add(this);
                });

                result.check("There should only be one selection range", {
                    actual: range.length,
                    expect: 1
                });
               
                result.check("The range contains correct node count", {
                    actual: range[0].length(),
                    expect: 3
                });

                result.check("The correct node is the start of the range", {
                    actual: range[0].start(),
                    expect: node.firstChild().path()
                });
                
                result.check("The correct node is the end of the range", {
                    actual: range[0].end(),
                    expect: node.lastChild().path()
                });
			}
		},
		{
			what: "Extend parent selection with child",
			how: function(result)
			{
                var selection = new TreeSelection(this);
                var node = this.tree.firstChild();
                node.selected(true);
                selection.add(node);
                var child = node.firstChild();
                child.selected(true);
                selection.add(child);
                
                var range = [];
                selection.each(function() {
                    range.add(this);
                });

                result.check("There should only be one selection range", {
                    actual: range.length,
                    expect: 1
                });
               
                result.check("The range contains correct node count", {
                    actual: range[0].length(),
                    expect: 2
                });

                result.check("The correct node is the start of the range", {
                    actual: range[0].start(),
                    expect: node.path()
                });
                
                result.check("The correct node is the end of the range", {
                    actual: range[0].end(),
                    expect: child.path()
                });
			}
		},
		{
			what: "Extend last child selection to next parent",
			how: function(result)
			{
                var selection = new TreeSelection(this);
                var node = this.tree.firstChild();
                var child = node.lastChild();
                child.selected(true);
                selection.add(child);
                var sib = node.nextSibling();
                sib.selected(true);
                selection.add(sib);
                
                var range = [];
                selection.each(function() {
                    range.add(this);
                });

                result.check("There should only be one selection range", {
                    actual: range.length,
                    expect: 1
                });
               
                result.check("The range contains correct node count", {
                    actual: range[0].length(),
                    expect: 2
                });

                result.check("The correct node is the start of the range", {
                    actual: range[0].start(),
                    expect: child.path()
                });
                
                result.check("The correct node is the end of the range", {
                    actual: range[0].end(),
                    expect: sib.path()
                });
			}
		},
		{
			what: "Extend parent selection to prev sibling's last child",
			how: function(result)
			{
                var selection = new TreeSelection(this);
                var node = this.tree.firstChild();
                var sib = node.nextSibling();
                sib.selected(true);
                selection.add(sib);
                var child = node.lastChild();
                child.selected(true);
                selection.add(child);
                
                var range = [];
                selection.each(function() {
                    range.add(this);
                });

                result.check("There should only be one selection range", {
                    actual: range.length,
                    expect: 1
                });
               
                result.check("The range contains correct node count", {
                    actual: range[0].length(),
                    expect: 2
                });

                result.check("The correct node is the start of the range", {
                    actual: range[0].start(),
                    expect: child.path()
                });
                
                result.check("The correct node is the end of the range", {
                    actual: range[0].end(),
                    expect: sib.path()
                });
			}
		},
		{
			what: "Join child node selection with parent",
			how: function(result)
			{
                var selection = new TreeSelection(this);
                var node = this.tree.firstChild();
                node.selected(true);
                selection.add(node);

                var child = node.child(1);
                child.selected(true);
                selection.add(child);
                
                var range = [];
                selection.each(function() {
                    range.add(this);
                });

                result.check("There should be two selection ranges", {
                    actual: range.length,
                    expect: 2
                });
               
                // now, we join the selection
                child = node.firstChild();
                child.selected(true);
                selection.add(child);

                range.clear();
                selection.each(function() {
                    range.add(this);
                });

                result.check("There should be 1 selection range", {
                    actual: range.length,
                    expect: 1
                });
             
//                println("range length: " + range.length);
                result.check("The range contains correct node count", {
                    actual: range[0].length(),
                    expect: 3
                });

                result.check("The correct node is the start of the range", {
                    actual: range[0].start(),
                    expect: node.path()
                });
                
                result.check("The correct node is the end of the range", {
                    actual: range[0].end(),
                    expect: node.child(1).path()
                });
			}
		},
		{
			what: "Join child node selection with parent next sibling",
			how: function(result)
			{
                var selection = new TreeSelection(this);
                var node = this.tree.firstChild();
                var child = node.lastChild();
                child.selected(true);
                selection.add(child);
                var sibling = node.nextSibling();
                child = sibling.firstChild();
                child.selected(true);
                selection.add(child);

                var range = [];
                selection.each(function() {
                    range.add(this);
                });

                result.check("There should be two selection ranges", {
                    actual: range.length,
                    expect: 2
                });
               
                // now, we join the selection
                sibling.selected(true);
                selection.add(sibling);

                range.clear();
                selection.each(function() {
                    range.add(this);
                });

                result.check("There should be 1 selection range", {
                    actual: range.length,
                    expect: 1
                });
               
                result.check("The range contains correct node count", {
                    actual: range[0].length(),
                    expect: 3
                });

                result.check("The correct node is the start of the range", {
                    actual: range[0].start(),
                    expect: node.lastChild().path()
                });
                
                result.check("The correct node is the end of the range", {
                    actual: range[0].end(),
                    expect: sibling.firstChild().path()
                });
			}
		},
		{
			what: "Join child node selection with parent prev sibling last child",
			how: function(result)
			{
                var selection = new TreeSelection(this);
                var node = this.tree.firstChild();
                var sibling = node.nextSibling();
                var child = sibling.firstChild();
                child.selected(true);
                selection.add(child);
                child = node.lastChild();
                child.selected(true);
                selection.add(child);

                var range = [];
                selection.each(function() {
                    range.add(this);
                });

                result.check("There should be two selection ranges", {
                    actual: range.length,
                    expect: 2
                });
               
                // now, we join the selection
                sibling.selected(true);
                selection.add(sibling);

                range.clear();
                selection.each(function() {
                    range.add(this);
                });

                result.check("There should be 1 selection range", {
                    actual: range.length,
                    expect: 1
                });
               
                result.check("The range contains correct node count", {
                    actual: range[0].length(),
                    expect: 3
                });

                result.check("The correct node is the start of the range", {
                    actual: range[0].start(),
                    expect: node.lastChild().path()
                });
                
                result.check("The correct node is the end of the range", {
                    actual: range[0].end(),
                    expect: sibling.firstChild().path()
                });
			}
		},
		{
			what: "Select and then unselect removes selection range",
			how: function(result)
			{
                var selection = new TreeSelection(this);
                var node = this.tree.firstChild();
                node.selected(true);
                selection.add(node);
                
                var range = [];
                selection.each(function() {
                    range.add(this);
                });

                result.check("There should be one node selected", {
                    actual: range[0].length(),
                    expect: 1
                });
              
                node.selected(false);
                selection.remove(node);
                
                range.clear();
                selection.each(function() {
                    range.add(this);
                });
                result.check("There should be 0 selection ranges", {
                    actual: range.length,
                    expect: 0
                });
            }
        },
		{
			what: "Select disconnected ranges in inverse order has ordered ranges",
			how: function(result)
			{
                var selection = new TreeSelection(this);
                var node = this.tree.firstChild();
                node.lastChild().selected(true);
                selection.add(node.lastChild());
                node.firstChild().selected(true);
                selection.add(node.firstChild());
                
                var range = [];
                selection.each(function() {
                    range.add(this);
                });

                result.check("There should be two ranges selected", {
                    actual: range.length,
                    expect: 2
                });
             
                var paths = [];
                range.each(function() {
                    this.each(function() {
                        paths.add(this.path());
                    });
                });

                result.check("The paths should be in ascending order", {
                    actual: paths,
                    expect: [ [ 0, 0 ], [ 0, 2 ] ]
                });
            }
        }
	]
});
