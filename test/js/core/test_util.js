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
// Name:        test_util.js
// Created:     Tue Dec  8 17:49:59 GMT 2009
//
///////////////////////////////////////////////////////////////////////

var Util = archistry.core.Util;

Jester.testing("Core library functionality", {
    tests: [
        {
            what: "archistry.core#objectEquals works correctly",
            how: function(result)
            {
                var eq = archistry.core.objectEquals;
                var a = {};
                var b = { one: 1, "two": "two", three: { x: 3 }};

                result.check("simple object equals with empty literal initializers", {
                    actual: eq({}, {}),
                    expect: false
                });
                
                result.check("simple object equals with various literal initializers", {
                    actual: eq({ one: 1, "two": "two", three: { x: 3 }}, { one: 1, "two": "two", three: { x: 3 }}),
                    expect: false
                });

                result.check("object identity equals (empty object)", {
                    actual: eq(a, a),
                    expect: true
                });

                result.check("object identity equals (non-empty object)", {
                    actual: eq(b, b),
                    expect: true
                });

                result.check("literal equals", {
                    actual: eq(1, 1),
                    expect: true
                });

                result.check("array equals", {
                    actual: eq([ 1, 2, 3 ], [ 1, 2, 3]),
                    expect: true
                });
                
                var A = function(val)
                {
                    this.valueOf = function() { return val; };
                };

                a = new A(1);
                a1 = new A(1);
                result.check("valueOf for object", {
                    actual: eq(a, a1),
                    expect: true
                });
            }
        },
        {
            what: "namespace definition works correctly",
            how: function(result)
            {
                namespace("example.app.foo");
                result.check("root of namespace is defined", {
                    actual: (example != null),
                    expect: true
                });

                result.check("middle of namespace is defined", {
                    actual: (example.app != null),
                    expect: true
                });

                result.check("end of namespace is defined", {
                    actual: (example.app.foo != null),
                    expect: true
                });

                example.one = "one";
                example.app.two = "two";
                example.app.foo.three = "three";

                namespace("example.app.foo");
                result.check("root of namespace not changed", {
                    actual: example.one,
                    expect: "one"
                });

                result.check("middle of namespace is not changed", {
                    actual: example.app.two,
                    expect: "two"
                });

                result.check("end of namespace is not changed", {
                    actual: example.app.foo.three,
                    expect: "three"
                });
            }
        },
        {
            what: "#merge overwrite target",
            how: function(result)
            {
				var merge = archistry.core.merge;

				var a = { a: "A", b: "B" };
				var b = { a: "B", b: "C", d: "D" };

				r = merge(a, b);
                result.check("properties added/replaced", {
                    actual: [ a.a, a.b, a.d ],
                    expect: [ b.a, b.b, b.d ]
                });

				result.check("target object returned", {
					actual: r,
					expect: a
				});
            }
		},
        {
            what: "#merge overwrite target leaving others",
            how: function(result)
            {
				var merge = archistry.core.merge;

				var a = { a: "A", b: "B" };
				var b = { a: "B", b: "C", d: "D" };

				r = merge(b, a);
                result.check("properties added/replaced", {
                    actual: [ r.a, r.b, r.d ],
                    expect: [ "A", "B", "D" ]
                });
            }
		},
        {
            what: "#merge callback triggered with correct arguments",
            how: function(result)
            {
				var merge = archistry.core.merge;

				var a = { a: "A", b: "B" };
				var b = { a: "B", b: "C", d: "D" };

				var arr = $Array();
				r = merge(a, b, function(key, targetValue) {
					arr.add(this).add(key).add(targetValue);
				});
                result.check("callback args", {
                    actual: arr,
                    expect: [ a, "a", "A", a, "b", "B" ]
                });

				result.check("merge successful", {
					actual: [ r.a, r.b, r.d ],
					expect: [ b.a, b.b, b.d ]
				});
            }
		},
		{
			what: "#resolve method works correctly",
			how: function(result)
			{
				var obj = Util.resolve("archistry.core.Hash");

				result.check("object is resoled", {
					actual: obj,
					expect: archistry.core.Hash
				});

				var hash = new obj();
				hash.set("k", "v");
				result.check("hash created from resolved name", {
					actual: hash.get("k"),
					expect: "v"
				});
			}
		},
		{
			what: "custom JSON marshalling round-trip",
			how: function(result)
			{
				archistry.A = function(val)
				{
					this.foo = function() { return val; };
					this.toJSON = function()
					{
						return { __jsonClass: "archistry.A", value: val };
					};
				};
				archistry.A.fromJSON = function(val) {
					return new archistry.A(val.value);
				};

				var s = JSON.stringify(new archistry.A("xyz"));
				var a = JSON.parse(s, archistry.core.Util.unmarshalJSON);

				result.check("instance value round-tripped", {
					actual: a.foo(),
					expect: "xyz"
				});

				delete archistry.A;
			}
		}
    ]
});
