//////////////////////////////////////////////////////////////////////
//
// Copyright (c) 2009 Archistry Limited
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
// Name:		test_util.js
// Created:		Tue Dec  8 17:49:59 GMT 2009
//
///////////////////////////////////////////////////////////////////////

Jester.testing("Core library functionality", {
	tests: [
		{
			what: "Object#equals works correctly",
			how: function(result)
			{
                var A = function(val)
                {
                    this.valueOf = function() { return val; };
                };

                a = new A(1);
                a1 = new A(1);

				result.check("object equals should use valueOf automatically", {
					actual: a.equals(a1),
					expect: true
				});

                result.check("object equals should equal primitive", {
                    actual: a.equals(1),
                    expect: true
                });
			}
		},
		{
			what: "Object#keys works correctly",
			how: function(result)
			{
                var obj = {};
                obj["key1"] = true;
                obj[this] = "context";
                obj.method1 = function() {};

                var functionlist = [];
                var proplist = [];
                for(k in obj)
                {
                    if(typeof obj[k] === 'function')
                        functionlist.add(k);
                    else
                        proplist.add(k);
                }
                functionlist.sort();
                proplist.sort();
                var allprops = functionlist.concat(proplist);
                allprops.sort();

                var keys = obj.keys().sort();
				result.check("default object key count", {
					actual: keys.length,
					expect: 2
				});

                result.check("default object key values are correct", {
                    actual: keys,
                    expect: proplist
                });

                keys = obj.keys(true).sort();
				result.check("object key count", {
					actual: keys.length,
					expect: allprops.length
				});

                result.check("object key values are correct", {
                    actual: keys,
                    expect: allprops
                });
			}
		},
		{
			what: "Hash#clear works correctly",
			how: function(result)
			{
                var obj = new archistry.core.Hash();
                obj.set("key1", true);
                obj.set("context", this);
                obj.set("key2", true);

                var proplist = [];
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
                    expect: [ "key1", "key2" ]
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
		},
		{
			what: "Object.mixin works correctly",
			how: function(result)
			{
				var proto = { 
					foo: "foo",
					doit: function(val)
					{
						return val;
					}
				};

				var A = function() {};
				A.mixin(proto);
				result.check("non-function property included in prototype", {
					actual: (A.prototype.foo != null),
					expect: true
				});

				result.check("function property included in prototype", {
					actual: (A.prototype.doit != null),
					expect: true
				});
				
				result.check("non-function property included in class", {
					actual: (A.foo != null),
					expect: true
				});

				result.check("function property included in class", {
					actual: (A.doit != null),
					expect: true
				});

				var a = new A();
				result.check("non-functional property present in instance", {
					actual: a.foo,
					expect: "foo"
				});

				result.check("function property present in instance", {
					actual: a.doit("xxx"),
					expect: "xxx"
				});
				
				var Aa = function() {};
				Aa.mixin(proto, false);
				result.check("non-function property not included in prototype (false)", {
					actual: (Aa.prototype.foo == null),
					expect: true
				});

				result.check("function property not included in prototype (false)", {
					actual: (Aa.prototype.doit == null),
					expect: true
				});
				
				result.check("non-function property included in class (false)", {
					actual: (Aa.foo != null),
					expect: true
				});

				result.check("function property included in class (false)", {
					actual: (Aa.doit != null),
					expect: true
				});

				var aa = new Aa();
				result.check("non-functional property not present in instance (false)", {
					actual: (aa.foo == null),
					expect: true
				});

				result.check("function property not present in instance (false)", {
					actual: (aa.doit == null),
					expect: true
				});

				var B = function()
				{
					this.mixin(A);
				};

				var b = new B();
				result.check("non-function property not included in class #2", {
					actual: (B.foo == null),
					expect: true
				});

				result.check("function property not included in class #2", {
					actual: (B.doit == null),
					expect: true
				});

				result.check("non-functional property present in instance of class #2", {
					actual: b.foo,
					expect: "foo"
				});

				result.check("function property present in instance of class #2", {
					actual: b.doit("xxx"),
					expect: "xxx"
				});

				var c = new B();
				result.check("non-functional property present in instance #2 of class #2", {
					actual: c.foo,
					expect: "foo"
				});

				result.check("function property present in instance #2 of class #2", {
					actual: c.doit("xxx"),
					expect: "xxx"
				});

				var P = function()
				{
					this.doit = function() { return "yyy"; };
				}
				P.mixin(proto);
				var p = new P();
				result.check("existing property not modified by include", {
					actual: p.doit(),
					expect: "yyy"
				});

				result.check("non-colliding property added", {
					actual: p.foo,
					expect: "foo"
				});
			}
		},
		{
			what: "ensure include of static object within intializer works as expected",
			how: function(result)
			{
				var foo = {
					prop1: "hello",
					fn1: function() { return this.prop1; }
				};

				var bar = function()
				{
					this.mixin(foo);

					result.check("prop1 is available within initializer", {
						actual: this.prop1,
						expect: "hello"
					});

					result.check("fn1 is available within initializer", {
						actual: this.fn1(),
						expect: "hello"
					});
				};

				var b = new bar();
				result.check("prop1 is available as instance property", {
					actual: b.prop1,
					expect: "hello"
				});

				result.check("fn1 is available as instance method", {
					actual: b.fn1(),
					expect: "hello"
				});
			}
		},
		{
			what: "ensure include of fn type 1 object within intializer works as expected",
			how: function(result)
			{
				var foo = function()
				{
					this.prop1 = "hello",
					this.fn1 = function() { return this.prop1; }
				};

				var bar = function()
				{
					this.mixin(foo);

					result.check("prop1 is available within initializer", {
						actual: this.prop1,
						expect: "hello"
					});

					result.check("fn1 is available within initializer", {
						actual: this.fn1(),
						expect: "hello"
					});
				};

				var b = new bar();
				result.check("prop1 is available as instance property", {
					actual: b.prop1,
					expect: "hello"
				});

				result.check("fn1 is available as instance method", {
					actual: b.fn1(),
					expect: "hello"
				});
			}
		},
		{
			what: "ensure include of fn type 2 object within intializer works as expected",
			how: function(result)
			{
				var foo = function() {};
				foo.prototype = {
					prop1: "hello",
					fn1: function() { return this.prop1; }
				};

				var bar = function()
				{
					this.mixin(foo);

					result.check("prop1 is available within initializer", {
						actual: this.prop1,
						expect: "hello"
					});

					result.check("fn1 is available within initializer", {
						actual: this.fn1(),
						expect: "hello"
					});
				};

				var b = new bar();
				result.check("prop1 is available as instance property", {
					actual: b.prop1,
					expect: "hello"
				});

				result.check("fn1 is available as instance method", {
					actual: b.fn1(),
					expect: "hello"
				});
			}
		},
		{
			what: "ensure multi-level mixin works correctly",
			how: function(result)
			{
				var foo = { p1: "one", p2: "two" };
				function Mixer(x)
				{
					this.mixin(x);
					this.p3 = "three";
				}

				var mixer = new Mixer(foo);
				result.check("p1 is available as an external property", {
					actual: mixer.p1,
					expect: "one"
				});
			}
		},
		{
			what: "ensure Array.indexOf works correctly",
			how: function(result)
			{
				var arr = [ "one", 1, 3, 4 ];
				result.check("array indexOf works for string types", {
					actual: arr.indexOf("one"),
					expect: 0
				});
		
				result.check("array indexOf works for number types", {
					actual: arr.indexOf(3),
					expect: 2
				});
				
				result.check("array returns -1 for not found", {
					actual: arr.indexOf("XXX"),
					expect: -1
				});

				function A(arg)
				{
					this.arg = arg;
					this.equals = function(rhs)
					{
						return this.arg == rhs.arg;
					}
				}

				var one = new A("one");
				arr = [ one, new A(1) ];
				result.check("array indexOf works for equals()", {
					actual: arr.indexOf(one),
					expect: 0
				});

                function B(arg)
                {
                    this.valueOf = function() { return arg; }
                }

                arr = [ new B("foo"), new B("bar") ];
                result.check("array indexOf works for valueOf()", {
                    actual: arr.indexOf(new B("foo")),
                    expect: 0
                });
                result.check("array indexOf works for valueOf()", {
                    actual: arr.indexOf(new B("bar")),
                    expect: 1
                });
			}
		},
		{
			what: "ensure Array.include works correctly",
			how: function(result)
			{
				var arr = [ "one", 1, 3, 4 ];
				result.check("array include works for string types", {
					actual: arr.include("one"),
					expect: true
				});
				
				result.check("array include works for number types", {
					actual: arr.include(3),
					expect: true 
				});
				
				result.check("array returns false for not found", {
					actual: arr.include("XXX"),
					expect: false
				});

				function A(arg)
				{
					this.arg = arg;
					this.equals = function(rhs)
					{
						return this.arg == rhs.arg;
					}
				}

				var one = new A("one");
				arr = [ one, new A(1) ];
				result.check("array include works for equals()", {
					actual: arr.include(one),
					expect: true
				});

				result.check("array.includes also works", {
					actual: arr.includes(new A(1)),
					expect: true
				});
			}
		},
		{
			what: "ensure Array.remove works correctly",
			how: function(result)
			{
				var arr0 = [ "one", 1, 2, 3 ];
				var arr1 = [ "one", 1, 2, 3 ];

				var x = arr0.remove("one");
				result.check("array returned the value removed", {
					actual: x,
					expect: "one"
				});

				result.check("array has been modified", {
					actual: arr0,
					expect: [ 1, 2, 3 ]
				});

				result.check("array returns null if not found", {
					actual: arr0.remove("xyzzy"),
					expect: null
				});

				result.check("array not modified if not found", {
					actual: arr0,
					expect: [ 1, 2, 3, ]
				});
			}
		},
		{
			what: "ensure Array.add works correctly",
			how: function(result)
			{
				var arr0 = [];
				arr0.add("one");
				arr0.add(1);
				arr0.add(2);
				arr0.add(3);
				var arr1 = [ "one", 1, 2, 3 ];

				result.check("array with add equal to static initializer", {
					actual: arr0,
					expect: arr1
				});
			}
		},
		{
			what: "ensure Array.clear works correctly",
			how: function(result)
			{
				var arr0 = [];
				arr0.add("one");
				arr0.add(1);
				arr0.add(2);
				arr0.add(3);

				result.check("array clear removes all elements and returns this", {
					actual: arr0.clear(),
					expect: []
				});
			}
		},
		{
			what: "ensure String trim methods work correctly",
			how: function(result)
			{
				var leading = " \n \t foo";
				var trailing = "foo   \n \t";
				var both = "    foo   ";

				result.check("ltrim removes leading whitespace", {
					actual: leading.ltrim(),
					expect: "foo"
				});

				result.check("ltrim does not change original string", {
					actual: leading,
					expect: " \n \t foo"
				});

				result.check("rtrim removes trailing whitespace", {
					actual: trailing.rtrim(),
					expect: "foo"
				});

				result.check("rtrim does not change original string", {
					actual: trailing,
					expect: "foo   \n \t"
				});

				result.check("trim strips leading whitespace", {
					actual: leading.trim(),
					expect: "foo"
				});
				
				result.check("trim does not change original string", {
					actual: leading,
					expect: " \n \t foo"
				});

				result.check("trim removes trailing whitespace", {
					actual: trailing.trim(),
					expect: "foo"
				});

				result.check("trim does not change original string", {
					actual: trailing,
					expect: "foo   \n \t"
				});

				result.check("trim strips both leading & trailing", {
					actual: both.trim(),
					expect: "foo"
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
		}
	]
});
