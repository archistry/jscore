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
	$A(this).mixin(new archistry.core.SignalSource(sender));
	this.addValidSignals([
		"selection-cleared",
		"selection-changed",
		"selection-extended"
	]);

    /**
     * This method is used to fire the "selection-cleared"
     * signal to the registered observers.
     */

    this.fireSelectionCleared = function()
    {
        this.signalEmit("selection-cleared");
    };

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
     * @param delta an array of the items added to the
     *      selection.
	 */

	this.fireSelectionExtended = function(delta)
	{
		this.signalEmit("selection-extended", delta);
	};
};

/**
 * @namespace
 *
 * This object provides constants representing the various
 * supported selection strategies.
 * <p>
 * <dl>
 * <dt>SINGLE_SELECTION</dt>
 * <dd>Allows only a single selection object at one time.</dd>
 * 
 * <dt>RANGE_SELECTION</dt>
 * <dd>Allows a single, contiguous range to be selected
 * between a start and an end marker.</dd>
 *
 * <dt>MULTI_RANGE_SELECTION</dt>
 * <dd>Allows multiple contiguous ranges to be selected at the
 * same time.  Each range is identified by a separate start
 * and end marker.</dd>
 * </dl>
 * </p>
 */

archistry.ui.selection.Mode = {
    /** @field */
    SINGLE_SELECTION:       "single-selection",
    /** @field */
    RANGE_SELECTION:        "range-selection",
    /** @field */
    MULTI_RANGE_SELECTION:  "multi-range-selection"
};

/**
 * @class
 *
 * This class represents a selection range and is an immutable
 * object once created.  The represented start-end range MUST
 * be contiguous.
 *
 * @property owner the owner object of the selection
 * @property start the start index
 * @property end the end path
 */

archistry.ui.selection.SelectionRange = function(owner, start, end)
{
    this.owner = function() { return owner; };
    this.start = function() { return start; };
    this.end = function() { return end; };
};

/**
 * @class
 *
 * This class implements a simple, single selection model.
 *
 * @param owner the signal sender
 * @param selectfn the callback to be invoked when the item is
 *      to be selected or unselected.  It has the form:
 *      <pre>
 *        callback(item, selected) {
 *          // set the item to value of selected
 *        }
 *      </pre>
 */

archistry.ui.selection.SingleSelectionModel = function(owner, selectfn)
{
    $A(this).mixin(archistry.core.Util);
	this.mixin(new archistry.ui.selection.Notifier(owner));

    if(!unselect)
        throw createError("ArgumentError: No unselect callback specified");

	var _selection = null;
   
    /** 
     * This method is part of the SelectionModel API and is
     * used to indicate the selection mode supported by the
     * instance.
     */

    this.mode = function()
    {
        return archistry.ui.selection.Mode.SINGLE_SELECTION;
    };

    /**
     * This method is part of the SelectionModel API and is
     * used to retrieve the length of the selection.
     */
    
    this.length = function()
    {
		return (_selection ? 1 : 0);
	};

	/**
	 * This method is part of the SelectionModel API and is
	 * used to add a new item to the selection.  In this
     * particular case, only the last item added actually
     * remains selected.
	 *
	 * @param item the item to be added
	 */

	this.add = function(item) 
	{
        if(_selection)
            selectfn(_selection, false);

		_selection = item
        selectfn(item, true);
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
            selectfn(_selection, false);
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
        if(_selection)
            selectfn(_selection, false);

		_selection = null;
		this.fireSelectionChanged();
	};

    /**
     * This method is part of the SelectionModel API and is
     * used to set the selection.
     *
     * @param item the item to be selected
     */

    this.set = function(item)
    {
        this.add(item);
    };

	/**
	 * This method is part of the core SelectionModel API and
	 * is used to iterate over the items in the selection.
	 *
	 * @param callback the callback function to be invoked
	 *		with each selection item as the this reference.
     *		To abort the traversal, return a value from the
     *		callback.
     * @return null or the value returned from the callback
	 */

	this.each = function(callback)
	{
		return callback.apply(_selection, [ _selection ]);
	};

	/**
	 * This method is part of the core SelectionModel API and
	 * is used to iterate over the items in the selection in
	 * reverse order.
	 *
	 * @param callback the callback function to be invoked
	 *		with each selection item as the this reference.
     * @function
	 */

	this.reverseEach = this.each;
};

/**
 * @class
 *
 * This class implements a basic multi-select model that
 * allows selection of multiple, discontiguous ranges.  The
 * items managed by this class are SelectionRange instances
 *
 * @param options a mixin object to set behavior options to
 *		control how the selection is interpreted.
 */

archistry.ui.selection.MultiSelectionModel = function(options)
{
	$A(this).mixin(new archistry.ui.selection.Notifier(this));
	this.mixin(options);

	var _selection = $Array();

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
		_selection = $Array();
		this.fireSelectionChanged();
	};

	/**
	 * This method is part of the SelectionModel API and is
	 * used to retrieve the length of the selection.
	 */

    this.length = function()
    {
		return _selection.length;
	};

	/**
	 * This method is part of the core SelectionModel API and
	 * is used to iterate over the items in the selection.
	 *
	 * @param callback the callback function to be invoked
	 *		with each selection item as the this reference.
     *		To abort the traversal, return a value from the
     *		callback.
     * @return null or the value returned from the callback
	 */

	this.each = function(callback)
	{
        var clone = _selection.slice(0);
        var rc = null;
		for(var i = 0; i < clone.length; ++i)
		{
			rc = callback.apply(clone[i], [ clone[i] ]);
            if(rc !== undefined)
                return rc;
		}
        delete clone;
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
        var clone = _selection.slice(0);
        var rc = null;
		for(var i = clone.length -1; i >= 0; --i)
		{
            rc = callback.apply(clone[i], [ clone[i] ]);
            if(rc !== undefined)
                return rc;
		}
        delete clone;
	};
};
