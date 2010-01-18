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
// Name:		xhr.js
// Created:		Sat Dec  5 14:59:45 GMT 2009
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.core");

/**
 * This is our version of the XMLHttpRequest handler that is
 * influenced by implementations in other JavaScript
 * libraries.
 */

archistry.core.XHR = function()
{
	var xhr			= null;
	var callbacks	= null;

	/**
	 * This method is used to allocate the XMLHttpRequest
	 * object on a variety of browsers.
	 */

	function init()
	{
		if(window.XMLHttpRequest)
		{
			try
			{
				xhr = new XMLHttpRequest();
			}
			catch(e)
			{
				xhr = null;
			}
		}
		else if(window.ActiveXObject)
		{
			try
			{
				xhr = new ActiveXObject("Msxml2.XMLHTTP");
			}
			catch(e)
			{
				try
				{
					xhr = new ActiveXObject("Microsoft.XMLHTTP");
				}
				catch(e)
				{
					xhr = null;
				}
			}
		}
	}

	function readyStateHandler()
	{
		var fn = null;

		switch(xhr.readyState)
		{
			case 1:
				fn = callbacks.loading;
				if(fn != null)
				{
					fn(xhr);
				}
				break;
			case 2:
				fn = callbacks.loaded;
				if(fn != null)
				{
					fn(xhr);
				}
				break;
			case 3:
				fn = callbacks.interactive;
				if(fn != null)
				{
					fn(xhr);
				}
				break;
			case 4:
				fn = callbacks.completed;
				if(fn != null)
				{
					fn(xhr);
				}
				break;
		}
	}

	/**
	 * This method is the main workhorse of our XHR
	 * implementation.  It uses the hash parameter to allow
	 * the caller to provide an object tree to be used during
	 * the interaction with the XMLHttpRequest session.
	 *
	 * The following properties are used by this
	 * implementation:
	 *
	 * Callbacks
	 *
	 * Each of the following property represents a callback
	 * function with the signature:  fn(xhr).  The callback
	 * will be passed a reference to the underlying
	 * XMLHttpRequest object being used to make the request.
	 *
	 *	hash.loading	  - the function to execute when the ready
	 *					    state is 1
	 *	hash.loaded       - the function to execute when the ready
	 *						state is 2
	 *	hash.interactive  - the function to execute when the ready
	 *						state is 3
	 *	hash.completed	  - the function to execute when the ready
	 *						state is 4
	 *	hash.authenticate - the function to be executed when
	 *						authentication is required with
	 *						the target endpoint.
	 *
	 *	Request
	 *
	 *	The caller can also specify request properties to be
	 *	sent with the request, including HTTP headers and a
	 *	request body.
	 *
	 *	hash.headers  - an array of objects with properties
	 *					"key" and "value" to indicate the
	 *					header to send
	 *	hash.body	  - the request body to send
	 */

	this.makeRequest = function(method, location, hash)
	{
		if(xhr == null)
		{
			init();
		}
		callbacks = hash;
		var body = hash.body;
		
		xhr.open(method, location, true);
		xhr.onreadystatechange = readyStateHandler;
		
		var headers = hash.headers;
		if(headers != null)
		{
			for(var i = 0; i < headers.length; ++i)
			{
				var h = headers[i];
				xhr.setRequestHeader(h.key, h.value);
			}
		}
		xhr.send(body);
	};

	this.post = function(url, hash)
	{
		this.makeRequest("POST", url, hash);
	};

	this.get = function(url, hash)
	{
		this.makeRequest("GET", url, hash);
	};

	this.abort = function()
	{
		xhr.abort();
	};
};
