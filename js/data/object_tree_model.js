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
 * objects as a conformant TreeModel.  The child nodes are
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
    var ObjectAdapter   = archistry.data.tree.ObjectAdapter;
    var TreeChange      = archistry.data.tree.TreeChange;
    var TreeNodeRef     = archistry.data.tree.TreeNodeRef;
    var createError     = archistry.core.Util.createError;
    var mapIndex        = archistry.data.Indexer.mapIndex;
    var toHashString    = archistry.core.Util.toHashString;

	this.mixin(new archistry.data.ObjectChangeSignalSource(this))
    this.mixin(new archistry.data.tree.Notifier(this));
    this.mixin(options);
   
    var _self = this;

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
        return _nodes.adapterForNode(node);
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
        if(node instanceof ObjectAdapter)
        {
            throw createError("Attempt to double-wrap node!");
        }
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
        if(rnode instanceof ObjectAdapter)
        {
            return rnode;
        }

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
     * @private
     *
     * This method is used to retrieve the actual child array
     * for the given parent node by path.
     *
     * @param path the path to load
     * @return an object containing two properties:
     * <code>parent</code> with a reference to the parent and
     * <code>children</code> with a reference to the children
     * array (created if necessary).
     */

    function childArray(path)
    {
        var parent = _self.nodeForPath(path);
        if(!parent)
        {
            throw createError("Unable to find parent node for path: [{0}]", [ path ]);
        }

        var children = parent.getProperty(childKey);
        if(!children)
        {
            children = [];
            parent.setProperty(childKey, children);
        }

        return { parent: parent, children: children };
    }

    /**
     * @private 
     *
     * This method returns the parent path for the
     * given path
     */

    function parentPath(path)
    {
        if(path.length > 1)
            return path.slice(0, -1);

        return [];
    }
    
    /**
     * @private
     *
     * Called whenever cell editing is completed in the grid.
     *
     * @param parent the parent TreeRow instance
     * @param row the TreeRow instance being edited
     * @param path the TreeCellPath of the cell
     * @param oldval the original cell value
     * @param newval the new cell value
     */

    function onCellEditingCompleted(parent, row, path, oldval, newval)
    {
        var pa = path.path();
        var obj = _self.nodeForPath(pa);
        if(!obj)
            return;

        _self.fireObjectPropertyChanged(obj, path.key(), newval, oldval);
        _self.nodeChanged(pa);
    }

    /**
     * This method is called when the model is attached to a
     * TreeGrid control so that the appropriate listeners can
     * be registered.
     *
     * @param grid the grid reference
     */

    this.attach = function(grid)
    {
        grid.signalConnect("cell-editing-completed", onCellEditingCompleted);
    };

    /**
     * This method is called when the model is detached from
     * a TreeGrid control.
     *
     * @param grid the grid reference
     */

    this.detach = function(grid)
    {
        grid.signalDisconnect("cell-editing-completed", onCellEditingCompleted);
    };

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
        var kidz = __node(node).getProperty(childKey);
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
        var obj = __node(node);
        if(obj.getProperty(childKey) === undefined)
            return 0;

        return obj.getProperty(childKey).length;
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
        var obj = __node(node);
        if(_self.isLeaf(node))
            return null;

        var kidz = obj.getProperty(childKey);
        var i = mapIndex(idx, kidz.length);
        return __node(kidz[i]);
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
        var idx = __node(parent).getProperty(childKey).each(function(i) {
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
        var node = _self.root();
        var n = null;

        for(var i = 0; i < path.length; ++i)
        {
            var kidz = node.getProperty(childKey);
            if(kidz === null)
                return null;

            var pi = mapIndex(path[i], kidz.length);
            if((n = kidz[pi]))
            {
                node = __node(n);
            }
            else
            {
                return null;
            }
        }

        return node;
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
        if(key === childKey || !_self.editable)
            return false;

        var node = _self.nodeForPath(path);
        if(!node)
            return false;

        return true;
    };

    /**
     * This method will simply report the number of children
     * available for the specified node
     *
     * @param parent the parent node
     * @param start the start index
     * @param count the number of nodes
     * @return the actual number of nodes available
     */

    this.ensureRange = function(parent, start, count)
    {
        return _self.childCount(parent);
    };

    /**
     * This method is not part of the standard TreeModel
     * interface, but it allows for easy manipulation of an
     * ObjectTreeModel instance.
     *
     * @param parentPath the path of the parent node where the
     *      child should be added
     * @param index the insert index
     * @param child the child node to be inserted
     * @returns the added child node
     */

    this.insertNode = function(parentPath, index, child)
    {
        var ref = childArray(parentPath);
        var idx = mapIndex(index, ref.children.length + 1);
        Console.println("ObjectTreeMode#insertNode insertion requested for node at index {0}({1}) for path [{2}] which has {3} children", idx, index, parentPath, ref.children.length);
        ref.children.splice(idx, 0, child);

        this.fireNodesInserted([
            new TreeChange(parentPath, ref.parent, [
                    new TreeNodeRef(__node(child), idx) ])
        ]);
    };

    /**
     * This method is used to perform bulk inserts beneath the
     * particular parent so that only a single event is
     * triggered.  It is not part of the standard Treemodel
     * interface.  The nodes will be inserted from the
     * specified insertion point in the order in which they
     * are passed to the method.
     *
     * @param parentPath the path of the parent where the
     *      insertions should take place.
     * @param index the insert point
     * @param nodes the array of nodes to be inserted at the
     *      specified child index
     */

    this.insertNodes = function(parentPath, index, nodes)
    {
        var ref = childArray(parentPath);
        var idx = mapIndex(index, ref.children.length + 1);
        Console.println("ObjectTreeMode#insertNodes insertion requested for {0} nodes at index {1}({2}) for path [{3}] which has {4} children", nodes.length, idx, index, parentPath, ref.children.length);
        var args = [ idx, 0 ].concat(nodes);
        ref.children.splice.apply(ref.children, args);

        var refs = [];
        nodes.each(function(i) {
            refs.add(new TreeNodeRef(__node(ref.children[idx + i]), idx + i));
        });

        this.fireNodesInserted([ new TreeChange(parentPath, ref.parent, refs) ]);
    };

    /**
     * This method is used to remove a child node from the
     * model at the given path.  This method is not part of
     * the standard TreeModel interface.
     *
     * @param path the path to the node to be removed
     * @returns the node that was removed
     */

    this.removeNode = function(path)
    {
        var ppath = parentPath(path);
        var ref = childArray(ppath);
        var idx = path[path.length - 1];
        var child = ref.children.removeAtIndex(idx);
        
        var node = __removeNode(child);
        if(!node)
        {
            node = __adapter(child);
            if(!node)
            {
                throw createError("RuntimeError:  unable to create adapter for child at path [{0}] ({1})", path.join(", "), toHashString(child));
            }
        }
        this.fireNodesRemoved([
            new TreeChange(ppath, ref.parent, [ 
                    new TreeNodeRef(node, idx) ])
        ]);
        return node;
    };

    /**
     * This method is used to indicate that the specified path
     * has been changed.
     *
     * @param path the path to the node that was changed
     */

    this.nodeChanged = function(path)
    {
        var ppath = parentPath(path);
        var ref = childArray(ppath);
        var idx = path[path.length - 1];
        var child = ref.children[idx];
        if(child === null)
        {
            throw createError("Path error:  no node found for path [{0}]", [path]);
        }

        this.fireNodesChanged([
            new TreeChange(ppath, ref.parent, [ 
                    new TreeNodeRef(__node(child), idx) ])
        ]);
    };
};
