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
// Name:        object_tree_model.js
// Created:     Fri Jan 15 10:45:10 GMT 2010
// Split:       Mon Mar  8 18:04:00 GMT 2010
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.data.tree");

/**
 * @class
 *
 * This class provides a simple adapter for using static
 * objects as a conformant TreeRowModel.  The child nodes are
 * identitfied by the property name supplied as the
 * contstructor which should return an array of child nodes.
 *
 * @param obj the object representing the tree structure
 * @param childKey the child node accessor
 * @param options the options mixed in to the model
 * @see archistry.data.tree.ArrayTreeModel
 */

archistry.data.tree.ObjectTreeModel = function(obj, childKey, options)
{
    var mapIndex = archistry.data.Indexer.mapIndex;
    
    this.mixin(new archistry.data.tree.Notifier(this));
    this.mixin(options);
    
    if(this.editable === undefined)
        this.editable = true;
   
    if(this.useAdapter === undefined)
    {
        this.useAdapter = true;
    }

    // ensure we have a default setter to eliminate redundant
    // checks
    if(this.setter === undefined && this.editable)
    {
        this.setter = function(item, key, value) {
            item[key] = value; 
            return value;
        };
    }

    var _nodes = new archistry.data.tree.ObjectAdapterManager(this.useAdapter, this.getter, this.setter);

    // support user-defined key definitions
    if(!this.keys)
    {
        var keys = [];
        for(k in obj)
        {
            if(k !== childKey && typeof obj[k] !== 'function')
            {
                keys.add(k);
            }
        }

        this.keys = function() { return keys; };
    }

    // FIXME:  I'd like to not have this duplicated here...

    /**
     * @private
     *
     * This method creates an adapter for the specified node
     * (or not, depending on the configuration settings)
     *
     * @param node the node to wrap
     * @return the wrapped node or the node if it supports the
     *      accessors API.
     */

    function __adapter(node)
    {
        _nodes.adapterForNode(node);
    }

    /**
     * @private
     *
     * This method adds a new node entry into the mapping
     *
     * @param node the raw data node
     * @return the new node entry
     */

    function __addNode(node)
    {
        return _nodes.setKey(node.object_id(), node);
    }

    /**
     * @private
     *
     * Ensures that each node is only mapped once.
     *
     * @param rnode the raw node
     * @return the node adapter
     */

    function __node(rnode)
    {
        var node = _nodes.getKey(rnode.object_id());
        if(node === undefined)
        {
            node = __addNode(rnode);
        }

        return node;
    }

    /**
     * @private
     *
     * This method manages removal of the specific nodes
     *
     * @param node the node
     * @return the node adapter for the node
     */

    function __removeNode(node)
    {
        return _nodes.removeKey(node.object_id());
    }

    /**
     * The root of the tree will be taken as the object and
     * cannot be modified.
     *
     * @return the initialized object
     */

    this.root = function()
    {
        return __node(obj);
    };

    /**
     * This method determines if the indicated node is a leaf
     * or not by the length of the childKey property.
     *
     * @param node the model node
     * @return true if node[childKey].length > 0
     */

    this.isLeaf = function(node)
    {
        var kidz = node.getProperty(childKey);
        if(kidz === undefined)
            return true;

        return kidz.length === 0;
    };

    /**
     * This method returns the child count of the node.
     *
     * @param node the node
     * @return the length of the childKey array
     */

    this.childCount = function(node) 
    {
        if(node.getProperty(childKey) === undefined)
            return 0;

        return node.getProperty(childKey).length;
    };

    /**
     * This method is used to retrieve the i-th child of the
     * specified node.
     *
     * @param node the node
     * @return the child node at the specified index or null
     *        if no child exists
     */

    this.child = function(node, idx)
    {
        if(this.isLeaf(node))
            return null;

        var i = mapIndex(idx, node.getProperty(childKey).length);
        return __node(node.getProperty(childKey)[i]);
    };

    /**
     * This method does a linear search of the child nodes to
     * determine the result.
     *
     * @param parent the parent node
     * @param child the child node
     * @return the index or -1 if the node is not a child of
     *        the specified parent
     */

    this.indexOfChild = function(parent, child)
    {
        var idx = parent.getProperty(childKey).each(function(i) {
            if(this.equals(child))
                return i;
        });

        if(idx === undefined)
            return -1;

        return idx;
    };

    /**
     * This method will return the node for the specified path
     * or NULL if it doesn't exist.
     *
     * @param path the path to check
     */

    this.nodeForPath = function(path)
    {
        // FIXME:  there's just no good way to do this using
        // the generic functionality....  This is cut & paste
        // reuse which sucks!
        var node = root;
        var n = null;

        for(var i = 0; i < path.length; ++i)
        {
            var pi = mapIndex(path[i], node[childKey].length);
            if((n = node[childKey][pi]))
            {
                node = n;
            }
            else
            {
                return;
            }
        }

        return __node(node);
    };

    /**
     * This method will indicate that all the objects are
     * editable unless the value is the childKey
     *
     * @param path the path to check
     * @param key (optional) the key to check
     */

    this.canEdit = function(path, key)
    {
        if(key === childKey || !this.editable)
            return false;

        var node = this.nodeForPath(path);
        if(!node)
            return false;

        return true;
    };

    /**
     * this method will simply report the number of children
     * available for the specified node
     *
     * @param parent the parent node
     * @param start the start index
     * @param count the number of nodes
     * @return the actual number of nodes available
     */

    this.ensureRange = function(parent, start, count)
    {
        return this.childCount(parent);
    };
};
