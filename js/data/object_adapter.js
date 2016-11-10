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
// Name:        object_adapter.js
// Created:     Mon Mar 15 10:51:58 GMT 2010
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.data");

/**
 * @class
 *
 * This class provides an adapter to allow a consistent
 * interface for consumers of model data that is independent
 * of straight property accessors since these are not
 * consistently supported across all browser/runtime
 * environments.
 * <p>
 * This class can also be used to provide a read-only view of
 * a particular by initializing the instance without a setter
 * function.
 * </p>
 *
 * @param obj the object to be adapted
 * @param getter a function used to get the value from the
 *      object for the specified key.  It MUST have the form:
 * <pre>
 *   function get(item, key) {
 *      // return the value for the key or null if not present
 *   }
 * </pre>
 * @param setter a function used to set the value for the
 *      specified key.  It MUST have the form:
 * <pre>
 *   function set(item, key, value) {
 *      // set the value of the item
 *      return value;
 *   }
 * </pre>
 */

archistry.data.ObjectAdapter = function(obj, getter, setter)
{
    $A(this);
    Console.println("ObjectAdapter created for object {0} with object ID: {1}", archistry.core.Util.toHashString(obj), this.objectId());

    /**
     * This method is used to get the specified property from
     * the object.
     *
     * @param key the property key
     * @return the property value of undefined if it is not
     *      set for the object.
     */

    this.getProperty = function(key)
    {
        return getter(obj, key);
    };

    /**
     * This method is used to set the specified property in
     * the target object.
     *
     * @param key the property key
     * @param val the new property value
     */

    this.setProperty = function(key, value)
    {
        if(setter)
            setter(obj, key, value);
    };

    /**
     * This method is used to return a reference to the
     * original object for the purposes of comparison.
     *
     * @return the original object
     */

    this.valueOf = function() { return obj; };

    this.toString = function()
    {
        return "[ObjectAdapter obj: {0} ]", obj.toString();
    };

    this.toHashString = function()
    {
        return archistry.core.Util.toHashString(obj);
    };
};

/**
 * @class
 * 
 * This class is responsible for managing ObjectAdapter
 * instances for data nodes for both the ArrayTreeModel and
 * the ObjectTreeModel implementations.  Since it is a
 * self-contained class, it can also easily be integrated into
 * user code.
 *
 * @param enabled true or false depending on whether
 *      ObjectAdapter instances should be used.
 * @param getter the getter that is applied to the object to
 *      retrieve the property value
 * @param setter the setter that is used to manipulate the
 *      object properties
 */

archistry.data.ObjectAdapterManager = function(enabled, getter, setter)
{
    $A(this);

    var _nodes = new archistry.core.Hash();
    var _getter = null;
    var _setter = null;

    // ensure we have a default accessor to eliminate
    // redundant checks, but we only require the getter.  If
    // the setter is undefined, we just don't support
    // modification of the object.

    if(getter === undefined)
    {
        _getter = function(item, key) { 
            return item[key];
        };
    }
    else
    {
        _getter = getter;
    }

    /**
     * This method is used to wrap the given node in an
     * ObjectAdapter based on the initialization settings.
     *
     * @param node the node to be wrapped
     * @return the wrapped node
     */

    this.adapterForNode = function(node)
    {
        if(!node)
            return null;

        if(enabled)
            return new archistry.data.ObjectAdapter(node, _getter, setter);
		else if(!node.objectId)
			$A(node);

        return node;
    };

    /**
     * This method is used to add the "raw" node to the map.
     * It MUST only be used on nodes which have not already
     * been wrapped.
     *
     * @param key the mapping key for the node
     * @param node the raw data node
     * @return the wrapped node
     */

    this.setKey = function(key, node)
    {
        return _nodes.set(key, this.adapterForNode(node));
    };

    /**
     * This method is used to retrieve the node for the
     * specified key.
     *
     * @param key the mapping key for the node
     * @return the node or null if no value is present
     */

    this.getKey = function(key)
    {
        return _nodes.get(key);
    };

    /**
     * This method is used to remove the given key entry from
     * the map.
     *
     * @param key the key to remove
     * @return the key value (if any) or null if none exists
     */

    this.removeKey = function(key)
    {
        return _nodes.remove(key);
    };

    /**
     * This is used to get the number of object mappings
     * currently stored.
     */

    this.size = function()
    {
        return _nodes.size();
    };
};
