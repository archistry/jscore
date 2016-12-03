//////////////////////////////////////////////////////////////////////
//
// Copyright (c) 2009-2016 Archistry Limited
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
// Name:		test_multimap.js
// Created:		Thu Nov 17 09:47:02 SAST 2016
//
///////////////////////////////////////////////////////////////////////

Jester.testing("MultiMap functionality", {
	tests: [
		{
			what: "MultiMap API works correctly",
			how: function(result)
			{
				var mm = new archistry.core.MultiMap();
				var v1 = mm.set("k", "v1");
				var v2 = mm.set("k", "v2");
				var v3 = mm.set("k", "v3");
				var v4 = mm.set("l", "vl");

                result.check("value returned for #set", {
                    actual: v1,
                    expect: "v1"
                });

                result.check("map size is correct", {
                    actual: mm.size(),
                    expect: 4
                });

                result.check("count of values is correct", {
                    actual: mm.count("k"),
                    expect: 3
                });

                result.check("count of non-key is correct", {
                    actual: mm.count("q"),
                    expect: 0 
                });

				result.check("#hasKey for existing key", {
					actual: mm.hasKey("k"),
					expect: true
				});

				result.check("#hasKey for bogus key", {
					actual: mm.hasKey("xyzzy"),
					expect: false
				});

				mm.clear();
				result.check("clear clears map", {
					actual: [ mm.size(), mm.count("k"), mm.count("l") ],
					expect: [ 0, 0, 0 ]
				});

			}
		},
		{
			what: "Removal of keys and values",
			how: function(result)
			{
				var mm = new archistry.core.MultiMap();
				var v1 = mm.set("k", "v1");
				var v2 = mm.set("k", "v2");
				var v3 = mm.set("k", "v3");
				var v4 = mm.set("l", "vl");

				var x = mm.remove("k", "v2");

                result.check("remove specific value works", {
                    actual: [ x, mm.count("k") ],
                    expect: [ "v2", 2 ]
                });

				var y = mm.remove("l");

                result.check("#remove without value removes array", {
                    actual: [ y, mm.count("l") ],
                    expect: [ [ "vl" ], 0 ]
                });
			}
		},
		{
			what: "Value retrieval",
			how: function(result)
			{
				var mm = new archistry.core.MultiMap();
				var v1 = mm.set("k", "v1");
				var v2 = mm.set("k", "v2");
				var v3 = mm.set("k", "v3");
				var v4 = mm.set("l", "vl");

				var data = $Array();
				mm.each(function(key, val) {
					data.add(key);
					data.add(val);
				});

                result.check("MultiMap iteration enumerates all key/value pairs", {
                    actual: data,
                    expect: [ "k", "v1", "k", "v2", "k", "v3", "l", "vl" ]
                });

				var vals = $Array();
				mm.eachWithKey("k", function() {
					vals.add(this);
				});

                result.check("#eachWithKey gets all items", {
                    actual: vals,
                    expect: [ "v1", "v2", "v3" ]
                });
			}
		},
		{
			what: "Bug:  string key converted to function reference",
			how: function(result)
			{
				var h1 = new archistry.core.MultiMap();
				h1.set("size", 1);
				h1.set("size", 2);
				h1.set("size", 3);
			
				var x = $Array();
				h1.eachWithKey("size", function() {
					x.add(this);
				});

				result.check("string keys works", {
					actual: x,
					expect: [ 1, 2, 3 ]
				});
			}
		}
	]
});
