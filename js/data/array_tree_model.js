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
// Name:        array_tree_model.js
// Created:     Fri Jan 15 10:45:10 GMT 2010
// Split:       Mon Mar  8 18:03:04 GMT 2010
//
///////////////////////////////////////////////////////////////////////

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
 * This class provides a linear TreeRowModel implementation based on
 * using an array of JavaScript objects.
 *
 * @param data the array containing the data to display
 * @param options the options to initialize the model
 *      Supported values for the options object include:
 *      <ul>
 *      <li>
 *      keys      - defines an array of keys which are valid
 *                  for the objects in the array
 *      </li>
 *      <li>
 *      editable  - by default, the array is considered
 *                  mutable.  If the array objects are not
 *                  to be changed, you MAY set
 *                  options.editable = false, or simply not
 *                  define editors for the columns.
 *      </li>
 *      <li>
 *      getter    - an optional function that is used to
 *                  get the value of the specified key
 *                  from the object.
 *      </li>
 *      <li>
 *      setter    - an optional function that is used to set
 *                  the value of the specified key for the
 *                  object.
 *      </li>
 *      <li>
 *      useAdapter - indicates the the objects in the model
 *                  already provide <code>#setProperty</code>
 *                  and <code>#getProperty</code> methods.
 *                  By default, the ObjectAdapter class will
 *                  be used to wrap the objects in the model.
 *      </li>
 *      </ul>
 * @see archistry.data.ObjectAdapter
 */

archistry.data.tree.ArrayTreeModel = function(data, options)
{
    var Indexer = archistry.data.Indexer;
    var TreeChange = archistry.data.tree.TreeChange;
    var TreeNodeRef = archistry.data.tree.TreeNodeRef;
    var Util = archistry.core.Util;

	$A(this).mixin(new archistry.data.ObjectChangeSignalSource(this))
    this.mixin(new archistry.data.tree.Notifier(this));
    this.mixin(options);
	data = $Array(data);

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

    var _self = this;
    var _root = new archistry.data.ObjectAdapter(_self)
    var _nodes = new archistry.data.ObjectAdapterManager(
						this.useAdapter, this.getter, this.setter);

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
     * @param idx the index of the node
     * @param node the raw data node
     * @return the new node entry
     */

    function __addNode(idx, node)
    {
        return _nodes.setKey(idx, node);
    }

    /**
     * @private
     *
     * This method manages the node mappings in a reasonable
     * manner so we don't create new nodes for each node
     * access.
     *
     * @param index the node index
     * @return the node adapter
     */

    function __node(index)
    {
        var idx = Indexer.mapIndex(index, data.length);
        var node = _nodes.getKey(idx);
        if(node === undefined || node === null)
        {
//            Console.println("********** No node for index: " + idx);
            node = __addNode(idx, data[idx]);
        }

        return node;
    }

    /**
     * @private
     *
     * This method manages removal of the specific nodes at
     * the given idex.
     *
     * @param index the node index
     * @return the node adapter for the node (might be created
     *      because we always need to have a node reference)
     */

    function __removeNode(index)
    {
        return _nodes.removeKey(index);
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

//        Console.println("path: [{0}]; oldval: '{1}'; newval: '{2}'", path, oldval, newval);
//        Console.println("Node: {0}; objectId: {1}", archistry.core.Util.toHashString(obj), obj.objectId());
        if((oldval && !oldval.equals(newval))
                || (newval && !newval.equals(oldval)))
        {
            _self.fireObjectPropertyChanged(obj, path.key(), newval, oldval);
            _self.rowChanged(pa[0]);
        }
    }

    // define the column interface since we're going to be the
    // root of the tree model.
//    this.key = function() { return "label"; };

    // we have a default label that can be changed via the
    // properties if the root should be shown.  Normally it
    // isn't, because you wouldn't use this model otherwise!
//    this.label = function() { return "Root"; };

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
     * This method returns the model as the root node of the
     * tree.
     */

    this.root = function() { return _root; };

    /**
     * This method ensures that the contents of the array will
     * be treated as children of this node.
     */

    this.isLeaf = function(node) 
    {
        if(_root.equals(node))
            return false;

        return true;
    };

    /**
     * This method returns the count of items in the array as
     * the child count of the root node.
     */

    this.childCount = function(node)
    {
        if(_root.equals(node))
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
        if(_root.equals(parent))
            return __node(index);

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
        if(!_root.equals(parent))
            return -1;

        var rval = data.each(function(i) {
            if(__node(i).equals(node))
                return i;
        });
        
        return rval === undefined ? -1 : rval;
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
        else if(path.length === 0)
            return _root;

        return __node(path[0]);
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

        if(this.editable !== undefined)
            return this.editable;

        return true;
    };

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
            s += "data[{0}] = {1}\n".format(i, Util.toHashString(this));
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
        var idx = Indexer.mapIndex(index, data.length + 1);
//        Console.println("ArrayTreeModel#insertRow({0} [{2}], {1})", index, node, idx);
        data.splice(idx, 0, node);

        var obj = __addNode(idx, node);
        _self.fireObjectAdded(obj);
        _self.fireNodesInserted([
            new TreeChange($Array(), _self, $Array([
                    new TreeNodeRef(obj, idx) ]) )
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
        var idx = Indexer.mapIndex(index, data.length + 1);
        var args = $Array([ idx, 0 ]).concat($Array(nodes));
        data.splice.apply(data, args);

        var refs = $Array();
        var obj = null;
        nodes.each(function(i) {
            // NOTE:  the 'this' reference IS NOT used here on
            // purpose because it converts primitive values
            // into objects (boxes them), so it makes simple
            // checks fail with number vs. object for ===
            obj = __addNode(idx + i, nodes[i]);
            _self.fireObjectAdded(obj);
            refs.add( new TreeNodeRef(obj, idx + i) );
        });

        _self.fireNodesInserted([ new TreeChange($Array(), _self, refs) ]);
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
        var idx = Indexer.mapIndex(index, data.length);
        var node = data.removeAtIndex(idx);

        if(node)
        {
            var obj = __removeNode(idx);
            if(!obj)
            {
                obj = __adapter(node);
            }
            _self.fireObjectRemoved(obj);
            _self.fireNodesRemoved([ 
                new TreeChange($Array(), _self, $Array([ new TreeNodeRef(obj, idx) ]))
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

        var idx = Indexer.mapIndex((index < 0 ? index - count + 1 : index), data.length);
        var nodes = $Array(data.splice(idx, count));

        if(nodes.length > 0)
        {
            var refs = $Array();
            nodes.each(function(i) {
                var obj = __removeNode(idx + i);

                // NOTE:  the 'this' reference IS NOT used here on
                // purpose because it converts primitive values
                // into objects (boxes them), so it makes simple
                // checks fail with number vs. object for ===
                if(!obj)
                {
                    obj = __adapter(nodes[i]);
                }
                _self.fireObjectRemoved(obj);
                refs.add( new TreeNodeRef(obj, idx + i) );
            });

            _self.fireNodesRemoved([ new TreeChange($Array(), _self, refs) ]);
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
        var idx = Indexer.mapIndex(index, data.length);
        var obj = __node(idx);
        // ensure that the data structure wasn't changed
        // undeneath us...
        if(!obj.equals(data[idx]))
        {
            Console.println("warning:  data structure changed!");
            __removeNode(idx);
            obj = __node(idx);
        }
        _self.fireObjectChanged(obj);
        _self.fireNodesChanged([ 
            new TreeChange($Array(), _self, $Array([ new TreeNodeRef(obj, idx) ]))
        ]);
    };
};
