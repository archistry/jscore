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
// Name:        multimap.js
// Created:     Thu Nov 17 09:25:19 SAST 2016
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.core");

/**
 * @class
 *
 * This class extends the Hash API to allow duplicate values
 * for a given key.
 */

archistry.core.MultiMap = function()
{
	$A(this);
	var _self = this;
    var _hash = new archistry.core.Hash();
    var _size = 0;

    /**
     * This method provides "clearing" of object properties which
     * are not methods/functions.  It is intended mainly for use
     * on Object instances used as associative arrays or mapes to
     * easily clear the keys.
     * <p>
     * WARNING:  The criteria for deletion of the object
     * properties is only that they are not functions, so any
     * nested objects will also be cleared.  Therefore, using this
     * method on objects representing complex structures like
     * namespaces can be catastrophic!
     * </p>
     *
     * @returns this
     */

    this.clear = function()
    {
		_hash.clear();
        _size = 0;

        return this;
    };

    /**
     * This method is used to iterate over all of the property
     * keys and values with the specified callback.
     * <p>
     * By default, only non-method keys are returned.  However,
     * this behavior can be changed by passing 'true' as the
     * optional argument to retrieve all properties of the object.
     * </p>
     * <p>
     * The callback's this reference will be to the object and the
     * key and value will be passed as the parameters.
     * </p>
	 * <p>
	 * NOTE: each value for a given key results in a unique
	 * callback call, therefore, if key "a" had two values,
	 * then the callback will be invoked twice, once with key
	 * "a" and value 1, and again with key "a" and value 2.
	 * </p>
     *
     * @param callback the callback function of the form:
     *      <pre>
     *      callback(key, value) {
     *          // this === object
     *      };
     *      </pre>
     *      Returning a value from the callback will stop the
     *      iteration.
     * @param includeMethods (optional) set to true to include
     *      property keys whose values are functions.
     * @return the property key values as an array
     */

    this.each = function(callback, includeMethods)
    {
        var rc = null;

		_hash.each(function(key, vals) {
			vals.each(function(i) {
				if((rc = callback.apply(_self, [ key, this ])) !== undefined)
					return rc;
			});
		}, includeMethods);
    };

	/**
	 * This method is used to determine if the given key is
	 * present in the MultiMap.
	 */

	this.hasKey = function(key)
	{
		return _hash.hasKey(key);
	};

    /**
     * This method returns the object keys for the values set
     * in the map.  It DOES NOT enumerate the property keys
     * in the Hash object.
     *
     * @return the keys of the map as an array
     */

    this.keys = function()
    {
		return _hash.keys();
    };

    /**
     * This method is used to set a map entry that can properly
     * index object-centric keys.
     *
     * @param key the key to set
     * @param value the value
     * @returns the value
     */

    this.set = function(key, val)
    {
		var _vals = _hash.get(key);
		if(!_vals)
		{
			_vals = $Array();
		}

		_vals.add(val);
		++_size;
		_hash.set(key, _vals);

		return val;
    };

	/**
	 * This method is used to return a count of the number of
	 * entries for the given key.
	 */

	this.count = function(key)
	{
		var _vals = _hash.get(key);
		if(!_vals)
			return 0;

		return _vals.length;
	};

    /**
     * This method is used to iterate the values for the given
	 * key.  The 'this' reference is set to each of the values
	 * in turn.
     *
     * @param key the key to get
	 * @param callback the callback function to execute
     * @returns the value or undefined if it doesn't exist.
     */

    this.eachWithKey = function(key, callback)
    {
		var _vals = _hash.get(key);
		if(!_vals || _vals.length === 0)
			return;

		return _vals.each(callback);
    };

    /**
     * This method is used to delete a map entry and optional
	 * value from the map.
     *
     * @param key the key to delete
     * @param value the optional value to delete
     * @returns the value or undefined if it doesn't exist.
     */

    this.remove = function(key, value)
    {
		if(!value)
			return _hash.remove(key);

		var _vals = _hash.get(key);
		return _vals.remove(value);
    };

    this.size = function() { return _size; };
};
