//////////////////////////////////////////////////////////////////////
//
// Copyright (c) 2010-2016 Archistry Limited
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
// Name:		path.js
// Created:		Mon Feb 15 22:10:06 GMT 2010
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.core");

/**
 * @class
 *
 * This is a static object that defines utility functions for
 * arbitrary path-like structures.
 */

archistry.core.Path = {

	/**
	 * This method is used to strip the path name and optional
	 * suffix from from a given string representing a path.
	 * An optional parameter specifies the delimiter to be
	 * used between path components.
	 *
	 * @param path the path string
	 * @param suffix the optional suffix to remove from the	path
	 * @param delim the path delimiter to use (by default '/'
	 *		is used as the path delimiter.
	 * @return the base path component
	 */

	basename: function(path, suffix, delim)
	{
		var d = "/";
		var s = "";
		var rs = "";
		if(delim) { d = delim; }
		if(suffix) { s = suffix; }

		var idx = path.lastIndexOf(d);
		if(idx < 0)
		{
			rs = path;
		}
		else if(idx === path.length - d.length)
		{
			rs = this.basename(path.substr(0, idx), suffix, delim);
		}
		else
		{
			rs = path.substr(idx+d.length);
		}
		var regex = new RegExp(s);
		return rs.replace(regex, "");
	},

	/**
	 * This function returns the path name portion of the
	 * given path.
	 *
	 * @param path the path to manipulate
	 * @param delim the path delimiter to use (by default '/'
	 *		is used as the path delimiter.
	 * @return the base path component
	 */

	pathname: function(path, delim)
	{
		var d = "/";
		var rs = "";
		if(delim) { d = delim; }

		var idx = path.lastIndexOf(d);
		if(idx < 0)
		{
			rs = path;
		}
		else if(idx === path.length - d.length)
		{
			rs = this.pathname(path.substr(0, idx), delim);
		}
		else
		{
			rs = path.substr(0, idx);
		}
		return rs;
	},

	/**
	 * This function is used to strip an extension from the
	 * string denoted by the last '.' and any trailing
	 * characters provided the string does not start with the
	 * '.' character.
	 *
	 * @param path the path to manipulate
	 * @return the path without the extension
	 */

	stripExtension: function(path)
	{
		var idx = path.lastIndexOf(".");
		if(idx > 0)
			return path.substr(0, idx);

		return path;
	},

	/**
	 * This function is used to get the extension of the
	 * string denoted by the argument.
	 *
	 * @param path the path to manipulate
	 * @return the extension (if any)
	 */

	getExtension: function(path)
	{
		var idx = path.lastIndexOf(".");
		if(idx > 0)
			return path.substr(idx);

		return null;
	},

	/**
	 * This function is used to join two path components using
	 * the optional path separator character so that the
	 * resulting path is valid.
	 *
	 * @param base the base path component
	 * @param leaf the leaf path component
	 * @param delim the optional path delimiter
	 * @return the joined string
	 */

	join: function(base, leaf, delim)
	{
		if(!leaf)
		{
			return base;
		}

		var d = "/";
		var l = leaf;
		if(delim) { d = delim; }

		var idx = base.lastIndexOf(d);
		var idx2 = l.indexOf(d);
		if(idx2 == 0)
		{
			l = l.substr(d.length);
		}
		if(idx != base.length - 1)
		{
			return String.format("{0}{1}{2}", [ base, d, l]);
		}

		return base + l;
	}
};
