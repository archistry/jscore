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

var Tree = archistry.data.Tree;
var TreeNode = archistry.data.tree.TreeNode;
var TreeSelection = archistry.ui.selection.TreeSelection;

TestTreeNode = function(data)
{
    this.mixin(TreeNode);
    var _selected = false;
    this.__defineGetter__("data", function() { return data; });
    this.selected = function(val)
    {
        if(val === undefined)
            return _selected;

        _selected = val;
    };

    this.toString = function()
    {
        var parent = this.parent();
        return String.format("[TestTreeNode parent: {0}, path: [{1}], data: {2} ]", [ (parent ? parent : "(null)"), this.path().join(", "), data ]);
    };
};

Jester.testing("TreeSelectionRange functionality", {
    setup: function(context) {
            // build our tree
            var root = new TestTreeNode("root");
            [ 0, 1, 2, 3, 4 ].each(function(i) {
                root.insertChild(i, new TestTreeNode("Child" + this));
            });
            var child = root.firstChild();
            [ 0, 1, 2 ].each(function(i) {
                child.insertChild(i, new TestTreeNode("L1 Child" + this));
            });
            child = child.nextSibling();
            [ 0, 1, 2 ].each(function(i) {
                child.insertChild(i, new TestTreeNode("L1 Child" + this));
            });

            println("---- Dumping tree ----");
            println(root.toString());
            Tree.visitChildren(root, "children", function(p, node, i) {
                var depth = node.depth();
                var s = "";
                for(var i = 0; i < depth; ++i)
                {
                    s += "  ";
                }
                println(s + node);
                return true;
            });
            println("---- Dumping tree complete ----");
            context.tree = root;
    },
	tests: [
		{
			what: "Select a single node in the tree",
			how: function(context, result)
			{
                var selection = new TreeSelection(this);
                var node = context.tree.firstChild();
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
                    actual: range[0].length,
                    expect: 1
                });

                result.check("The correct node is the start of the range", {
                    actual: range[0].start,
                    expect: node.path()
                });
                
                result.check("The correct node is the end of the range", {
                    actual: range[0].end,
                    expect: node.path()
                });
			}
		},
		{
			what: "Select a node range",
			how: function(context, result)
			{
                var selection = new TreeSelection(this);
                var node = context.tree.firstChild();
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

                println("range: " + range[0].toString());

                result.check("There should only be one selection range", {
                    actual: range.length,
                    expect: 1
                });
               
                result.check("The range contains correct node count", {
                    actual: range[0].length,
                    expect: 3
                });

                result.check("The correct node is the start of the range", {
                    actual: range[0].start,
                    expect: node.firstChild().path()
                });
                
                result.check("The correct node is the end of the range", {
                    actual: range[0].end,
                    expect: node.lastChild().path()
                });
			}
		},
		{
			what: "Extend parent selection with child",
			how: function(context, result)
			{
                var selection = new TreeSelection(this);
                var node = context.tree.firstChild();
                node.selected(true);
                selection.add(node);
                var child = node.firstChild();
                child.selected(true);
                selection.add(child);
                
                var range = [];
                selection.each(function() {
                    range.add(this);
                });

                println("range: " + range[0].toString());

                result.check("There should only be one selection range", {
                    actual: range.length,
                    expect: 1
                });
               
                result.check("The range contains correct node count", {
                    actual: range[0].length,
                    expect: 2
                });

                result.check("The correct node is the start of the range", {
                    actual: range[0].start,
                    expect: node.path()
                });
                
                result.check("The correct node is the end of the range", {
                    actual: range[0].end,
                    expect: child.path()
                });
			}
		},
		{
			what: "Extend last child selection to next parent",
			how: function(context, result)
			{
                var selection = new TreeSelection(this);
                var node = context.tree.firstChild();
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

                println("range: " + range[0].toString());

                result.check("There should only be one selection range", {
                    actual: range.length,
                    expect: 1
                });
               
                result.check("The range contains correct node count", {
                    actual: range[0].length,
                    expect: 2
                });

                result.check("The correct node is the start of the range", {
                    actual: range[0].start,
                    expect: child.path()
                });
                
                result.check("The correct node is the end of the range", {
                    actual: range[0].end,
                    expect: sib.path()
                });
			}
		},
		{
			what: "Extend parent selection to prev sibling's last child",
			how: function(context, result)
			{
                var selection = new TreeSelection(this);
                var node = context.tree.firstChild();
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

                println("range: " + range[0].toString());

                result.check("There should only be one selection range", {
                    actual: range.length,
                    expect: 1
                });
               
                result.check("The range contains correct node count", {
                    actual: range[0].length,
                    expect: 2
                });

                result.check("The correct node is the start of the range", {
                    actual: range[0].start,
                    expect: child.path()
                });
                
                result.check("The correct node is the end of the range", {
                    actual: range[0].end,
                    expect: sib.path()
                });
			}
		},
		{
			what: "Join child node selection with parent",
			how: function(context, result)
			{
                var selection = new TreeSelection(this);
                var node = context.tree.firstChild();
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
             
                println(range.length);
                result.check("The range contains correct node count", {
                    actual: range[0].length,
                    expect: 3
                });

                result.check("The correct node is the start of the range", {
                    actual: range[0].start,
                    expect: node.path()
                });
                
                result.check("The correct node is the end of the range", {
                    actual: range[0].end,
                    expect: node.child(1).path()
                });
			}
		},
		{
			what: "Join child node selection with parent next sibling",
			how: function(context, result)
			{
                var selection = new TreeSelection(this);
                var node = context.tree.firstChild();
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
                    actual: range[0].length,
                    expect: 3
                });

                result.check("The correct node is the start of the range", {
                    actual: range[0].start,
                    expect: node.lastChild().path()
                });
                
                result.check("The correct node is the end of the range", {
                    actual: range[0].end,
                    expect: sibling.firstChild().path()
                });
			}
		},
		{
			what: "Join child node selection with parent prev sibling last child",
			how: function(context, result)
			{
                var selection = new TreeSelection(this);
                var node = context.tree.firstChild();
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
                    actual: range[0].length,
                    expect: 3
                });

                result.check("The correct node is the start of the range", {
                    actual: range[0].start,
                    expect: node.lastChild().path()
                });
                
                result.check("The correct node is the end of the range", {
                    actual: range[0].end,
                    expect: sibling.firstChild().path()
                });
			}
		}
	]
});
