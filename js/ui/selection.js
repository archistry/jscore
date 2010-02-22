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
// Name:		selection.js
// Created:		Sun Feb 21 22:55:38 GMT 2010
//
///////////////////////////////////////////////////////////////////////

/**
 * @name archistry.ui.selection
 * @namespace
 *
 * Selection utility classes.
 */

namespace("archistry.ui.selection");

/**
 * @class
 *
 * This class provides mix-in signal notification
 * functionality for the supported selection signals.
 *
 * @param sender the implementation instance that should be
 *		the sender of the signals
 */

archistry.ui.selection.Notifier = function(sender)
{
	this.mixin(new archistry.core.SignalSource(sender));
	this.addValidSignals([
		"selection-changed",
		"selection-extended"
	]);

	/**
	 * This method is used to fire the "selection-changed"
	 * signal to the registered observers.  The callback
	 * function's this pointer will be for the selection
	 * object that sent the signal.
	 */

	this.fireSelectionChanged = function()
	{
		this.signalEmit("selection-changed");
	};

	/**
	 * This method is used to fire the "selection-extended"
	 * signal to the registered observers.  The callback
	 * function's this pointer reference will be set to the
	 * selection sending the signal, and it should have the
	 * following signature:
	 * <pre>
	 *   callback(delta)
	 *   {
	 *		// this === selection
	 *   }
	 * </pre>
	 * <p>
	 * The delta parameter represents the item added to the
	 * selection.
	 * </p>
	 */

	this.fireSelectionExtended = function(delta)
	{
		this.signalEmit("selection-extended", delta);
	};
};

/**
 * @class
 *
 * This class implements a basic single selection model.
 */

archistry.ui.selection.SingleSelectionModel = function()
{
	this.mixin(new archistry.ui.selection.Notifier(this));

	var _selection = null;

	/**
	 * This method is part of the SelectionModel API and is
	 * used to add a new item to the selection.
	 *
	 * @param item the item to be added
	 */

	this.add = function(item) 
	{
		_selection = item
		this.fireSelectionChanged();
	};

	/**
	 * This method is part of the SelectionModel API and is
	 * used to remove an item from the selection.
	 *
	 * @param item the item to be removed
	 */

	this.remove = function(item)
	{
		if(item === _selection)
		{
			_selection = null;
			this.fireSelectionChanged();
		}
	};
	
	/**
	 * This method is part of the SelectionModel API and is
	 * used to clear the selection.
	 */

	this.clear = function()
	{
		_selection = null;
		this.fireSelectionChanged();
	};

	/**
	 * This method is part of the SelectionModel API and is
	 * used to retrieve the length of the selection.
	 */

	this.__defineGetter__("length", function() {
		return (_selection ? 1 : 0);
	});
	
	/**
	 * This method is part of the core SelectionModel API and
	 * is used to iterate over the items in the selection.
	 *
	 * @param callback the callback function to be invoked
	 *		with each selection item as the this reference.
	 */

	this.each = function(callback)
	{
		callback.apply(_selection, [ _selection ]);
	};

	/**
	 * This method is part of the core SelectionModel API and
	 * is used to iterate over the items in the selection in
	 * reverse order.
	 *
	 * @param callback the callback function to be invoked
	 *		with each selection item as the this reference.
	 */

	this.reverseEach = this.each;
};

/**
 * @class
 *
 * This class implements a basic multi-select model.
 *
 * @param options a mixin object to set behavior options to
 *		control how the selection is interpreted.
 */

archistry.ui.selection.MultiSelectionModel = function(options)
{
	this.mixin(new archistry.ui.selection.Notifier(this));
	this.mixin(options);

	var _selection = [];

	/**
	 * This method is part of the SelectionModel API and is
	 * used to add a new item to the selection.
	 *
	 * @param item the item to be added
	 */

	this.add = function(item) 
	{
		_selection.add(item);
		if(this.sorter)
		{
			_selection.sort(this.sorter);
		}
		this.fireSelectionChanged();
		if(_selection.length > 1)
		{
			this.fireSelectionExtended(item);
		}
	};

	/**
	 * This method is part of the SelectionModel API and is
	 * used to remove an item from the selection.
	 *
	 * @param item the item to be removed
	 */

	this.remove = function(item)
	{
		if(_selection.remove(item))
		{
			this.fireSelectionChanged();
		}
	};
	
	/**
	 * This method is part of the SelectionModel API and is
	 * used to clear the selection.
	 */

	this.clear = function()
	{
		_selection = [];
		this.fireSelectionChanged();
	};

	/**
	 * This method is part of the SelectionModel API and is
	 * used to retrieve the length of the selection.
	 */

	this.__defineGetter__("length", function() {
		return _selection.length;
	});

	/**
	 * This method is part of the core SelectionModel API and
	 * is used to iterate over the items in the selection.
	 *
	 * @param callback the callback function to be invoked
	 *		with each selection item as the this reference.
	 */

	this.each = function(callback)
	{
		for(var i = 0; i < _selection.length; ++i)
		{
			callback.apply(_selection[i], [ _selection[i] ]);
		}
	};

	/**
	 * This method is part of the core SelectionModel API and
	 * is used to iterate over the items in the selection in
	 * reverse order.
	 *
	 * @param callback the callback function to be invoked
	 *		with each selection item as the this reference.
	 */

	this.reverseEach = function(callback)
	{
		for(var i = _selection.length -1; i >= 0; --i)
		{
			callback.apply(_selection[i], [ _selection[i] ]);
		}
	};
};
