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
 * @class
 *
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
	 * <p>
	 * The signature of the validate method MUST be:
	 * <code>validate(row, col, old, new)</code> where the
	 * parameters are equivalent to the parameters passed to
	 * this method.
	 * </p>
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
		archistry.ui.Console.println("checking values '{0}' vs '{1}'", old, newVal);
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
 * @class
 *
 * This class provides an implementation of an abstract base
 * editor that can be used by specific editor implementations
 * to share code.
 */

archistry.ui.editor.AbstractEditor = function()
{
	mixin(archistry.ui.Helpers);
	mixin(archistry.ui.editor.ValidatingCellEditor);

	var _self = this;
	var _editing = false;
	var _observer = null;
	var _obj = null;
	var _key = null;
	var _cell = null;
	var _editor = null;
	var _value = null;
	var _context = null;

	this.cancelKeyCodes = [ 27 ];
	this.completionKeyCodes = [ 9, 13 ];

	////// INTERNAL EDITOR API //////

	/**
	 * This is the focus lost handler to ensure the edit is
	 * saved appropriately.
	 *
	 * @param event the event
	 */

	this.onBlur = function(event)
	{
		return _self.onEditingCompleted();
	}

	/**
	 * This is the method that gets called when the editing is
	 * potentially to be completed.  It still gets validated,
	 * so the editing session may not actually be completed if
	 * the validation fails.
	 */

	this.onEditingCompleted = function()
	{
		if(!_editing)
			return true;

		if(onBeforeEditingCompleted(_obj, _key, _obj[_key], _editor.value))
		{
			_editing = false;
			_value = _editor.value;
			_self.destroyEditor();
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

	this.onEditingCancelled = function()
	{
		if(_editing)
		{
			_editing = false;
			_value = null;
			_self.destroyEditor();
			if(_observer)
			{
				_observer.editingCancelled(_context);
			}
		}
	}

	/**
	 * This event handler is used to detect the end of the
	 * editing session.
	 *
	 * @param event the key event
	 */

	this.onKeyDown = function(event)
	{
		// FIXME:  this probably isn't as efficient as the
		// switch version, but we need to be able to change
		// the keybindings without having to re-implement this
		// method!
		if(_self.cancelKeyCodes.include(event.keyCode))
		{
			_self.onEditingCancelled();
		}
		else if(_self.completionKeyCodes && _self.completionKeyCodes.include(event.keyCode))
		{
			return _self.onEditingCompleted();
		}
		
		return true;
	}

	/**
	 * This method is used to destroy the editor instance.  It
	 * is called from #onEditingCancelled and
	 * #onEditingCompleted
	 */

	this.destroyEditor = function()
	{
		if(_editor)
		{
			_cell.removeChild(_editor.parentNode);
			removeAttr(_cell, "class", archistry.ui.Styles.State.EDITING);
			_editor = null;
		}
	}

	/**
	 * This method should be overridden in concrete
	 * implementations to actually create the editor within
	 * the cell.
	 *
	 * @param cell the cell in which to render the editor
	 * @param name the element ID of the editor control
	 * @param value the initial value for the control
	 * @return the editor element
	 */

	this.createEditor = function(cell, name, value)
	{
		return null;
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
     * @param size (optional) allows the caller to override the default
     *      size of the editor
	 */

	this.startEditing = function(observer, obj, key, cell, context, size)
	{
		if(_editing)
		{
			return false;
		}

		// FIXME:  there's gotta be a better way around the
		// problem of this getting redefined in the event
		// handlers than this sort of crap!
		if(_self !== this)
		{
			_self = this;
		}
		
		_editing = true;
		_observer = observer
		_obj = obj;
		_key = key;
		_cell = cell;
		_context = context;

		_editor = this.createEditor(cell, "editor-" + _key, _obj[_key], size);
		setTimeout(function() { _editor.focus(); }, 50);
		_editor.onkeydown = this.onKeyDown;
		_editor.onblur = this.onBlur;
		appendAttr(_cell, "class", archistry.ui.Styles.State.EDITING);
		return true;
	};

	/**
	 * This method returns the value of the editor.
	 */

	this.value = function() { return _value; }

	/**
	 * This method is used to cancel the edit operation.
	 */

	this.cancelEditing = function() { _self.onEditingCancelled(); }

	/**
	 * This method is used to request completion of the
	 * current edit operation.
	 */

	this.completeEditing = function() { return _self.onEditingCompleted(); }
};

/**
 * @class
 *
 * This class provides a basic text editor suitable for
 * editing single line text values.
 */

archistry.ui.editor.TextFieldEditor = function()
{
	mixin(archistry.ui.Helpers);
	this.mixin(archistry.ui.editor.AbstractEditor);

	const INPUTFMT = "<form style='display:inline;' action='javascript:void(0);'><input id=\"{0}\" autocomplete='off' value=\"{1}\" style='width:{2};height:{3};'/></form>";

	/**
	 * This method creates the HTML form and the HTML input
	 * control.
	 */

	this.createEditor = function(cell, name, value, size)
	{
		var width = ewidth(cell);
        if(size && size.width)
            width = size.width;

		var height = getStyle(cell, "height");
        if("0px" === height)
        {
            height = getStyle(cell.parentNode, "height");
        }
        if(size && size.height)
            height = size.height;

		cell.innerHTML = String.format(INPUTFMT, [ name, value, width, height ]);
		var editor = e(name);
		editor.select();
		return editor;
	}
};

/**
 * @class
 *
 * This class provides a basic multi-line text editor suitable
 * for editing multi-line text values.
 */

archistry.ui.editor.TextAreaEditor = function()
{
	mixin(archistry.ui.Helpers);
	this.mixin(archistry.ui.editor.AbstractEditor);
	this.completionKeyCodes = [];

	const INPUTFMT = "<form style='display:inline;' action='javascript:void(0);'><textarea id=\"{0}\" style='width:{2};height:{3};'>{1}</textarea></form>";

	/**
	 * This method creates the HTML form and the HTML textarea
	 * control.
	 */

	this.createEditor = function(cell, name, value, size)
	{
		var width = ewidth(cell);
		var height = getStyle(cell, "height");
        if("0px" === height)
        {
            height = getStyle(cell.parentNode, "height");
        }
        if(size)
        {
            if(size.width) width = size.width;
            if(size.height) height = size.height;
        }

		cell.innerHTML = String.format(INPUTFMT, [ name, value, width, height ]);
		var editor = e(name);
		editor.select();
		return editor;
	}
};

/**
 * @class
 *
 * This class provides a flexible text editor for editing
 * inline content elements.  If the cell containing the text
 * value to be edited is a block element, a TextAreaEditor is
 * used.  Otherwise, an inline TextFieldEditor is used
 * instead.
 *
 * @param config any override configuation settings for the
 *		editor.
 */

archistry.ui.editor.InlineTextEditor = function(config)
{
	mixin(archistry.ui.Helpers);
	this.mixin(archistry.ui.editor.AbstractEditor);
	this.mixin(config);

	var _inputEditor = new archistry.ui.editor.TextFieldEditor();
	var _textEditor = new archistry.ui.editor.TextAreaEditor();

	this.createEditor = function(cell, name, value)
	{
		var editor = null;
		if((getStyle(cell, "display") === "block")
			|| (value && this.maxLength && value.length > this.maxLength))
		{
			editor = _textEditor;
		}
		else
		{
			editor = _inputEditor;
		}
		
		this.completionKeyCodes = editor.completionKeyCodes;
		this.cancelKeyCodes = editor.cancelKeyCodes;

		return editor.createEditor(cell, name, value);
	};
};
