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
// Name:		main.js
// Created:		Tue Feb 16 17:28:47 GMT 2010
//
///////////////////////////////////////////////////////////////////////

// declare a global document instance of the controller class
// and make sure it is initialized when the page is ready for
// interaction.

var ajc = new archistry.ui.Controller();
$(function()
{
	ajc.initialize();

	// FIXME:  need to automatically find/build certain
	// controls if they are referenced in the page, e.g. the
	// console...
});

// Make sure that we cancel all pending XHR requests when the
// page is about to be unloaded.

$(window).unload(function() {
	ajc.xhr.shutdown();
});
