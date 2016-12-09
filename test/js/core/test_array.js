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
// Name:        test_array.js
// Created:     Tue Dec  8 17:49:59 GMT 2009
// Split:		Fri Nov 18 10:54:33 SAST 2016
//
///////////////////////////////////////////////////////////////////////

Jester.testing("Array mixin functionality", {
    tests: [
        {
            what: "Test $Array() function initializer",
            how: function(result)
            {
				var arr = $Array(0,1,2,3);
                result.check("verify array length", {
                    actual: arr.length,
                    expect: 4
                });
                result.check("verify array methods", {
                    actual: arr.each === undefined,
                    expect: false 
                });
            }
        },
        {
            what: "ensure Array#indexOf works correctly",
            how: function(result)
            {
                var arr = $Array([ "one", 1, 3, 4 ]);
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
                arr = $Array([ -1, one, new A(1) ]);
                result.check("array indexOf works for equals()", {
                    actual: arr.indexOf(one),
                    expect: 1
                });

                function B(arg)
                {
                    this.valueOf = function() { return arg; }
                }

                arr = $Array([ new B("foo"), new B("bar") ]);
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
            what: "ensure Array#include works correctly",
            how: function(result)
            {
                var arr = $Array([ "one", 1, 3, 4 ]);
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
					$A(this)
                    this.arg = arg;
                    this.equals = function(rhs)
                    {
                        return this.arg == rhs.arg;
                    }
                }

                var one = new A("one");
                arr = $Array([ one, new A(1) ]);
                result.check("array include works for equals()", {
                    actual: arr.include(one),
                    expect: true
                });

                result.check("array includes named object works", {
                    actual: arr.includes(one),
                    expect: true
                });

                result.check("array includes arbitrary object works", {
                    actual: arr.includes(new A(1)),
                    expect: true
                });
            }
        },
        {
            what: "ensure Array#remove works correctly",
            how: function(result)
            {
                var arr0 = $Array([ "one", 1, 2, 3 ]);
                var arr1 = $Array([ "one", 1, 2, 3 ]);

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
                    expect: [ 1, 2, 3 ]
                });
            }
        },
        {
            what: "ensure Array#add works correctly",
            how: function(result)
            {
                var arr0 = $Array();
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
            what: "ensure Array#clear works correctly",
            how: function(result)
            {
                var arr0 = $Array();
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
            what: "ensure Array#each works correctly",
            how: function(result)
            {
                var arr0 = $Array();
                arr0.add(1);
                arr0.add(2);
                arr0.add(3);
                var arr1 = $Array();

				arr0.each(function() {
					arr1.add(this);
				});

                result.check("array each can create equivalent array", {
                    actual: arr0,
                    expect: arr1
                });
            }
        },
        {
            what: "ensure Array#equals works correctly",
            how: function(result)
            {
                var arr0 = $Array([ 1, 2, 3, "four" ]);

                result.check("Array#equals works for basic types.", {
                    actual: arr0.equals([ 1, 2, 3, "four" ]),
                    expect: true
                });

                function A(x)
                {
                    this.valueOf = function() { return x; };
                }

                var arr0 = $Array([ 1, "two", new A(3), new A("four") ]);
                result.check("Array#equals supports element #valueOf for Object#equals", {
                    actual: arr0.equals([ 1, "two", new A(3), new A("four") ]),
                    expect: true
                });

                function B(x)
                {
                    this.x = x;
                    this.equals = function(rhs)
                    {
                        return this.x === rhs.x;
                    };
                }

                var arr0 = $Array([ new B(2) ]);
                result.check("Array#equals supports element #equals", {
                    actual: arr0.equals([ new B(2) ]),
                    expect: true
                });
            }
        },
        {
            what: "ensure Array#compare works correctly",
            how: function(result)
            {
                var arr0 = $Array([ 1, 2, 3, "four" ]);

                result.check("Array#compare returns 0 for equal arrays of primitives.", {
                    actual: arr0.compare([ 1, 2, 3, "four" ]),
                    expect: 0
                });

                function A(x)
                {
                    this.valueOf = function() { return x; };
                }

                var arr0 = $Array([ 1, "two", new A(3), new A("four") ]);
                result.check("Array#compare supports element #valueOf for Object#compare", {
                    actual: arr0.compare([ 1, "two", new A(3), new A("four") ]),
                    expect: 0
                });

                result.check("Array#compare will return -1 for shorter arrays", {
                    actual: $Array([]).compare([1]),
                    expect: -1
                });

                result.check("Array#compare will return 1 for longer arrays", {
                    actual: $Array([ 1 ]).compare([]),
                    expect: 1
                });

                result.check("Array#compare will order by value order", {
                    actual: $Array([ 1 ]).compare([ 2 ]),
                    expect: -1
                });

                result.check("Array#compare reversed value order is correct", {
                    actual: $Array([ 2 ]).compare([1]),
                    expect: 1
                });

                function B(x)
                {
                    this.x = x;
                    this.compare = function(rhs)
                    {
                        return this.x.compare(rhs.x);
                    };
                }

                var arr0 = $Array([ new B(2) ]);
                result.check("Array#compare supports element #compare", {
                    actual: arr0.compare([ new B(2) ]),
                    expect: 0
                });
            }
        },
        {
            what: "ensure Array#unique works correctly",
            how: function(result)
            {
				var a = $Array([ 1, 2, 3, 4, 1, 3, 4, 5, 7, 2 ]);
				result.check("unique integers", {
					actual: a.unique(),
					expect: [ 1, 2, 3, 4, 5, 7 ]
				});

				function A(obj)
				{
					$A(this);
					for(k in obj)
					{
						this[k] = obj[k];
					}

					this.valueOf = function()
					{
						return this.toString();
					};
				}

				var a = new A({one: 1, a: "A" });
				var b = new A({one: 1, a: "A" });

				result.check("a.equals(b)", {
					actual: a.equals(b),
					expect: true
				});

				c = $Array([ a, b, 2 ]);
				result.check("unique objects", {
					actual: c.unique(),
					expect: [ new A({ one: 1, a: "A" }),  2 ]
				});

				result.check("unique strings", {
					actual: $Array([ "a", "a", "a", "b", "c" ]).unique(),
					expect: [ "a", "b", "c" ]
				});
			}
		},
        {
            what: "ensure Array#last works correctly",
            how: function(result)
            {
				var a = $Array([ 1, 2, 3, 4, 1, 3, 4, 5, 7, 2 ]);
				result.check("unique integers", {
					actual: a.last(),
					expect: 2
				});

				result.check("empty array", {
					actual: $Array().last(),
					expect: undefined
				});
			}
		}
    ]
});
