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
// Name:		test_object_tree_model.js
// Created:		Sun Mar  7 13:41:41 GMT 2010
//
///////////////////////////////////////////////////////////////////////

var ObjectTreeModel = archistry.data.tree.ObjectTreeModel;

Jester.testing("Concrete ObjectTreeModel functionality", {
	tests: [
		{
			what: "ObjectTreeModel default behavior",
			how: function(result)
			{
                var data = buildObjectArray([ "key", "value" ], 5);
                var root = $A({ key: "Root", children: data });
                var model = new ObjectTreeModel(root, "children");

                result.check("model is editable", {
                    actual: model.editable,
                    expect: true
                });

                result.check("model is using object adapter", {
                    actual: model.useAdapter,
                    expect: true
                });

                result.check("model using default getters", {
                    actual: model.getter === undefined,
                    expect: true
                });

                result.check("model using default setters", {
                    actual: model.setter !== undefined,
                    expect: true
                });
                
                result.check("getter works correctly", {
                    actual: model.child(root, 0).getProperty("key"),
                    expect: data[0].key
                });

                model.child(root, 0).setProperty("key", "arf"),
                result.check("setter works correctly", {
                    actual: model.child(root, 0).getProperty("key", "arf"),
                    expect: data[0].key
                });

                result.check("model wrapped nodes != data nodes", {
                    actual: model.child(root, 0) == data[0],
                    expect: false
                });

                result.check("model wrapped nodes !== data nodes", {
                    actual: model.child(root, 0) === data[0],
                    expect: false
                });

                result.check("model wrapped nodes.equal(data) nodes", {
                    actual: model.child(root, 0).equals(data[0]),
                    expect: true
                });

                result.check("model wrapped nodes.compare(data) nodes", {
                    actual: model.child(root, 0).compare(data[0]),
                    expect: 0
                });

                result.check("node for path returns root", {
                    actual: model.nodeForPath([]),
                    expect: root
                });

                result.check("root node from model is ObjectAdapter", {
                    actual: model.nodeForPath([]) instanceof archistry.data.ObjectAdapter,
                    expect: true 
                });

                result.check("node for path returns leaf", {
                    actual: model.nodeForPath([3]),
                    expect: data[3]
                });

                result.check("child node from model is ObjectAdapter", {
                    actual: model.nodeForPath([3]) instanceof archistry.data.ObjectAdapter,
                    expect: true 
                });

                result.check("node wrapped with native toHashString", {
                    actual: model.root().toHashString !== undefined,
                    expect: true
                });
			}
		},
		{
			what: "ObjectTreeModel non-wrapped behavior",
			how: function(result)
			{
                var data = buildObjectArray([ "key", "value" ], 5);
                var root = $A({ key: "Root", children: data });
                var model = new ObjectTreeModel(root, "children", { useAdapter: false });

                $Array([ root ].concat(data)).each(function(i) {
                    this.getProperty = function(key) {
                        return this[key];
                    };
                });

                result.check("model is using object adapter", {
                    actual: model.useAdapter,
                    expect: false
                });

                result.check("model nodes == data nodes", {
                    actual: model.child(root, 0) == data[0],
                    expect: true
                });

                result.check("model nodes === data nodes", {
                    actual: model.child(root, 0) === data[0],
                    expect: true
                });

                result.check("model nodes.equal(data) nodes", {
                    actual: model.child(root, 0).equals(data[0]),
                    expect: true
                });

                result.check("model nodes.compare(data) nodes", {
                    actual: model.child(root, 0).compare(data[0]),
                    expect: 0
                });
			}
		},
		{
			what: "ObjectTreeModel fires tree-nodes-inserted on insert",
			how: function(result)
			{
                var data = buildObjectArray([ "key", "value" ], 5);
                var root = $A({ key: "Root", children: data });
                var model = new ObjectTreeModel(root, "children");
                var fired = false;
                var node = $A({ key: "New node", value: "X" });
                
                model.immediate = true;
                model.signalConnect("tree-nodes-inserted", function(event) {
                    fired = true;
                    result.check("event list length", {
                        actual: event.length,
                        expect: 1
                    });

                    var e = event[0];
                    var refs = e.refs();
                    result.check("tree-nodes-inserted event data", {
                        actual: [ this, e.path(), e.parent(), refs[0].node(), refs[0].index() ],
                        expect: [ model, [0], data[0], node, 0 ]
                    });
                });

                model.insertNode([0], -1, node);
                result.check("node inserted at correct location", {
                    actual: data[0].children,
                    expect: [ node ]
                });
                
                result.check("insertion point is no longer a leaf node", {
                    actual: !model.isLeaf(data[0]),
                    expect: true
                });

                result.check("signal was actually fired", {
                    actual: fired,
                    expect: true
                });
			}
		},
		{
			what: "ObjectTree fires tree-nodes-removed on remove",
			how: function(result)
			{
                var data = buildObjectArray([ "key", "value" ], 5);
                var root = $A({ key: "Root", children: data });
                var model = new ObjectTreeModel(root, "children");
                var fired = false;
                model.immediate = true;
                model.signalConnect("tree-nodes-removed", function(event) {
                    fired = true;
                    result.check("event list length", {
                        actual: event.length,
                        expect: 1
                    });

                    var e = event[0];
                    var refs = e.refs();
                    result.check("tree-nodes-removed event data", {
                        actual: [ this, e.path(), e.parent(), refs[0].node(), refs[0].index() ],
                        expect: [ model, [], root, { key: "key4", value: "value4" }, 4 ]
                    });
                });

                var dnode = data[4];
                var node = model.removeNode([ 4 ]);
                result.check("node removed at correct location", {
                    actual: node,
                    expect: dnode
                });

                result.check("data contents are correct", {
                    actual: data,
                    expect: buildObjectArray(["key", "value"], 4)
                });
                
                result.check("signal was actually fired", {
                    actual: fired,
                    expect: true
                });
			}
		},
		{
			what: "ObjectTreeModel fires tree-nodes-changed on nodeChanged",
			how: function(result)
			{
                var data = buildObjectArray([ "key", "value" ], 5);
                var root = $A({ key: "Root", children: data });
                var model = new ObjectTreeModel(root, "children");
                var fired = false;
                model.immediate = true;
                model.signalConnect("tree-nodes-changed", function(event) {
                    fired = true;
                    result.check("event list length", {
                        actual: event.length,
                        expect: 1
                    });

                    var e = event[0];
                    var refs = e.refs();
                    result.check("tree-nodes-changed event data", {
                        actual: [ this, e.path(), e.parent(), refs[0].node(), refs[0].index() ],
                        expect: [ model, [0], root, data[4], 5 ]
                    });
                });

                model.nodeChanged([ 4 ]);
                result.check("signal was actually fired", {
                    actual: fired,
                    expect: true
                });
			}
		},
		{
			what: "ObjectTreeModel fires tree-nodes-inserted on insertNodes",
			how: function(result)
			{
                var data = buildObjectArray([ "key", "value" ], 5);
                var root = $A({ key: "Root", children: data });
                var model = new ObjectTreeModel(root, "children");
                var fired = false;
                model.immediate = true;
                model.signalConnect("tree-nodes-inserted", function(event) {
                    fired = true;
                    result.check("event list length", {
                        actual: event.length,
                        expect: 1
                    });

                    var e = event[0];
                    var refs = e.refs();
                    result.check("tree-nodes-inserted event data", {
                        actual: [ this, e.path(), e.parent(), refs[0].node(), refs[0].index() ],
                        expect: [ model, [0], root, data[5], 5 ]
                    });
                });

           
                var added = buildObjectArray([ "key", "value" ], 2, "foo");
                model.insertNode([], -1, added);
                result.check("node inserted at correct location", {
                    actual: data,
                    expect: buildObjectArray([ "key", "value" ], 5).add(added)
                });
                
                result.check("signal was actually fired", {
                    actual: fired,
                    expect: true
                });
			}
		}
	]
});
