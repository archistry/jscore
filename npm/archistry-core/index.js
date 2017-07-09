//////////////////////////////////////////////////////////////////////
//
// Copyright (c) 2009-2017 Archistry Limited
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
// File:	index.js
// Created:	Fri Jul  7 12:26:36 AST 2017
//
///////////////////////////////////////////////////////////////////////

var fs = require("fs");
eval(fs.readFileSync(__dirname + "/core.min.js", "utf8"));

global.$A = $A;
global.$Array = $Array;
global.archistry = archistry;
global.namespace = namespace;

// FIXME: not quite sure how to get around this problem since
// we can't include it and have it visible to libraries since
// it's designed for node/commonJS
global.SparkMD5 = require("spark-md5");

module.exports = {
	Array: archistry.core.Array,
	Hash: archistry.core.Hash,
	MultiMap: archistry.core.MultiMap,
	Observer: archistry.core.Observer,
	Path: archistry.core.Path,
	Util: archistry.core.Util,
	Version: archistry.core.Version
};

