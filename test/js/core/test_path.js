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
// Name:		test_path.js
// Created:		Mon Feb 15 22:56:10 GMT 2010
//
///////////////////////////////////////////////////////////////////////

var Path = archistry.core.Path;

Jester.testing("Path function functionality", {
	tests: [
		{
			what: "test path basename",
			how: function(context, result)
			{
				result.check("path with no suffix and default delimiter", {
					actual: Path.basename("/some/path/file.txt"),
					expect: "file.txt"
				});

				result.check("path with suffix and default delimiter", {
					actual: Path.basename("/some/path/file.txt", ".txt"),
					expect: "file"
				});

				result.check("path with no suffix and custom delimiter", {
					actual: Path.basename(":some:path:file.txt", null, ":"),
					expect: "file.txt"
				});

				result.check("path with suffix and custom delimiter", {
					actual: Path.basename("@@some@@path@@file.txt", ".txt", "@@"),
					expect: "file"
				});

				result.check("path with no path component", {
					actual: Path.basename("foo.txt"),
					expect: "foo.txt"
				});

				result.check("path with no leaf component", {
					actual: Path.basename("/some/path/"),
					expect: "path"
				});
			}
		},
		{
			what: "test path pathname",
			how: function(context, result)
			{
				result.check("path with default delimiter", {
					actual: Path.pathname("/some/path/file.txt"),
					expect: "/some/path"
				});

				result.check("path with custom delimiter", {
					actual: Path.pathname("::some::path::file.txt", "::"),
					expect: "::some::path"
				});
				
				result.check("path with no leaf component", {
					actual: Path.pathname("/some/path/"),
					expect: "/some"
				});
			}
		},
		{
			what: "test path stripExtension",
			how: function(context, result)
			{
				result.check("path with basic file extension", {
					actual: Path.stripExtension("/some/path/file.txt"),
					expect: "/some/path/file"
				});

				result.check("path with multiple dots", {
					actual: Path.stripExtension("some.path.file.txt"),
					expect: "some.path.file"
				});
				
				result.check("path with no extension", {
					actual: Path.stripExtension("/some/path"),
					expect: "/some/path"
				});
			}
		},
		{
			what: "test path getExtension",
			how: function(context, result)
			{
				result.check("path with basic file extension", {
					actual: Path.getExtension("/some/path/file.txt"),
					expect: ".txt"
				});

				result.check("path with multiple dots", {
					actual: Path.getExtension("some.path.file.txt"),
					expect: ".txt"
				});
				
				result.check("path with no extension", {
					actual: Path.getExtension("/some/path"),
					expect: null
				});

				result.check("leading dot path", {
					actual: Path.getExtension(".profile"),
					expect: null
				});

				result.check("leading dot path with extension", {
					actual: Path.getExtension(".profile.xml"),
					expect: ".xml"
				});
			}
		},
		{
			what: "test path join",
			how: function(context, result)
			{
				result.check("basic path join", {
					actual: Path.join("/some/path", "file.txt"),
					expect: "/some/path/file.txt"
				});

				result.check("basic path join with custom delim", {
					actual: Path.join("::some::path", "file.txt", "::"),
					expect: "::some::path::file.txt"
				});
				
				result.check("join of path with trailing slash", {
					actual: Path.join("/some/path/", "file.txt"),
					expect: "/some/path/file.txt"
				});

				result.check("join of path with trailing slash and leading pc slash", {
					actual: Path.join("/some/path/", "/file.txt"),
					expect: "/some/path/file.txt"
				});


				result.check("join of path with leading pc slash", {
					actual: Path.join("/some/path", "/file.txt"),
					expect: "/some/path/file.txt"
				});

				result.check("join of path at root", {
					actual: Path.join("/", "file.txt"),
					expect: "/file.txt"
				});
			}
		}
	]
});
