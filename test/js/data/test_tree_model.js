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

var ArrayRowModel = archistry.data.tree.ArrayRowModel;
var ObjectRowModel = archistry.data.tree.ObjectRowModel;

Jester.testing("Concrete TreeRowModel functionality", {
	tests: [
		{
			what: "ArrayRowModel fires tree-nodes-inserted on insert",
			how: function(context, result)
			{
                var data = [ 1, 2, 3, 4 ];
                var model = new ArrayRowModel(data);
                var fired = false;
                model.immediate = true;
                model.signalConnect("tree-nodes-inserted", function(event) {
                    fired = true;
                    result.check("event list length", {
                        actual: event.length,
                        expect: 1
                    });

                    var e = event[0];
                    result.check("tree-nodes-inserted event data", {
                        actual: [ this, e.path, e.parent, e.refs[0].node, e.refs[0].index ],
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
			what: "ArrayRowModel fires tree-nodes-removed on remove",
			how: function(context, result)
			{
                var data = [ 1, 2, 3, 4 ];
                var model = new ArrayRowModel(data);
                var fired = false;
                model.immediate = true;
                model.signalConnect("tree-nodes-removed", function(event) {
                    fired = true;
                    result.check("event list length", {
                        actual: event.length,
                        expect: 1
                    });
                    
                    var e = event[0];
                    result.check("tree-nodes-removed event data", {
                        actual: [ this, e.path, e.parent, e.refs[0].node, e.refs[0].index ],
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
			what: "ArrayRowModel fires tree-nodes-changed on rowChanged",
			how: function(context, result)
			{
                var data = [ 1, 2, 3, 4 ];
                var model = new ArrayRowModel(data);
                var fired = false;
                model.immediate = true;
                model.signalConnect("tree-nodes-changed", function(event) {
                    fired = true;
                    result.check("event list length", {
                        actual: event.length,
                        expect: 1
                    });
                    
                    var e = event[0];
                    result.check("tree-nodes-changed event data", {
                        actual: [ this, e.path, e.parent, e.refs[0].node, e.refs[0].index ],
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
	]
});
