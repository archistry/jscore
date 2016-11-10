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
// Name:        table_layout.js
// Created:     Fri Jan 15 10:45:10 GMT 2010
// Split:       Wed Mar 10 12:00:48 GMT 2010
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.ui");

/**
 * @class
 *
 * This class represents a row reference in the layout.  It is
 * used to encapsulate any particular accessors (and crazy API
 * calls) required for the specific layout implementation's
 * concept of rows and columns.
 *
 * @param layout a reference to the containing layout
 * @param row an opaque reference to the actual layout row
 *        element
 * @param cols an array of opaque references to the actual
 *        layout column elements
 */

archistry.ui.GridLayoutRow = function(layout, row, cols)
{
    this.layout = layout;
    this.row = row;
    this.cell = cols;
};

/**
 * @class
 *
 * This class creates a grid using the default browser layout
 * behavior.  Rendering performance is based on the browser
 * and no additional optimizations are provided.
 *
 * @param id the element ID of the grid's containing div
 */

archistry.ui.BrowserGridLayout = function(id)
{

    var GridLayoutRow = archistry.ui.GridLayoutRow;
    var Style = archistry.ui.Styles;
    var GridStyle = archistry.ui.Styles.Grid;
    
    var mapIndex = archistry.data.Indexer.mapIndex;
    var e = archistry.ui.Helpers.e;
    var ne = archistry.ui.Helpers.ne;
    var appendAttr = archistry.ui.Helpers.appendAttr;

    var _self = this;
    var _tabid = "ag-table-" + id;
    var _root = e(id);
    var _table = null;

    /**
     * @private
     *
     * This method is used to calculate the row insertion
     * point based on mapping the appropriate index
     *
     * @param index raw index
     * @return the mapped index
     */

    function insertIndex(index)
    {
        return mapIndex(index, _table.rows.length + 1);
    }

    /**
     * @private
     *
     * This method is used to calculate the row reference
     * point everywhere that IS NOT row insertion.
     *
     * @param index raw index
     * @return the mapped index
     */

    function rowIndex(index)
    {
        return mapIndex(index, _table.rows.length);
    }

    /**
     * @private
     *
     * This method is used to retrieve the TABLE row reference
     * as opposed t the GridLayoutRow reference that is
     * expected from the GridLayout API.
     *
     * This method also does index translation for negative
     * values.
     *
     * @param row the row to retreive
     */

    function row(row)
    {
        return _table.rows[rowIndex(row)];
    }

    /**
     * @private
     *
     * This method is used to return the specific TABLE cell,
     * using full index translation.
     *
     * @param row the row index
     * @param col the column index
     */

    function cell(row, col)
    {
        var row = row(row);
        return row.cells[mapIndex(col, row.cells.length)];
    }

    /**
     * @private
     *
     * This method is used to return the number of columns in
     * the table.
     */

    function cols()
    {
        if(_table && _table.rows.length > 0)
            return _table.rows[0].cells.length;
    
        return 0;
    }

    /**
     * @private
     *
     * This method is used to create a single row with the
     * specified number of columns and return a GridLayoutRow
     * reference.
     */

    function insertRow(index, cols)
    {
        var ri = insertIndex(index);
//        Console.println("rows: {0}; insert row index: {1}; ri: {2}", [
//                _table.rows.length, index, ri ]);
        var row = _table.insertRow(ri);
        var rval = new GridLayoutRow(_self, row, []);

        for(var i = 0; i < cols; ++i)
        {
            rval.cell.add(row.insertCell(i));
        }

        return rval;
    }

    //////// PUBLIC API ////////

    /**
     * This method is used to search for the actual row index
     * of the particular row.
     *
     * @param row a layout row instance
     * @return the row index
     */

    this.indexOfRow = function(row)
    {
        for(var i = 0; i < _table.rows.length; ++i)
        {
            if(_table.rows[i] === row)
                return i;
        }
        return -1;
    };

    /**
     * This method is used to return the content element for
     * the cell at the specified row index and column index.
     *
     * @param row the row index
     * @param col the column index
     */

    this.cell = function(row, col)
    {
        if(!_table)
            return null;

        return cell(row, col);
    };
    
    /**
     * This method returns a reference to the referenced row
     *
     * @param idx the row index to retrieve
     */

    this.row = function(idx)
    {
        var r = row(idx);
        if(!r)
            return null;

        var ref = new GridLayoutRow(_self, r);
        ref.cell = ref.row.cells;
        return ref;
    };

    /**
     * This method is used to insert a new colum into the
     * table FOR ALL ROWS.  Rendering/update of the rows will
     * be taken care of by the grid
     *
     * @param colIdx the insert index
     */

    this.insertColumn = function(colIdx)
    {
        var ci = mapIndex(colIdx, cols() + 1);
        _table.rows.each(function() {
            this.insertCell(ci);
        });
    };

    /**
     * This methd is used to insert the specified number of
     * rows in the table starting from the given index.  If
     * the index is negative, it represents a reverse index
     * into the table, e.g. -1 is the last row in the table,
     * -2 is the second-to-last row, etc.
     *
     * @param idx the insert point
     * @param cols the number of columns to insert
     * @param count the number of rows to insert
     * @return an array containing references to the rows
     *        created
     */

    this.insertRows = function(idx, cols, count)
    {
        var rval = [];
        var si = insertIndex(idx);
//        Console.println("inserting {0} rows at {1}; si: {2}", [ count, idx, si ]);
        for(var i = 0; i < count; ++i)
        {
            rval.add(insertRow(si + i, cols));
        }

        return rval;
    };

    /**
     * This method is used to delete the specified number of
     * rows from the table.
     *
     * @param idx the deletion point
     * @param count the number of rows to delete.
     */

    this.deleteRows = function(idx, count)
    {
        var di = rowIndex(idx);
//        Console.println("Delete {0} rows starting with {1}", [ count, di ]); 
        for(var i = count - 1; i >= 0; --i)
        {
            _table.deleteRow(di + i);
        }
    };

    /**
     * This method is used to delete the specific column from
     * the table.
     * <p>
     * NOTE:  if you are only interested in showing/hiding
     * columns, you should do this with CSS and not do it by
     * adding/removing the whole column!
     * </p>
     *
     * @param idx the row index
     * @param col the column to delete
     */

    this.deleteColumn = function(idx, col)
    {
        var ci = mapIndex(col, cols());
        for(var i = 0; i < _table.rows.length; ++i)
        {
            row(i).deleteCell(ci);
        }
    };

    /**
     * This method is used to ensure that the specified cell
     * index is visible.
     *
     * @param row the row index
     * @param col (optional) the column index
     */

    this.ensureVisible = function(row, col) {};

    /**
     * This method is used to "clear" the underlying layout by
     * deleting all of the rows from the table.
     */

    this.reset = function()
    {
        for(var i = 0; i < _table.rows.length; ++i)
        {
            _table.deleteRow(0);
        }
    };

    /**
     * This method is used to reorder a particular column in
     * the layout.
     *
     * @param oldIdx the original column index
     * @param newIdx the new column index
     */

    this.reorderColumn = function(oldIdx, newIdx)
    {
        var oi = mapIndex(oldIdx, cols());
        var ni = mapIndex(newIdx, cols());
        for(var i = 0; i < _table.rows.length; ++i)
        {
            var row = row(i);
            var targ = row.cells[ni];
            var old = row.removeChild(row.cells[oi]);
            row.insertBefore(old, targ);
        }
    };

    /**
     * Returns the number of rows in the layout
     */

    this.length = function() { return _table.rows.length; };

    /**
     * This method returns a reference to the main control
     * element.
     */

    this.root = function() { return _table; };

    // initialize the object
    appendAttr(_root, "class", GridStyle.GRID);
    _table = ne("table");
    appendAttr(_table, "class", Style.Widget.CONTENT);
    _table.id = _tabid;
    _root.appendChild(_table);
};
