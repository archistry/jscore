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
// Name:		test_indexer.js
// Created:		Mon Feb 22 22:54:04 GMT 2010
//
///////////////////////////////////////////////////////////////////////

var Indexer = archistry.data.Indexer;

Jester.testing("Indexer core functionality", {
	tests: [
		{
			what: "mapIndex method functionality",
			how: function(result)
			{
                var mapIndex = archistry.data.Indexer.mapIndex;
                var data = [ 1, 2, 3, 4 ];

                result.check("start index not changed", {
                    actual: mapIndex(0, data.length),
                    expect: 0
                });
                
                result.check("last index not changed", {
                    actual: mapIndex(3, data.length),
                    expect: 3
                });
                
                result.check("-1 mapped to last element", {
                    actual: mapIndex(-1, data.length),
                    expect: 3
                });
                
                result.check("-4 mapped to first element", {
                    actual: mapIndex(-4, data.length),
                    expect: 0
                });

                result.check("zero count returns zero offset", {
                    actual: mapIndex(-4, 0),
                    expect: 0
                });
			}
		}
	]
});
