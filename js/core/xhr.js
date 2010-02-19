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
	 *	hash.headers		- an array of objects with properties
	 *						  "key" and "value" to indicate the
	 *						  header to send
	 *	hash.body			- the request body to send
	 *	hash.contentType	- the MIME type of the content
	 *						  type being sent (ignored for all
	 *						  but PUT and POST requests)
	 */

	this.makeRequest = function(method, location, hash)
	{
		if(xhr == null)
		{
			init();
		}
		callbacks = hash;
		var body = hash.body;
		var headers = hash.headers;
		if(!headers)
		{
			headers = [];
		}

		if(body && typeof body === 'object')
		{
			switch(method)
			{
				case 'POST':
					body = this.urlEncode(body);
					headers.add({key: "Content-Type", value: "application/x-www-form-urlencoded"});
					break;
				case 'GET':
					if(location.match(/\?/))
					{
						location = archistry.core.Path.join(location,
									this.urlEncode(body), "&");
					}
					else
					{
						location = archistry.core.Path.join(location,
									this.urlEncode(body), "?");
					}
					body = null;
					break;
			}
		}
	
		if(hash.contentType)
		{
			headers.add({key: "Content-Type", value: hash.contentType});
		}

		xhr.open(method, location, true);
		xhr.onreadystatechange = readyStateHandler;
		
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

	this.head = function(url, hash)
	{
		this.makeRequest("HEAD", url, hash);
	};

	this.abort = function()
	{
		if(xhr)
		{
			xhr.abort();
		}
	};

	/**
	 * This method is used to escape each component of a URL query
	 * string parameter to generate valid data according to
	 * the application/x-www-form-urlencoded MIME format.
	 *
	 * @param val the value to escape
	 * @return the escaped, URL Encoded value
	 */

	this.urlEscape = function(val)
	{
		// FIXME: I know this isn't too efficient...
		return val.replace(/([^ a-zA-Z0-9_.-]+)/g, function(m, s) {
			var vals = "";
			for(var i = 0; i < s.length; ++i)
			{
				vals += "%" + s.charCodeAt(i).toString(16);
			}
			return vals;
		}).replace(/ /g, "+");
	};

	/**
	 * This method is used to convert a value object
	 * representing form parameters into a URL Encoded query
	 * string path component.  This path component can then
	 * either be joined to a URI using the
	 * archistry.core.Path#join method, or it can be used as
	 * the body of a POST request.
	 *
	 * This method will automatically be applied to body
	 * values that are given to the makeRequest method as
	 * objects.
	 *
	 * @param obj the object representing the values to send
	 * @return the encoded object as a string
	 */

	this.urlEncode = function(obj)
	{
		var ps = [];
		for(k in obj)
		{
			if(typeof obj[k] === 'function')
				continue;

			ps.add(String.format("{0}={1}", 
					[ this.urlEscape(k), this.urlEscape(obj[k]) ]));
		}
		return ps.join("&");
	};
};

/**
 * This class provides a factory for creating and managing
 * groups of XHR objects to simplify management when changing
 * pages.
 */

archistry.core.XHRFactory = function()
{
	var instances = [];

	/**
	 * This method creates a new XHR instance and keeps a
	 * reference to the created object for further management.
	 *
	 * @return the XHR instance
	 */

	this.createInstance = function()
	{
		var xhr = new archistry.core.XHR();
		instances.add(xhr);
		return xhr;
	};

	/**
	 * This method is used to abort all currently active
	 * requests for XHR instances created by the factory.  It
	 * will only affect instances that were created by this
	 * instance, and it will not interfere with other factory
	 * objects that may be in use on the current page.
	 */

	this.abortAll = function()
	{
		for(var i = 0; i < instances.length; ++i)
		{
			instances[i].abort();
		}
	};

	/**
	 * This method is used to clean up the factory and any
	 * instances.  It calls abort for each XHR managed by the
	 * factory and then deletes the instance to ensure that
	 * memeory leaks are avoided.
	 */

	this.shutdown = function()
	{
		for(var i = 0; i < instances.length; ++i)
		{
			instances[i].abort();
			delete instances[i];
		}
	};
};
