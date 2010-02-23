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
// Name:		changeset.js
// Created:		Thu Jan 21 16:08:45 GMT 2010
//
///////////////////////////////////////////////////////////////////////

/**
 * @name archistry.data
 * @namespace
 *
 * This namespace provides various data-centric utility
 * classes.
 */

namespace("archistry.data");

/**
 * This is a static object that represents the names of the
 * change operations.
 */

archistry.data.ChangeOp = {
	OBJECT_ADDED		: "obj-add",
	OBJECT_DELETED		: "obj-del",
	PROPERTY_CHANGED	: "prop-change",
	PROPERTY_ADDED		: "prop-add",
	PROPERTY_DELETED	: "prop-del"
};

/**
 * @class
 *
 * This class represents object property changes and
 * implements the Memento pattern.  It is fully initialized by
 * the constructor.
 *
 * @param object the object that was changed
 * @param change the nature of the change as a ChangeOp
 *			property value
 * @param key the property key that was changed (optional)
 * @param oldVal the original property key value, if
 *			appropriate for the nature of the change (optional)
 */

archistry.data.ChangeMemento = function(object, change, key, oldVal)
{
	this.object = object;
	this.change = change;
	this.key = key;
	this.oldVal = oldVal;
};

/**
 * @class
 *
 * This class defines the signals that are used by the
 * ObjectChangeObserver protocol.  This protocol defines 3
 * signals:
 * <ul>
 * <li>object-inserted &ndash; fired after a new object has
 * been added to the signal source.  The signal handler is
 * passed the following arguments:
 * <em>index</em>, and <em>data</em>.</li>
 * <li>object-deleted &ndash; fired after an object has
 * been deleted from the signal source.  The signal handler is
 * passed the following arguments: 
 * <em>index</em>, and <em>data</em>.</li>
 * <li>object-changed &ndash; fired after an object has
 * been changed in the signal source.  The signal handler is
 * passed the following arguments:
 * <em>index</em>, and <em>data</em>.</li>
 * </ul>
 * <p>
 * This class can simply be mixed in to any class that wishes
 * to support these signals as a signal source.
 * </>
 * @param sender the sender
 */

archistry.data.ObjectChangeSignalSource = function()
{
	this.mixin(new archistry.core.SignalSource(this));
	this.addValidSignals([
		"object-inserted",
		"object-deleted",
		"object-changed"
	]);

	/**
	 * This is a helper method to trigger the object-inserted
	 * signal to the listeners.
	 *
	 * @param idx the index of the object
	 * @param object the object added
	 */

	this.fireObjectInserted = function(idx, object)
	{
		this.signalEmit("object-inserted", idx, object);
	}

	/**
	 * This is a helper method to trigger the object deleted
	 * signal to the listeners.
	 *
	 * @param idx the index of the object
	 * @param object the object being deleted
	 */

	this.fireObjectDeleted = function(idx, object)
	{
		this.signalEmit("object-deleted", idx, object);
	}

	/**
	 * This is a helper method to trigger the object changed
	 * signal to the listeners.
	 *
	 * @param idx the index of the object
	 * @param object the object that was changed
	 */

	this.fireObjectChanged = function(idx, object)
	{
		this.signalEmit("object-changed", idx, object);
	}
};

/**
 * @class
 *
 * This class plays the role of the Caretaker in the Memento
 * pattern implementation.  It tracks a history of changes, so
 * can be used as the basis of an undo/redo facility.
 *
 * @param options initializer options to be mixed in with the
 *		instance after it is created
 */

archistry.data.ChangeSet = function(options)
{
	this.mixin(archistry.data.ObjectChangeSignalSource)
	this.mixin(options);

	var _changes = [];

	/**
	 * This method is used to add a new change to the
	 * changeset.
	 *
	 * @param memento the change memento
	 */

	this.add = function(memento)
	{
		var idx = _changes.length;
		_changes.add(memento);
		this.fireObjectInserted(idx, memento);
	};

	/**
	 * This method is used to delete a change from the
	 * changeset.
	 *
	 * @param memento the instance to delete
	 * @return a reference to the object removed or null if
	 *		not in the changeset
	 */

	this.remove = function(memento)
	{
		var obj = _changes.remove(memento);
		if(obj)
		{
			this.fireObjectDeleted(_changes.length, obj);
		}
		return obj;
	};

	/**
	 * This method is used to retrieve the specific memento by
	 * item index.
	 *
	 * @param idx the index of the item
	 * @return the change memento
	 */

	this.get = function(idx)
	{
		return _changes[idx];
	};

	/** returns the number of items in the changeset */
	this.__defineGetter__("length", function() { return _changes.length; });
};

/**
 * @class
 *
 * This is an implementation of a ChangeSet that only records
 * the last change for any object.  It is not suitable for
 * undo/redo operations, but it is useful for creating the
 * minimum of upates necessary to apply to some data store.
 *
 * @param options any additional configuration options or
 *		properties.
 */

archistry.data.CompactChangeSet = function(options)
{
	this.mixin(archistry.data.ObjectChangeSignalSource)
	this.mixin(options);
	if(!this.getKey)
	{
		this.getKey = function(memento)
		{
			return memento.object;
		};
	}

	var _changes = {};
	var _keys = [];

	/** @private */
	function getIdx(key)
	{
		for(var i = 0; i < _keys.length; ++i)
		{
			if(key === _keys[i])
				return i;
		}

		return null;
	}

	/**
	 * This method will store the specific change for the
	 * object based on using the object as a key.  Therefore,
	 * any previous change memento for that object will be
	 * discarded.
	 *
	 * @param memento
	 * @return the previous memento (if any)
	 */

	this.add = function(memento)
	{
		var key = this.getKey(memento);
		var old = _changes[key];
		_changes[key] = memento;
		if(!old)
		{
			_keys.add(key);
			this.fireObjectInserted(_keys.length - 1, memento);
		}
		else
		{
			this.fireObjectChanged(getIdx(key), memento);
		}
		return old;
	}

	/**
	 * This method will remove any memento currently stored
	 * for the specified object.
	 *
	 * @param memento
	 * @return the memento (if present)
	 */

	this.remove = function(memento)
	{
		var key = getKey(memento);
		var obj = _changes[key];
		if(old)
		{
			_keys.remove(key);
			this.fireObjectDeleted(keys.length, obj);
		}
		return obj;
	}

	/**
	 * This method will retrieve the specific memento by the
	 * item index (in this case, the object key).
	 *
	 * @param idx the index to the item
	 * @return the change memento (if it exists)
	 */

	this.get = function(idx)
	{
		if(typeof idx === "number")
			return _changes[_keys[idx]];

		return _changes[idx];
	}

	/**
	 * This method will retrieve the length of the changeset
	 */
	
	this.__defineGetter__("length", function() { return _keys.length; });
};
