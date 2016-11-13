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
// Name:		file_loader.js
// Created:		Sat Nov 12 16:09:27 SAST 2016
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.io");

/**
 * @class
 *
 * This class provides the information about file loading
 * events.
 */

archistry.io.FileLoadEvent = function(xhr, responseData)
{
	this.xhr = function() { return xhr; };
	this.response = function() { return responseData };
};

/**
 * @class
 *
 * This class allows us to open local files and get
 * information about them during the loading process.  The
 * implementation is based on the example in Mozilla's PDF.js
 * web viewer
 * (https://github.com/mozilla/pdf.js/blob/master/web/viewer.js)
 */

archistry.io.FileLoader = function()
{
	var FileLoadEvent = archistry.io.FileLoadEvent;

	$A(this).mixin(new archistry.core.SignalSource(this));
	this.addValidSignals([
		"file-load-completed",
		"file-load-failed"
	]);

	var _self = this;
	var _xhr = new archistry.core.XHR();

	/**
	 * @private
	 *
	 * This method is used to fire the file-load-completed
	 * signal to all registered observers.
	 * 
	 * @param url the URL loaded
	 * @param resp the response object describing the response
	 */

	function fireLoadCompleted(xhr, eventData)
	{
		_self.signalEmit("file-load-completed",
				new FileLoadEvent(xhr, eventData));
	}

	/**
	 * This method indicates whether the local file loading
	 * support is available in the current browser or not.
	 */

	this.isAvailable = function()
	{
		return window.File 
				|| window.FileReader 
				|| window.FileList
				|| window.Blob
	};

	this.load = function(url)
	{
		var fileuri = /^file:/
		var hash = {
			loaded: function(xhr)
			{
				var resp = xhr.response;
				var rval = {
					uri: url,
					contentType: xhr.getResponseHeader('content-type'),
					hash: hex_md5(resp),
					data: resp
				};

				if(fileuri.test(url))
				{
					rval.data = new Uint8Array(resp);
				}

				fireLoadCompleted(xhr, rval);
			}
		};

		if(fileuri.test(url))
		{
			hash.responseType = 'arraybuffer';
		}

		xhr.get(url, hash);
	};
};
