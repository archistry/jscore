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
// Name:		test_tree_model.js
// Created:		Mon Feb 22 21:46:21 GMT 2010
//
///////////////////////////////////////////////////////////////////////

var ArrayTreeModel = archistry.data.tree.ArrayTreeModel;

Jester.testing("Concrete TreeRowModel functionality", {
	tests: [
		{
			what: "ArrayTreeModel basic API functionality",
			how: function(result)
			{
                var data = [ 1, 2, 3, 4 ];
                var model = new ArrayTreeModel(data);
                
                result.check("root node is the model", {
                    actual: model.root(),
                    expect: model
                });

                result.check("root node is not a leaf", {
                    actual: model.isLeaf(model.root()),
                    expect: false
                });

                result.check("child count of the root is correct", {
                    actual: model.childCount(model.root()),
                    expect: 4
                });

                var child = model.child(model.root(), 0);
                result.check("child is not null", {
                    actual: child !== null,
                    expect: true
                });

                result.check("child is correct node", {
                    actual: child,
                    expect: data[0]
                });

                result.check("child is a leaf node", {
                    actual: model.isLeaf(child),
                    expect: true
                });

                result.check("child count of child is correct", {
                    actual: model.childCount(child),
                    expect: 0
                });

                result.check("child request for child is null", {
                    actual: model.child(child, 0),
                    expect: null
                });

                child = model.child(model.root(), 3);
                result.check("child index is correct", {
                    actual: model.indexOfChild(model.root(), child),
                    expect: 3
                });

                result.check("node for root is correct", {
                    actual: model.nodeForPath([]),
                    expect: model.root()
                });

                result.check("node for path is correct", {
                    actual: model.nodeForPath([ 3 ]),
                    expect: child
                });
			}
		},
		{
			what: "ArrayTreeModel fires tree-nodes-inserted on insert",
			how: function(result)
			{
                var data = [ 1, 2, 3, 4 ];
                var model = new ArrayTreeModel(data);
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
                        expect: [ model, [], model, 7, 2 ]
                    });
                });

                model.insertRow(2, 7);
                result.check("node inserted at correct location", {
                    actual: data,
                    expect: [ 1, 2, 7, 3, 4 ]
                });
                
                result.check("signal was actually fired", {
                    actual: fired,
                    expect: true
                });
			}
		},
		{
			what: "ArrayTreeModel fires tree-nodes-removed on remove",
			how: function(result)
			{
                var data = [ 1, 2, 3, 4 ];
                var model = new ArrayTreeModel(data);
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
                        expect: [ model, [], model, 4, 3 ]
                    });
                });

                model.removeRow(-1);
                result.check("node removed at correct location", {
                    actual: data,
                    expect: [ 1, 2, 3 ]
                });
                
                result.check("signal was actually fired", {
                    actual: fired,
                    expect: true
                });
			}
		},
		{
			what: "ArrayTreeModel fires tree-nodes-changed on rowChanged",
			how: function(result)
			{
                var data = [ 1, 2, 3, 4 ];
                var model = new ArrayTreeModel(data);
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
                        expect: [ model, [], model, 5, 2 ]
                    });
                });

                data[2] = 5;
                model.rowChanged(2);
                result.check("signal was actually fired", {
                    actual: fired,
                    expect: true
                });
			}
		},
		{
			what: "ArrayTreeModel fires tree-nodes-inserted on insertRows",
			how: function(result)
			{
                var data = [ 1, 2, 3, 4 ];
                var model = new ArrayTreeModel(data);
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
                        actual: [ this, e.path(), e.parent(), refs.length, refs[0].node(), refs[0].index(), e.isContiguous() ],
                        expect: [ model, [], model, 3, 7, 2, true ]
                    });
                });

                model.insertRows(2, [7, 8, 9 ]);
                result.check("nodes inserted at correct location", {
                    actual: data,
                    expect: [ 1, 2, 7, 8, 9, 3, 4 ]
                });
                
                result.check("signal was actually fired", {
                    actual: fired,
                    expect: true
                });
			}
		},
		{
			what: "ArrayTreeModel fires tree-nodes-removed on removeRows",
			how: function(result)
			{
                var data = [ 1, 2, 3, 4 ];
                var model = new ArrayTreeModel(data);
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
                        actual: [ this, e.path(), e.parent(), refs.length, refs[0].node(), refs[0].index(), e.isContiguous() ],
                        expect: [ model, [], model, 2, 3, 2, true ]
                    });
                });

                model.removeRows(-1, 2);
                result.check("node removed at correct location", {
                    actual: data,
                    expect: [ 1, 2 ]
                });
                
                result.check("signal was actually fired", {
                    actual: fired,
                    expect: true
                });
			}
		},
		{
			what: "Array row model default behavior",
			how: function(result)
			{
                var data = buildObjectArray([ "key", "value" ], 5);
                var model = new ArrayTreeModel(data);

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
                    actual: model.child(model, 0).getProperty("key"),
                    expect: data[0].key
                });

                model.child(model, 0).setProperty("key", "arf"),
                result.check("setter works correctly", {
                    actual: model.child(model, 0).getProperty("key", "arf"),
                    expect: data[0].key
                });

                result.check("model wrapped nodes != data nodes", {
                    actual: model.child(model, 0) == data[0],
                    expect: false
                });

                result.check("model wrapped nodes !== data nodes", {
                    actual: model.child(model, 0) === data[0],
                    expect: false
                });

                result.check("model wrapped nodes.equal(data) nodes", {
                    actual: model.child(model, 0).equals(data[0]),
                    expect: true
                });

                result.check("model wrapped nodes.compare(data) nodes", {
                    actual: model.child(model, 0).compare(data[0]),
                    expect: 0
                });
                
                result.check("node for path returns root", {
                    actual: model.nodeForPath([]),
                    expect: model
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

                var n1 = model.nodeForPath([3]);
                var n2 = model.nodeForPath([3]);

                result.check("Successive requests for node get same wrapped object", {
                    actual: n1.equals(n2),
                    expect: true
                });

                result.check("Successive returned objects have same ID", {
                    actual: n1.objectId() === n2.objectId(),
                    expect: true
                });
			}
		},
		{
			what: "Array row model non-wrapped behavior",
			how: function(result)
			{
                var data = buildObjectArray([ "key", "value" ], 5);
                var model = new ArrayTreeModel(data, { useAdapter: false });

                result.check("model is using object adapter", {
                    actual: model.useAdapter,
                    expect: false
                });

                result.check("model wrapped nodes == data nodes", {
                    actual: model.child(model, 0) == data[0],
                    expect: true
                });

                result.check("model wrapped nodes === data nodes", {
                    actual: model.child(model, 0) === data[0],
                    expect: true
                });

                result.check("model wrapped nodes.equal(data) nodes", {
                    actual: model.child(model, 0).equals(data[0]),
                    expect: true
                });

                result.check("model wrapped nodes.compare(data) nodes", {
                    actual: model.child(model, 0).compare(data[0]),
                    expect: 0
                });
			}
		}
	]
});
