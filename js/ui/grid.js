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
// Name:		grid.js
// Created:		Fri Jan 15 10:45:10 GMT 2010
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.ui");

/**
 * This object defines the default styles used for the grid
 * as it creates the various control objects.
 */

archistry.ui.GridStyles = {
	GRID				: "aui-grid " + archistry.ui.Styles.Widget.CONTROL,
	CELL				: "aui-grid-cell",
	CELL_SELECTED		: "aui-grid-cell-selected " + archistry.ui.Styles.State.HIGHLIGHT,
	CELL_DIRTY			: "aui-grid-cell-dirty " + archistry.ui.Styles.State.DIRTY,
	ROW					: "aui-grid-row",
	ROW_CONTENT			: "aui-grid-row-data",
	ROW_HEADER			: "aui-grid-header " + archistry.ui.Styles.Widget.HEADER,
	ROW_SELECTED		: "aui-grid-row-selected " + archistry.ui.Styles.State.HIGHLIGHT,
	ROW_DIRTY			: "aui-grid-row-dirty",
	ROW_SENTINAL		: "aui-grid-row-sentinal",
	COLUMN_BASE			: "aui-grid-col-"
};

/**
 * This class represents the default cell renderer behavior.
 */

archistry.ui.DefaultCellRenderer = function()
{
	/**
	 * This method is called by the grid when it needs to
	 * render a particular cell.
	 *
	 * @param grid the control
	 * @param node the row object from the model
	 * @param column the column definition for the cell
	 * @param cell the cell element itself
	 */

	this.render = function(grid, node, column, cell)
	{
		var val = null;
		if(column.value)
		{
			val = column.value(node);
		}
		else
		{
			val = node[column.key];
		}
		cell.innerHTML = val;
	}
};

/**
 * This class represents the cell renderer behavior using
 * checkboxes for boolean values.
 */

archistry.ui.CheckboxCellRenderer = function()
{
	/**
	 * This method is called by the grid when it needs to
	 * render a particular cell.
	 *
	 * @param grid the control
	 * @param node the row object from the model
	 * @param column the column definition for the cell
	 * @param cell the cell element itself
	 */

	this.render = function(grid, node, column, cell)
	{
		var _self = this;
		var val = null;
		if(column.value)
		{
			val = column.value(node);
		}
		else
		{
			val = node[column.key];
		}

		if(val)
		{
			cell.innerHTML = '<input type="checkbox" checked="true"/>';
		}
		else
		{
			cell.innerHTML = '<input type="checkbox"/>';
		}
	}
};

/**
 * This class provides a linear TreeRowModel implementation based on
 * using an array of JavaScript objects.
 *
 * To make this model mutable, supply the constructor with a
 * createRow property that will create a new row in the
 * model.
 *
 * @param data the array containing the data to display
 * @param options the options to initialize the model
 *		Supported values for the options object include:
 *
 *		  keys		- defines an array of keys which are valid
 *					  for the objects in the array
 *		  editable	- by default, the array is considered
 *					  mutable.  If the array objects are not
 *					  to be changed, you MAY set
 *					  options.editable = false, or simply not
 *					  define editors for the columns.
 */

archistry.ui.ArrayRowModel = function(data, options)
{
	var _self = this;
	this.mixin(options);

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

	this.isLeaf = function(node) { return true; };

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
	 *		doesn't exist
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
	 *			keys independent of the column editor
	 *			controls.
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
		for(var i = 0; i < _data.length; ++i)
		{
			s += String.format("_data[{0}] = {1}\n", [i, _data[i].inspect()]);
		}
		return s;
	};
};

/**
 * This class provides a simple adapter for using static
 * objects as a conformant TreeRowModel.  The child nodes are
 * identitfied by the property name supplied as the
 * contstructor which should return an array of child nodes.
 *
 * @param obj the object representing the tree structure
 * @param childKey the child node accessor
 * @param options the options mixed in to the model
 */

archistry.ui.ObjectTreeModel = function(obj, childKey, options)
{
	mixin(archistry.data.TreeUtil);
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
	 *		if no child exists
	 */

	this.child = function(node, idx) { return child(node, childKey, idx); };

	/**
	 * This method does a linear search of the child nodes to
	 * determine the result.
	 *
	 * @param parent the parent node
	 * @param child the child node
	 * @return the index or -1 if the node is not a child of
	 *		the specified parent
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

/**
 * This class provides a ColumnModel based on using an array
 * of JavaScript objects to define the properties of the
 * particular column.
 *
 * In this case, the properties MUST include:
 *
 *   - key: the key to use when requesting data for this
 *			column from the row model
 *
 * The object properties MAY include the following keys:
 *
 *   - label: a label that should be used for this column
 *   - renderer: a reference to a JavaScript instance that
 *			will be used to render the particular column cell
 *	 - headerRenderer: a reference to a JavaScript instance
 *			that will be used to render the particular column
 *			cell header
 *   - editor: a reference to a JavaScript instance that will
 *			be used to edit the particular column cell if the
 *			grid is editable
 *   - value: a function that will be called with the row to
 *			retrieve the value to be displayed for the column
 */

archistry.ui.ArrayColumnModel = function(cols, options)
{
	this.mixin(options);

	if(!this.defaultRenderer)
	{
		this.defaultRenderer = new archistry.ui.DefaultCellRenderer();
	}

	for(var i = 0; i < cols.length; ++i)
	{
		if(!cols[i].renderer) { cols[i].renderer = this.defaultRenderer; }
		if(!cols[i].headerRenderer) { cols[i].renderer = this.defaultRenderer; }
		if(!cols[i].label)
		{
			var s = cols[i].key;
			cols[i].label = s.charAt(0).toUpperCase() + s.slice(1);
		}
		if(!cols[i].style)
		{
			var s = archistry.ui.GridStyles.COLUMN_BASE + cols[i].key + " ";
			cols[i].style = s;
		}
		archistry.ui.Console.println("Column[{0}]: {1}", [ i, cols[i].inspect() ]);
	}

	/**
	 * This method is used to access a particular column by
	 * index.
	 *
	 * @param idx the index of the column to retrieve
	 *		(relative to the current rendering of the grid)
	 * @return the column instance.
	 */

	this.col = function(idx) { return cols[idx]; }

	this.__defineGetter__("length", function() { return cols.length; });
};

/**
 * This class handles notification management for TreeRowModel
 * implementations as a mixin component.  Each of the signals
 * provides the path and the row object that was affected as
 * arguments.
 */

// FIXME:  this needs to be updated!!
archistry.ui.RowModelNotifier = function()
{
	this.include(archistry.core.SignalSource);
	this.validSignals([
		"row-inserted",
		"row-deleted",
		"row-changed"
	]);
};

/**
 * This class implements the default keyboard navigation
 * strategy for the grid control.  The idea is that various
 * strategies can be provided to mimic various types of
 * familar user navigation environments.
 */

archistry.ui.DefaultKeyNavStrategy = function(grid)
{
	mixin(archistry.ui.Helpers);

	var _this = this;

	function findNextCell(cell, forward, down)
	{
		var row = cell.parentNode;
//		println("row: " + row.innerHTML);

		if(forward)
		{
			if(cell.nextSibling)
				return cell.nextSibling;
			else
			{
				var nextRow = row.nextSibling;
				if(nextRow)
				{
					return nextRow.firstChild;
				}
			}
		}
		else
		{
			if(cell.previousSibling)
				return cell.previousSibling;
			else
			{
				var prevRow = row.previousSibling;
				if(prevRow)
				{
					return prevRow.lastChild;
				}
			}
		}
		return null;
	}

	function onKeyDown(event)
	{
		var down = null;
		switch(event.keyCode)
		{
			case 9:		// TAB
				break;
//			case 13:	// ENTER
//				down = !event.shiftKey;
//				break;
			default:
				return true;
		}

		var thisCell = parentWithTag(eventTarget(event), "td");
		var nextCell = findNextCell(thisCell, !event.shiftKey, down)
//		println(nextCell.tagName + ": " + nextCell.innerHTML);
		if(nextCell)
		{
			var row = parseInt(nextCell.getAttribute("row"));
			var col = parseInt(nextCell.getAttribute("col"));
			while(!grid.isCellEditable(row, col))
			{
//				println("<<<< Cell({0}, {1}) is not editable", [row, col]);
				nextCell = findNextCell(nextCell, !event.shiftKey, down)
				if(!nextCell)
					return true;

				row = parseInt(nextCell.getAttribute("row"));
				col = parseInt(nextCell.getAttribute("col"));
			}
			if(grid.completeEditing())
			{
				grid.editCell(row, col);
			}
			return false;
		}

		return true;
	}

	/**
	 * This is the public API that is used to notify the key
	 * navigation strategy that a new cell has been added to
	 * the grid.
	 *
	 * @param cell the cell element
	 */

	this.onCellAdded = function(cell)
	{
//		cell.onkeydown = onKeyDown;
		cell.addEventListener("keydown", onKeyDown, true);
	};
};

/**
 * This class represents a row reference in the layout.  It is
 * used to encapsulate any particular accessors (and crazy API
 * calls) required for the specific layout implementation's
 * concept of rows and columns.
 *
 * @param layout a reference to the containing layout
 * @param row an opaque reference to the actual layout row
 *		element
 * @param cols an array of opaque references to the actual
 *		layout column elements
 */

archistry.ui.GridLayoutRow = function(layout, row, cols)
{
	this.layout = layout;
	this.row = row;
	this.cell = cols;
};

/**
 * This class creates a grid using the default browser layout
 * behavior.  Rendering performance is based on the browser
 * and no additional optimizations are provided.
 *
 * @param id the element ID of the grid's containing div
 */

archistry.ui.BrowserGridLayout = function(id)
{
	mixin(archistry.data.TreeUtil);
	mixin(archistry.ui.Helpers);

	var GridLayoutRow = archistry.ui.GridLayoutRow;
	var Style = archistry.ui.Styles;
	var GridStyle = archistry.ui.GridStyles;

	var _self = this;
	var _tabid = "ag-table-" + id;
	var _root = e(id);
	var _table = null;

	/**
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
		return _table.rows[mapIndex(row, _table.rows.length)];
	}

	/**
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
	 * This method is used to create a single row with the
	 * specified number of columns and return a GridLayoutRow
	 * reference.
	 */

	function insertRow(index, cols)
	{
		var ri = mapIndex(index, _table.rows.length);
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
		var ref = new GridLayoutRow(_self, row(idx));
		ref.cell = ref.row.cells;
        return ref;
    };

	/**
	 * This method is used to insert a new colum into the
	 * table FOR ALL ROWS.  Rendering/update of the rows will
	 * be taken care of by the grid
	 *
	 * @param colIdx the insert index
	 * @param before (optional) if true, indicates that the
	 *		column should be inserted before the given index.
	 *		The default is false, so insertions happen after
	 *		the specified index.  Like the row references,
	 *		negative indices indicate insertion from the end.
	 */

	this.insertColumn = function(colIdx, before)
	{
		var ci = mapIndex(colIdx, cols());
		if(before)
		{
			ci--;
		}
		for(var i = 0; i < _table.rows.length; ++i)
		{
			_table.rows[i].insertCell(ci);
		}
	}

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
	 *		created
	 */

	this.insertRows = function(idx, cols, count)
	{
		var rval = [];
		for(var i = 0; i < count; ++i)
		{
			rval.add(insertRow(idx + i, cols));
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
		var di = mapIndex(idx);
		for(var i = 0; i < count; ++i)
		{
			_table.deleteRow(di + i);
		}
	};

	/**
	 * This method is used to delete the specific column from
	 * the table.
	 *
	 * NOTE:  if you are only interested in showing/hiding
	 * columns, you should do this with CSS and not do it by
	 * adding/removing the whole column!
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

	// initialize the object
	appendAttr(_root, "class", GridStyle.GRID);
	_table = ne("table");
	appendAttr(_table, "class", Style.Widget.CONTENT);
	_table.id = _tabid;
	_root.appendChild(_table);
};

/**
 * This class implements a TreeGrid control that is similar in
 * many respects to the GtkTreeView and XUL Tree controls.
 * However, it blends a few of these APIs together to
 * implement a multi-column tree.
 *
 * Tree paths are represented as arrays with integer offsets
 * relative to the parent, e.g.
 *
 * Given the path:
 *
 *   [ 0, 3, 2 ]
 *
 * and the tree:
 *
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
 *
 * represents the following path:
 *
 *  /c0/c0c3/c0c3c2
 *
 * To indicate the root of the tree, an empty array should be
 * used.
 *
 * @param id the element ID where the grid should be located
 * @param columns the column model to be used for the
 *		control
 * @param data the row model to be used.
 * @param options any confiruation options to be specified for
 *		the grid
 */

archistry.ui.TreeGrid = function(id, columns, data, options)
{
	var _self = this;
	var _selection = [];

	mixin(archistry.data.TreeUtil);
	mixin(archistry.ui.Styles);
	mixin(archistry.ui.Helpers);
	this.mixin(options);
	
	var CheckboxCellRenderer = archistry.ui.CheckboxCellRenderer;
	var GridStyle = archistry.ui.GridStyles;
	var Style = archistry.ui.Styles;

	if(!this.layout)
	{
		this.layout = new archistry.ui.BrowserGridLayout(id);
	}

	if(!this.nav)
	{
		this.nav = new archistry.ui.DefaultKeyNavStrategy(_self);
	}

	if(this.showRoot === undefined)
	{
		this.showRoot = false;
	}

	if(this.showExpanders === undefined)
	{
		this.showExpanders = true;
	}

	////// DEFINE INTERNAL API SHARED/CALLED BY TREEROW //////
	
	/**
	 * This method is used to force rendering of the given
	 * TreeRow reference.
	 *
	 * @param row the TreeRow reference of the row to be
	 *		rendered
	 */

	function renderRow(row)
	{
		for(var i = 0; i < _allCols.length; ++i)
		{
			var col = _allCols[i];
			var cell = row.cell(i);
			col.renderer.render(_self, row, col, cell);
			if(row.dirty)
			{
				appendAttr(cell, "class", GridStyle.CELL_DIRTY);
			}
			else
			{
				removeAttr(cell, "class", GridStyle.CELL_DIRTY);
			}
		}

		var cell = row.cell(0);
		if(_self.showSelectorColumn)
		{
			cell = row.cell(1);
		}
		
		// FIXME:  need a better way to do this!
		var span = ne("span");
//		println("showExpanders: " + _self.showExpanders);
		if(_self.showExpanders)
		{
			span.setAttribute("class", "ui-icon");
			appendAttr(cell, "class", "ui-icon-left");
		}
		if(!row.isLeaf())
		{
			appendAttr(cell, "class", "aui-grid-parent-node");
			if(_self.showExpanders)
			{
				if(row.expanded())
				{
					appendAttr(span, "class", "aui-grid-expander aui-grid-expander-open");
				}
				else
				{
					appendAttr(span, "class", "aui-grid-expander aui-grid-expander-closed");
				}
				span.onclick = function(event) {
//					println("key: {0}; rowCount: {1}", [ row.key, row.rowCount() ]);
					if(row.expanded())
					{
						collapse(row);
					}
					else
					{
						expand(row);
					}
				};
			}
		}
		else
		{
			appendAttr(cell, "class", "aui-grid-child-node");
			if(_self.showExpanders)
			{
				appendAttr(span, "class", "ui-icon-none");
			}
		}
		var width = ewidth(span, true);
		var depth = row.depth();
		var d = depth;
		if(!_self.showRoot)
		{
			d = (d > 0) ? d - 1 : 0;
		}
//		println("width: {0}; d: {1}; width * d: {2}", [ width, d, width * d]);
		span.setAttribute("style", String.format("margin-left: {0}px;", [width * d ]));

		cell.insertBefore(span, cell.firstChild);
	}

	/**
	 * This is an internal class that is used to wrap the row
	 * references returned from the layout.
	 *
	 * @param layoutRow a row from the layout
	 * @param modelNode a node from the data model
	 */

	function TreeRow(layoutRow, modelNode)
	{
		mixin(archistry.data.TreeUtil);
//		mixin(layoutRow)

		if(layoutRow)
		{
			var cell = layoutRow.cell;
			var row = layoutRow.row;
		}
		var _me = this;
		var _childKey = "__atg_children";
		var _selected = false;
		var _expanded = false;
		var _sentinal = false;
		var _dirty = false;
		var _parent = null;
		var _children = [];

		/**
		 * This method is used to retrieve the actual column
		 * index relative to all the available columns.
		 */

		function colIndex(idx)
		{
			return mapIndex(idx, _allCols.length);
		}

		/**
		 * This method is used to retrieve the actual child
		 * index based on the current child nodes.
		 */

		function childIndex(idx)
		{
			return mapIndex(idx, _children.length);
		}

		this.__defineGetter__("__atg_children", function()
		{
			return _children;
		});

		// Ok, so this is a bit of a hack, but I can't do
		// crazy things with accessors, and I don't want to
		// totally screw up the API...
		this.mixin(modelNode)

		this.__defineSetter__("__atg_selected", function(val)
		{
			_selected = val;
			if(val)
			{
				_selection.add(_me);
//				removeAttr(row, "class", Style.State.DEFAULT);
				appendAttr(row, "class", GridStyle.ROW_SELECTED);
			}
			else
			{
				removeAttr(row, "class", GridStyle.ROW_SELECTED);
//				appendAttr(row, "class", Style.State.DEFAULT);
				_selection.remove(_me);
			}
			renderRow(_me);
		});

		this.__defineGetter__("__atg_selected", function() { return _selected; });

		/**
		 * This method returns true if the node has no
		 * children.
		 */

		this.isLeaf = function() { return data.isLeaf(modelNode); };

		/**
		 * This method is used to retrieve the i-th cell in
		 * the layout row.
		 *
		 * @param idx the column index
		 * @return the layoutRow cell
		 */

		this.cell = function(idx)
		{
			return cell[colIndex(idx)];
		};

		/**
		 * This method is used to add a new child node at the
		 * specified index.
		 *
		 * @param idx the index for the new child
		 * @param child the new child node
		 * @return the added child node
		 */

		this.addChild = function(idx, child)
		{
			_children[childIndex(idx)] = child;
			child.parent(_me);
			return child;
		};

		/**
		 * This method is used to retrieve the number of
		 * children for the node.
		 */

		this.childCount = function() { return data.childCount(modelNode); };

		/**
		 * This method returns the index of the specified
		 * child.
		 */

		this.indexOfChild = function(node)
		{
			return indexOfChild(_me, _childKey, node);
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
			var expander = cell[0].firstChild;
			if(_self.showSelectorColumn)
			{
				println("Using column 2 for the expander!");
				expander = cell[1].firstChild;
			}
			if(!val)
			{
				removeAttr(expander, "class", "aui-grid-expander-open");
				appendAttr(expander, "class", "aui-grid-expander-closed");
			}
			else
			{
				removeAttr(expander, "class", "aui-grid-expander-closed");
				appendAttr(expander, "class", "aui-grid-expander-open");
			}
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

		this.row = function() { return row; };

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
			return visitParents(_me, "parent");
		};

		/**
		 * This method is used to calculate the exact layout
		 * row index of this node based on walking upwards in
		 * the tree.
		 */

		this.rowIndex = function()
		{
			// FIXME:  this does a linear search because
			// there's just not a good way that I know to
			// track this without a lot of extra overhead...
			return _self.layout.indexOfRow(row);
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

			for(var i = 0; i < _children.length; ++i)
			{
				rows += _children[i].rowCount();
			}

			return rows;
		};

		///////// EVENT REGISTRATION ////////
		row.onclick = function(event)
		{
			_me.__atg_selected = !_selected;
		}
	}

	/**
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

	var _root = null;
	var _cols = [];
	var _allCols = [];
	var _colsByKey = {};

	if(this.showSelectorColumn)
	{
		_allCols = [ new TreeColumn({ key: "__atg_selected", renderer: new CheckboxCellRenderer(), style: "aui-grid-col-selector ui-widget-header" })];
	}

	// load the column definitions
	for(var i = 0; i < columns.length; ++i)
	{
		var c = new TreeColumn(columns.col(i));
		_cols.add(c);
		_colsByKey[c.key] = _allCols.length;
		_allCols.add(c);
	}

	/**
	 * This function returns the column for the specified
	 * index, accounting for hidden columns.
	 *
	 * @param index the column index
	 */

	function col(index)
	{
		var ci = mapIndex(index, _cols.length);
		return _cols[ci];
	}

	/**
	 * This function indicates whether the column is editable
	 * or not
	 *
	 * @param col the column reference to check
	 * @return true or false
	 */

	function colEditable(col)
	{
		if(!data.editable || !col.editor)
			return false;

		return true;
	}

	/**
	 * This method is used to build a particular tree row
	 *
	 * @param treerow the object to render
	 */

	function buildRow(treerow)
	{
		appendAttr(treerow.row(), "class", GridStyle.ROW);
		for(var i = 0; i < _allCols.length; ++i)
		{
			var col = _allCols[i];
			var cell = treerow.cell(i);
			var style = [ GridStyle.CELL, col.style ];
			cell.setAttribute("class", style.join(" "));

//			println("treerow.isLeaf() {0}; depth: {1}", 
//					[ treerow.isLeaf(), treerow.depth() ]);

			if(colEditable(col))
			{
				bindEdit(cell, onStartCellEdit);
			}
			_self.nav.onCellAdded(cell);
		}
		renderRow(treerow);
	}

	/**
	 * This method is used to expand the specified
	 * node and update the layout accordingly.
	 *
	 * @param node the TreeRow reference
	 * @param row the row index of the layout of the node to
	 *		be expanded
	 */

	function expand(node, row)
	{
		var i = 0;
		if(!node.expanded() && node.__atg_children.length > 0)
		{
			visitChildren(node, "__atg_children", function(parent, node, idx) {
//				println("Expanding node: {0}.child[{1}]: {2}", [ parent.key, idx, node.key ]);
				removeAttr(node.row(), "class", Style.Layout.HIDDEN);
				return true;
			});
			node.expanded(true);
			return;
		}

		if(!row)
		{
			row = node.rowIndex();
		}
		var count = data.childCount(node.data());
		var rows = _self.layout.insertRows(row + 1, _allCols.length, count);
		// clear any references from before
		node.clearChildren();
		for(i = 0; i < count; ++i)
		{
			buildRow( node.addChild(i, 
				new TreeRow(rows[i], data.child(node.data(), i))));
		}

		node.expanded(true);
	}

	/**
	 * This method is used to "collapse" the node.  However,
	 * we don't really remove them from the layout, we just
	 * hide them temporarily figuring that we'll need them
	 * later.
	 *
	 * @param node the node to collapse
	 */

	function collapse(node)
	{
		visitChildren(node, "__atg_children", function(parent, node, idx) {
//			println("Collapsing node: {0}.child[{1}]: {2}", [ parent.key, idx, node.key ]);
			if(parent.expanded())
			{
				appendAttr(node.row(), "class", Style.Layout.HIDDEN);
				return true;
			}
			return false;
		});
		node.expanded(false);
	}

	/**
	 * This helper function will return a NodeInfo object with
	 * node property being the actual TreeRow node reference
	 * and the index value being the physical layout row
	 * index.
	 *
	 * @param path the path
	 * @param xpand (optional) if true, the path will be
	 *		expanded in the process of traversal to locate the
	 *		specified node
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
//			println("Processing path {0}", [ path[i] ]);
			var pi = mapIndex(path[i], node.childLength());
//			println("Processing path {0} ({1})", [ path[i], pi ]);
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
						expand(n, row);
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
	 * This method is used to programmatically delete the row
	 * with the given path.
	 *
	 * @param path the path to the row to be deleted
	 */

	this.deleteRow = function(path)
	{
		if(!data.editable)
			return;
		
		var info = getNodeInfo(path);
		if(!info.node)
		{
			return;
		}

		if(info.index > -1)
		{
			// the row's visible, so we need to delete it from
			// the layout.
			_self.layout.deleteRows(info.index, 1);
		}

		// delete the value from the model
		data.deleteChild(info.node.parent().data(), info.node.data());
	};

	/**
	 * This method is used to trigger cell editing on the
	 * target path and column index.  Normally, this method
	 * will only be triggered for keyboard navigation/editing.
	 *
	 * @param path the path to the row object to edit
	 * @param col the column index to edit
	 */

	this.editCell = function(path, col)
	{
		kol = col(col);
		if(!data.editable || !kol.editor)
			return;

		// make sure the path is expanded
		var info = getNodeInfo(path, true);
		if(!info.node)
			throw new Error("Path error:  no row for the specified path " + path.inspect());
		
		setTimeout(function() {
			_self.editing = info;
			kol.editor.startEditing(_self, 
					info.node.data(),
					kol.key,
					info.node.cell(_colsByKey[kol.key]),
				{ path: path, col: kol });
		}, 50);
	};

	/**
	 * This method is used to programmatically insert a new
	 * row at the specified path.  In order for this method to
	 * work, the data model MUST provide a
	 * #createChild(parent, index) method that will allocate
	 * the row in the correct location.
	 *
	 * @param path the insertion point.  The last path
	 *		component represents the desired location of the
	 *		node in relation to the parent.
	 */

	this.insertRow = function(path)
	{
		if(!data.createChild)
			return;

		var ppath = path.slice(0, (path.length == 1 ? 1 : path.length - 1));
		var idx = path[path.length];
		var info = getNodeInfo(ppath, true);
		if(!info.node)
			return;

		var obj = data.createChild(info.node.data(), idx);
		var lrows = _self.layout.insertRows(info.index, _allCols.length, 1);
		buildRow(info.node.addChild(idx, new TreeRow(lrows[0], obj)));
	};

	/**
	 * This method returns true or false depending on whether
	 * the cell is editable or not.
	 *
	 * @param path the path to the row
	 * @param colIdx the column index of the cell
	 * @return true or false
	 */

	this.isCellEditable = function(path, colIdx)
	{
		return colEditable(col(colIdx));
	};

	/**
	 * This method is used to select or unselect the specified
	 * path.  The path will be shown if it is not currently
	 * visible.
	 *
	 * @param path the path location or null to clear the
	 *		selection.
	 * @param selected (optional) true or false to control
	 *		selection state
	 */

	this.selectPath = function(path, colIdx, selected)
	{
		// FIXME:  selecting cells is not currently supported
		if(!path)
		{
			for(var i = 0; i < _selection.length; ++i)
			{
				_selection[i].selected = false;
				render(_selection[i]);
			}
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
	
		info.node.__atg_selected = sel;
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
	 *		to the row index being edited and the column definition
	 *		of the editing column
	 */

	this.editingCancelled = function(context)
	{
		_self.editing = null;
		_self.renderCell(context.rowIndex, context.col);
	};

	/**
	 * This method is called from cell editors when they have
	 * completed editing the current cell.
	 *
	 * @param context the context object contains a reference
	 *		to the row index being edited and the column definition
	 *		of the editing column
	 */

	this.editingCompleted = function(context)
	{
		var row = data.row(context.rowIndex);
		var old = row[context.col.key];
		var newVal = context.col.editor.value();
		var dirty = false;

		if(old != newVal)
		{
			row[context.col.key] = newVal;
			dirty = true;
			if(_self.changeSet)
			{
				_self.changeSet.add(new archistry.data.ChangeMemento(row,
							archistry.data.ChangeOp.PROPERTY_CHANGED,
							context.col.key, old));
			}
		}
		_self.editing = null;
		_self.renderCell(context.rowIndex, context.col, dirty);
	};

	// FIXME:  show/hide/reorder of columns is not yet
	// implemented

	if(this.showRoot)
	{
		var rrow = _self.layout.insertRows(0, _allCols.length, 1);
		_root = new TreeRow(rrow[0], data.root);
		buildRow(_root);
	}
	else
	{
		_root = new TreeRow(null, data.root);
		expand(_root);
	}
};
