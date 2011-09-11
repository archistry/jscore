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
// Name:		test_tree_selection_range.js
// Created:		Sun Feb 28 15:43:46 GMT 2010
//
///////////////////////////////////////////////////////////////////////

var TreeSelectionRange = archistry.ui.selection.TreeSelectionRange;

var T = function(path)
{
    $A(this);

    this.path = function() { return path; };
    // NOTE: this is necessary because sometimes it might be a
    // boxed vs. non-boxed value--even for numbers!
    this.valueOf = function() { return path.valueOf(); };
    this.toString = function() { return "" + path; };
};

Jester.testing("TreeSelectionRange functionality", {
	tests: [
		{
			what: "Insert single node at end of empty list",
			how: function(result)
			{
                var range = new TreeSelectionRange(this);
                range.insert(0, new T(0));

                result.check("node inserted at front of the list", {
                    actual: range.start(),
                    expect: 0
                });
               
                result.check("list length is correct", {
                    actual: range.length(),
                    expect: 1
                });

                result.check("node is also the end of the list", {
                    actual: range.end(),
                    expect: 0
                });
			}
		},
		{
			what: "Insert single node at end of non-empty list",
			how: function(result)
			{
                var range = new TreeSelectionRange(this);
                [ 0, 1, 2, 3 ].each(function(i) {
                    range.insert(i, new T(this));
                });
                range.insert(-1, new T(4));

                result.check("start path is correct", {
                    actual: range.start(),
                    expect: 0
                });
               
                result.check("list length is correct", {
                    actual: range.length(),
                    expect: 5
                });

                result.check("node is at the end of the list", {
                    actual: range.end(),
                    expect: 4
                });
			}
		},
		{
			what: "Insert single node at beginning of non-empty list",
			how: function(result)
			{
                var range = new TreeSelectionRange(this);
                [ 0, 1, 2, 3 ].each(function(i) {
                    range.insert(i, new T(this));
                });
                range.insert(0, new T(4));

                result.check("start path is correct", {
                    actual: range.start(),
                    expect: 4
                });
               
                result.check("list length is correct", {
                    actual: range.length(),
                    expect: 5
                });

                result.check("node is at the end of the list", {
                    actual: range.end(),
                    expect: 3
                });
			}
		},
		{
			what: "Insert single node in the middle of non-empty list",
			how: function(result)
			{
                var range = new TreeSelectionRange(this);
                [ 0, 1, 2, 3 ].each(function(i) {
                    range.insert(i, new T(this));
                });
                range.insert(2, new T(4));

                result.check("start path is correct", {
                    actual: range.start(),
                    expect: 0
                });
               
                result.check("list length is correct", {
                    actual: range.length(),
                    expect: 5
                });

                result.check("node is at the end of the list", {
                    actual: range.end(),
                    expect: 3
                });
			}
		},
		{
			what: "Split for bogus node",
			how: function(result)
			{
                var range = new TreeSelectionRange(this);
                var r2 = range.split(new T(4));

                result.check("start path is correct", {
                    actual: range.start(),
                    expect: null
                });
               
                result.check("list length is correct", {
                    actual: range.length(),
                    expect: 0
                });

                result.check("no range returned", {
                    actual: r2,
                    expect: null 
                });
			}
		},
		{
			what: "Split for first node",
			how: function(result)
			{
                var range = new TreeSelectionRange(this);
                [ 0, 1, 2, 3 ].each(function(i) {
                    range.insert(i, new T(this));
                });
                var r2 = range.split(new T(0));

                result.check("start path is correct", {
                    actual: range.start(),
                    expect: 1
                });
               
                result.check("list length is correct", {
                    actual: range.length(),
                    expect: 3
                });

                result.check("no range returned", {
                    actual: r2,
                    expect: null 
                });
			}
		},
		{
			what: "Split for last node",
			how: function(result)
			{
                var range = new TreeSelectionRange(this);
                [ 0, 1, 2, 3 ].each(function(i) {
                    range.insert(i, new T(this));
                });
                var r2 = range.split(new T(3));

                result.check("end path is correct", {
                    actual: range.end(),
                    expect: 2
                });
               
                result.check("list length is correct", {
                    actual: range.length(),
                    expect: 3
                });

                result.check("no range returned", {
                    actual: r2,
                    expect: null 
                });
			}
		},
		{
			what: "Split for middle node",
			how: function(result)
			{
                var range = new TreeSelectionRange(this);
                [ 0, 1, 2, 3 ].each(function(i) {
                    range.insert(i, new T(this));
                });
                var r2 = range.split(new T(1));
                Console.println(range.toString());
                Console.println(r2.toString());

                result.check("start path is correct", {
                    actual: range.start(),
                    expect: 0
                });
               
                result.check("list length is correct", {
                    actual: range.length(),
                    expect: 1
                });

                result.check("end path is correct", {
                    actual: range.end(),
                    expect: 0 
                });

                result.check("new range start path is correct", {
                    actual: r2.start(),
                    expect: 2
                });
               
                result.check("new range list length is correct", {
                    actual: r2.length(),
                    expect: 2
                });

                result.check("new range end path is correct", {
                    actual: r2.end(),
                    expect: 3 
                });
			}
		}
	]
});
