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
// Name:		test_changest.js
// Created:		Wed Mar 10 14:38:32 GMT 2010
//
///////////////////////////////////////////////////////////////////////

var ChangeMemento = archistry.data.ChangeMemento;
var ChangeOp = archistry.data.ChangeOp;
var ChangeSet = archistry.data.ChangeSet;
var CompactChangeSet = archistry.data.CompactChangeSet;

Jester.testing("ChangeSet functionality", {
	tests: [
		{
			what: "ChangeMemento equality and comparison checks",
			how: function(result)
			{
                var m1 = new ChangeMemento(this, 
                        ChangeOp.PROPERTY_CHANGED, "sam", "spade");
                var m2 = new ChangeMemento(this, 
                        ChangeOp.PROPERTY_CHANGED, "sam", "spade");

                result.check("valueOf values are equal", {
                    actual: m1.valueOf(),
                    expect: m2.valueOf()
                });

                result.check("memento values are equal", {
                    actual: m1.equals(m2),
                    expect: true
                });
                
                result.check("memento values compare as 0", {
                    actual: m1.compare(m2),
                    expect: 0
                });
			}
		},
        {
			what: "ChangeSet fires object-inserted on insert",
			how: function(result)
			{
                var changes = new ChangeSet();
                var fired = false;
                changes.immediate = true;
                changes.signalConnect("object-inserted", function(index, event) {
                    fired = true;
                    result.check("memento index is correct", {
                        actual: index,
                        expect: 0
                    });

                    result.check("memento values are correct", {
                        actual:  event.valueOf(),
                        expect: [ this, ChangeOp.PROPERTY_CHANGED, "sam", "spade" ]
                    });
                    
                    result.check("memento accessor values are correct", {
                        actual:  [ event.object(), event.change(), event.key(), event.value() ],
                        expect: [ this, ChangeOp.PROPERTY_CHANGED, "sam", "spade" ]
                    });
                });

                result.check("size is correctly initialized", {
                    actual: changes.size(),
                    expect: 0
                });
                
                changes.add(new ChangeMemento(this, 
                        ChangeOp.PROPERTY_CHANGED, "sam", "spade"));

                result.check("size is correctly incremented", {
                    actual: changes.size(),
                    expect: 1
                });
                
                var m = changes.get(0);
                result.check("memento retrieved correctly", {
                    actual:  [ m.object(), m.change(), m.key(), m.value() ],
                    expect: [ this, ChangeOp.PROPERTY_CHANGED, "sam", "spade" ]
                });

                result.check("signal was actually fired", {
                    actual: fired,
                    expect: true
                });
			}
		},
		{
			what: "ChangeSet fires object-deleted on remove",
			how: function(result)
			{
                var changes = new ChangeSet();
                var fired = false;
                changes.immediate = true;
                changes.signalConnect("object-deleted", function(index, event) {
                    fired = true;
                    result.check("memento index is correct", {
                        actual: index,
                        expect: 1
                    });

                    result.check("memento values are correct", {
                        actual:  event.valueOf(),
                        expect: [ this, ChangeOp.PROPERTY_CHANGED, "sam", "spade" ]
                    });
                    
                    result.check("memento accessor values are correct", {
                        actual:  [ event.object(), event.change(), event.key(), event.value() ],
                        expect: [ this, ChangeOp.PROPERTY_CHANGED, "sam", "spade" ]
                    });
                });

                result.check("size is correctly initialized", {
                    actual: changes.size(),
                    expect: 0
                });
                
                changes.add(new ChangeMemento(this,
                        ChangeOp.PROPERTY_CHANGED, "xxx", "xxx"));

                var change = new ChangeMemento(this, 
                        ChangeOp.PROPERTY_CHANGED, "sam", "spade");
                changes.add(change);
                
                result.check("size is correctly incremented", {
                    actual: changes.size(),
                    expect: 2
                });
                
                var val = changes.remove(change);
                
                result.check("value returned correctly", {
                    actual: change,
                    expect: val
                });
                
                result.check("size is correctly decremented", {
                    actual: changes.size(),
                    expect: 1
                });
                
                result.check("signal was actually fired", {
                    actual: fired,
                    expect: true
                });
			}
		},
		{
			what: "CompactChangeSet folds entries correctly with defaults",
			how: function(result)
			{
                var changes = new CompactChangeSet();

                result.check("size is correctly initialized", {
                    actual: changes.size(),
                    expect: 0
                });
                
                changes.add(new ChangeMemento(this,
                        ChangeOp.PROPERTY_CHANGED, "xxx", "xxx"));

                var change = new ChangeMemento(this, 
                        ChangeOp.PROPERTY_CHANGED, "sam", "spade");
                changes.add(change);
                
                result.check("size represents folded changes", {
                    actual: changes.size(),
                    expect: 1
                });
                
                result.check("last change returned correctly", {
                    actual: changes.get(0),
                    expect: change
                });
			}
		},
		{
			what: "CompactChangeSet folds entries correctly with user function",
			how: function(result)
			{
                var changes = new CompactChangeSet({
                    getKey: function(memento) {
                        return [ memento.object().object_id(), memento.key() ].join(":");
                    }
                });

                result.check("size is correctly initialized", {
                    actual: changes.size(),
                    expect: 0
                });
                
                changes.add(new ChangeMemento(this,
                        ChangeOp.PROPERTY_CHANGED, "xxx", "xxx"));
                
                changes.add(new ChangeMemento(this,
                        ChangeOp.PROPERTY_CHANGED, "sam", "xxx"));


                var change = new ChangeMemento(this, 
                        ChangeOp.PROPERTY_CHANGED, "sam", "spade");
                changes.add(change);
                
                result.check("size represents folded changes", {
                    actual: changes.size(),
                    expect: 2
                });
                
                result.check("last change returned correctly", {
                    actual: changes.get(1),
                    expect: change
                });
			}
		},
        {
			what: "CompactChangeSet fires object-inserted on insert",
			how: function(result)
			{
                var changes = new CompactChangeSet();
                var fired = false;
                changes.immediate = true;
                changes.signalConnect("object-inserted", function(index, event) {
                    fired = true;
                    result.check("memento index is correct", {
                        actual: index,
                        expect: 0
                    });

                    result.check("memento values are correct", {
                        actual:  event.valueOf(),
                        expect: [ this, ChangeOp.PROPERTY_CHANGED, "sam", "spade" ]
                    });
                    
                    result.check("memento accessor values are correct", {
                        actual:  [ event.object(), event.change(), event.key(), event.value() ],
                        expect: [ this, ChangeOp.PROPERTY_CHANGED, "sam", "spade" ]
                    });
                });

                result.check("size is correctly initialized", {
                    actual: changes.size(),
                    expect: 0
                });
                
                changes.add(new ChangeMemento(this, 
                        ChangeOp.PROPERTY_CHANGED, "sam", "spade"));

                result.check("size is correctly incremented", {
                    actual: changes.size(),
                    expect: 1
                });
                
                var m = changes.get(0);
                result.check("memento retrieved correctly", {
                    actual:  [ m.object(), m.change(), m.key(), m.value() ],
                    expect: [ this, ChangeOp.PROPERTY_CHANGED, "sam", "spade" ]
                });

                result.check("signal was actually fired", {
                    actual: fired,
                    expect: true
                });
			}
		},
		{
			what: "CompactChangeSet fires object-deleted on remove",
			how: function(result)
			{
                var changes = new CompactChangeSet();
                var fired = false;
                changes.immediate = true;
                changes.signalConnect("object-deleted", function(index, event) {
                    fired = true;
                    result.check("memento index is correct", {
                        actual: index,
                        expect: 0
                    });

                    result.check("memento values are correct", {
                        actual:  event.valueOf(),
                        expect: [ this, ChangeOp.PROPERTY_CHANGED, "sam", "spade" ]
                    });
                    
                    result.check("memento accessor values are correct", {
                        actual:  [ event.object(), event.change(), event.key(), event.value() ],
                        expect: [ this, ChangeOp.PROPERTY_CHANGED, "sam", "spade" ]
                    });
                });

                result.check("size is correctly initialized", {
                    actual: changes.size(),
                    expect: 0
                });
                
                changes.add(new ChangeMemento(this,
                        ChangeOp.PROPERTY_CHANGED, "xxx", "xxx"));

                var change = new ChangeMemento(this, 
                        ChangeOp.PROPERTY_CHANGED, "sam", "spade");
                changes.add(change);
                
                result.check("size is correctly incremented", {
                    actual: changes.size(),
                    expect: 1
                });
                
                var val = changes.remove(change);
                
                result.check("value returned correctly", {
                    actual: change,
                    expect: val
                });
                
                result.check("size is correctly decremented", {
                    actual: changes.size(),
                    expect: 0
                });
                
                result.check("signal was actually fired", {
                    actual: fired,
                    expect: true
                });
			}
		},
		{
			what: "CompactChangeSet fires object-changed on add same key",
			how: function(result)
			{
                var changes = new CompactChangeSet();
                var fired = false;
                changes.immediate = true;
                changes.signalConnect("object-changed", function(index, event) {
                    fired = true;
                    result.check("memento index is correct", {
                        actual: index,
                        expect: 0
                    });

                    result.check("memento values are correct", {
                        actual:  event.valueOf(),
                        expect: [ this, ChangeOp.PROPERTY_CHANGED, "sam", "spade" ]
                    });
                    
                    result.check("memento accessor values are correct", {
                        actual:  [ event.object(), event.change(), event.key(), event.value() ],
                        expect: [ this, ChangeOp.PROPERTY_CHANGED, "sam", "spade" ]
                    });
                });

                result.check("size is correctly initialized", {
                    actual: changes.size(),
                    expect: 0
                });
                
                changes.add(new ChangeMemento(this,
                        ChangeOp.PROPERTY_CHANGED, "sam", "xxx"));

                var change = new ChangeMemento(this, 
                        ChangeOp.PROPERTY_CHANGED, "sam", "spade");
                changes.add(change);
                
                result.check("size is correctly incremented", {
                    actual: changes.size(),
                    expect: 1
                });
                
                var val = changes.get(0);
                
                result.check("value returned correctly", {
                    actual: change,
                    expect: val
                });
                
                result.check("signal was actually fired", {
                    actual: fired,
                    expect: true
                });
			}
		}
	]
});
