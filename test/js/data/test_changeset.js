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
// Name:        test_changest.js
// Created:        Wed Mar 10 14:38:32 GMT 2010
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
            what: "ChangeSet fires object-added on insert",
            how: function(result)
            {
                var changes = new ChangeSet();
                var fired = false;
                var change = new ChangeMemento(this, 
                        ChangeOp.PROPERTY_CHANGED, "sam", "spade");

                changes.immediate = true;
                changes.signalConnect("object-added", function(memento) {
                    fired = true;
                    result.check("memento values are correct", {
                        actual:  memento.valueOf(),
                        expect: [ change, ChangeOp.OBJECT_ADDED, undefined, undefined, undefined ]
                    });
                    
                    result.check("memento accessor values are correct", {
                        actual:  [ memento.object(), memento.change(), memento.key(), memento.value(), memento.oldValue() ],
                        expect: [ change, ChangeOp.OBJECT_ADDED, undefined, undefined, undefined ]
                    });
                });

                result.check("size is correctly initialized", {
                    actual: changes.size(),
                    expect: 0
                });
                
                changes.add(change);

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
            what: "ChangeSet fires object-removed on remove",
            how: function(result)
            {
                var changes = new ChangeSet();
                var fired = false;
                var change = new ChangeMemento(this, 
                        ChangeOp.PROPERTY_CHANGED, "sam", "spade", "xxx");
                
                changes.immediate = true;
                changes.signalConnect("object-removed", function(memento) {
                    fired = true;
                    result.check("memento values are correct", {
                        actual:  memento.valueOf(),
                        expect: [ change, ChangeOp.OBJECT_REMOVED, undefined, undefined, undefined ]
                    });
                    
                    result.check("memento accessor values are correct", {
                        actual:  [ memento.object(), memento.change(), memento.key(), memento.value(), memento.oldValue() ],
                        expect: [ change, ChangeOp.OBJECT_REMOVED, undefined, undefined, undefined ]
                    });
                });

                result.check("size is correctly initialized", {
                    actual: changes.size(),
                    expect: 0
                });
                
                changes.add(new ChangeMemento(this,
                        ChangeOp.PROPERTY_CHANGED, "xxx", "xxx"));

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
				$A(this);

                var changes = new CompactChangeSet({
                    getKey: function(memento) {
                        return [ memento.object().objectId(), memento.key() ].join(":");
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
            what: "CompactChangeSet fires object-changed on insert",
            how: function(result)
            {
				var sender = $A(this);
                var changes = new CompactChangeSet();
                var fired = false;
                var change = new ChangeMemento(this, 
                        ChangeOp.PROPERTY_ADDED, "sam", "spade");
                var change2 = new ChangeMemento(this, 
                        ChangeOp.PROPERTY_CHANGED, "sam", "xyzzy");


				var cs = $Array([ change, change2 ]);
				var i = 0;
                changes.immediate = true;
                changes.signalConnect("object-changed", function(memento) {
                    fired = true;

                    result.check("callback memento values are correct", {
                        actual:  memento.valueOf(),
                        expect: [ 
							changes, 
							cs[i].change(),
							sender,
							cs[i],
							cs[i-1]
						]
                    });
                    
                    result.check("callback memento accessor values are correct", {
                        actual:  [ 
							memento.object(), 
							memento.change(), 
							memento.key(), 
							memento.value(), 
							memento.oldValue()
						],
                        expect: [ 
							changes, 
							cs[i].change(),
							sender,
							cs[i],
							cs[i-1]
						]
                    });

					++i;
                });

                result.check("size is correctly initialized", {
                    actual: changes.size(),
                    expect: 0
                });
                
                changes.add(change);
                changes.add(change2);
                
                result.check("size is correctly incremented", {
                    actual: changes.size(),
                    expect: 1
                });
                
                var m = changes.get(0);
                result.check("memento retrieved correctly", {
                    actual:  [ m.object(), m.change(), m.key(), m.value() ],
                    expect: [ this, ChangeOp.PROPERTY_CHANGED, "sam", "xyzzy" ]
                });

                result.check("signal was actually fired", {
                    actual: fired,
                    expect: true
                });
            }
        },
        {
            what: "CompactChangeSet fires object-changed on remove",
            how: function(result)
            {
				var sender = $A(this);
                var changes = new CompactChangeSet();
                var fired = false;
                var change = new ChangeMemento(this, 
                        ChangeOp.PROPERTY_CHANGED, "sam", "spade");
                
				result.check("size is correctly initialized", {
                    actual: changes.size(),
                    expect: 0
                });

                changes.add(new ChangeMemento(this,
                        ChangeOp.PROPERTY_CHANGED, "xxx", "xxx"));

                changes.add(change);
                
                result.check("size is correctly incremented", {
                    actual: changes.size(),
                    expect: 1
                });
                
                changes.immediate = true;
                changes.signalConnect("object-changed", function(memento) {
                    fired = true;
                    result.check("memento values are correct", {
                        actual:  memento.valueOf(),
                        expect: [ changes, ChangeOp.PROPERTY_REMOVED, sender, change, undefined ]
                    });
                    
                    result.check("memento accessor values are correct", {
                        actual:  [ memento.object(), memento.change(), memento.key(), memento.value() ],
                        expect: [ changes, ChangeOp.PROPERTY_REMOVED, sender, change ]
                    });
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
            what: "ChangeSet#attach records all changes",
            how: function(result)
            {
                var changes = new ChangeSet();
                var observer = new ChangeSet();
                var change1 = new ChangeMemento(this, 
                        ChangeOp.PROPERTY_CHANGED, "sam", "xxx");
                var change2 = new ChangeMemento(this, 
                        ChangeOp.PROPERTY_CHANGED, "sam", "spade");

                result.check("size is correctly initialized", {
                    actual: changes.size(),
                    expect: 0
                });

//Console.println("****************** Attached ChangeSet observer");
//Console.println("observer: {0}; changes: {1}", observer.objectId(), changes.objectId());
                observer.attach(changes);
                changes.immediate = true;
                changes.add(change1);
                changes.add(change2);
//Console.println("****************** Finished ChangeSet observer");
                
                result.check("size the same for both instances", {
                    actual: observer.size(),
                    expect: changes.size()
                });
            }
        },
        {
            what: "CompactChangeSet#attach records all changes",
            how: function(result)
            {
                var changes = new ChangeSet();
                var observer = new CompactChangeSet();
                var change1 = new ChangeMemento(this, 
                        ChangeOp.PROPERTY_CHANGED, "sam", "xxx");
                var change2 = new ChangeMemento(this, 
                        ChangeOp.PROPERTY_CHANGED, "sam", "spade");

                result.check("size is correctly initialized", {
                    actual: changes.size(),
                    expect: 0
                });
                
                observer.attach(changes);
                changes.immediate = true;
                changes.add(change1);
                changes.add(change2);
                
                result.check("size reflects folding of changes", {
                    actual: observer.size(),
                    expect: changes.size()
                });
            }
        }
    ]
});
