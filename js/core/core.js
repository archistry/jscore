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
// Name:		core.js
// Created:		Sat Dec  5 22:40:26 GMT 2009
//
///////////////////////////////////////////////////////////////////////

/*!
 * @package_name@
 * Version @version@
 *
 * Copyright 2009-2010 Archistry Limited.  All Rights Reserved.
 * http://software.archistry.com/
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *     * Redistributions of source code must retain the above
 *       copyright notice, this list of conditions and the following
 *       disclaimer.
 *
 *     * Redistributions in binary form must reproduce the above
 *       copyright notice, this list of conditions and the following
 *       disclaimer in the documentation and/or other materials provided
 *       with the distribution.
 *
 *     * Neither the name Archistry Limited nor the names of its
 *       contributors may be used to endorse or promote products derived
 *       from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 * COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// this variable is a hack for working namespace support in
// all browser contexts.  "Global" isn't "global" in
// JavaScript unless it's created with the var keyword or as a
// regular variable declaration.

var __ajs_ns = {};

/**
 * This function is used to define an object hierarchy that
 * represents a "namespace" entry.  It will create
 * intermediate objects (including the top-level global
 * holder) that represent the string path.
 * <p>
 * For example, to declare the "com.example" namespace, you
 * would simply write:
 *
 * <pre>
 *   namespace("com.example");
 * </pre>
 *
 * And further in the code, you could define new classes as:
 * <pre>
 *   com.example.MyClass = function() { ... }
 * </pre>
 * </p>
 *
 * @param ns the namespace string to create
 */

function namespace(ns)
{
	if('string' != typeof ns)
	{
		throw new ReferenceError("Must specify namespace path to be defined as a string!");
	}

    if(!ns.match(/^[_a-zA-Z]+[_.a-zA-Z0-9]*$/))
    {
        throw new Error("Syntax error:  Illegal namespace declaration");
    }

	var _global = (function(){return this;}).call();
	var global = __ajs_ns;
	var nspath = ns.split(".");
    var base = nspath[0];
	var root = global;
	var pc = "";
	for(var i = 0; i < nspath.length; ++i)
	{
		pc = nspath[i];
		if(root[pc] == null)
		{
			root[pc] = { };
		}
		root = root[pc];
	}

    if(!_global[base]) _global[base] = __ajs_ns[base];

    // NOTE:  this is necessary to ensure that the namespace
    // reference is defined "globally" so that it will be
    // available across window contexts in the browser
    // environment.  The _global reference above is only the
    // *initial* thing that happens to be global (depending on
    // the environment).  It WILL NOT always be the global,
    // because in the browser, new Window objects get created
    // and set as the global scope.
    if(typeof load !== 'function')
    {
        try
        {
            // only do this if not running console Rhino runtime
            if(Window !== undefined && !Window.prototype[base])
                Window.prototype[base] = __ajs_ns[base];
        }
        catch(e)
        {
            // Opera pukes because Window isn't defined...
        }
    }
}
