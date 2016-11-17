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
// Name:        observable_hash.js
// Created:     Wed Nov 16 17:41:20 SAST 2016
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.data");

/**
 * @class
 *
 * This class extends the core Hash class to provide
 * notification of change events so that it can be observed by
 * other objects.
 */

archistry.data.ObservableHash = function(hash)
{
	$A(this).mixin(new archistry.core.SignalSource(this));
	this.addValidSignals([
		"property-set",
		"property-removed",
		"instance-reset"
	]);
	var _self = this;
	var _hash = hash ? hash : new archistry.core.Hash();

    /**
     * This method provides "clearing" of object properties which
     * are not methods/functions.  It is intended mainly for use
     * on Object instances used as associative arrays or hashes to
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
		_signalEmit("instance-reset");
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
		return _hash.each(callback, includeMethods);
    };

    /**
     * This method returns the object keys for the values set
     * in the hash.  It DOES NOT enumerate the property keys
     * in the Hash object.
     *
     * @return the keys of the hash as an array
     */

    this.keys = function()
    {
		return _hash.keys();
    };

    /**
     * This method is used to set a hash entry that can properly
     * index object-centric keys.
     *
     * @param key the key to set
     * @param value the value
     * @returns the value
     */

    this.set = function(key, val)
    {
		var oldval = _hash.get(key);
		var rval = _hash.set(key, val);
		_signalEmit("property-changed", key, val, oldval)
        return rval;
    };

    /**
     * This method is used to retrieve a hash entry.
     *
     * @param key the key to get
     * @returns the value or undefined if it doesn't exist.
     */

    this.get = function(key)
    {
		return _hash.get(key);
    };

    /**
     * This method is used to delete a hash entry.
     *
     * @param key the key to delete
     * @returns the value or undefined if it doesn't exist.
     */

    this.remove = function(key)
    {
		var rval = _hash.remove(key);
		_signalEmit("property-removed", key, rval);
		return rval;
    };

    this.size = function() { return _hash.size(); };
};
