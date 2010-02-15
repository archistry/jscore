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
// Name:		version.js
// Created:		Fri Jan 15 10:50:12 GMT 2010
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.core");

/**
 * This class is used to represent version information about
 * the particular thing being versioned.
 */

archistry.core.Version = function(name, major, minor, release, build, date)
{
	var _name = name;
	var _major = major;
	var _minor = minor;
	var _rel = release;
	var _build = build;
	var _date = date;

	const _version = _name + " " + _major + "." + _minor + "." + _rel;
	const _fullVersion = _version + " (Build " + _build + "; " + _date + ")";

	this.__defineGetter__("name", function() { return _name; });
	this.__defineGetter__("major", function() { return _major; });
	this.__defineGetter__("minor", function() { return _minor; });
	this.__defineGetter__("release", function() { return _release; });
	this.__defineGetter__("build", function() { return _build; });
	this.__defineGetter__("fullVersion", function() { return _fullVersion; });
};

archistry.core.version = new archistry.core.Version("@package_name@", @version_major@, @version_minor@, "@version_release@", "@version_date@");
