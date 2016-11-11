//////////////////////////////////////////////////////////////////////
//
// Copyright (c) 2009-2010 Archistry Limited
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
// Name:		test_hash.js
// Created:		Tue Dec  8 17:49:59 GMT 2009
// Split:       Thu Mar 11 22:29:32 GMT 2010
//
///////////////////////////////////////////////////////////////////////

Jester.testing("Hash functionality", {
	tests: [
		{
			what: "Hash basic API works correctly",
			how: function(result)
			{
				$A(this);
				$A(result);
                var obj = new archistry.core.Hash();
                var o1 = obj.set("key1", "val1");
                var o2 = obj.set("context", this);
                var o3 = obj.set("one", 1);
                var o4 = obj.set(1, "one");
                var o5 = obj.set(result, true);

                result.check("set of basic string value returns set value", {
                    actual: o1,
                    expect: "val1"
                });

                result.check("set of object value returns set value", {
                    actual: o2,
                    expect: this
                });

                result.check("set of number value returns set value", {
                    actual: o3,
                    expect: 1
                });

                result.check("set of number key returns set value", {
                    actual: o4,
                    expect: "one"
                });

                result.check("set of object key returns set value", {
                    actual: o5,
                    expect: true
                });

                var g1 = obj.get("key1");
                result.check("get of string key returns original value", {
                    actual: [ g1, g1.objectId() ],
                    expect: [ o1, o1.objectId() ]
                });

                var g2 = obj.get("context");
                result.check("get of object value returns original value", {
                    actual: [ g2, g2.objectId() ],
                    expect: [ o2, o2.objectId() ]
                });

                var g3 = obj.get("one");
                result.check("get of number value returns original value", {
                    actual: g3,
                    expect: o3
                });

                var g4 = obj.get(1);
                result.check("get of number key returns original value", {
                    actual: g4,
                    expect: o4
                });

                var g5 = obj.get(result);
                result.check("get of number key returns original value", {
                    actual: g5,
                    expect: o5
                });

                result.check("size of the hash is correct", {
                    actual: obj.size(),
                    expect: 5
                });

                var arr = $Array();
                obj.each(function(key, val) {
                    arr.add(key).add(val);
                });

                // FIXME:  needs more robust check here, but
                // assuming all of the above worked, it's a
                // matter of just checking the number of
                // elements
                
                result.check("iteration over keys and values is correct", {
                    actual: arr.length,
                    expect: 10
                });
			}
		},
		{
			what: "Hash#clear works correctly",
			how: function(result)
			{
				$A(this);
                var obj = new archistry.core.Hash();
                obj.set("key1", true);
                obj.set("context", this);
                obj.set("key2", true);

                var proplist = $Array();
                obj.each(function(key, val) {
                    proplist.add(key);
                });
                proplist.sort();

                var keys = obj.keys().sort();
				result.check("initial object key count", {
					actual: keys.length,
					expect: proplist.length
				});

                result.check("size matches key count", {
                    actual: obj.size(),
                    expect: 3
                });

                result.check("pre-clear object key values are correct", {
                    actual: keys,
                    expect: [ "context", "key1", "key2" ]
                });

                keys = obj.clear().keys();
				result.check("object key count", {
					actual: keys.length,
					expect: 0
				});

                result.check("post-clear object key values are correct", {
                    actual: keys,
                    expect: []
                });
			}
		}
	]
});
