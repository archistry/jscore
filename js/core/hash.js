//////////////////////////////////////////////////////////////////////
//
// Copyright (c) 2010-2016 Archistry Limited
// All rights reserved.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 
//	 * Redistributions of source code must retain the above
//	 copyright notice, this list of conditions and the following
//	 disclaimer.
// 
//	 * Redistributions in binary form must reproduce the above
//	 copyright notice, this list of conditions and the following
//	 disclaimer in the documentation and/or other materials provided
//	 with the distribution.
// 
//	 * Neither the name Archistry Limited nor the names of its
//	 contributors may be used to endorse or promote products derived 
//	 from this software without specific prior written permission.  
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
// Name:	hash.js
// Created:	Tue Mar  2 16:05:11 GMT 2010
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.core");

/**
 * @class
 *
 * This is a simple specialization of the Object for use as
 * associative array so we can add useful methods to it.
 */

archistry.core.Hash = function()
{
	$A(this);
	var _self = this;
	var _data = {};
	var _index = $A();
	var _size = 0;

	function getKey(val)
	{
		k = val;

		switch(typeof val)
		{
			case "string":
			case "number":
				break;
			default:
				if(k.substring === undefined)
				{
					k = val.objectId();
				}
		}

		return k;
	}

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
		_data = {}
		_index = $A();
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
	 *
	 * @param callback the callback function of the form:
	 *	  <pre>
	 *	  callback(key, value) {
	 *		  // this === object
	 *	  };
	 *	  </pre>
	 *	  Returning a value from the callback will stop the
	 *	  iteration.
	 * @param includeMethods (optional) set to true to include
	 *	  property keys whose values are functions.
	 * @return the property key values as an array
	 */

	this.each = function(callback, includeMethods)
	{
		var rc = null;

		for(var k in _data)
		{
			if(typeof _data[k] === 'function' && !includeMethods)
				continue;

			var key = _index[k];
			if((rc = callback.apply(this, [ key, _data[k] ])) !== undefined)
				return rc;
		}
	};

	/**
	 * This method is used to determine if the given key
	 * exists in the hash instance.
	 */

	this.hasKey = function(key)
	{
		return _index[key] !== undefined;
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
		var ks = $Array();
		_index.keys().each(function() { ks.add(_index[this]); });
		return ks;
	};

	/**
	 * This method is used to merge in the contents of an
	 * object or hash into this instance, overwriting any
	 * existing values.
	 *
	 * @param source
	 * @return this
	 */

	this.merge = function(source)
	{
		if(source.get === undefined)
		{
			// treat it as a regular object
			for(var k in source)
			{
				if(typeof source[k] !== 'function')
				{
					_self.set(k, source[k]);
				}
			}
		}
		else
		{
			source.keys().each(function() {
				_self.set(this, source.get(this));
			});
		}

		return this;
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
		var k = getKey(key);

		if(_data[k] === undefined)
			_size++;

		_index[k] = key;
		_data[k] = val;
		return val;
	};

	/**
	 * This method is used to retrieve a hash entry.
	 *
	 * @param key the key to get
	 * @returns the value or undefined if it doesn't exist.
	 */

	this.get = function(key)
	{
		var k = getKey(key);
		return _data[k];
	};

	/**
	 * This method is used to delete a hash entry.
	 *
	 * @param key the key to delete
	 * @returns the value or undefined if it doesn't exist.
	 */

	this.remove = function(key)
	{
		var k = getKey(key);

		var rval = _data[k];
		_size--;
		delete _data[k];
		delete _index[k];
		return rval;
	};

	this.size = function() { return _size; };
};
