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
// Name:        file_opener.js
// Created:     Sat Nov 12 16:45:52 SAST 2016
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.ui");

/**
 * @class
 *
 * This class provides the functionality of a 'File Open...'
 * button on a WebUI.  The code is based on the Mozilla PDF.js
 * viewer.js application.
 */

archistry.ui.FileOpener = function(options)
{
    var H = archistry.ui.Helpers;

	$A(this).mixin(new archistry.core.SignalSource(this));
	this.addValidSignals([
		"file-open-requested",
		"file-open-completed"
	]);

	var _self = this;
	var _options = $A({ multiple: false }).mixin(options);
	var _fileIO = new archistry.io.FileLoader();
	var _fileInput = null;
	var _fileResponse = $A();

	/**
	 * @private
	 *
	 * This method is used to fire the open requested event.
	 */

	function fireOpenRequested(files)
	{
		_self.signalEmit("file-open-requested", files);
	}

	/**
	 * @private
	 *
	 * This method is used to trigger the file loaded event.
	 */

	function fireOpenCompleted(responseData)
	{
		_self.signalEmit("file-open-completed", responseData);
	}

	/**
	 * @private
	 *
	 * This method is used to handle the change in the file
	 * input contents.
	 */

	function fileInputChanged(e)
	{
		var fileList = e.target.files;

		// notify listeners the open has been requested
		fireOpenRequested(fileList);

		// now, actually go about loading the files
		for(var i = 0; i < fileList.length; ++i)
		{
			loadFile(fileList[i]);
		}
	}

	/**
	 * @private
	 *
	 * This method takes care of actually loading the specific
	 * file.
	 */

	function loadFile(file)
	{
		// FIXME: I'm not really sure whether this is
		// necessary or not yet.
		var reader = new FileReader();
		var fileRef = { 
			name: file.name, 
			size: file.size, 
			contentType: file.type
		};

		reader.onload = function(e) {
			fileRef.data = e.target.result;
			fileRef.md5 = hex_md5(fileRef.data);
			fireOpenCompleted(fileRef);
		};

		reader.readAsBinaryString(file);
	}

    /**
     * This method is used to attach the opener to a given
	 * button in the interface.
     *
     * @param buttonId the ID of the button
     */

    this.attach = function(buttonId)
    {
		if(_fileIO.isAvailable())
		{
			this.button = H.e(buttonId);
			_fileInput = document.createElement("input");
			_fileInput.id = "{0}-input".format(buttonId);
			_fileInput.className = "ajs-file-input";
			_fileInput.setAttribute("type", "file");
			_fileInput.oncontextmenu = function(e) {
				e.preventDefault();
			};

			// take care of any additional attributes
			if(_options.multiple)
			{
				_fileInput.setAttribute("multiple", true);
			}
			if(_options.accept)
			{
				_fileInput.setAttribute("accept", _options.accept);
			}
			document.body.appendChild(_fileInput);

			// wire up the DOM events
			this.button.addEventListener("click", function(e) {
				_fileInput.click();
			});
				
			_fileInput.addEventListener("change", function(e) {
				fileInputChanged(e);
			});
		}
	};

	/**
	 * This method is an accessor to retrieve the current URI
	 * of the file input control.
	 */

	this.getFile = function()
	{
		if(_fileInput)
		{
			return _fileInput.value;
		}

		return null;
	};

	/**
	 * This method is an accessor to get the file URI list.
	 */

	this.getFileList = function()
	{
		if(_fileInput)
		{
			return $Array(_fileInput.files);
		}

		return $Array();
	};

	// default behavior to automatically attach if presented
	// with the option element:
	if(_options.element && !_fileInput)
	{
		this.attach(_options.element);
	}
}
