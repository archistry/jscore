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
// Name:		tree.js
// Created:		Sun Feb 28 19:29:00 GMT 2010
//
///////////////////////////////////////////////////////////////////////

var Tree = archistry.data.Tree;
var TreeNode = archistry.data.tree.TreeNode;
var TreeSelection = archistry.ui.selection.TreeSelection;
var ObjectTreeModel = archistry.data.tree.ObjectTreeModel;

var TestTreeNode = function(data)
{
    $A(this).mixin(TreeNode);
    var _selected = false;
    this.data = function() { return data; };
    this.selected = function(val)
    {
        if(val === undefined)
            return _selected;

        _selected = val;
    };

    this.toString = function()
    {
        var parent = this.parent();
        return String.format("[TestTreeNode parent: {0}, path: [{1}], data: {2} ]", [ (parent ? parent.path() : "(null)"), this.path().join(", "), data ]);
    };
};

function buildTestTree(dump)
{
    // build our tree
    var root = new TestTreeNode("root");
    $Array(0, 1, 2, 3, 4).each(function(i) {
        root.insertChild(i, new TestTreeNode("Child" + this));
    });
    var child = root.firstChild();
    $Array(0, 1, 2).each(function(i) {
        child.insertChild(i, new TestTreeNode("L1 Child" + this));
    });
    child = child.nextSibling();
    $Array(0, 1, 2).each(function(i) {
        child.insertChild(i, new TestTreeNode("L1 Child" + this));
    });

    if(dump)
    {
		dumpTree(root);
    }

    return root;
}

function dumpTree(root, childProperty)
{
		childProperty = childProperty || "children";

        Console.println("---- Dumping tree ----");
        Console.println(root.toString());
//        Tree.visitChildren(root, childProperty, function(p, node, i) {
        Tree.visitChildren(root, function(p, node, i) {
            var depth = node.depth();
            var s = "";
            for(var i = 0; i < depth; ++i)
            {
                s += "  ";
            }
            Console.println(s + node);
            return true;
        });
        Console.println("---- Dumping tree complete ----");
}

function buildObjectArray(keys, length, prefix)
{
    var arr = $Array();
    for(i = 0; i < length; ++i)
    {
        var obj = $A();
        $Array(keys).each(function() {
            obj[this] = "{0}{1}{2}".format([prefix, this, i]);
        });
        arr.add(obj);
    }

    return arr;
}

function buildTreeModel(start)
{
	var darray = $Array();
	for(var i = (start ? start : 0); i < 5; ++i)
	{
	  darray.add({ key: "Key " + i, value: "Value " + i, children: [
		{ key: "Child 1", value: "Child Value #1", children: [
		  { key: "CC1", value: "CCV #1" },
		  { key: "Child Child 2", value: "Child Child Value #2" }
		]},
		{ key: "Child 2", value: "Child Value #2", children: [
		  { key: "Child Child 1", value: "Child Child Value #1" },
		  { key: "Child Child 2", value: "Child Child Value #2" }
		]}
	  ]});
	}

	return new ObjectTreeModel({
			  key: "Root", value: "I'm the root!",
			  children: darray
			}, "children");
}

