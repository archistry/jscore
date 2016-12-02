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
// Name:		array.js
// Created:		Sat Dec  5 22:40:26 GMT 2009
// Split:       Fri Mar 12 08:06:52 GMT 2010
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.core");

/**
 * @class
 * 
 * This is a namespaced extension to the built-in Array class
 * that doesn't extend the Array prototype.  We can't do this
 * anymore because it makes other libraries barf when they
 * traverse arrays with the 'for(x in y)' syntax.
 */

archistry.core.Array = function()
{
	$A(this);
	
	/**
	 * This method allows objects to be added to the array without
	 * having to deal with the length stuff.
	 *
	 * @param obj the object to add
	 * @returns this so that you can chain the invocations
	 */

	this.add = function(obj)
	{
		this[this.length] = obj;
		return this;
	};

	/**
	 * This method is used to override the inspect behavior for
	 * arrays.
	 */

	this.inspect = function()
	{
		var s = "[ ";
		for(var i = 0; i < this.length; ++i)
		{
			s += this[i].inspect();
			if(i < this.length - 1)
			{
				s += ", "
			}
		}
		return s + "]";
	};

	/**
	 * This method will return the index if the element exists in
	 * the array or -1 if it does not.
	 *
	 * @param obj the object to check
	 * @return the integer index of the matching object or -1 if
	 *		not found
	 */

	this.indexOf = function(obj)
	{
		var idx = -1;
		for(var i = 0; i < this.length; ++i)
		{
			if(this[i] === obj)
			{
				return i;
			}
			else if(archistry.core.objectEquals(this[i], obj))
			{
				return i;
			}
		}
		return idx;
	};

	/**
	 * This method will return true if the array includes the
	 * indicated object or false if it does not.
	 */

	this.includes = this.include = function(obj)
	{
		return this.indexOf(obj) != -1;
	};

	// Array Remove - By John Resig (MIT Licensed)
	this.removeRange = function(from, to)
	{
		var rest = this.slice((to || from) + 1 || this.length);
		this.length = from < 0 ? this.length + from : from;
		return this.push.apply(this, rest);
	};

	/**
	 * This method will remove the specified object at the given
	 * index.  It is based on the above implementation
	 * of removeRange (I changed the name), but it returns the
	 * object that was removed.
	 *
	 * @param idx the index of the object to remove
	 * @return the item or null
	 */

	this.removeAtIndex = function(idx)
	{
		if(idx >=0 && idx < this.length)
		{
			var mobj = this[idx];
			var rest = this.slice(idx + 1 || this.length);
			this.length = idx;
			this.push.apply(this, rest);
			return mobj;
		}
		return null;
	};

	/**
	 * This method will attempt to remove the specified object
	 * from the array.
	 *
	 * @param obj the object to remove
	 * @return the object removed
	 */

	this.remove = function(obj)
	{
		return this.removeAtIndex(this.indexOf(obj));
	};

	/**
	 * This method allows the array to be cleared without creating
	 * another array instance.
	 */

	this.clear = function()
	{
		this.splice(0, this.length);
		return this;
	};

	/**
	 * This method provides an each iterator and calls the
	 * callback with the this reference set to the array element
	 * and the index of the item in the array.  To abort the
	 * traversal of the array, the callback should return a
	 * value.
	 *
	 * @param callback the callback function
	 * @return reference to the array or the return value of
	 *      the callback
	 */

	this.each = function(callback)
	{
		var rc = null;
		for(var i = 0; i < this.length; ++i)
		{
			rc = callback.apply(this[i], [ i ]);
			if(rc !== undefined)
				return rc;
		}

		return this;
	};

	/**
	 * This method provides an each iterator and calls the
	 * callback with the this reference set to the array element
	 * and the index of the item in the array.  Like the
	 * forward iterator, to abort the traversal, return a
	 * value from the callback
	 *
	 * @param callback the callback function
	 * @return reference to the array
	 */

	this.reverseEach = function(callback)
	{
		var rc = null;
		for(var i = this.length - 1; i >= 0; --i)
		{
			rc = callback.apply(this[i], [ i ]);
			if(rc !== undefined)
				return rc;
		}

		return this;
	};

	/**
	 * This method allows equality checks of array values.  If the
	 * arrays are the same length and the elements are the same,
	 * they are considered equal.
	 *
	 * @param rhs the right hand side to test
	 * @returns true if equal; false otherwise
	 */

	this.equals = function(rhs)
	{
		return archistry.core.arrayEquals(this, rhs);
	};

	/**
	 * This method is used to compare two arrays.  The rules for
	 * ordering will be as follows:
	 * <ul>
	 * <li>Shorter arrays will be ordered first</li>
	 * <li>If the arrays are the same length, they will be ordered
	 * by comparing the elements in them</li>
	 * </ul>
	 *
	 * @param rhs the "right hand side" array
	 * @return -1, 0, or 1
	 */

	this.compare = function(rhs)
	{
		if(!rhs.length)
			return 1;

		if(this.length < rhs.length)
			return -1;
		else if(this.length > rhs.length)
			return 1;

		var rval = this.each(function(i) {
			var l = this;
			var r = rhs[i];
			if(r === undefined)
			{
				if(this[i] !== undefined)
					return false;
			}
			else
			{
				var rc = 0;
				if(l.compare)
				{
					rc = l.compare(r);
					if(rc !== 0)
						return rc;
				}
				else if(r.compare)
				{
					rc = r.compare(l);
					if(rc !== 0)
						return 1 - rc;
				}
				if(l.valueOf) l = l.valueOf();
				if(r.valueOf) r = r.valueOf();

				if(l < r)
					return -1;
				else if(l > r)
					return 1;
			}
		});

		if(rval === this)
			return 0;

		return rval;
	};

	this.unique = function()
	{
		var uniq = $Array();
		this.each(function() {
			if(!uniq.include(this))
				uniq.add(this);
		});

		return uniq;
	};

	this.toString = function()
	{
		var s = "[";
		for(var i = 0; i < this.length; ++i)
		{
			var x = this[i];
			if(x.toString === undefined)
			{
				s += x;
			}
			else
			{
				s += x.toString();
			}
			if(i < this.length - 1)
			{
				s += ", ";
			}
		}
		return s += "]";
	};
};

/**
 * This utility function is used to either adapt an existing
 * array or to create a new array with the Archistry extension
 * methods.
 *
 * @param args an array, null or sequence of objects used to
 *			create a new instance
 * @returns an extended Array object
 */

var $Array = function()
{
	var targ = []
	var args = "";

	if(arguments.length == 1 && arguments[0].removeAtIndex !== undefined)
	{
		// attempting to wrap an existing wrapped instance, so
		// do nothing
		return arguments[0];
	}
	else if(arguments.length > 0 && !(arguments[0] instanceof Array))
	{
		// build a new array
		for(var i = 0; i < arguments.length; ++i)
		{
//			println("adding element arr[{0}]: {1}", i, arguments[i]);
			targ[targ.length] = arguments[i];
		}
	}
	else if(arguments.length == 1 && arguments[0] instanceof Array)
	{
		targ = arguments[0];
	}

	var arr = new archistry.core.Array();

	// this is required since we don't overwrite the prototype
	// methods anymore, and the default Array#indexOf doesn't
	// support our enhanced object comparators (which we need
	// for our own API implementation).
	targ.indexOf = arr.indexOf;

	// the default Array#includes method doesn't support our
	// extended notion of equality either, and so we need to
	// make sure we override it in the browser if it exists as
	// well.
	targ.includes = arr.includes;

	return archistry.core.extend(targ, arr);
};
