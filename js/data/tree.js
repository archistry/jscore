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
// Name:        tree.js
// Created:     Fri Jan 15 10:45:10 GMT 2010
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.data");

/**
 * @class
 *
 * This is a mixin object that defines indexing methods
 */

archistry.data.Indexer = {
    /**
     * This method is used to return the offset based on
     * negative indexing.
     *
     * @param idx the specified index
     * @param count the number of items
     * @return the actual offset into the items
     */

    mapIndex: function(idx, count)
    {
        var val = count - (0 - idx);
        if(count === 0)
        {
            return 0;
        }
        else if(idx >= 0 && idx < count)
        {
            return idx;
        }
        else if(val >= 0 && val < count)
        {
            return val;
        }

        var msg = String.format("Index out of bounds: index: {0}; length: {1}\n{2}", [ idx, count, printStackTrace() ]);
        throw new Error(msg);
    }
};

/**
 * @class
 *
 * This is a mixin class that provides some utility tree
 * walking functionality.
 */

archistry.data.Tree = {
    /**
     * Uses the {@link archistry.data.Indexer#mapIndex}
     * implementation.
     */

    mapIndex: archistry.data.Indexer.mapIndex,

    /**
     * This helper is used to visit the path and apply the
     * given callback to the node at each path element.
     *
     * @param root the start node
     * @param path the path to visit
     * @param childKey the key returning the array of child
     *        nodes
     * @param callback the function to execute for each node.
     *        It MUST have the following signature:
     *          
     *          callback(path, node)
     * @return the last path component node
     */

    visitPath: function(root, path, childKey, callback)
    {
        var node = root;
        var n = null;

        for(var i = 0; i < path.length; ++i)
        {
            var pi = mapIndex(path[i], node[childKey].length);
            if((n = node[childKey][pi]))
            {
                if(callback)
                    callback(path.slice(0, i + 1), n);
                node = n;
            }
            else
            {
                return;
            }
        }

        return node;
    },

    /**
     * This helper is used to visit the parent nodes and apply
     * the callback function to each parent of the start node.
     *
     * @param start the start node
     * @param getParent the name of the node function to get the parent node
     * @param callback the function to execute for each node.
     *        It MUST have the following signature:
     *          
     *          callback(parent, node, depth)
     * @return the depth of the node
     */

    visitParents: function(start, getParent, callback)
    {
        var node = start;
        var parent = null;
        var depth = 0;
        
        while(node && (parent = node[getParent]()))
        {
            depth++;
            if(callback)
                callback(parent, node, depth);

            node = parent;
        }

        return depth;
    },
    
    /**
     * This helper is used to visit the children of the node.
     *
     * @param root the start node
     * @param childKey the key returning the array of child
     *        nodes
     * @param callback the function to execute for each node.
     *        It MUST have the following signature:
     *          
     *          callback(parent, node, childIndex)
     *        
     *        If the callback returns false, the traversal will
     *        be aborted for the specified node.
     */

    visitChildren: function(root, childKey, callback)
    {
        if(!callback)
            return;
        
        var kidz = root[childKey];
        for(var i = 0; i < kidz.length; ++i)
        {
            if(callback(root, kidz[i], i))
                visitChildren(kidz[i], childKey, callback)
        }
    },

    /**
     * This method determines if the indicated node is a leaf
     * or not by the length of the childKey property.
     *
     * @param node the model node
     * @param childKey the child nodes accessor
     * @return true if node[childKey].length > 0
     */

    isLeaf: function(node, childKey)
    {
        if(!node[childKey])
            return true;

        return node[childKey].length == 0;
    },

    /**
     * This method returns the child count of the node.
     *
     * @param node the node
     * @param childKey the child nodes accessor
     * @return the length of the childKey array
     */

    childCount: function(node, childKey)
    {
        if(!node[childKey])
            return 0;

        return node[childKey].length;
    },

    /**
     * This method is used to retrieve the i-th child of the
     * specified node.
     *
     * @param node the node
     * @param childKey the child nodes accessor
     * @param idx the index
     * @return the child node at the specified index or null
     *        if no child exists
     */

    child: function(node, childKey, idx)
    {
        if(node[childKey].length === 0)
            return null;

        return node[childKey][mapIndex(idx, node[childKey].length)];
    },

    /**
     * This method does a linear search of the child nodes to
     * determine the result.
     *
     * @param parent the parent node
     * @param childKey the child nodes accessor
     * @param child the child node
     * @return the index or -1 if the node is not a child of
     *        the specified parent
     */

    indexOfChild: function(parent, childKey, child)
    {
        if(parent[childKey].length === 0)
            return -1;

        for(var i = 0; i < parent[childKey].length; ++i)
        {
            if(child === parent[childKey][i])
                return i;
        }

        return -1;
    }
};

/**
 * @name archistry.data.tree
 * @namespace
 *
 * Tree utility classes.
 */

namespace("archistry.data.tree");

/**
 * @class
 * 
 * This class represents a specific tree cell location within
 * a tree.  "Cells" are actually holders for values of named
 * object properties, so they MUST have a unique key.
 * <p>
 * To locate any cell in a tree, you need to identify the path
 * to the tree node and then the specific property to which
 * the cell refers.  This class only deals with the logical
 * addressing of a particular tree value and not with the way
 * that value (or the path) is presented visually.
 * </p>
 * <p>
 * Objects of TreeCellPath are not intended to not be a
 * long-lived objects as the actual tree location can easily
 * be changed for a variety of reasons.  Therefore, instances
 * are immutable and initiallized fully when they are created.
 * </p>
 * <p>
 * However, since there is no good way to freeze the path
 * array and copying the array can be expensive, there is
 * nothing that actually prevents the path component of the
 * object from being modified once the object has been
 * created.  DO NOT DO THIS!
 * </p>
 *
 * @param path the array indicating the zero-indexed path from
 *      the root of the tree to the specific tree node.
 * @param key (optional) the property key of the cell to which the path
 *      refers.  If the value of the key parameter is null,
 *      the path represents the entire node of the tree.
 */

archistry.data.tree.TreeCellPath = function(path, key)
{
    this.__defineGetter__("path", function() { return path; });
    this.__defineGetter__("key", function() { return key; });
};

/**
 * @class
 *
 * This class reprents the location of a given tree node at a
 * particular point in time.  It is a transient, holder object
 * that is primarily used by the tree signals.
 *
 * @param node the actual tree node reference
 * @param index the child index of the node relative to its
 *      parent node
 */

archistry.data.tree.TreeNodeRef = function(node, index)
{
    this.__defineGetter__("node", function() { return node; });
    this.__defineGetter__("index", function() { return index; });
};

/**
 * @class
 *
 * This class represents a tree change event and is modelled
 * closely after the JSE 1.4.1 TreeModelEvent class.  The
 * actual values of the properties will vary depending on the
 * particular tree event, so make sure you read the specific
 * documentation about each signal.
 * <p>
 * Like TreeCellPath, instances of this class should be
 * considered transient, and are therefore immutable.
 * </p>
 * <p>
 * Unlike the Java TreeModelEvent, instances do not hold a
 * reference to the sender of the signal.  Instead, the sender
 * is available as the this reference for each of the callback
 * signal handlers.
 * </p>
 * <p>
 * The values transmitted as properties represent the previous
 * state of the nodes, however the nodes themselves MAY NOT be
 * snapshots of the previous state.  The only previous state
 * transmitted by this event is the tree structure before the
 * event occurred.
 * </p>
 * <p>
 * To track the changes to the individual object properties,
 * use the {@link archistry.data.ChangeSet} infrastructure.
 * </p>
 *
 * @property path the path to the parent node in the tree
 * @property parent the parent of the changed nodes
 * @property refs the list of {@link
 *      archistry.data.tree.TreeNodeRef} instances representing
 *      children and their previous locations (if any)
 * @property isContiguous (optional) set to false if the child
 *      references DO NOT represent a contiguous set of
 *      indices.  The default is true.
 */

archistry.data.tree.TreeChange = function(path, parent, refs, isContiguous)
{
    this.__defineGetter__("path", function() { return path; });
    this.__defineGetter__("parent", function() { return parent; });
    this.__defineGetter__("refs", function() { return refs; });
    this.__defineGetter__("isContiguous", function() {
        if(isContiguous === undefined)
            return true;

        return isContiguous;
    });
};

/**
 * @class
 *
 * This class is used to handle notification of tree change
 * events.
 *
 * <h3>
 * Valid Signals
 * </h3>
 *
 * <p>
 * The following signals are supported by the notifier:
 * <dl>
 * <dt>tree-nodes-inserted</dt>
 * <dd>Fired when one or more nodes are inserted into the
 * tree.  The {@link TreeChange#nodes} property provides
 * information about the new node locations.</dd>
 *
 * <dt>tree-nodes-changed</dt>
 * <dd>Fired when one or more node's properties are changed in
 * the tree.  They have not changed location in the tree.</dd>
 *
 * <dt>tree-nodes-removed</dt> <dd>Fired when nodes are removed
 * from the tree.  The {@link TreeChange#parent} references
 * the previous parent of the node(s) and information about
 * the removed child nodes is present in the {@link
 * TreeChange#nodes} property.  NOTE:  When a subtree is
 * removed, the sender MUST only send a notification relating
 * to the root of the subtree.  Receivers MUST assume that all
 * child nodes have also been removed, but they MUST NOT
 * assume that the nodes have been permanently deleted.</dd>
 *
 * <dt>tree-structure-changed</dt> <dd>Fired when the tree
 * structure has dramatically changed and needs to be
 * revisited by the listener.  The path and parent properties
 * denote the root of the change.  If the path is length 0 and
 * the parent is different than the current tree parent, the
 * node referenced in the event should become the new root of
 * the tree.</dd>
 *
 * @param sender the object that should be the sender of the
 *      signals
 */

archistry.data.tree.Notifier = function(sender)
{
    this.mixin(new archistry.core.SignalSource(sender));
    this.addValidSignals([
        "tree-nodes-inserted",
        "tree-nodes-changed",
        "tree-nodes-removed",
        "tree-structure-changed"
    ]);

    /**
     * This method is used to fire the nodes inserted signal.
     * The signal handler's callback MUST provide the
     * following signature:
     * <pre>
     *   callback(eventlist)
     *   {
     *     // this === event source
     *   }
     * </pre>
     *
     * @param eventlist an array containing the tree events
     *        that should be sent to the listeners
     */

    this.fireNodesInserted = function(eventlist)
    {
        this.signalEmit("tree-nodes-inserted", eventlist);
    };

    /**
     * This method is used to fire the nodes changed signal.
     * The signal handler's callback MUST provide the
     * following signature:
     * <pre>
     *   callback(eventlist)
     *   {
     *     // this === event source
     *   }
     * </pre>
     *
     * @param eventlist an array containing the tree events to
     *        send
     */

    this.fireNodesChanged = function(eventlist)
    {
        this.signalEmit("tree-nodes-changed", eventlist);
    };

    /**
     * This method is used to fire the nodes removed signal.
     * The signal handler's callback MUST provide the
     * following signature:
     * <pre>
     *   callback(eventlist)
     *   {
     *     // this === event source
     *   }
     * </pre>
     *
     * @param eventlist an array containing the tree events to
     *        send
     */

    this.fireNodesRemoved = function(eventlist)
    {
        this.signalEmit("tree-nodes-removed", eventlist);
    };

    /**
     * This method is used to fire the tree structure changed
     * event.  There are no arguments required for the
     * callback function.
     * <pre>
     *   callback()
     *   {
     *     // this === event source
     *   }
     * </pre>
     *
     * @param eventlist an array containing the tree events to
     *        send
     */

    this.fireStructureChanged = function()
    {
        this.signalEmit("tree-structure-changed");
    };
};

/**
 * @class
 *
 * This class provides a linear TreeRowModel implementation based on
 * using an array of JavaScript objects.
 *
 * @param data the array containing the data to display
 * @param options the options to initialize the model
 *        Supported values for the options object include:
 *
 *          keys        - defines an array of keys which are valid
 *                      for the objects in the array
 *          editable    - by default, the array is considered
 *                      mutable.  If the array objects are not
 *                      to be changed, you MAY set
 *                      options.editable = false, or simply not
 *                      define editors for the columns.
 */

archistry.data.tree.ArrayRowModel = function(data, options)
{
    var TreeChange = archistry.data.tree.TreeChange;
    var TreeNodeRef = archistry.data.tree.TreeNodeRef;

    mixin(archistry.data.Indexer);
    this.mixin(new archistry.data.tree.Notifier(this));
    this.mixin(options);
    
    var _self = this;

    // define the column interface since we're going to be the
    // root of the tree model.
    this.key = "label";

    // we have a default label that can be changed via the
    // properties if the root should be shown.  Normally it
    // isn't, because you wouldn't use this model otherwise!
    this.label = "Root";

    /**
     * This method returns the model as the root node of the
     * tree.
     */

    this.__defineGetter__("root", function() { return _self; });

    /**
     * This method ensures that the contents of the array will
     * be treated as children of this node.
     */

    this.isLeaf = function(node) 
    {
        if(node === _self)
            return false;

        return true;
    };

    /**
     * This method returns the count of items in the array as
     * the child count of the root node.
     */

    this.childCount = function(node)
    {
        if(node === _self)
            return data.length;

        return 0;
    };

    /**
     * This method is actually used to retrieve the child at
     * the specified index.  Since we're dealing with a flat
     * list, the index is mapped directly onto the data array.
     *
     * @param parent the parent node
     * @param index the index of the child
     * @return the object to be displayed
     */

    this.child = function(parent, index)
    {
        if(parent === _self)
            return data[index];

        return null;
    };

    /**
     * This method is used to find the index of the specified
     * node in the array.
     *
     * @param parent should be us
     * @param node the node to find
     * @return the index of the node or -1 if not found
     */

    this.indexOfChild = function(parent, node)
    {
        if(parent !== _self)
            return -1;

        for(var i = 0; i < data.length; ++i)
        {
            if(data[i] === node)
                return i;
        }

        return -1;
    };

    /**
     * This method returns the node reference for the
     * specified path.
     *
     * @param path
     * @return a reference to the node or null if the path
     *        doesn't exist
     */

    this.nodeForPath = function(path)
    {
        if(path.length > 1)
            return null;

        return data[path[0]];
    };

    /**
     * This method indicates whether the node at the specified
     * path is editable.
     *
     * @param path the path to the specific node
     * @param key (optional) can disable editing of particular
     *            keys independent of the column editor
     *            controls.
     */

    this.canEdit = function(path, key)
    {
        if(path.length > 1)
            return false;

        if(this.editable)
            return this.editable;

        return true;
    }

    /**
     * This method is used to ensure the range given has been
     * loaded and return the number of rows actually available
     * in that range.
     *
     * @param parent the parent node (should be us)
     * @param startIdx the start index offset
     * @param count the number of rows requested
     * @return the number of rows actually available
     */

    this.ensureRange = function(parent, startIdx, count)
    {
        if(parent !== _self)
            return 0;

        return ( (startIdx + count) < data.length ? count : data.length - startIdx);
    };

    this.dump = function()
    {
        var s = "";
        data.each(function(i) {
            s += String.format("data[{0}] = {1}\n", [i, this.inspect()]);
        });
        return s;
    };

    /**
     * This method is used to add a new row into the model.
     * It is not part of the standard TreeRowModel interface,
     * but it ensures that the proper model events are fired
     * when the row object is inserted.
     *
     * @param index the index at which the row should be
     *      inserted
     * @param node the object to be inserted in the row
     */

    this.insertRow = function(index, node)
    {
        var idx = mapIndex(index, data.length + 1);
        data.splice(idx, 0, node);
        
        this.fireNodesInserted([
            new TreeChange([], _self, [ new TreeNodeRef(node, idx) ])
        ]);
    };

    /**
     * This method is used to do bulk inserts into the tree
     * model so that only one tree-nodes-changed event is
     * created.
     *
     * @param index the insertion point index
     * @param nodes the array of nodes to be inserted at the
     *      insertion point
     */

    this.insertRows = function(index, nodes)
    {
        var idx = mapIndex(index, data.length + 1);
        var args = [ idx, 0 ].concat(nodes);
        data.splice.apply(data, args);

        var refs = [];
        nodes.each(function(i) {
            println("idx ({0}) + i ({1}) = {2}", [ idx, i, idx + i ]);
            refs.add( new TreeNodeRef(this, idx + i) );
        });

        this.fireNodesInserted([ new TreeChange([], _self, refs) ]);
    };

    /**
     * This method is used to remove a row from the model and
     * fire the appropriate event.  Note that this is not part
     * of the core TreeRowModel API.
     *
     * @param index the index of the row to be removed
     * @return the row removed
     */

    this.removeRow = function(index)
    {
        var idx = mapIndex(index, data.length);
        var node = data.removeAtIndex(idx);
        if(node)
        {
            this.fireNodesRemoved([ 
                new TreeChange([], _self, [ new TreeNodeRef(node, idx) ])
            ]);
            return node;
        }

        return null;
    };

    /**
     * This method is used to bulk-remove rows from the model
     * so that only a single tree-nodes-removed event is
     * fired.
     *
     * @param index the index of the start of the rows to be
     *      removed
     * @param count the number of rows to be removed
     * @returns the rows removed from the model
     */

    this.removeRows = function(index, count)
    {
        // special case if the index is -ve, so we need to
        // actually subtract the count from the index so that
        // we get the right results!

        var idx = mapIndex((index < 0 ? index - count + 1 : index), data.length);
        var nodes = data.splice(idx, count);
        if(nodes.length > 0)
        {
            var refs = [];
            nodes.each(function(i) {
                refs.add( new TreeNodeRef(this, idx + i) );
            });

            this.fireNodesRemoved([ new TreeChange([], _self, refs) ]);
        }

        return nodes;
    };

    /**
     * This method is used to trigger the nodes changed event
     * based on the index of the specified node.
     *
     * @param index the index of the node that was changed
     */

    this.rowChanged = function(index)
    {
        var idx = mapIndex(index, data.length);
        this.fireNodesChanged([ 
            new TreeChange([], _self, [ new TreeNodeRef(data[idx], idx) ])
        ]);
    };
};

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
 */

archistry.data.tree.ObjectTreeModel = function(obj, childKey, options)
{
    mixin(archistry.data.Tree);
    this.mixin(new archistry.data.tree.Notifier(this));
    this.mixin(options);

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

        this.__defineGetter__("keys", function() { return keys; });
    }

    /**
     * The root of the tree will be taken as the object and
     * cannot be modified.
     *
     * @return the initialized object
     */

    this.__defineGetter__("root", function() { return obj; });

    if(this.editable === undefined)
    {
        this.editable = true;
    }

    /**
     * This method determines if the indicated node is a leaf
     * or not by the length of the childKey property.
     *
     * @param node the model node
     * @return true if node[childKey].length > 0
     */

    this.isLeaf = function(node) { return isLeaf(node, childKey); };

    /**
     * This method returns the child count of the node.
     *
     * @param node the node
     * @return the length of the childKey array
     */

    this.childCount = function(node) { return childCount(node, childKey); };

    /**
     * This method is used to retrieve the i-th child of the
     * specified node.
     *
     * @param node the node
     * @return the child node at the specified index or null
     *        if no child exists
     */

    this.child = function(node, idx) { return child(node, childKey, idx); };

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
        return indexOfChild(parent, childKey, child);
    };

    /**
     * This method will return the node for the specified path
     * or NULL if it doesn't exist.
     *
     * @param path the path to check
     */

    this.nodeForPath = function(path)
    {
        return visitPath(obj, path, childKey);
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
        if(key === childKey)
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

