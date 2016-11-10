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
// Name:		renderer.js
// Created:		Fri Jan 15 10:45:10 GMT 2010
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.ui");

/**
 * @class
 *
 * This class implements the abstract base render API that can
 * be shared widely across a number of different rendering
 * contexts.  It simply renders the value as HTML.
 */

archistry.ui.Renderer = function()
{
	/**
	 * This method is called to render the property
	 *
	 * @param node the element in which to render the value
	 * @param val the value to be rendered
	 * @param options options that may affect the rendering
	 */

	this.render = function(node, val, options)
	{
		node.innerHTML = (val === undefined || val === null ? "" : val);
	};
};

/**
 * @class
 *
 * This class provides a renderer that will display boolean
 * values using a checkbox.
 */

archistry.ui.CheckboxRenderer = function()
{
	this.render = function(node, val, options)
	{
        if(!node)
        {
            throw createError("ArgumentError:  rendering node is NULL!");
        }

		if(val)
		{
			node.innerHTML = '<input type="checkbox" checked="true"/>';
		}
		else
		{
			node.innerHTML = '<input type="checkbox"/>';
		}
	};
};

/**
 * @class
 *
 * This class implements the Adapter pattern to allow any
 * renderer type to be used as a PropertyRender.
 *
 * @param renderer the render implementing the above interface
 * @param options (optional) any options that should be passed
 *		to the renderer
 */

archistry.ui.PropertyRenderer = function(renderer, options)
{
	if(!renderer)
	{
		renderer = new archistry.ui.Renderer();
	}

	/**
	 * This method is called to render the property
	 *
	 * @param obj the object providing the data
	 * @param key the property being rendered
	 * @param node the element in which to render the value
	 */

	this.render = function(obj, key, node)
	{
		renderer.render(node, obj.getProperty(key), options);
	};
};

/**
 * @class
 *
 * This class implements the Adapter pattern to allow any
 * renderer type to be used as a CellRenderer.
 *
 * @param renderer the render implementing the above interface
 * @param options (optional) any options that should be passed
 *		to the renderer
 */

archistry.ui.CellRenderer = function(renderer, options)
{
	if(!renderer)
	{
		renderer = new archistry.ui.Renderer();
	}

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
			val = node.getProperty(column.key);
		}

		renderer.render(cell, val, options);
	};
};

