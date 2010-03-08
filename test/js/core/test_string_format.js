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
// Name:		test_string_format.js
// Created:		Mon Mar  1 16:43:54 GMT 2010
//
///////////////////////////////////////////////////////////////////////

Jester.testing("String#format functionality", {
	tests: [
		{
			what: "String#format basic functionality",
			how: function(result)
			{
                result.check("simple string with no format specifier", {
                    actual: String.format("Hello world!"),
                    expect: "Hello world!"
                });

                result.check("parameter substitution with array arguments", {
                    actual: String.format("Hello {0}.  Welcome to {1}!", [ "Frank", "Hell" ]),
                    expect: "Hello Frank.  Welcome to Hell!"
                });

                result.check("parameter substitution with variable argument list", {
                    actual: String.format("Hello {0}.  Welcome to {1}!", "Frank", "Hell"),
                    expect: "Hello Frank.  Welcome to Hell!"
                });

                result.check("parameter substitution with non-string args", {
                    actual: String.format("{0}, {1}, {2}", {}, 1, 3.14159),
                    expect: "[object Object], 1, 3.14159"
                });

                result.check("missing arg substitution is correct", {
                    actual: String.format("{1}", "test"),
                    expect: ""
                });

                result.check("second arg of 3 is array", {
                    actual: String.format("my array: {0} is {1}", [ 0, 1 ], 2),
                    expect: "my array: 0,1 is 2"
                });
			}
		},
		{
			what: "String#format with custom #toString implementations",
			how: function(result)
			{
                var A = function(arg)
                {
                    this.toString = function() { return arg; };
                };

                var b = {};
                b.toString = function() { return "b"; };

                var B = function(arg)
                {
                    this.arg = arg;
                };
                B.prototype.toString = function() { return this.arg; };

                var C = function() {};
                C.toString = function() { return "instance"; };

                var D = function() {};
                var d = new D();
                d.toString = function() { return "instance"; };
                D.prototype.toString = function() { return "class"; };

                result.check("Define #toString with closure", {
                    actual: String.format("'{0}'", new A("hello")),
                    expect: "'hello'"
                });
                
                result.check("Define #toString on instance", {
                    actual: String.format("'{0}'", b),
                    expect: "'b'"
                });
                
                result.check("Define #toString on prototype", {
                    actual: String.format("'{0}'", new B("arf")),
                    expect: "'arf'"
                });
                
                result.check("Define #toString on class", {
                    actual: String.format("'{0}'", new C()),
                    expect: "'[object Object]'"
                });
                
                result.check("Define #toString on prototype", {
                    actual: String.format("'{0}'", new D()),
                    expect: "'class'"
                });
                
                result.check("Define #toString on prototype and instance", {
                    actual: String.format("'{0}'", d),
                    expect: "'instance'"
                });
			}
		},
		{
			what: "String#format with custom #formatString implementations",
			how: function(result)
			{
                var A = function(arg)
                {
                    this.formatString = function() { return arg; };
                };

                var b = {};
                b.formatString = function() { return "b"; };

                var B = function(arg)
                {
                    this.arg = arg;
                };
                B.prototype.formatString = function() { return this.arg; };

                var C = function() {};
                C.formatString = function() { return "instance"; };

                var D = function() {};
                var d = new D();
                d.formatString = function() { return "instance"; };
                D.prototype.formatString = function() { return "class"; };

                result.check("Define #formatString with closure", {
                    actual: String.format("'{0}'", new A("hello")),
                    expect: "'hello'"
                });
                
                result.check("Define #formatString on instance", {
                    actual: String.format("'{0}'", b),
                    expect: "'b'"
                });
                
                result.check("Define #formatString on prototype", {
                    actual: String.format("'{0}'", new B("arf")),
                    expect: "'arf'"
                });
                
                result.check("Define #formatString on class", {
                    actual: String.format("'{0}'", new C()),
                    expect: "'[object Object]'"
                });
                
                result.check("Define #formatString on prototype", {
                    actual: String.format("'{0}'", new D()),
                    expect: "'class'"
                });
                
                result.check("Define #formatString on prototype and instance", {
                    actual: String.format("'{0}'", d),
                    expect: "'instance'"
                });
			}
		},
		{
			what: "String#format parameter width functionality",
			how: function(result)
			{
                result.check("left justification of value", {
                    actual: String.format("'{0,-7}'", "arf"),
                    expect: "'arf    '"
                });
                
                result.check("right justification of value", {
                    actual: String.format("'{0,7}'", "arf"),
                    expect: "'    arf'"
                });
                
                result.check("left justification of value longer than width", {
                    actual: String.format("'{0,-2}'", "arf"),
                    expect: "'arf'"
                });
                
                result.check("right justification of value longer than width", {
                    actual: String.format("'{0,2}'", "arf"),
                    expect: "'arf'"
                });
			}
		},
		{
			what: "String#format parameter format functionality",
			how: function(result)
			{
                result.check("Base conversion for numbers using format", {
                    actual: String.format("'{0:16}'", 255),
                    expect: "'ff'"
                });
                
                var A = function()
                {
                    this.toString = function(arg) { return arg ? arg : "[object A]"; };
                };

                result.check("args passed to #toString", {
                    actual: String.format("'{0:someHairyString77}'", [ new A() ]),
                    expect: "'someHairyString77'"
                });
                
                var B = function()
                {
                    this.formatString = function(arg) { return arg; };
                };

                result.check("args passed to #formatString", {
                    actual: String.format("'{0:7234as##*(*)}'", new B()),
                    expect: "'7234as##*(*)'"
                });
                
                result.check("combination of width and format specification", {
                    actual: String.format("'{0,-7:arf}'", new A()),
                    expect: "'arf    '"
                });
			}
		},
		{
			what: "String instance#format basic functionality",
			how: function(result)
			{
                result.check("simple string with no format specifier", {
                    actual: "Hello world!".format(),
                    expect: "Hello world!"
                });

                result.check("parameter substitution with array arguments", {
                    actual: "Hello {0}.  Welcome to {1}!".format([ "Frank", "Hell" ]),
                    expect: "Hello Frank.  Welcome to Hell!"
                });

                result.check("parameter substitution with variable argument list", {
                    actual: "Hello {0}.  Welcome to {1}!".format("Frank", "Hell"),
                    expect: "Hello Frank.  Welcome to Hell!"
                });

                result.check("parameter substitution with non-string args", {
                    actual: "{0}, {1}, {2}".format({}, 1, 3.14159),
                    expect: "[object Object], 1, 3.14159"
                });

                result.check("missing arg substitution is correct", {
                    actual: "{1}".format("test"),
                    expect: ""
                });

                result.check("second arg of 3 is array", {
                    actual: "my array: {0} is {1}".format([ 0, 1 ], 2),
                    expect: "my array: 0,1 is 2"
                });

                var s = "{0} {1}"
                var x = s.format(1, "foo");
                result.check("original string is not modified", {
                    actual: s,
                    expect: "{0} {1}" 
                });

                result.check("can handle values that are zero as first argument", {
                    actual: "{0}".format(0),
                    expect: "0"
                });

                result.check("can handle values that are false as first argument", {
                    actual: "{0}".format(false),
                    expect: "false"
                });
			}
		}
	]
});
