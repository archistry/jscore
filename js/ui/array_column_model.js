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
// Name:        array_column_model.js
// Created:     Fri Jan 15 10:45:10 GMT 2010
// Split:       Wed Mar 10 11:57:55 GMT 2010
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.ui");

/**
 * @class
 *
 * This class provides a ColumnModel based on using an array
 * of JavaScript objects to define the properties of the
 * particular column.
 * <p>
 * In this case, the properties MUST include:
 * <ul>
 * <li>
 *   key: the key to use when requesting data for this
 *            column from the row model
 * </li>
 * </ul>
 * </p>
 * <p>
 * The object properties MAY include the following keys:
 * <ul>
 * <li>label: a label that should be used for this column</li>
 * <li>renderer: a reference to a JavaScript instance that
 * will be used to render the particular column
 * cell</li>
 * <li>headerRenderer: a reference to a JavaScript instance
 *    that will be used to render the particular column
 *    cell header.  It must implement the following
 *    interface:
 *    <pre>
 *      callback(grid, col, cell)
 *    </pre>
 * </li>
 * <li>editor: a reference to a JavaScript instance that will
 *            be used to edit the particular column cell if the
 *            grid is editable</li>
 * <li>value: a function that will be called with the row to
 *            retrieve the value to be displayed for the column
 *            </li>
 * </ul>
 */

archistry.ui.ArrayColumnModel = function(cols, options)
{
    var _self = this;
    this.mixin(options);

    if(!this.defaultRenderer)
    {
        this.defaultRenderer = new archistry.ui.CellRenderer();
    }

    cols.each(function(i) {
        if(!this.renderer) { this.renderer = _self.defaultRenderer; }
        if(!this.label)
        {
            var s = this.key;
            this.label = s.charAt(0).toUpperCase() + s.slice(1);
        }
        if(!this.style)
        {
            var s = archistry.ui.Styles.Grid.COLUMN_BASE + this.key + " ";
            this.style = s;
        }
        Console.println("Column[{0}]: {1}", i, archistry.core.Util.toHashString(this));
    });

    /**
     * This method is used to access a particular column by
     * index.
     *
     * @param idx the index of the column to retrieve
     *        (relative to the current rendering of the grid)
     * @return the column instance.
     */

    this.col = function(idx) { return cols[idx]; };

    this.length = function() { return cols.length; };

    /**
     * This method calls the callback with a reference to each
     * column definition as the this pointer and the index of
     * the column in the model.
     *
     * @param callback the callback function
     */

    this.each = function(callback)
    {
        for(var i = 0; i < cols.length; ++i)
        {
            callback.apply(cols[i], [ i ]);
        }

        return this;
    };
};
