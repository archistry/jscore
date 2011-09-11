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
// Name:		example1.js
// Created:		Mon Dec  7 00:31:36 GMT 2009
//
///////////////////////////////////////////////////////////////////////

load('/opt/devel/env-js/src/env.rhino.js');
load('../../jester-min.js');

var x = {
	one: {
		two: [
			1, 2, 3, 4
		]
	},

	"two": {
		two: [ 5, 6, 7, 8 ]
	}
};

print("x.one: " + x.one);
print("x.one.two: " + x.one.two);
print("x.one.two.length: " + x.one.two.length);

for(var q in x)
{
	print("q: " + q);
	print("q.two: " + x[q].two);
	print("q.two.length: " + x[q].two.length);
}
	
Jester.testing("Test suite description", {
	"Tests with context A": {
		setup: function(context)
		{
			context.prop = "value1";
			print("the tests are ready, sir");
		},
		teardown: function(context)
		{
			print("all back to normal, sir");
		},
		tests: [
			{
				what: "Function #1",
				how: function(context, result)
				{
					print("using context property: " + context.prop);
					result.check("the property value is correct", {
						actual: context.prop,
						expect: "value1"
					});

					result.check("this is test #2", {
						actual: "foo",
						expect: "foo"
					});
				}
			},
			{
				what: "Function #2",
				how: function(context, result)
				{
					result.check("the answer to life, the universe and everything", {
						actual: 54,
						expect:	42
					});

					result.check("No, really, the answer is correct", {
						actual: 6*9,
						expect: 54
					});
				}
			}
		]
	},
	"Tests with sync context 2": {
		setup: function(context)
		{
			print("setup");
		},
		teardown: function(context)
		{
			print("teardown");
		},
		tests: [
			{
				what: "sync #1",
				how: function(context, result)
				{
					result.check("criteria 1", {
						actual: 42,
						expect: 42
					});

					print("test");
				}
			}
		]
	}
});

print(Jester.reporter.toString());
