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
// Name:        grid.js
// Created:     Fri Jan 15 10:45:10 GMT 2010
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.ui");

/**
 * @class
 *
 * This class implements a TreeGrid control that is similar in
 * many respects to the GtkTreeView and XUL Tree controls.
 * However, it blends a few of these APIs together to
 * implement a multi-column tree.
 * <p>
 * Tree paths are represented as arrays with integer offsets
 * relative to the parent, e.g.
 * </p>
 * <p>
 * Given the path:
 * <pre>
 *   [ 0, 3, 2 ]
 * </pre>
 * and the tree:
 * <pre>
 *  root
 *    - c0
 *      + c0c0
 *      + c0c1
 *      + c0c2
 *      - c0c3
 *        + c0c3c0
 *        + c0c3c1
 *        + c0c3c2     <--- this is the node referenced
 *    + c1
 * </pre>
 * represents the following path:
 * <pre>
 *  /c0/c0c3/c0c3c2
 * </pre>
 * </p>
 * <p>
 * To indicate the root of the tree, an empty array should be
 * used.
 * </p>
 *
 * @param divId the element ID where the grid should be located
 * @param columns the column model to be used for the
 *        control
 * @param data the row model to be used.
 * @param options any confiruation options to be specified for
 *        the grid
 */

archistry.ui.TreeGrid = function(divId, columns, data, options)
{
    var CellRenderer            = archistry.ui.CellRenderer;
    var CheckboxRenderer        = archistry.ui.CheckboxRenderer;
    var GridStyle               = archistry.ui.Styles.Grid;
    var H                       = archistry.ui.Helpers;
    var Hash                    = archistry.core.Hash;
    var Renderer                = archistry.ui.Renderer;
    var SingleSelectionModel    = archistry.ui.selection.SingleSelectionModel;
    var Style                   = archistry.ui.Styles;
    var Tree                    = archistry.data.Tree;
    var TreeCellPath            = archistry.data.tree.TreeCellPath;
    var TreeSelection           = archistry.ui.selection.TreeSelection;
    var Util                    = archistry.core.Util;
    
    var createError             = Util.createError;
    var toHashString            = Util.toHashString;

    this.mixin(options);
    

    if(!this.layout)
    {
        this.layout = new archistry.ui.BrowserGridLayout(divId);
    }

    if(!this.nav)
    {
        this.nav = new archistry.ui.DefaultKeyNavStrategy(this);
    }

    if(!this.eventMode)
    {
        this.eventMode = new archistry.ui.TableModeStrategy(this, this.layout, this.eventModeOptions);
    }

    if(this.showRoot === undefined)
    {
        this.showRoot = false;
    }

    if(this.showExpanders === undefined)
    {
        this.showExpanders = true;
    }
   
    var _self = this;
    var _data = data;
    var _header = null;
    var _columns = columns;
    var _tasks = [];
    var _working = false;
    var _root = null;
    var _cols = [];
    var _allCols = [];
    var _colByKey = {};
    var _colIndexByKey = {};
    var _nodeById = new Hash();
    var _checkRenderer = new CheckboxRenderer();
    var _renderer = new Renderer();
    var _selectAll = false;
    var _selection = new TreeSelection(this, function(item, sel) {
        item.selected(sel);
        item.render();
    });
//    var _selection = new SingleSelectionModel(this, function(item) {
//        item.selected(false);
//        item.render();
//    });
    var _regexpHidden = new RegExp(Style.Layout.HIDDEN);
    var _signaler = new archistry.core.SignalSource(this);

    _signaler.addValidSignals([
        ////// cell editing events //////
        
        /**
         * @name sentinal_activated
         * @memberOf archistry.ui.TreeGrid
         * @signal
         *
         * This signal is sent when a sentinal row is
         * activated either via mouse or keyboard events.
         *
         * @param parent the parent tree node of the sentinal
         *      row
         * @param path the path to the node to be created in
         *      the model in place of the sentinal row
         */

        "sentinal-activated",

        /**
         * @name cell_editing_requested
         * @memberOf archistry.ui.TreeGrid
         * @signal
         *
         * This signal is sent when editing of a cell is
         * requested from either keyboard navigation or mouse
         * events.  It is only sent for cells that would
         * otherwise be editable.
         *
         * @param parent the parent TreeRow instance of the
         *      row to be edited
         * @param row the TreeRow instance for the specific
         *      row to be edited
         * @param cellPath the TreeCellPath of the cell to be
         *      edited
         * @return true to allow editing to take place; false
         *      to prevent the edit for this cell
         */

        "cell-editing-requested",

        /**
         * @name cell_editing_started
         * @memberOf archistry.ui.TreeGrid
         * @signal
         *
         * This signal is sent when editing of a tree cell has
         * started.
         *
         * @param parent the parent TreeRow instance
         * @param row the TreeRow instance being edited
         * @param path the TreeCellPath of the cell being
         *      edited
         */

        "cell-editing-started",

        /**
         * @name cell_editing_completed
         * @memberOf archistry.ui.TreeGrid
         * @signal
         *
         * This signal is sent when editing of the tree cell
         * has been completed.
         *
         * @param parent the parent TreeRow instance
         * @param row the TreeRow instance being edited
         * @param path the TreeCellPath of the cell
         * @param oldVal the original cell value
         * @param newVal the new cell value
         */

        "cell-editing-completed",

        /**
         * @name cell_editing_cancelled
         * @memberOf archistry.ui.TreeGrid
         * @signal
         *
         * This signal is sent when the edit of a particular
         * cell has been cancelled by the user.
         *
         * @param parent the parent TreeRow instance
         * @param row the TreeRow instance being edited
         * @param path the TreeCellPath of the cell
         */

        "cell-editing-cancelled"
    ]);

    ////// DEFINE INTERNAL API SHARED/CALLED BY TREEROW //////
    
    /**
     * @private
     *
     * This method is used to retrieve the meta span from the
     * specified TreeRow instance
     *
     * @param row the TreeRow
     * @return the span element used for row meta information
     */

    function metaSpan(row)
    {
        var cell = row.cell(0);
        if(_self.showSelectorColumn)
        {
            cell = row.cell(1);
        }
        
        // FIXME:  need a better way to do this!
        return cell.firstChild;
    }
    
    /**
     * @private
     *
     * This method is used to force rendering of the given
     * TreeRow reference.
     *
     * @param row the TreeRow reference of the row to be
     *        rendered
     */

    function renderRow(row)
    {
        if(!row.visible())
            return;

        if(!row || typeof row.render !== 'function')
        {
            throw createError("ArgumentError:  invalid row!");
        }

        row.render();

        // render the special columns/expanders
        // FIXME: should this stuff be done in the row
        // implementation too???

        // FIXME:  need a better way to do this!
        var span = metaSpan(row);
        var cell = span.parentNode;

        if(_self.showExpanders)
        {
            H.appendAttr(span, "class", "ui-icon");
            H.appendAttr(cell, "class", "ui-icon-left");
        }
        if(!row.isLeaf())
        {
            H.removeAttr(cell, "class", "aui-grid-child-node");
            H.appendAttr(cell, "class", "aui-grid-parent-node");
            if(_self.showExpanders)
            {
                if(row.expanded())
                {
                    H.removeAttr(span, "class", "aui-grid-expander-closed");
                    H.appendAttr(span, "class", "aui-grid-expander-open");
                }
                else
                {
                    H.removeAttr(span, "class", "aui-grid-expander-open");
                    H.appendAttr(span, "class", "aui-grid-expander-closed");
                }
            }
        }
        else
        {
            H.removeAttr(cell, "class", "aui-grid-parent-node");
            H.appendAttr(cell, "class", "aui-grid-child-node");
            H.removeAttr(span, "class", "aui-grid-expander-open");
            H.removeAttr(span, "class", "aui-grid-expander-closed");
            if(_self.showExpanders)
            {
                H.appendAttr(span, "class", "ui-icon-none");
            }
        }
        var width = H.ewidth(span, true);
        var depth = row.depth();
        var d = depth;
        if(!_self.showRoot)
        {
            d = (d > 0) ? d - 1 : 0;
        }
//        Console.println("width: {0}; d: {1}; width * d: {2}", [ width, d, width * d]);
        if(d > 0)
        {
            span.setAttribute("style", "margin-left: {0}px;".format(width * d));
        }
        if(_self.showExpanders)
        {
            // make sure we have a proper text wrapping margin
            // around the expander
            span.nextSibling.setAttribute("style", "margin-left: {0}px;".format(width * (d + 1) + 2));
        }

//        Console.println("\nnode XML: " + cell.toXML());
    }

    /**
     * @class
     *
     * This is an internal class that is used to wrap the row
     * references returned from the layout.
     *
     * @param layoutRow a row from the layout
     * @param modelNode a node from the data model
     * @param options additional mixin options
     */

    function TreeRow(layoutRow, modelNode, options)
    {
        // FIXME:  can we figure out a way to leverage the
        // implementation of the generic TreeNode class?????
        // Right now, all of the TreeNode code was forked from
        // here, so duplicates that might be out of sync
        // ASAP!!  2010-02-28T19:46:16+0000
        this.mixin(options);
        
        // set defaults for options
        if(sentinal === undefined)
            var sentinal = false;
        if(header === undefined)
            var header = false;

        var _me = this;
        var _selected = false;
        var _expanded = false;
        var _parent = null;
        var _children = [];
        var _deleted = false;
        var _dirty = false;
        var _cellState = {};
        var _loaded = false;

        /**
         * @private
         *
         * This method is used to retrieve the actual column
         * index relative to all the available columns.
         */

        function colIndex(idx)
        {
            return Tree.mapIndex(idx, _allCols.length);
        }

        /**
         * @private
         *
         * This method is used to retrieve the actual child
         * index based on the current child nodes.
         */

        function childIndex(idx, isNew)
        {
            return Tree.mapIndex(idx, (isNew ? _children.length + 1 : _children.length));
        }

        /**
         * @private
         *
         * This method is used to update the dirty status and
         * ensure that the appropriate style classes are
         * added/removed.
         *
         * @param dirty the new dirty value for the row
         */

        function updateDirty(dirty)
        {
            if(dirty !== undefined && dirty)
            {
                _dirty = dirty;
                if(_dirty)
                {
                    H.appendAttr(layoutRow.row, "class", GridStyle.ROW_DIRTY);
                }
                else
                {
                    H.removeAttr(layoutRow.row, "class", GridStyle.ROW_DIRTY);
                }
            }
        }

        /**
         * This method indicates whether the node has been
         * loaded or not.
         */

        this.loaded = function() { return _loaded; };

        /**
         * This method returns true if the node has no
         * children.
         */

        this.isLeaf = function()
        {
            if(!layoutRow)
            {
                // must be root
                return false;
            }
            return _data.isLeaf(modelNode);
        };

        /**
         * This method indicates if the row is a header row
         */

        this.isHeader = function() { return header; };

        /**
         * This method indicates if the row is a sential row
         */

        this.isSentinal = function() { return sentinal; };

        /**
         * This method is used to retrieve the i-th cell in
         * the layout row.
         *
         * @param idx the column index
         * @return the layoutRow cell
         */

        this.cell = function(idx)
        {
            if(!layoutRow)
            {
                Console.println("TreeNode#cell({0}) is undefined!  me: {1}\n{2}".format(idx, this.path(), printStackTrace()));
                return null;
            }
            return layoutRow.cell[colIndex(idx)];
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
            child.parent(_me);
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

        this.childCount = function() { return _data.childCount(modelNode); };

        /**
         * This method returns the index of the specified
         * child.
         */

        this.indexOfChild = function(node)
        {
            return Tree.indexOfChild(_me, node);
        };

        /**
         * This method is used to retrieve the current path of
         * this node.
         */

        this.path = function()
        {
            var pc = [];
            Tree.visitParents(_me, function(parent, node, depth) {
                if(parent)
                {
                    pc.add(parent.indexOfChild(node));
                }
            });

            return pc.reverse();
        };

        /**
         * This method is used to set or retrieve the
         * expansion state of the node.
         */

        this.expanded = function(val)
        {
            if(val === undefined)
                return _expanded;

            _expanded = val;
            if(!layoutRow)
                return;

            if(!_loaded)
                _loaded = true;

            var expander = layoutRow.cell[0].firstChild;
            if(_self.showSelectorColumn)
            {
                expander = layoutRow.cell[1].firstChild;
            }
            if(!val)
            {
                H.removeAttr(expander, "class", "aui-grid-expander-open");
                H.appendAttr(expander, "class", "aui-grid-expander-closed");
            }
            else
            {
                H.removeAttr(expander, "class", "aui-grid-expander-closed");
                H.appendAttr(expander, "class", "aui-grid-expander-open");
            }
        };

        /**
         * This method is used to notify the parent that the
         * child node was deleted
         */

        this.childDeleted = function(node)
        {
            // we just remove it from our node list
            _children.remove(node);
        };

        /**
         * This method is used to get the node deletion status
         */
        
        this.deleted = function(val)
        {
            if(val === undefined)
                return _deleted;

            _deleted = val;
            if(_deleted)
            {
                // make sure we're not in the selection!
                _selection.remove(_me);

                // notify our parent
                if(_parent) { _parent.childDeleted(_me); }

                // mark all our child nodes deleted too
                _children.each(function(i) { this.deleted(val); });
            }
        };

        /**
         * This method is used to get/set the visibility
         * status of the node.
         */

        this.visible = function(val)
        {
            if(val === undefined)
            {
                if(!layoutRow)
                    return false;

                var css = layoutRow.row.getAttribute("class");
                return ( css && !css.match(_regexpHidden) );
            }
            
            if(val)
                H.removeAttr(layoutRow.row, "class", Style.Layout.HIDDEN);
            else
                H.appendAttr(layoutRow.row, "class", Style.Layout.HIDDEN);
        };

        /**
         * This method will return the i-th child of the node
         * or null if it doesn't exist.
         */

        this.child = function(index)
        {
            return _children[childIndex(index)];
        };

        /**
         * This method will return the layout row
         */

        this.row = function() { return layoutRow.row; };

        /**
         * This method will return the model node
         */

        this.data = function(val)
        {
            return modelNode;
        };

        /**
         * This method will reset the child references for the
         * node.
         */

        this.clearChildren = function() { _children = []; };

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
            return Tree.visitParents(_me);
        };

        /**
         * This method is used to calculate the exact layout
         * row index of this node based on walking upwards in
         * the tree.
         */

        this.rowIndex = function()
        {
            if(!layoutRow)
                return -1;

            // FIXME:  this does a linear search because
            // there's just not a good way that I know to
            // track this without a lot of extra overhead...
            return _self.layout.indexOfRow(layoutRow.row);
        };

        /**
         * This method is used to determine the number of
         * visible rows beneath this node.
         */

        this.rowCount = function()
        {
            var rows = 1;

            if(!_expanded)
            {
                return rows;
            }

            _children.each(function() {
                rows += this.rowCount();
            });

            return rows;
        };

        /**
         * This method is a handier way to toggle the
         * selection state of the row.
         *
         * @param state the boolean state (default is true)
         */

        this.selected = function(state)
        {
            if(state === undefined)
            {
                return _selected;
            }

            _selected = state;
            if(state)
            {
//                H.removeAttr(layoutRow.row, "class", Style.State.DEFAULT);
                H.appendAttr(layoutRow.row, "class", GridStyle.ROW_SELECTED);
            }
            else
            {
                H.removeAttr(layoutRow.row, "class", GridStyle.ROW_SELECTED);
//                H.appendAttr(layoutRow.row, "class", Style.State.DEFAULT);
                _selectAll = false;
                if(_header)
                {
                    _header.render(_colIndexByKey);
                }
            }
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
           
            idx = _parent.indexOfChild(_me);
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

            idx = _parent.indexOfChild(_me);
//            Console.println("index of {0} is {1}", this.path(), idx);
            if(idx === 0)
                return null;

            return _parent.child(idx - 1);
        };

        this.toString = function()
        {
            return "[TreeRow path: [{0}], data: {1} ]".format(this.path().join(","), toHashString(modelNode));
        };

        /**
         * This method is used to tell the grid how many
         * columns are actually required for this row.
         *
         * @return the column count
         */

        this.columnCount = function()
        {
            return _allCols.length;
        };

        this.valueOf = function()
        {
//            Console.println("valueOf called! \n" + printStackTrace());
            return modelNode;
        };

        // Bean interface

        this.getProperty = function(key)
        {
            if(key === "__atg_selected")
                return _selected;

            return null;
        };

        ///////// EVENT REGISTRATION ////////
        if(!layoutRow)
            return;

        /**
         * This method is used to render the specific cell in
         * the row without re-rendering the whole row.
         *
         * @param colDef the column definition of the column
         *      to be rendered.
         * @param dirty (optional) indicates that the column is
         *      to be rendered as dirty
         */

        this.renderColumn = function(colDef, dirty)
        {
            var cdef = colDef;
            var i = _colIndexByKey[cdef.key];
            var cel = layoutRow.cell[i];
            if(!cel)
            {
                Console.println("*** Warning :TreeNode.render: no cell for {0}\n{1}",
                        [ i , printStackTrace() ])
                return;
            }

            // track the dirty state of the cell
            var _isDirty = _cellState[cdef.key];
            if(dirty !== undefined && dirty)
            {
                _cellState[cdef.key] = dirty;
                _isDirty = dirty;
                updateDirty(dirty);
            }
//            Console.println("layoutRow.cell[{0}] XML: {1}", i, cel.toXML());
            // locate the data span in which to render
            var elem = cel.firstChild.nextSibling;
            if(!elem || !elem.getAttribute("class").match(/aui-grid-cell-data/))
            {
                throw createError("Unable to find the cell data span!");
            }
            var n = modelNode;
            if("__atg_selected" === cdef.key)
                n = _me;

            cdef.renderer.render(_self, n, cdef, elem);
            if(_isDirty)
            {
                H.appendAttr(cel, "class", GridStyle.CELL_DIRTY);
            }
            else
            {
                H.removeAttr(cel, "class", GridStyle.CELL_DIRTY);
            }
        };

        /**
         * This method is used to render the rows given the
         * specified array of column definitions.
         *
         * @param dirty (optional) indicates that the column is
         *      to be rendered as dirty
         */

        this.render = function(dirty)
        {
            if(_deleted)
                return;

            _allCols.each(function(i) {
                _me.renderColumn(this, dirty);
            });

            updateDirty(dirty);
        };

        /**
         * This method is used to initialize/build out the
         * physical layout row for this particular row.
         * Specific row types should alter this implementation
         * as required.
         *
         * @param callback a function that will be called with
         *      a reference to each cell built by the row.  It
         *      MUST have the form:
         *      <pre>
         *        callback(index, columnDef) {
         *          // this === cell
         *        }
         *      </pre>
         *      And the columnDef MAY be null depending on the
         *      type of row being built.
         */

        this.initRow = function(callback)
        {
            H.appendAttr(layoutRow.row, "class", GridStyle.ROW);
            _allCols.each(function(i) {
                var cel = layoutRow.cell[i];
                var style = [ GridStyle.CELL, this.style ];
                cel.setAttribute("class", style.join(" "));
                if(callback)
                {
                    callback.apply(cel, [ i ]);
                }
            });
        };

        // make sure that we're part of the mapping scheme
        var rowid = "{0}-node-{1}".format(divId, this.object_id());
        _nodeById.set(rowid, this);
        layoutRow.row.id = rowid;
    }

    /**
     * @class
     *
     * This class represents a header row in the control
     *
     * @param layoutRow the actual layout row used to render
     * the header.
     */

    function HeaderRow(layoutRow)
    {
        this.mixin(new TreeRow(layoutRow, null, { header: true }));
        layoutRow.row.onclick = null;

        /**
         * We need to render column header rows differently
         * than regular tree rows.
         */

        this.render = function()
        {
//            Console.println("KeyIndex: " + keyIndex.inspect());
            _allCols.each(function(i) {
                var cel = layoutRow.cell[_colIndexByKey[this.key]];
                if(this.headerRenderer)
                {
                    this.headerRenderer.render(_self, this, cel);
                }
                else
                {
                    _renderer.render(cel, this.label);
                }
            });
        }
    }

    /**
     * @class
     *
     * This is an internal class that wraps the column model
     * values so that we can show/hide and reorder the columns
     * and keep track of this vs. the original/default
     * settings.
     *
     * @param col the column reference from the column model
     */

    function TreeColumn(column)
    {
        this.mixin(column);
        if(this.visible === undefined)
        {
            this.visible = true;
        }

        if(this.reorderable === undefined)
        {
            this.reorderable = true;
        }
    }

    /**
     * @private
     *
     * This function returns the column for the specified
     * index, accounting for hidden columns.
     *
     * @param index the column index
     */

    function getCol(index)
    {
        var ci = Tree.mapIndex(index, _cols.length);
        return _cols[ci];
    }

    /**
     * @private
     *
     * This function indicates whether the column is editable
     * or not
     *
     * @param col the column reference to check
     * @return true or false
     */

    function colEditable(col)
    {
        if(!_data.editable || !col.editor)
            return false;

        return true;
    }

    /**
     * @private
     *
     * This method is used to add the event handlers to the
     * expander span
     *
     * @param treerow the TreeRow node
     */

    function ensureExpanderEvents(treerow)
    {
        if(!treerow.isLeaf())
        {
            var span = (arguments.length === 2 ? arguments[1] : metaSpan(treerow));
            H.appendAttr(span, "class", "aui-grid-expander");
            span.onclick = function(event) {
                if(!event)
                    event = window.event;

                if(treerow.expanded())
                {
                    collapse(treerow);
                }
                else
                {
                    expand(treerow);
                }
                event.cancelBubble = true;
                if(event.stopPropagation)
                    event.stopPropagation();
            };
        }
    }

    /**
     * @private
     *
     * This method is used to build a particular tree row
     *
     * @param treerow the object to render
     */

    function buildRow(treerow)
    {
        treerow.initRow(function(i, col) {
            if(col && colEditable(col))
            {
                // hook up events?
            }
            // set up the special span elements in each cell
            var span = H.ne("span");
            span.setAttribute("class", "aui-grid-cell-meta");
            if(_self.showExpanders && i === (_self.showSelectorColumn ? 1 : 0) && !treerow.isLeaf())
            {
                H.appendAttr(span, "class", "aui-grid-expander");
                ensureExpanderEvents(treerow, span);
            }
            this.appendChild(span);
            span = H.ne("span");
            span.setAttribute("class", "aui-grid-cell-data");
            this.appendChild(span);

            _self.nav.onCellAdded(this);
        });

        // ADD THE EVENT LISTENERS FOR THE ROW
        var lrow = treerow.row();
        if(_self.showSelectorColumn)
        {
            treerow.cell(0).onclick = function(event) {
                if(treerow.selected())
                    _selection.remove(treerow);
                else
                    _selection.add(treerow);
            };
        }

        renderRow(treerow);
        return treerow;
    }

    /**
     * @private
     *
     * This method is used to clear the selection for the
     * control.
     */

    function clearSelection()
    {
        _selectAll = false;
        _selection.clear();
        if(_header)
        {
            _header.render();
        }
    }

    /**
     * @private
     *
     * This method is used to retrieve the node for the given
     * path.
     *
     * @param path the path to resolve
     * @return the node or null if not present
     */

    function nodeForPath(path)
    {
        return Tree.visitPath(_root, path);
    }

    /**
     * @private
     *
     * This method is used to build a header row.
     *
     * @param index (optional) insertion point index
     */

    function buildHeader(index)
    {
        if(!(_self.showHeader || _self.showHeaders))
        {
            return;
        }

//        Console.println("Inserting header row");
        var hrow = _self.layout.insertRows((index ? index : -1), _allCols.length, 1);
        _header = new HeaderRow(hrow[0]);
        H.appendAttr(_header.row(), "class", GridStyle.ROW_HEADER);
        _allCols.each(function(i) {
//            Console.println("Processing header column " + this.label);
            var cell = _header.cell(i);
            var style = [ GridStyle.CELL, this.style ];
            cell.setAttribute("class", style.join(" "));
            H.disableSelect(cell);
            if(this.headerRenderer)
            {
                this.headerRenderer.render(_self, this, cell);
            }
            else
            {
                _renderer.render(cell, this.label);
            }
        });

        if(_self.showSelectorColumn)
        {
            _header.cell(0).onclick = function(event) {
                _self.selectAll(!_selectAll);
            }
        };

        _header.render();
    }

    /**
     * @private
     *
     * This method is used to expand the specified
     * node and update the layout accordingly.
     *
     * @param node the TreeRow reference
     */

    function expand(node)
    {
        if(node.isLeaf() || node.expanded())
            return;

        var i = 0;
        Console.println("node.expanded? {0}; node.loaded? {1}", node.expanded(), node.loaded());
        
        if(!node.expanded() && node.loaded())
        {
            node.expanded(true);
            Tree.visitChildren(node, function(parent, node, idx) {
                if(!parent.expanded())
                    return false;

//                Console.println("Expanding node: {0}.child[{1}]: {2}", [ parent.key, idx, node.key ]);
                node.visible(true);
                return true;
            });
            return;
        }

        var row = node.rowIndex();
        var idx = row + 1;
        if(row === -1)
        {
            idx = row;
        }
        Console.println("index of row at path [{0}] is {1}; inserting at {2}", node.path(), row, idx);

        var count = _data.childCount(node.data());
        var rows = _self.layout.insertRows(idx, _allCols.length, count);
        // clear any references from before
        node.clearChildren();
        for(i = 0; i < count; ++i)
        {
            buildRow( node.insertChild(i, 
                new TreeRow(rows[i], 
                            _data.child(node.data(), i))));
        }

        node.expanded(true);
    }

    /**
     * @private
     *
     * This method is used to "collapse" the node.  However,
     * we don't really remove them from the layout, we just
     * hide them temporarily figuring that we'll need them
     * later.
     *
     * @param node the node to collapse
     */

    function collapse(node)
    {
        Tree.visitChildren(node, function(parent, node, idx) {
//            Console.println("visiting node at path [{0}, {1}]", parent.path(), idx);
            if(node.row())
            {
                node.visible(false);
                if(node.expanded())
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            return false;
        });
        node.expanded(false);
    }

    /**
     * @private
     *
     * This helper function will return a NodeInfo object with
     * node property being the actual TreeRow node reference
     * and the index value being the physical layout row
     * index.
     *
     * @param path the path
     * @param xpand (optional) if true, the path will be
     *        expanded in the process of traversal to locate the
     *        specified node
     * @return the NodeInfo object
     */

    function getNodeInfo(path, xpand)
    {
        if(!_root)
            return { node: null, index: -1 };

        if(path.length === 0)
        {
            if(xpand)
            {
                expand(_root);
            }
            return { node: _root, index: _self.showRoot ? 0 : -1 };
        }

        var node = _root;
        var pl = path.length;
        var n = null;
        var row = 0;
        for(var i = 0; i < path.length; ++i)
        {
//            Console.println("Processing path {0}", [ path[i] ]);
            var pi = Tree.mapIndex(path[i], node.childCount());
//            Console.println("Processing path {0} ({1})", [ path[i], pi ]);
            if((n = node.child(pi)))
            {
                if(i < pl && node.expanded())
                {
                    if(row) row += pi;
                }
                else if(i < pl && !node.expanded())
                {
                    if(xpand && row)
                    {
                        row += pi;
                        expand(n)
                    }
                    else
                    {
                        row = null;
                    }
                }
                node = n;
            }
            else
            {
                // no path component node
                return { node: null, index: -1 };
            }
        }

        return { node: node, index: (row ? -1 : row) };
    }

    /**
     * @private
     *
     * This helper function is used to translate node index
     * values into the proper layout index for row
     * manipulation
     *
     * @param node the node to check
     * @return the actual row index
     */

    function rowIndex(node)
    {
        var ri = node.rowIndex();
        if(ri === -1 && !_header)
        {
            ri = 0;
        }
        else if(ri === -1 && _header)
        {
            ri = 1;
        }

        return ri;
    }
    
    /**
     * @private
     *
     * This method is used to programmatically delete the row
     * with the given path.
     *
     * @param path the path to the row to be deleted
     */

    function deleteRow(node)
    {
        var rc = node.rowCount();
        var ri = node.rowIndex();
//        Console.println("rowcount for node {0} at path [ {1} ]: {2}", [
//            node.key, path.join(", "), rc ]);

        if(ri === -1 && node.deleted())
        {
//            Console.println("row at path [ {1} ] already deleted from the layout", [ path.join(", ") ]);
            return;
        }
        else if(ri === -1 && !node.deleted())
        {
//            Console.println("path: " + path.inspect());
            throw createError("No layout row found for node at path [ {0} ]!", [ path.join(", ") ]);
        }

        _self.layout.deleteRows(ri, rc);
        var parent = node.parent();
        node.deleted(true);
        if(parent && parent.rowIndex() !== -1)
        {
            renderRow(parent);
        }

//        Console.println("selection length: " + _selection.length);
        if(_selection.length === 0 && _selectAll)
        {
            clearSelection();
        }
    
        // FIXME: fire event!
    };


    ////// SIGNAL HANDLING CALLBACKS //////

    /**
     * @private
     *
     * This method is used to do repeated checks before
     * actually processing each node in the event list.
     *
     * @param sender the sender of the signal
     * @param eventlist the event list to process
     * @param callback the callback function to be invoked
     *      with each reference object.  The this reference
     *      will point to the event object
     */

    function processEventList(sender, eventlist, callback)
    {
        if(!sender.equals(_data))
            return;

        eventlist.each(function(i) {
            var tr = nodeForPath(this.path());
            if(!tr)
                return;

            if(!this.parent().equals(tr.data()))
            {
                throw createError("StateError:  TreeGrid and TreeRowModel are not in sync!");
            }
            var event = this;
            callback.apply(event, [ tr ]);
        });
    }

    /**
     * @private
     *
     * This method is called for 'tree-nodes-inserted' from
     * the model.
     */

    function modelNodesInserted(eventlist)
    {
        processEventList(this, eventlist, function(parent) {
            if(this.refs().length === 0)
            {
                // nothing to do
                return;
            }

            Console.println("processing insertion for parent: {0} at path [{1}]", [ parent.data().toHashString(), this.path() ] );
            if(!parent.expanded())
            {
                Console.println("Parent not expanded; isLeaf? " + parent.isLeaf());
                // re-render the parent for the expander state,
                // but otherwise we don't care.
                renderRow(parent);
                ensureExpanderEvents(parent);
                return;
            }
            var lrows = null;
            var index = null;
            var ri = null;

            if(this.isContiguous())
            {
                var event = this;
                index = event.refs()[0].index();
                var child = parent.child(index - 1);
                if(child)
                {
                    ri = rowIndex(child) + child.rowCount();
                }
                else
                {
                    ri = rowIndex(parent) + 1;
                }
                Console.println("ri: {0}, ref[0].index: {1}", ri, index);
                lrows = _self.layout.insertRows(ri, 
                                _allCols.length, event.refs().length);
                lrows.each(function(i) {
                    buildRow(parent.insertChild(event.refs()[i].index(),
                                new TreeRow(this, event.refs()[i].node())));
                });
            }
            else
            {
                this.refs().each(function(i) {
                    index = this.index();
                    var child = parent.child(index - 1);
                    if(child)
                    {
                        ri = rowIndex(child) + child.rowCount();
                    }
                    else
                    {
                        ri = rowIndex(parent) + 1;
                    }
                    lrows = _self.layout.insertRows(ri, _allCols.length, 1);
                    buildRow(parent.insertChild(index,
                                new TreeRow(lrows[0], this.node())));
                });
            }
            renderRow(parent);
        });
    }

    function modelNodesRemoved(eventlist)
    {
        processEventList(this, eventlist, function(node) {
//            Console.println("processing removal for parent: {0} at path [{1}]", node.label, this.path);
            if(!node.expanded())
            {
//                Console.println("Parent not expanded");
                renderRow(node);
                return;
            }
            if(this.refs().length === 0)
                return;

            this.refs().each(function(i) {
                deleteRow(node.child(this.index()));
            });
            renderRow(node);
        });
    }

    function modelNodesChanged(eventlist)
    {
    }

    function modelTreeChanged(eventlist)
    {
    }

    /**
     * @private
     *
     * This method is used to register ourselves with the
     * data model so we can reflect changes in the model
     * automatically.
     *
     * @param model the data model
     */

    function registerDataListeners(model)
    {
        if(!model.signalConnect)
            return;
        
        model.signalConnect("tree-nodes-inserted", modelNodesInserted);
        model.signalConnect("tree-nodes-removed", modelNodesRemoved);
        model.signalConnect("tree-nodes-changed", modelNodesChanged);
        model.signalConnect("tree-structure-changed", modelTreeChanged);
    }

    /**
     * @private
     *
     * This method is used to unregister ourselves from a data
     * model instance.
     *
     * @param model the data model
     */

    function unregisterDataListeners(model)
    {
        if(!model.signalConnect)
            return;

        model.signalDisconnect("tree-nodes-inserted");
        model.signalDisconnect("tree-nodes-removed");
        model.signalDisconnect("tree-nodes-changed");
        model.signalDisconnect("tree-structure-changed");
    }

    //////// INTERNAL EVENT TRIGGERS ////////

    function fireEditRequested(parent, node, path)
    {
        return _signaler.signalEmitImmediate("cell-editing-requested",
                                parent, node, path);
    }

    function fireEditStarted(parent, node, path)
    {
        _signaler.signalEmit("cell-editing-started", parent, node, path);
    }

    function fireEditCompleted(parent, node, path, oval, nval)
    {
        _signaler.signalEmit("cell-editing-completed", parent, node, path, oval, nval);
    }

    function fireEditCancelled(parent, node, path)
    {
        _signaler.signalEmit("cell-editing-cancelled", parent, node, path);
    }

    /**
     * @private
     *
     * This method is used to set up the overall event
     * handling strategy for the actual layout.
     */

    function initLayoutEvents()
    {
    }

    //////// START PUBLIC API ////////
    
    /**
     * @function
     * @see archistry.core.SignalSource#signalConnect
     */

    this.signalConnect = _signaler.signalConnect;

    /**
     * @function
     * @see archistry.core.SignalSource#signalDisconnect
     */

    this.signalDisconnect = _signaler.signalDisconnect;

    /**
     * This method is used to trigger cell editing on the
     * target path and column index.  Normally, this method
     * will only be triggered for keyboard navigation/editing.
     *
     * @param path the path to the row object to edit as
     *      either an array or a TreeCellPath instance.  If
     *      the path is a TreeCellPath, the col parameter is
     *      ignored.
     * @param col the column index to edit
     * @return true if editing started, false otherwise
     */

    this.editCell = function(path, col)
    {
//        Console.println("TreeGrid#editCell( {0}, {1} )".format(path, col));
        var kol = null;
        var cellPath = null;

        if(col === undefined || path instanceof TreeCellPath)
        {
            kol = _colByKey[path.key()];
            cellPath = path;
        }
        else
        {
            kol = getCol(col);
            cellPath = new TreeCellPath(path, kol.key);
        }
        
        if(!_data.editable || !kol.editor)
        {
            Console.println("Model is not editable or no editor defined. Aborted.");
            return false;
        }

        // make sure the path is expanded
        var info = getNodeInfo(cellPath.path(), true);
        if(!info.node)
        {
            throw createError("Path error:  no row for the specified path [{0}]", cellPath);
        }
    
        var parent = info.node.parent();
        if(!fireEditRequested(parent, info.node, cellPath))
        {
            Console.println("edit vetoed by listener(s).  Aborted.");
            return false;
        }

        setTimeout(function() {
            _self.editing = {
                parent: parent,
                node: info.node,
                column: kol,
                path: cellPath,
                editor: kol.editor
            };
            fireEditStarted(parent, info.node, cellPath);
            var cell = info.node.cell(_colIndexByKey[kol.key]);
            var meta = cell.firstChild;
            var dcell = meta.nextSibling;
            var cellw = H.ewidth(cell, true);
            var cellh = H.eheight(cell, true);
            var metaw = H.ewidth(meta, true);
            var metah = H.eheight(meta, true);
            var dataw = H.ewidth(dcell, true);
            var datah = H.eheight(dcell, true);
            var cellpad = H.styleBox(cell, "padding", true);
            var dcellmg = H.styleBox(dcell, "margin", true);
            var doffset = H.offset(dcell, true);

//            Console.println("Cell {0}x{1}; Meta: {2}x{3}; Data: {4}x{5}, offset: '{6}', padding: {7}, margin: {8}", cellw, cellh, metaw, metah, dataw, datah, toHashString(doffset), toHashString(cellpad), toHashString(dcellmg));
            var size = {};
            if(0 === metaw)
            {
                size.width = cellw;
                size.height = cellh;
            }
            else
            {
                size.width = (dataw - 2);
                size.height = cellh;
            }

//            Console.println("size: {0}", toHashString(size));
            // calculate the width
            if(!cell.addEventListener && cell.attachEvent)
            {
//                Console.println("added event forwarder");
                kol.editor.fakeCapture = _self.nav.pushEvent;
            }

            kol.editor.startEditing(_self, 
                    info.node.data(),
                    kol.key,
                    meta.nextSibling, 
                    _self.editing,
                    size);
        }, 50);
    };

    /**
     * This method returns true or false depending on whether
     * the cell is editable or not.
     *
     * @param path the path to the row as either an array or a
     *      TreeCellPath instance.  If a TreeCellPath is
     *      provided, the colIdx parameter is ignored
     * @param colIdx the column index of the cell
     * @return true or false
     */

    this.isCellEditable = function(path, colIdx)
    {
//        Console.println("TreeGrid#isCellEditable( {0}, {1} )".format(path, (colIdx === undefined ? "(undefined)" : colIdx)));
        var kol = null;
        if(colIdx === undefined || path instanceof TreeCellPath)
        {
//            Console.println("_colByKey.keys: [{0}]", _colByKey.keys().join(", "));
            kol = _colByKey[path.key()];
        }
        else
        {
            kol = getCol(colIdx);
        }

        if(!kol)
        {
            // this is probably the selector
            return false;
        }

        return colEditable(kol);
    };

    /**
     * This method is used to select or unselect the specified
     * path.  The path will be shown if it is not currently
     * visible.
     *
     * @param path the path location or null to clear the
     *        selection.
     * @param selected (optional) true or false to control
     *        selection state
     */

    this.selectPath = function(path, colIdx, selected)
    {
        // FIXME:  selecting cells is not currently supported
        if(!path)
        {
            _selection.clear();
            return;
        }
        
        var sel = true;
        if(selected !== undefined)
        {
            sel = selected;
        }

        var info = getNodeInfo(path, true);
        if(!info.node)
            return;
    
        info.node.selected(sel);
        renderRow(info.node);
    };

    /**
     * This method is used to ensure the path is expanded or
     * collapsed.
     *
     * @param path the path to manipulate
     * @param expanded (optional) if not set, defaults to true
     */

    this.expandPath = function(path, expanded)
    {
        var expand = true;
        if(expanded !== undefined)
        {
            expand = expanded;
        }

        var info = getNodeInfo(path, expand);
        if(!expand)
        {
            collapse(info.node, info.index);
        }
    };

    /**
     * This method is used to select all of the rows in the
     * model.
     *
     * @param selected (optional) boolean indicating the
     *        selection state
     */

    this.selectAll = function(selected)
    {
        var excludeRoot = true;
        if(_self.showRoot)
        {
            if(!_root.expanded())
            {
                expand(_root);
            }
            excludeRoot = false;
        }

        if(selected !== undefined && selected)
        {
            _selection.selectAll(_root, excludeRoot);
        }
        else
        {
            _selection.clear();
        }

        _selectAll = selected;
    };

    /**
     * This method returns the current tree selection as a
     * sorted list of path references to the selected nodes.
     * Modifications to the returned array have no effect on
     * the tree.
     */

    this.selection = function()
    {
        // FIXME:  We're kinda ignoring the whole selection
        // range thing doing it this way, but I suppose that's
        // really what the callers want--just the list of
        // paths. *sigh*
        //
        // FIXME:  also need to cache the paths until the
        // selection changes
        var paths = [];
//        Console.println("selection contains {0} ranges", _selection.length);
        _selection.each(function() {
//            Console.println("selection() processing range: {0}", this);
            this.each(function() { 
                paths.add(this.path());
            });
        });
        return paths;
    };

    /**
     * This method is used to expand all of the nodes in the
     * tree.
     *
     * @param state (optional) boolean representing the
     *        desired state of the tree
     */

    this.expandAll = function(state)
    {
        if(_self.showRoot)
        {
            if(state && !node.expanded())
                expand(_root);
            else
                collapse(_root);
        }

        Tree.visitChildren(_root, function(p, node, i) {
            if(!node.isLeaf())
            {
                if(state)
                    expand(node);
                else
                    collapse(node);
            }
            return true;
        });
    };

    /**
     * This method is used to set a new model for the tree.
     * The old model is completely replaced and the grid is
     * redrawn.
     *
     * @param model the new model
     */

    this.data = function(model)
    {
        if(model === undefined)
            return _data;

        // take care of event listener registration
        unregisterDataListeners(_data);
        _data = model;
        registerDataListeners(_data);

        // make sure we don't whack the header!!
        if(!_header)
        {
            _self.layout.reset();
        }
        else
        {
            if(_self.layout.length > 1)
            {
                _self.layout.deleteRows(1, _self.layout.length - 1);
            }
        }
        if(this.showRoot)
        {
            var rrow = _self.layout.insertRows(-1, _allCols.length, 1);
            _root = new TreeRow(rrow[0], _data.root());
            buildRow(_root);
        }
        else
        {
            _root = new TreeRow(null, _data.root());
            expand(_root);
        }
    };

    /**
     * This method is used to set the column model
     *
     * @param mode the new column model
     */

    this.columnModel = function(model)
    {
        if(model === undefined)
            return _columns;

        _columns = model;
        _cols = [];
        _allCols = [];
        _colIndexByKey = {};
        _colByKey = {};

        if(this.showSelectorColumn)
        {
            _allCols = [ new TreeColumn({
                key: "__atg_selected",
                renderer: new CellRenderer(_checkRenderer),
                headerRenderer: {
                    render: function(grid, col, cell)
                    {
                        _checkRenderer.render(cell, _selectAll);
                    }
                },
                style: "aui-grid-col-selector ui-widget-header"
                })
            ];
            _colIndexByKey["__atg_selected"] = 0;
            _colByKey["__atg_selected"] = _allCols[0];
        }

        // load the column definitions
        for(var i = 0; i < columns.length(); ++i)
        {
            var c = new TreeColumn(columns.col(i));
            _cols.add(c);
            _colByKey[c.key] = c;
            _colIndexByKey[c.key] = _allCols.length;
            _allCols.add(c);
        }

        if(_self.showHeader || _self.showHeaders)
        {
            // FIXME: for now, we assume we only have one
            // header row
            if(_self.layout.row(0) instanceof HeaderRow)
            {
                Console.println("deleting existing header row");
                _self.layout.deleteRows(0, 1);
            }
            buildHeader();
        }
    };

    /**
     * This method is used to ensure the edit of the current
     * cell has been completed.
     */

    this.completeEditing = function()
    {
        if(_self.editing)
        {
            var val = _self.editing.editor.completeEditing();
            if(val)
            {
                _self.editing = false;
                return val;
            }
        }
        return true;
    };
    
    /**
     * This method is called from cell editors when the user
     * cancels the edit.
     *
     * @param context the context object contains a reference
     *        to the row index being edited and the column definition
     *        of the editing column
     */

    this.editingCancelled = function(context)
    {
        fireEditCancelled(context.parent, context.node, context.path);
        context.node.renderColumn(context.column);
        _self.editing = null;
        fireEditingCancelled
    };

    /**
     * This method is called from cell editors when they have
     * completed editing the current cell.
     *
     * @param context the context object contains a reference
     *        to the row index being edited and the column definition
     *        of the editing column
     */

    this.editingCompleted = function(context)
    {
        var row = context.node.data();
        var old = row.getProperty(context.column.key);
        var newVal = context.column.editor.value();
        var dirty = false;

        if(old != newVal)
        {
            row.setProperty(context.column.key, newVal);
            dirty = true;

//            Console.println("New value for {0} is '{1}'", context.path, row[context.column.key]);
        }
        context.node.renderColumn(context.column, dirty);
        fireEditCompleted(context.parent, context.node, context.path, old, newVal);
        _self.editing = null;
    };

    /**
     * This method is used to get the map the specified
     * element to TreeCellPath instance that can be used to
     * identify the given cell.
     *
     * @param element an Element reference
     * @return the path or null if the row is not part of the
     *      grid
     */

    this.pathForElement = function(element)
    {
        var rowid = null;
        var colid = null;
        var el = element;
        var m = null;

//        Console.println("element: {0}", element.toXML());
//        Console.println("element.tagName: {0}", element.tagName);

        switch(el.tagName.toLowerCase())
        {
            case "span":
                el = H.parentWithTag(el, "td");
            case "td":
                if(!el)
                    return null;

                m = el.getAttribute("class").match(/aui-grid-col-([^\s]*)/);
                if(m.length > 0)
                    colid = m[1];

                el = H.parentWithTag(el, "tr");
            case "tr":
                if(!el)
                    return null;

                rowid = el.id;
                break;
            default:
                return null;
        }

//        Console.println("found rowid: {0} and colid: {1}".format(rowid, colid));
        node = _nodeById.get(rowid);
        if(!node)
            throw createError("StateError:  unable to find a node for rowid: {0}".format(rowid));

        var path = new TreeCellPath(node.path(), colid);
        // FIXME:  this is cheating....
        path.index = _colIndexByKey[colid];
//        Console.println("#pathForElement returning " + path);
        return path;
    };

    // FIXME:  show/hide/reorder of columns is not yet
    // implemented

    // set the models to the parameters to initialize the
    // instance data
    
    this.columnModel(columns);
    this.data(data);

//    // start the task processor
//    setInterval(function() {
//        // this has a race condition, but JavaScript doesn't
//        // appropriate synchronization constructs until
//        // version 1.7!
//        if(_working || _tasks.length === 0)
//            return;
//
//        // process the task
//        _working = true;
//        fn = _tasks.shift();
//        fn();
//        _working = false;
//    }, 20);
};
