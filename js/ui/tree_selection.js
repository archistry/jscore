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
// Name:        tree_selection.js
// Created:     Sun Feb 28 10:58:03 GMT 2010
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.ui.selection");

/**
 * @class
 *
 * This class represents a tree selection range.  Unlike the
 * {@link archistry.ui.selection.SelectionRange} class,
 * objects of this class are mutable and manage the nodes that
 * actually make up the tree selection ranges as well as take
 * care of splitting an existing range at the location of a
 * specific node.
 * <p>
 * It is up to the user of this class to manage the order of
 * the nodes in the selection.  Instances of this class make
 * no attempt to ensure that the nodes are in any particular
 * ordering to actually represent the logically contiguous
 * range.  All management in this respect must be handled
 * elsewhere.
 * </p>
 * <p>
 * Also, right now we DO NOT support cell selection events.
 * Therefore, the API should be considered somewhat draft and
 * likely to change.
 * </p>
 *
 * @property owner the owner of the selection
 * @property start the start path of the selection range
 * @property end the end path of the selection range
 * @property length the number of nodes in the selection range
 */

archistry.ui.selection.TreeSelectionRange = function(owner)
{
    $A(this);

    var Indexer = archistry.data.Indexer;
    var TreeSelectionRange = archistry.ui.selection.TreeSelectionRange;

    var _nodes = $Array();

    function index(val, forInsert)
    {
        return Indexer.mapIndex(val, (forInsert ? _nodes.length + 1 : _nodes.length));
    }

    /**
     * This method inserts the node into the selection range
     * at the specified index.
     */

    this.insert = function(idx, node)
    {
        _nodes.splice(index(idx, true), 0, node);
    };

    /**
     * This method will split the range at the specified node,
     * removing it from the current range.
     *
     * @param node the split point for the range
     * @returns the new range or null if the node was at the
     *      end of the current instance
     */
   
    this.split = function(node)
    {
        var last = index(-1);
        var idx = last;
        if(_nodes.length && node.equals(_nodes[idx]))
        {
            _nodes.splice(idx, 1);
            return null;
        }

//println("node: " + node);
//println("nodes: [{0}]", _nodes.join(", ")); 
        idx = _nodes.indexOf(node);
        if(idx === -1)
        {
//            println("Node not found in range");
            return null;
        }

        if(node.equals(_nodes[0]))
        {
            _nodes.shift();
            return null;
        }
        else if(node.equals(_nodes[last]))
        {
            _nodes.pop();
            return null;
        }

        // we're in the middle of the list somewhere
//        println("last: {0}; idx: {1}", [ last, idx ]);
        var ns = $Array(_nodes.splice(idx, _nodes.length - idx));
        ns.shift(); // get rid of the first node

        var range = new TreeSelectionRange(owner);
        ns.each(function(i) { range.insert(i, this); });
        return range;
    };

    /**
     * This method is used to iterate over the nodes in the
     * range as per {@link Array#each}.
     */

    this.each = function(callback)
    {
        return _nodes.each(callback);
    };

    /**
     * This method is used to reverse iterate over the nodes
     * in the range as per {@link Array#reverseEach}.
     */

    this.reverseEach = function(callback)
    {
        return _nodes.reverseEach(callback);
    };
 
    /**
     * This method returns the value of the range for both
     * equality and comparison purposes.  The value is
     * returned as an array of <code>[ start, end, length ]</code>.
     */

    this.valueOf = function()
    {
        return [ this.start(), this.end(), _nodes.length ];
    };

    this.equals = function(rhs)
    {
        return this.objectId() === rhs.objectId();
    };

    this.toString = function()
    {
        return String.format("[TreeSelectionRange start: {0}, end: {1}, nodes: [{2}] ]", [ this.start(), this.end(), _nodes.join(", ") ]);
    };

    this.owner = function() { return owner; };
    
    this.start = function()
	{
        if(_nodes.length)
            return _nodes[0].path();
        
        return null;
    };

    this.end = function()
	{
        if(_nodes.length)
            return _nodes[_nodes.length - 1].path();
        
        return null;
    };
    
    this.length = function() { return _nodes.length; };
};

/**
 * @class
 *
 * This class provides an implementation of the Range and
 * Multi-Range selection models specifically to support trees.
 * It is used by the grid to manage the selection of tree
 * nodes.
 *
 * @property length This property provides the "length" of the
 *      selection, but the meaning of the value depends on the
 *      current tree selection mode.
 * @property mode This property indicates the selection mode
 *      for the tree.
 *
 * @param owner the "owner" object of the selection contents
 *      (tree nodes)
 * @param selectfn (optional)a callback function that is used to
 *      select/deselct the specific nodes.  It MUST have the
 *      following form:
 *      <pre>
 *        callback(item, selected) {
 *          // if selected, then select the item and re-render
 *        }
 *      </pre>
 * @param options a mixin object to set behavior options to
 *        control how the selection is interpreted.  The
 *        supported options are:
 *        <ul>
 *        <li>mode - determines the mode of the tree selection
 *            and must be one of the values defined in {@link
 *            archistry.selection.Mode}.
 *        </li>
 *        </ul>
 */

archistry.ui.selection.TreeSelection = function(owner, selectfn, options)
{
    $A(this).mixin(new archistry.ui.selection.Notifier(this));
    this.mixin(options);
   
    if(!selectfn)
    {
        selectfn = function(node, val) { node.selected(val); };
    }

    var Util = archistry.core.Util;
    var Hash = archistry.core.Hash;
    var TreeSelectionRange = archistry.ui.selection.TreeSelectionRange;
    var visitChildren = archistry.data.Tree.visitChildren;
    var _self = this;

    /**
     * This variable is used to hold the mapping between tree
     * nodes and their member selection (if any) so that we
     * can optimize the range operations.
     */

    var _nodeIndex = new Hash();

    /** 
     * This variable tracks whether the entire tree is
     * selected so that the appropriate event is fired during
     * the clear operation.
     */

    var _selectAll = false;

    /** the list of active selection ranges */
    var _rangelist = $Array();

    /**
     * @private
     *
     * This method is used to retrieve the previous row node
     * (which may or may not be visible)
     */

    function prevNode(node)
    {
        var prev = null;
        if(prev = node.previousSibling())
        {
            if(prev.childCount() === 0)
            {
                // no children, so this really is the previous
                // node
                return prev;
            }
            else
            {
                return prev.lastChild();
            }
        }

        return node.parent();
    }

    /**
     * @private
     *
     * This method is used to retrieve the next row node
     * (which may or may not be visible)
     */

    function nextNode(node)
    {
        var nxt = null;
        if(node.childCount() !== 0)
        {
            return node.firstChild();
        }

        if(nxt = node.nextSibling())
        {
            return nxt;
        }
        
        nxt = node.parent();
        if(nxt = node.parent())
        {
            return nxt.nextSibling();
        }

        return null;
    }

    /**
     * @private
     *
     * This method is used to compare two treepaths in row
     * order.
     *
     * @param lhs the "left hand side"
     * @param rhs the "right hand side"
     * @return -1, 0, or 1
     */

    function rowOrder(lhs, rhs)
    {
//        println("checking row order for [{0}] vs. [{1}]", [ lhs, rhs ]);
        if(rhs.length > lhs.length)
        {
            for(var i = 0; i < lhs.length; ++i)
            {
                if(lhs[i] < rhs[i])
                    return -1;
                else if(lhs[i] > rhs[i])
                    return 1;
            }
            return -1; // lhs is shorter, but equal pc's
        }
        var rc = lhs.each(function(i) {
//            println("i: " + i);
            if(rhs[i] !== undefined)
            {
                if(this < rhs[i])
                    return -1;
                if(this > rhs[i])
                    return 1;
            }
            else
            {
                return -1;
            }
        });

//        println("returning: " + (rc === undefined ? 0 : rc));
        if(rc === undefined)
            return 0;

        return rc;
    }
    
    /**
     * @private
     *
     * This method is used to find the range for the given
     * node (if any).
     *
     * @param node the node in question
     * @returns range the range instance for the node or null
     *      if no existing ranges apply
     */

    function rangeForNode(node)
    {
        var range = null;

        // check if we already have a reference to the node
        range = _nodeIndex.get(node);
        if(range)
            return range;

        var prev = prevNode(node);
        var nxt = nextNode(node);

//        println("prev: " + prev.path().join(", "));
//        println("node: " + node.path().join(", "));
//        println("next: " + nxt.path().join(", "));
        var tmp = null;
        if(prev && prev.selected())
        {
            tmp = prev;
        }
        else if(nxt && nxt.selected())
        {
            tmp = nxt;
        }

        if(tmp)
        {
            range = _nodeIndex.get(tmp);
            if(!range)
            {
                throw Util.createError("StateError:  neighbor of node [{0}] is marked selected, but is not part of a selection range!", [node.path()]);
            }
            return range;
        }
        
        // no nearby nodes selected
        return null;
    }


    /**
     * @private
     *
     * This method is used to join two ranges with the given
     * node.
     *
     * @param r1 the first range
     * @param node the joining node
     * @param r2 the second range
     * @returns the joined range
     */

    function join(r1, node, r2)
    {
        var delta = $Array(node.path());

        r1.insert(-1, node);
        _nodeIndex.set(node, r1);
        r2.each(function(i) {
            delta.add(this.path());
            r1.insert(-1, this);
            _nodeIndex.set(this, r1);
        });
        var obj = _rangelist.remove(r2);
//        println("#join: deleted {0} from rangelist", obj);
        delete r2;
        
        _self.fireSelectionExtended(delta);

        return r1;
    }

    /**
     * This method is used by TreeNodes to add themselves to
     * the selection.  Once added, the selection instance
     * works out the appropriate signal that should be fired.
     *
     * @param node the node to be added
     */

    this.add = function(node) 
    {
        if(_nodeIndex.get(node))
            return; // node already in the range

        // ensure the node is selected
        selectfn(node, true);

        var range = rangeForNode(node);
        if(range)
        {
//            println("range: {0}", range);
            var prev = prevNode(node);
            var nxt = nextNode(node);
//            println("prev node: [{0}], selected: {1}", [ 
//                        prev.path().join(", "), prev.selected() ]);
//            println("next node: [{0}], selected: {1}", [ 
//                        nxt.path().join(", "), nxt.selected() ]);
            if(prev && prev.selected() && nxt && nxt.selected())
            {
//                println("join ranges!");
                // FIXME:  need to join ranges!
                range = join(rangeForNode(prev), node, rangeForNode(nxt));
            }
            else
            {
                var path = node.path();
//                println("insert node into range. check1: {0}, check2: {1}", 
//                        [ rowOrder(range.start(), path), 
//                          rowOrder(range.end(), path) ]);
                // put the node in the correct spot
                if(rowOrder(range.start(), path) > 0)
                {
                    range.insert(0, node);
                }
                else if(rowOrder(range.end(), path) < 0)
                {
                    range.insert(-1, node);
                }

                // Selection extended is sent by join too
                this.fireSelectionExtended([ node.path() ]);
            }
        }
        else
        {
            // need to create a new range
            range = new TreeSelectionRange(owner);
            range.insert(0, node);
            _rangelist.add(range);
//            println("#add: added range to rangelist: {0}", range);
//            println("rangelist length: " + _rangelist.length);
            _rangelist.sort(function(lhs, rhs) {
                var rval = lhs.compare(rhs);
//                println("rval: " + rval);
//                println("comparison of {0} vs. {1} => {2}", [ lhs, rhs, rval ]);
                return rval;
            });
        }
//        println("Range after adding node {0} is: {1}".format([ node, range]));
//        println("Rangelist is: [ {0} ]", _rangelist.join(", ") );
        _nodeIndex.set(node, range);

        if(arguments.length === 1)
            this.fireSelectionChanged();
    };

    /**
     * This method is used by TreeNodes to remove themselves
     * from the selection.  The selection instance manages the
     * effect on the selection and fires the appropriate
     * events.
     *
     * @param node the node to be removed
     */

    this.remove = function(node)
    {
//        println("#remove( {0} )", node);
        var range = rangeForNode(node);
//        println("range: {0}", range);
        if(!range)
        {
//            println("Node index: " + archistry.core.Util.toHashString(_nodeIndex));
            throw Util.createError("StateError:  node {0} is not in any range!", node);
        }

        var r2 = range.split(node);
        if(r2)
        {
            // update the row index references for the new
            // range for all nodes in the split range
            r2.each(function(i) {
                _nodeIndex.set(this, r2);
            });
            _rangelist.add(r2);
//            println("#remove: added range to rangelist: {0}", r2);
        }
        else
        {
//            println("#remove: node {0} removed from range: {1}", node, range);
            if(range.length() === 0)
            {
                _rangelist.remove(range);
//                println("#remove: removed range: {0}", range);
            }
        }

        _nodeIndex.remove(node);

        // ensure the node is not selected
        selectfn(node, false);
        this.fireSelectionChanged();
    };

    /**
     * This method is called by the tree and indicates that
     * the node and all of its children have been selected.
     * If the node passed in is the root, then the select-all
     * signal will be fired.  Otherwise, the effect is the
     * same as adding each node individually except for only a
     * single signal is emitted for the event.
     *
     * @param node the root node of the selection
     * @param children the property reference to return the
     *      children of the specified node
     * @param excludeRoot (optional) if set to true, the root
     *      node WILL NOT be included in the selection.  This
     *      is most often used with simple grids since the
     *      root isn't part of the information displayed in
     *      the control.
     */

    this.selectAll = function(node, children, excludeRoot)
    {
        // FIXME:  if we do this with large trees, how do we
        // make sure that the UI remains responsive????
        if(excludeRoot !== undefined && !excludeRoot)
        {
            this.add(node, false);
        }

        var selection = this;
        visitChildren(node, function(parent, node, i) {
            selection.add(node, false);
        });

        if(node.path().length === 0)
        {
            // FIXME: fire select-all
            this.fireSelectionChanged();
        }
        else
        {
            this.fireSelectionChanged();
        }
    };

    /**
     * This method is part of the SelectionModel API and is
     * used to clear the selection.
     */

    this.clear = function()
    {
        // make sure we deselect the individual nodes
        _nodeIndex.keys().each(function(i) {
            selectfn(this, false);
        });
        _rangelist.clear();
        _nodeIndex.clear();
        this.fireSelectionCleared();
    };

    /**
     * This method is used to iterate over each of the
     * selection ranges managed by the instance.  The number
     * of ranges will be determined by the mode of the
     * instance.
     *
     * @see Array#each
     * @param callback
     * @returns null or the value returned by the callback
     */

    this.each = function(callback)
    {
        return _rangelist.each(callback);
    };

    /**
     * This method is used to iterate over the selection
     * ranges in reverse order.
     *
     * @see Array#reverseEach
     * @param callback
     * @returns null or the value returned by the callback
     */

    this.reverseEach = function(callback)
    {
        return _rangelist.reverseEach(callback);
    };

    this.length = function() {
        return _rangelist.length;
    };
};
