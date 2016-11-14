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

archistry.io.FileLoadTask = function(file, chunkSize)
{
	$A(this).mixin(new archistry.core.SignalSource(this));
	this.addValidSignals([
		"task-started",
		"task-paused",
		"task-resumed",
		"task-completed",
		"task-error",
		"task-status"
	]);

	var slice = File.prototype.slice 
			|| File.prototype.mozSlice
			|| File.prototype.webkitSlice

	var _self = this;
	var _spark = new SparkMD5.ArrayBuffer();
	var	_reader = new FileReader();
	var _eventInfo = {
			source: file,
			contentType: file.type,
			size: file.size,
			name: file.name
		};
	var _chunks = Math.ceil(file.size / chunkSize);
	var	_chunk = 0;
	var _paused = false;	

	function nextChunk()
	{
		if(_paused)
		{
			return;
		}

		var start = _chunk * chunkSize;
		var end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;

		_reader.readAsArrayBuffer(slice.call(file, start, end));
		fireTaskStatus();
	}

	function fireTaskStarted()
	{
		_self.signalEmit("task-started", $A().mixin(_eventInfo));
	}

	function fireTaskCompleted()
	{
		// FIXME: this is pretty annoying that we need to do
		// things this way, and we probably are copying the
		// information around multiple times, but right now, I
		// don't see any other good way to do this based on
		// what we're trying to accomplish.
		//
		// FIXME: investigate ObjectURLs based on this post: 
		// https://www.bennadel.com/blog/2966-rendering-image-previews-using-object-urls-vs-base64-data-uris-in-angularjs.htm
		
		var reader = new FileReader();
		var data = null;
		reader.onload = function(e) {
			_self.signalEmit("task-completed", $A({
					md5: _spark.end(),
					data: e.target.result,
					}).mixin(_eventInfo));
		};
		reader.readAsDataURL(file);
	}

	function fireTaskError(event)
	{
		_self.signalEmit("task-error", $A({
				pos: _chunk * chunkSize,
				error: event.target.error,
				}).mixin(_eventInfo));
	}

	function fireTaskStatus()
	{
		_self.signalEmit("task-status", $A({
				pos: _chunk * chunkSize
				}).mixin(_eventInfo));
	}

	_reader.onerror = fireTaskError;
	_reader.onload = function(e) {
		_spark.append(e.target.result);
		_chunk++;

		if(_chunk < _chunks)
		{
			nextChunk();
		}
		else
		{
			fireTaskCompleted();
		}
	};

	/**
	 * This method actually starts the load process.
	 */

	this.start = function()
	{
		// start the file loading process
		_paused = false;
		fireTaskStarted();
		nextChunk();
	};

	/**
	 * This method will pause the load process at the next
	 * chunk.
	 */

	this.pause = function()
	{
		_paused = true;
		_self.signalEmit("task-paused", $A({
			pos: _chunk * chunkSize
			}).mixin(_eventInfo));
	};

	/**
	 * This method will resume the task.
	 */

	this.resume = function()
	{
		_paused = false;
		_self.signalEmit("task-resumed", $A({
			pos: _chunk * chunkSize
			}).mixin(_eventInfo));
		nextChunk();
	};
};

/**
 * @class
 *
 * This class allows us to open local files and get
 * information about them during the loading process.  The
 * implementation is based on the example in Mozilla's PDF.js
 * web viewer
 * (https://github.com/mozilla/pdf.js/blob/master/web/viewer.js)
 * as well as the example in the README for the SparkMD5
 * library (https://github.com/archistry/js-spark-md5)
 */

archistry.io.FileLoader = function()
{
	var FileLoadEvent = archistry.io.FileLoadEvent;

	$A(this).mixin(new archistry.core.SignalSource(this));
	this.addValidSignals([
		"file-load-started",
		"file-load-completed",
		"file-load-error",
		"file-load-data",
		"file-load-failed"
	]);

	var CHUNKSIZE	= 2097152;
	var _self		= this;
	var _xhr		= new archistry.core.XHR();
	var _tasks		= $Array();
	
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
					hash: SparkMD5.hash(resp),
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

	/**
	 * This method will load and return the contents of the
	 * file object according to the given mime type.
	 */

	this.loadFile = function(file)
	{
		var task = new archistry.io.FileLoadTask(file, CHUNKSIZE);
		task.signalConnect("task-started", function(e) {
			_tasks.add(this);
			_self.signalEmit("file-load-started", e);
		});
		task.signalConnect("task-error", function(e) {
			_self.signalEmit("file-load-error", e);
		});
		task.signalConnect("task-completed", function(e) {
			_tasks.remove(this);
			_self.signalEmit("file-load-completed", e);
		});
		task.signalConnect("task-status", function(e) {
			_self.signalEmit("file-load-data", e);
		});

		setTimeout(task.start(), 10);
	};
};
