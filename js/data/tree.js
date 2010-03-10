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
    },

    /**
     * This method is a generic sort function that takes
     * advantage of the {@link Object#compare} method if
     * available.
     *
     * @param lhs the "left hand side" object
     * @param rhs the "right hand side" object
     * @return -1, 0 or 1
     */

    compareAsc: function(lhs, rhs)
    {
        if(lhs.compare && !rhs.compare)
        {
            return lhs.compare(rhs);
        }
        else if(rhs.compare && !lhs.compare)
        {
            return 1 - rhs.compare(lhs);
        }

        // unfortunately, this is lifted from the
        // Object#compare implementation because if we get
        // here, we're dealing with primitives

        var lval = lhs;
        var rval = rhs;
        if(lhs.valueOf) { lval = lhs.valueOf(); }
        if(rhs.valueOf) { rval = rhs.valueOf(); }

        if(lval < rval)
            return -1;
        else if(lval > rval)
            return 1;

        return 0;
    },

    /**
     * This method is used to provide a descending comparison
     * sort function leveraging {@link Object#compare}.
     *
     * @param lhs the "left hand side"
     * @param rhs the "right hand side"
     * @return -1, 0 or 1
     */

    compareDesc: function(lhs, rhs)
    {
        return 1 - this.compareAsc(lhs, rhs);
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
     * given callback to the node at each path element.  Tree
     * implementations that wish to use this mixin MUST
     * conform to the TreeNode interface defined by the {@link
     * archistry.data.tree.TreeNode} class.
     *
     * @param root the start node
     * @param path the path to visit
     * @param callback the function to execute for each node.
     *        It MUST have the following signature:
     *          
     *          callback(path, node)
     * @return the last path component node
     */

    visitPath: function(root, path, callback)
    {
        var node = root;
        var n = null;

        for(var i = 0; i < path.length; ++i)
        {
            var pi = this.mapIndex(path[i], node.childCount());
            if((n = node.child(pi)))
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
     * @param callback the function to execute for each node.
     *        It MUST have the following signature:
     *          
     *          callback(parent, node, depth)
     * @return the depth of the node
     */

    visitParents: function(start, callback)
    {
        var node = start;
        var parent = null;
        var depth = 0;
        
        while(node && (parent = node.parent()))
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
     * @param callback the function to execute for each node.
     *        It MUST have the following signature:
     *          
     *          callback(parent, node, childIndex)
     *        
     *        If the callback returns false, the traversal will
     *        be aborted for the specified node.
     */

    visitChildren: function(root, callback)
    {
        if(!callback)
            return;
        
//        Console.println("child count for [{0}] is {1}", root.path(), root.childCount());
        for(var i = 0; i < root.childCount(); ++i)
        {
            var child = root.child(i);
            if(callback(root, child, i))
                this.visitChildren(child, callback)
        }
    },

    /**
     * This method does a linear search of the child nodes to
     * determine the result.
     *
     * @param parent the parent node
     * @param child the child node
     * @return the index or -1 if the node is not a child of
     *        the specified parent
     */

    indexOfChild: function(parent, child)
    {
        if(parent.isLeaf() || !child)
            return -1;

        var length = parent.childCount();
        for(var i = 0; i < length; ++i)
        {
            if(child.equals(parent.child(i)))
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
    this.path = function() { return path; };
    this.key = function() { return key; };
    this.toString = function()
    {
        return "[TreeCellPath {0}".format(archistry.core.Util.toHashString(this));
    };
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
    this.node = function() { return node; };
    this.index = function() { return index; };
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
    this.path = function() { return path; };
    this.parent = function() { return parent; };
    this.refs = function() { return refs; };
    this.isContiguous = function() {
        if(isContiguous === undefined)
            return true;

        return isContiguous;
    };
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
 * This class provides the core TreeNode API as a mix-in that
 * may or may not be suitable for use in a specific
 * application context.
 *
 * @property children a read-only view of the child node
 *      array.  Modifications of the nodes will be possible,
 *      but modifications to the structure of the children or
 *      the parent will not.
 */

archistry.data.tree.TreeNode = function()
{
    var Tree = archistry.data.Tree;
    var _parent = null;
    var _children = [];

    /**
     * This method is used to retrieve the actual child
     * index based on the current child nodes.
     */

    function childIndex(idx, isNew)
    {
        return Tree.mapIndex(idx, 
                (isNew ? _children.length + 1 : _children.length));
    }

    /**
     * This method is used to retrieve the i-th child of the
     * node with support for negative child node indices.
     *
     * @param index the child index
     * @returns the child node or null if no child exists at
     *      the specified index
     */

    this.child = function(index)
    {
        return _children[Tree.mapIndex(index, _children.length)];
    };

    /**
     * This method returns true if the node has no
     * children.
     */

    this.isLeaf = function()
    {
        return _children.length === 0;
    };

    /**
     * This method is used to insert a new child node at the
     * specified index.
     *
     * @param idx the index for the new child
     * @param child the new child node
     * @return the added child node
     */

    this.insertChild = function(idx, child)
    {
        var ix = childIndex(idx, true);
        // ensure there aren't any gaps!
        if(ix > _children.length)
            ix = _children.length;

        _children.splice(ix, 0, child);
        child.parent(this);
        return child;
    };

    /**
     * This method is used to remove the i-th child from
     * the parent node.
     *
     * @param idx the index of the child to be removed
     * @return the child node
     */

    this.removeChildAtIndex = function(idx)
    {
        return _children.removeAtIndex(childIndex(idx));
    };

    /**
     * This method is used to retrieve the number of
     * children for the node.
     */

    this.childCount = function() { return _children.length; };

    /**
     * This method returns the index of the specified
     * child.
     */

    this.indexOfChild = function(node)
    {
        return Tree.indexOfChild(this, node);
    };

    /**
     * This method is used to retrieve the current path of
     * this node.
     */

    this.path = function()
    {
        var pc = [];
        Tree.visitParents(this, function(parent, node, depth) {
            if(parent)
            {
                pc.add(parent.indexOfChild(node));
            }
        });

        return pc.reverse();
    };

    /**
     * This method will reset the child references for the
     * node.
     */

    this.clearChildren = function() { _children.clear(); };

    /**
     * This method is used to set/retrieve the parent of the
     * given node.
     */

    this.parent = function(val)
    {
        if(val === undefined)
            return _parent;

        _parent = val;
    };

    /**
     * This method returns the depth of the tree node
     */

    this.depth = function()
    {
        return Tree.visitParents(this);
    };

    /**
     * This method is used to get the first child (if any)
     * for the given node.
     *
     * @returns the node or null if no children
     */

    this.firstChild = function()
    {
        if(_children.count === 0)
            return null;

        return _children[0];
    };

    /**
     * This method is used to get the last child (if any)
     * for the given node.
     *
     * @returns the node or null if no children
     */

    this.lastChild = function()
    {
        if(_children.count === 0)
            return null;

        return _children[childIndex(-1)];
    };

    /**
     * This method is used to get the next sibling node of
     * this node (if any)
     *
     * @return the node or null if the node is the last
     *      child
     */

    this.nextSibling = function()
    {
        var idx = null;
        if(!_parent)
            return null;
       
        idx = _parent.indexOfChild(this);
        if(idx === _parent.childCount() - 1)
            return null;
            
        return _parent.child(idx + 1);
    };

    /**
     * This method is used to get the previous sibling
     * node of this node (if any)
     *
     * @return the node or null if the node is the first
     *      child
     */

    this.previousSibling = function()
    {
        var idx = null;
        if(!_parent)
            return null;

        idx = _parent.indexOfChild(this);
        if(idx === 0)
            return null;

        return _parent.child(idx - 1);
    };
   
    /**
     * This method returns the details of the tree node as a
     * string.
     */

    this.toString = function()
    {
        return String.format("[TreeNode parent: {0}, path: [{1}] ]", [ _parent, this.path().join(',') ]);
    };
};

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

archistry.data.tree.ObjectAdapter = function(obj, getter, setter)
{
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

archistry.data.tree.ObjectAdapterManager = function(enabled, getter, setter)
{
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
            return new archistry.data.tree.ObjectAdapter(node, _getter, setter);

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

    this.getKey = _nodes.get;

    /**
     * This method is used to remove the given key entry from
     * the map.
     *
     * @param key the key to remove
     * @return the key value (if any) or null if none exists
     */

    this.removeKey = _nodes.remove;
};
