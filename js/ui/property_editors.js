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
// Name:		property_editors.js
// Created:		Fri Jan 15 11:06:12 GMT 2010
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.ui.editor");

/**
 * This object provides some mix-in behavior methods that are
 * used to support validation during cell editing.
 */

archistry.ui.editor.ValidatingCellEditor = {
	
	/**
	 * This method can be called before the editing process is
	 * completed for the particular editor to allow validation
	 * to be performed.
	 *
	 * Validation mechanisms can be provided by the following
	 * means:
	 * <ol>
	 * <li>If a validator is defined as the
	 * <code>validator</code> property of the column</li>
	 * <li>If a validator is defined as the
	 * <code>validator</code> property of this object</li>
	 * <li>If a <code>validate</code> method is defined as a
	 * property of this object</li>
	 * </ol>
	 *
	 * The signature of the validate method MUST be:
	 * <code>validate(row, col, old, new)</code> where the
	 * parameters are equivalent to the parameters passed to
	 * this method.
	 *
	 * @param obj the object being edited
	 * @param key the property key of the property being * edited
	 * @param old the old value from the model
	 * @param newVal the new value from the editor
	 * @param helper an optional object that has a validate
	 *		method
	 * @return true if the editing value is acceptable or
	 *		false otherwise.
	 */

	onBeforeEditingCompleted: function(obj, key, old, newVal, helper)
	{
		archistry.ui.Console.println("checking values '{0}' vs '{1}'", [old, newVal]);
		var validator = null;
		if(helper)
		{
			validator = helper;
		}
		else if(this.validator)
		{
			validator = this.validator;
		}
		else if(this.validate)
		{
			validator = this;
		}

		if(validator)
		{
			return validator.validate(obj, key, old, newVal);
		}

		return true;
	}
};

/**
 * This class provides a basic text editor suitable for
 * editing single line text values.
 */

archistry.ui.editor.TextCellEditor = function()
{	
	include(archistry.ui.Helpers);
	include(archistry.ui.editor.ValidatingCellEditor);

	var _self = this;
	var _editing = false;
	var _observer = null;
	var _obj = null;
	var _key = null;
	var _cell = null;
	var _editor = null;
	var _value = null;
	var _context = null;

	const INPUTFMT = "<form style='display:inline;' action='javascript:void(0);'><input id='{0}' autocomplete='off' value='{1}' style='width:{2};height:{3};'/></form>";
//	const INPUTFMT = "<form action='javascript:void(0);'><input id='{0}' autocomplete='off' value='{1}' style='width:{2}'/></form>";

	/**
	 * This event handler is used to detect the end of the
	 * editing session.
	 *
	 * @param event the key event
	 */

	function onKeyDown(event)
	{
		switch(event.keyCode)
		{
			case 9:		// TAB key
			case 13:	// ENTER key
				return onEditingCompleted();
			case 27:	// ESC key
				onEditingCancelled();
		}
		
		return true;
	}

	/**
	 * This is the focus lost handler to ensure the edit is
	 * saved appropriately.
	 *
	 * @param event the event
	 */

	function onBlur(event)
	{
		return onEditingCompleted();
	}

	/**
	 * This is the method that gets called when the editing is
	 * potentially to be completed.  It still gets validated,
	 * so the editing session may not actually be completed if
	 * the validation fails.
	 */

	function onEditingCompleted()
	{
		if(!_editing)
			return true;

		if(onBeforeEditingCompleted(_obj, _key, _obj[_key], _editor.value))
		{
			_editing = false;
			_value = _editor.value;
			destroyEditor();
			if(_observer)
			{
				_observer.editingCompleted(_context);
			}
			return true;
		}

		return false;
	}

	/**
	 * This method is called when the edit is cancelled by the
	 * user.
	 */

	function onEditingCancelled()
	{
		if(_editing)
		{
			_editing = false;
			_value = null;
			destroyEditor();
			if(_observer)
			{
				_observer.editingCancelled(_context);
			}
		}
	}

	function destroyEditor()
	{
		if(_editor)
		{
			_cell.removeChild(_editor.parentNode);
			_editor = null;
		}
	}

	function createEditor(cell, name, value)
	{
		var width = getStyle(cell, "width");
		var height = getStyle(cell, "height");

		if(cell.tagName == "SPAN")
		{
			if(cell.clip)
			{
				width = cell.clip.width;
			}
			else
			{
				width = cell.offsetWidth;
			}
			width = width + "px";
		}

		cell.innerHTML = String.format(INPUTFMT, [ name, value, width, height ]);
		return e(name);
	}

	////// PUBLIC EDITOR API //////
	
	/**
	 * This method is called by the control to prepare the
	 * editor for interaction with the user.
	 *
	 * @param observer an object that wishes to be notified
	 *		when the editing is completed or cancelled.  It
	 *		MUST implement the EditingObserver interface as
	 *		follows:
	 *			editingCancelled(context);
	 *			editingCompleted(context);
	 * @param obj the data object being edited
	 * @param key the property key being edited
	 * @param cell the element where the editor should be
	 *		rendered
	 * @param context an opaque context object that is sent to
	 *		the observer when the editing operation ends
	 */

	this.startEditing = function(observer, obj, key, cell, context)
	{
		if(_editing)
		{
			return false;
		}

		_editing = true;
		_observer = observer
		_obj = obj;
		_key = key;
		_cell = cell;
		_context = context;

		_editor = createEditor(cell, "editor-" + _key, _obj[_key]);
		setTimeout(function() { _editor.focus(); }, 50);
		_editor.onkeydown = onKeyDown;
//		_editor.onblur = onBlur;
		return true;
	};

	/**
	 * This method returns the value of the editor.
	 */

	this.value = function() { return _value; }

	/**
	 * This method is used to cancel the edit operation.
	 */

	this.cancelEditing = function() { onEditingCancelled(); }

	/**
	 * This method is used to request completion of the
	 * current edit operation.
	 */

	this.completeEditing = function() { return onEditingCompleted(); }
};
