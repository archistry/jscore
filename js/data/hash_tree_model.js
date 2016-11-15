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
// Name:        hash_tree_model.js
// Created:     Tue Nov 15 21:25:42 SAST 2016
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.data.tree");

/**
 * @class
 *
 * This class provides a linear TreeRowModel implementation based on
 * using a simple archistry.core.Hash object.
 *
 * @param data the hash (or object) containing the data to display
 * @param options the options to initialize the model
 *      Supported values for the options object include:
 *      <ul>
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
 *      </ul>
 */

archistry.data.tree.HashTreeModel = function(data, options)
{
    var Indexer = archistry.data.Indexer;
    var ObjectAdapter = archistry.data.ObjectAdapter;
    var TreeChange = archistry.data.tree.TreeChange;
    var TreeNodeRef = archistry.data.tree.TreeNodeRef;
    var Util = archistry.core.Util;

	$A(this).mixin(new archistry.data.ObjectChangeSignalSource(this))
    this.mixin(new archistry.data.tree.Notifier(this));
    this.mixin(options);

	// allow initialization with regular JS objects
	if(!data instanceof archistry.core.Hash)
	{
		var th = new archistry.core.Hash();
		for(k in data)
		{
			th.set(k, data[k]);
		}
		data = th;
	}

    if(this.editable === undefined)
        this.editable = true;

	// define getters/setters
    this.setter = function(item, key, value) {
		item.set(key, value);
        return value;
    };

	this.getter = function(item, key) {
		return item.get(key);
	};

    var _self = this;
    var _root = new ObjectAdapter(_self)
	var _keys = data.keys();

	var KeyAdapter = function(k)
	{
		var _self = this;
		_self.key = k;
		$A(this).mixin(new ObjectAdapter(data,
			function(item, key) {
				if("key" === key)
					return _self.key;
				else
					return data.get(_self.key);
			},
			function(item, key, value) {
				if("key" === key)
				{
					var val = data.remove(_self.key);
					_self.key = value;
					data.set(_self.key, val);
				}
				else
				{
					data.set(_self.key, value);
				}
			}
		));
	};

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

        if((oldval && !oldval.equals(newval))
                || (newval && !newval.equals(oldval)))
        {
            _self.fireObjectPropertyChanged(obj, path.key(), newval, oldval);
            _self.rowChanged(pa[0]);
        }
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
            return data.size();

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
		{
            return new KeyAdapter(_keys[index]);
		}

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

Console.writeln("node: {0}", node.toString());

        var rval = data.keys().each(function(i) {
            if(this === node.key)
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

        return new KeyAdapter(_keys[path[0]]);
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

        return ( (startIdx + count) < data.size() ? count : data.size() - startIdx);
    };

    this.dump = function()
    {
        var s = "";
        data.each(function(key, val) {
            s += "data[{0}] = {1}\n".format(key, Util.toHashString(val));
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
        var obj = new KeyAdapter(node.key);
		data.set(node.key, node.value);
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
		var idx = data.size();
        var refs = $Array();
        var obj = null;
        nodes.each(function(i) {
			_keys.add(this.key);
			data.set(this.key, this.value);
			obj = new KeyAdapter(this.key);
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
        var idx = Indexer.mapIndex(index, _keys.length);
		var key = _keys.removeAtIndex(index);
        var node = new ObjectAdapter({key: key, value: data.remove(key) });

        if(node)
        {
            _self.fireObjectRemoved(node);
            _self.fireNodesRemoved([ 
                new TreeChange($Array(), _self, $Array([ new TreeNodeRef(node, idx) ]))
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
		var keys = $Array(_keys.splice(idx, count));
        var nodes = $Array();
		keys.each(function(i) {
			nodes.add(new ObjectAdapter({key: this, value: data.get(this)}));
		});

		// make sure our mappings are deleted as well
		_keys.removeRange(idx, idx+count);

        if(nodes.length > 0)
        {
            var refs = $Array();
            nodes.each(function(i) {
				data.remove(nodes[i].key);
                _self.fireObjectRemoved(nodes[i]);
                refs.add( new TreeNodeRef(nodes[i], idx + i) );
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
        var obj = new KeyAdapter(_keys[index]);
        _self.fireObjectChanged(obj);
        _self.fireNodesChanged([ 
            new TreeChange($Array(), _self, $Array([ new TreeNodeRef(obj, idx) ]))
        ]);
    };
};
