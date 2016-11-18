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
// Name:        test_object.js
// Created:     Tue Dec  8 17:49:59 GMT 2009
// Split:		Fri Nov 18 10:57:06 SAST 2016
//
///////////////////////////////////////////////////////////////////////

Jester.testing("AObject mixin functionality", {
    tests: [
        {
            what: "AObject#equals works correctly",
            how: function(result)
            {
                var A = function(val)
                {
                    $A(this);
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

                $A(Boolean.prototype);
                result.check("boolean equals works for primitives", {
                    actual: (new Boolean(true)).equals(true),
                    expect: true
                });

                result.check("boolean equals fails when not equal boolean", {
                    actual: !(new Boolean(true)).equals(false),
                    expect: true
                });
            }
        },
        {
            what: "AObject#keys works correctly",
            how: function(result)
            {
                var obj = $A({});
                obj["key1"] = true;
                obj[this] = "context";
                obj.method1 = function() {};

                var functionlist = $Array();
                var proplist = $Array();
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
            what: "AObject#mixin works correctly",
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
                    $A(this).mixin(A);
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

                var P = $A(function()
                {
                    this.doit = function() { return "yyy"; };
                });

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
                    $A(this).mixin(foo);

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
                    $A(this).mixin(foo);

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
                    $A(this).mixin(foo);

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
                    $A(this).mixin(x);
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
			what: "ensure merge works correctly",
			how: function(result)
			{
				var a = $A({a: "X"}).merge({a: "A", b: "B"});

				result.check("merged properties overwrite instance", {
					actual: [ a.a, a.b ],
					expect: [ "A", "B" ]
				});
			}
		}
    ]
});
