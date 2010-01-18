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
	GRID				: "aui-grid",
	CELL				: "aui-grid-cell",
	CELL_SELECTED		: "aui-grid-cell-selected",
	CELL_DIRTY			: "aui-grid-cell-dirty",
	ROW					: "aui-grid-row",
	ROW_HEADER			: "aui-grid-header",
	ROW_SELECTED		: "aui-grid-row-selected",
	ROW_DIRTY			: "aui-grid-row-dirty",
	ROW_SENTINAL		: "aui-grid-row-sentinal",
	COLUMN_BASE			: "aui-grid-col-"
};

/**
 * While it's hardly jQuery, here are some helper methods that
 * can be mixed in to various classes without introducing a
 * jQuery dependency in the core UI framework.
 */

archistry.ui.Helpers = {
	/**
	 * This is a very simple wrapper for locating elements by
	 * ID (and only by ID).
	 *
	 * @param id the element's ID to locate
	 * @return the element or null if not found
	 */

	e: function(id)
	{
		return document.getElementById(id);
	},

	/**
	 * This method is used to create a new element of the
	 * specified name.
	 *
	 * @param elt the element name to create
	 * @return the new element reference
	 */

	ne: function(elt)
	{
		return document.createElement(elt);
	},

    /**
     * Shorter version of getElementsByTagName
     *
     * @param elt the start element
     * @param tag the tag name
     * @returns array of all child elements with the tag name
     */

    etn: function(elt, tag)
    {
        return elt.getElementsByTagName(tag);
    },

	/**
	 * This method is used to disable selection on the
	 * specific element.  It is similar to what's implemented
	 * in jQuery UI, but slightly different in the
	 * implementation.  It is based on several different code
	 * snippets found on the Web.
	 *
	 * @param elt the element to not be selected
	 * @return a reference to the element for call chaining
	 */

	disableSelect: function(elt)
	{
		elt.setAttribute("unselectable", "on");
		elt.style.MozUserSelect = "none";
		elt.style.cursor = "default";
		elt.onselectstart = function() { return false; }
		return elt;
	},

	/**
	 * This method of code was lifted (more or less) directly
	 * from quirksmode.org and is used to determine the target
	 * of the specified event.
	 *
	 * @param event the event instance
	 * @return the target element for the event
	 */

	eventTarget: function(event)
	{
		var targ = null;
		if(!event)
			event = window.event;

		if(!event)
			return null;

		if(event.target)
		{
			targ = event.target;
		}
		else if(event.srcElement)
		{
			targ = event.srcElement;
		}
		if(targ.nodeType == 3)
		{
			targ = targ.parentNode;
		}
		return targ;
	},

	/**
	 * This function was lifted from Robert Nyman at
	 * http://robertnyman.com/2006/04/24/get-the-rendered-style-of-an-element/
	 */

	getStyle: function(oElm, strCssRule){
		var strValue = "";
		if(document.defaultView && document.defaultView.getComputedStyle){
			strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
		}
		else if(oElm.currentStyle){
			strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){
				return p1.toUpperCase();
			});
			strValue = oElm.currentStyle[strCssRule];
		}
		return strValue;
	},

	/**
	 * This method finds the first parent element from the
	 * start element with the specified tag.
	 *
	 * @param start the start element
	 * @param tag the tag of the element to find
	 * @return the element or null if not found
	 */

	parentWithTag: function(start, tag)
	{
		var t = tag.toUpperCase();
		var p = start;
		while(p.tagName != t && p != document)
		{
			p = p.parentNode;
		}

		return p;
	}
};

/**
 * This class represents the default cell renderer behavior.
 */

archistry.ui.DefaultGridCellRenderer = function()
{
	/**
	 * This method is called by the grid when it needs to
	 * render a particular cell.
	 *
	 * @param grid the control
	 * @param rowIdx the index of the current row
	 * @param row the row object from the model
	 * @param column the column definition for the cell
	 * @param cell the cell element itself
	 */

	this.render = function(grid, rowIdx, row, column, cell)
	{
		cell.innerHTML = row[column.key];
	}
};

/**
 * This class provides a RowModel implementation based on
 * using an array of JavaScript objects.
 *
 * To make this model mutable, supply the constructor with a
 * createRow property that will create a new row in the
 * model.
 *
 * @param data the array containing the data to display
 * @param options the options to initialize the model
 */

archistry.ui.ArrayRowModel = function(data, options)
{
	var _data = data;
	if(options) { this.include(options); }

	/**
	 * This method provides an indexer for retrieving the
	 * current row.
	 */

	this.row = function(idx) { return _data[idx]; };

	/**
	 * This method is used to ensure the range given has been
	 * loaded and return the number of rows actually available
	 * in that range.
	 *
	 * @param startIdx the start index offset
	 * @param count the number of rows requested
	 * @return the number of rows actually available
	 */

	this.ensureRange = function(startIdx, count)
	{
		return ( (startIdx + count) < _data.length ? count : _data.length - startIdx);
	};

	this.dump = function()
	{
		var s = "";
		for(var i = 0; i < _data.length; ++i)
		{
			s += String.format("_data[{0}] = {1}\n", [i, _data[i].inspect()]);
		}
		return s;
	}
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
 *   - editor: a reference to a JavaScript instance that will
 *			be used to edit the particular column cell if the
 *			grid is editable
 */

archistry.ui.ArrayColumnModel = function(cols, options)
{
	var _cols = cols;
	if(options) { this.include(options); }

	if(!this.defaultRenderer)
	{
		this.defaultRenderer = new archistry.ui.DefaultGridCellRenderer();
	}

	for(var i = 0; i < _cols.length; ++i)
	{
		if(!_cols[i].renderer) { _cols[i].renderer = this.defaultRenderer; }
		if(!_cols[i].headerRenderer) { _cols[i].renderer = this.defaultRenderer; }
		if(!_cols[i].label)
		{
			var s = _cols[i].key;
			_cols[i].label = s.charAt(0).toUpperCase() + s.slice(1);
		}
		if(!_cols[i].style)
		{
			var s = archistry.ui.GridStyles.COLUMN_BASE + _cols[i].key + " ";
			_cols[i].style = s;
		}
	}

	/**
	 * This method is used to access a particular column by
	 * index.
	 *
	 * @param idx the index of the column to retrieve
	 *		(relative to the current rendering of the grid)
	 * @return the column instance.
	 */

	this.col = function(idx) { return _cols[idx]; }

	this.__defineGetter__("length", function() { return _cols.length; });
};

/**
 * This class implements the default keyboard navigation
 * strategy for the grid control.  The idea is that various
 * strategies can be provided to mimic various types of
 * familar user navigation environments.
 */

archistry.ui.DefaultKeyNavStrategy = function(grid)
{
	include(archistry.ui.Helpers);

	var _this = this;
	var _grid = grid;

	function findNextCell(cell, forward, down)
	{
		var row = cell.parentNode;
		println("row: " + row.innerHTML);

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
		println(nextCell.tagName + ": " + nextCell.innerHTML);
		if(nextCell)
		{
			var row = parseInt(nextCell.getAttribute("row"));
			var col = parseInt(nextCell.getAttribute("col"));
			if(_grid.completeEditing())
			{
				_grid.editCell(row, col);
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
 * This class creates a grid using the default browser layout
 * behavior.  Rendering performance is based on the browser
 * and no additional optimizations are provided.
 *
 * @param grid the grid control
 */

archistry.ui.BrowserGridLayout = function(id, grid)
{
	include(archistry.ui.Helpers);

	var _tabid = "ag-table-" + id;
	var _that = this;
	var _root = e(id);
	var _grid = grid;
	var _table = null;
    var _columns = {};
	var _datarows = 0;
	var _sentinal = null;

    /**
     * This method takes care of returning the proper table
     * row index for the given data row offset.
     *
     * @param the index into the data rows
     * @return the actual table row index
     */

    function dataRowIndex(index)
    {
        return (_grid.showHeader ? index + 1: index);
    }

	function newRow(index)
	{
		if(!index)
		{
			index = _table.rows.length;
		}
		else if(index == -1)
		{
			index = ( _sentinal ? _table.rows.length - 1 : _table.rows.length );
		}
		else if(index && _grid.showHeader)
		{
			index += 1;
		}

		println("actual row insert point is: {0}", [ index ]);
		var row = _table.insertRow(index);
		row.setAttribute("class", _grid.styleClass.ROW);
		return row;
	}

	/**
	 * This method is used to render the table column headers.
	 */

	function renderHeaders()
	{
		var row = newRow();
		appendAttr(row, "class", _grid.styleClass.ROW_HEADER);
		for(var i = 0; i< _grid.columnModel.length; ++i)
		{
			var col = _grid.columnModel.col(i);
			var cell = ne("th");
			var style = [ _grid.styleClass.CELL, col.style ].join(" ");
			cell.setAttribute("class", style);
			disableSelect(cell);

			// FIXME: defer to the renderer
			cell.innerHTML = _grid.columnModel.col(i).label;
			row.appendChild(cell);
		}
	}

	/**
	 * This method is used to render the contents of the table
	 * from the data model.
	 */

	function renderBody()
	{
		var rowIdx = 0;
		var count = _grid.data.ensureRange(rowIdx, _grid.chunkSize);
		for(var i = 0; i < count; ++i)
		{
			var idx = rowIdx + i;
			renderRow(idx, _grid.data.row(idx));
		}
	}

	function bindEdit(cell, func)
	{
		var signal = (_grid.clicksToEdit == 2 ? "dblclick" : "click");
		cell.addEventListener(signal, func, true);
	}

	/**
	 * This method is used to render an individual data row in
	 * the table.
	 */

	function renderRow(idx, data)
	{
		var row = newRow(idx);
		// FIXME:  this check should be made cleaner--and in
		// one place!!!!
		if(idx == -1)
		{
			idx = _datarows;
		}

		println("rendering row using idx: {0} (data: {1})", [ idx, data.inspect() ]);
		for(var i = 0; i < _grid.columnModel.length; ++i)
		{
			var col = _grid.columnModel.col(i);
			var cell = row.insertCell(i);
			var style = [ _grid.styleClass.CELL, col.style ].join(" ");
			cell.setAttribute("class", style);
			cell.setAttribute("row", idx);
			cell.setAttribute("col", i);
			col.renderer.render(_grid, idx, data, col, cell);
			if(_grid.editable && col.editable !== false && col.editor !== null)
			{
				bindEdit(cell, _grid.onStartCellEdit);
			}
			_grid.nav.onCellAdded(cell);
		}
		_datarows += 1;
	}

	/**
	 * This method is used to add a "sentinal" row to the
	 * bottom of the table that can be used to create new
	 * values in the model.
	 */

	function addSentinal()
	{
		var row = newRow();
		var trigger = false;
		appendAttr(row, "class", _grid.styleClass.ROW_SENTINAL);

		for(var i = 0; i < _grid.columnModel.length; ++i)
		{
			var col = _grid.columnModel.col(i);
			var cell = row.insertCell(i);
			var style = [ _grid.styleClass.CELL, col.style ].join(" ");
			cell.setAttribute("class", style);
			cell.setAttribute("row", _datarows);
			cell.setAttribute("col", i);
			if(!trigger && col.editable !== false && col.editor !== null)
			{
				if(_grid.sentinalRowText)
				{
					cell.innerHTML = _grid.sentinalRowText;
				}
				else
				{
					cell.innerHTML = "Edit to add a new row";
				}
				bindEdit(cell, _grid.onCreateNewRow);
				trigger = true;
			}
			_grid.nav.onCellAdded(cell);
		}
		_sentinal = row;
	};

	/**
	 * This method is used to update the sentinal row values
	 * as rows are added or deleted from the table.
	 */

	function updateSentinal()
	{
		if(_sentinal)
		{
			var cells = etn(_sentinal, "td");
			for(var i = 0; i < cells.length; ++i)
			{
				cells[i].setAttribute("row", _datarows);
			}
		}
	}

	/**
	 * This method is used to update all of the row values
	 * that are currently displayed in the table after rows
	 * have been added, deleted or reordered.
	 */

	function updateRows(start, end)
	{
		println("\nupdateRows({0}, {1})", [ start, end ]);
		if(dataRowIndex(start) >= _table.rows.length)
			return;
		
		if(end == -1)
			end = _table.rows.length - 1;

		for(var i = start; i < end; ++i)
		{
			var row = _table.rows[dataRowIndex(i)];
			println("updating row using idx: {0} (data: {1})", [ i, row.innerHTML ]);
			var cells = etn(row, "td");
			for(var j = 0; j < cells.length; ++j)
			{
				cells[j].setAttribute("row", i);
			}

			println("updated row: " + row.innerHTML);
		}
	}

	/**
	 * This method is used to build the initial table and
	 * apply the appropriate CSS styles to the table.
	 */

	function init()
	{
		appendAttr(_root, "class", _grid.styleClass.GRID);
		_table = ne("table");
		_table.id = _tabid;
		_datarows = 0;
        
        for(var i = 0; i < _grid.columnModel.length; ++i)
        {
            var col = _grid.columnModel.col(i);
            _columns[col.key] = { index: i, colDef: col };
        }

		if(_grid.showHeader)
			renderHeaders();

		renderBody();

		if(_grid.editable && _grid.showSentinalRow && _grid.data.createRow)
		{
			addSentinal();
		}
		_root.appendChild(_table);
	}

    /**
     * This method returns the reference for the particular
     * cell for the given rowIndex and column definition.
     */
    
    this.cell = function(rowIndex, col)
    {
        var cells = etn(this.row(rowIndex), "td");
        return cells[_columns[col.key].index];
    };

    /**
     * This method returns a reference to the referenced row
     */

    this.row = function(rowIndex)
    {
        return _table.rows[dataRowIndex(rowIndex)];
    };

	/**
	 * This method is used to insert a new row into the
	 * layout.
	 *
	 * @param idx the index into the data model
	 * @param data the data to be displayed
	 * @return the actual location where the row was inserted
	 */

	this.insertRow = function(idx, data)
	{
		renderRow(idx, data);
		if(idx == -1)
		{
			idx = _datarows - 1;
		}
		updateRows(idx + 1, -1);
		
		return idx;
	};

	/**
	 * This method is used to determine if the specified index
	 * represents the sentinal row.
	 * 
	 * @param idx the data row index
	 */

	this.isSentinalRow = function(idx)
	{
		// FIXME:  this is a cheat that I'm not sure is right!
		return idx == _datarows;
	};

	init();
};

/**
 * This class represents a grid control for displaying tabular
 * data.  In its simplest form, it is just a wrapper for
 * creating a normal HTML table from a JavaScript data model.
 *
 * @param id the element ID where the grid should be located
 * @param options any confiruation options to be specified for
 *		the grid
 */

archistry.ui.Grid = function(id, columnModel, rowModel, options)
{
	var _self = this;
	this.styleClass = archistry.ui.GridStyles;
	this.include(options);
	this.chunkSize = 20;
	this.columnModel = columnModel;
	this.data = rowModel;

	////// Cell Rendering/Editing API //////
	
	/**
	 * This method is called to render the specific cell
	 * identified by the rowIndex and column definition.
	 *
	 * @param rowIndex the row index of the cell
	 * @param col the column definition of the cell
	 * @param dirty if true then the cell should be rendered
	 *      as "dirty" according to the CSS style rules.
	 */

	this.renderCell = function(rowIndex, col, dirty)
	{
		var cell = this.layout.cell(rowIndex, col);
		var row = this.layout.row(rowIndex);

		if(dirty)
		{
			appendAttr(cell, "class", this.styleClass.CELL_DIRTY);
			appendAttr(row, "class", this.styleClass.ROW_DIRTY);
		}
		col.renderer.render(this, rowIndex, this.data.row(rowIndex),
							col, cell);
	};
	
	/**
	 * This method is called from cell editors when the user
	 * cancels the edit.
	 *
	 * @param rowIndex the row index being edited
	 * @param col the column definition of the editing column
	 */

	this.editingCancelled = function(rowIndex, col)
	{
		this.editing = null;
		this.renderCell(rowIndex, col);
	};

	/**
	 * This method is called from cell editors when they have
	 * completed editing the current cell.
	 *
	 * @param rowIndex the row index being edited
	 * @param col the column definition of the editing column
	 */

	this.editingCompleted = function(rowIndex, col)
	{
		var row = this.data.row(rowIndex);
		var old = row[col.key];
		var newVal = col.editor.value();
		var dirty = false;

		if(old != newVal)
		{
			row[col.key] = newVal;
			dirty = true;
		}
		this.editing = null;
		this.renderCell(rowIndex, col, dirty);
	};

	/**
	 * This method is used to start editing a cell based on
	 * the row and column indices.
	 *
	 * @param row the integer row index
	 * @param col the integer column index
	 */

	this.editCell = function(row, col)
	{
		if(_self.editing)
		{
			return;
		}

		if(_self.layout.isSentinalRow(row))
		{
			this.appendNewRow();
			return;
		}

		println("start edit for: ({0}, {1})", [row, col]);
		var cdef = _self.columnModel.col(col);
		var data = _self.data.row(row);
//		println("_self.data: {0}", [ _self.data.dump() ]);
//		println("data: {0}", [ data.inspect() ]);
		var cell = _self.layout.cell(row, cdef);

		if(cdef.editor)
		{
			setTimeout(function() {
				_self.editing = cdef;
				cdef.editor.startEditing(_self, row, data, cdef, cell);
			}, 50);
		}
		else
		{
			alert("No editor defined");
		}
	};

	/**
	 * This method is called to start editing the target cell
	 * from an event
	 *
	 * @param event the event
	 */

	this.onStartCellEdit = function(event)
	{
		var cell = parentWithTag(eventTarget(event), "td");
		var col = parseInt(cell.getAttribute("col"));
		var row = parseInt(cell.getAttribute("row"));

		event.stopPropagation();
		event.preventDefault();
		_self.editCell(row, col);
		return false;
	};

	/**
	 * This method is used to ensure the edit of the current
	 * cell has been completed.
	 */

	this.completeEditing = function()
	{
		if(this.editing)
		{
			var val = this.editing.editor.completeEditing();
			if(val)
			{
				this.editing = false;
				return val;
			}
		}
		return true;
	};

	////// Row Manipulation API //////
	
	/**
	 * This method is used to allow the sential row to create
	 * a new empty row in the model.  It is called when the
	 * user attempts to edit the first editable cell in the
	 * sentinal row.
	 */

	this.onCreateNewRow = function(event)
	{
		var cell = parentWithTag(eventTarget(event), "td");
		var row = parseInt(cell.getAttribute("row"));
		if(_self.layout.isSentinalRow(row))
		{
			_self.appendNewRow();
		}
	};

	/**
	 * This is separate so we can trigger it from either
	 * keyboard or mouse events.
	 */

	this.appendNewRow = function()
	{
		var data = _self.data.createRow();
		var idx = _self.insertRow(-1, data);
		_self.editCell(idx, 0);
	}

	/**
	 * This method is used to insert a new data row at the
	 * given index.  If the index is negative, it is relative
	 * to the end of the rows currently displayed in the
	 * table.
	 *
	 * @param idx the index of where to create the new row
	 * @param data the row data to display
	 * @param returns the actual data index of the row
	 *		inserted
	 */

	this.insertRow = function(idx, data)
	{
		println("Need to insert new row at data index {0}", [ idx ]);
		return this.layout.insertRow(idx, data);
	};

	this.editing = null;
	this.nav = new archistry.ui.DefaultKeyNavStrategy(this);
	this.layout = new archistry.ui.BrowserGridLayout(id, this);
};
