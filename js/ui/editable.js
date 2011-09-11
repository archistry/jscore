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
// Name:        editable.js
// Created:        Wed Jan 20 13:45:22 GMT 2010
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.ui");

/**
 * @class
 *
 * This class provides in-line object property editing for the
 * specified element.
 *
 * @param arg the element ID or element definition
 * @param options additional object properties to define/set
 */

archistry.ui.Editable = function(arg, options)
{
    var H = archistry.ui.Helpers;

    var _oldval = null;
    var _node = null;
    var _self = $A(this);
    var _obj = null;
    var _key = null
    var _global = (function(){return this;}).call();
    
    _self.mixin(options);

    if(!_self.renderer)
    {
        _self.renderer = new archistry.ui.PropertyRenderer(null, options);
    }

    if(arg instanceof Element)
    {
        _node = arg;
    }
    else
    {
        _node = e(arg);
    }

    if(!_node)
    {
        throw new ReferenceError("unable to find node for '{0}'".format([ arg ]));
    }

    /** @private */
    function getAttribute(attr)
    {
        var _val = _node.getAttribute(attr);
        if(!_val || _val === "")
        {
            throw new ReferenceError(format("Node {0} does not include the '{1}' attribute".format( _node, attr)));
        }

        return _val;
    }

    /** @private */
    function onEdit(event)
    {
        _oldval = _obj.getProperty(_key);
        _self.editor.startEditing(_self, _obj, _key, _node);
    }

    /** @private */
    function render()
    {
        _self.renderer.render(_obj, _key, _node);
    }

    /** @private */
    function init()
    {
        // first, validate that the element has all the right
        // attributes
        ref = getAttribute("object");
        _obj = _global[ref];
        if(!_obj && !(_obj = window[ref]))
        {
            throw new ReferenceError("Unable to find the object!");
        }

        if(!_obj.getProperty)
        {
            var getter = this.getter || (function(obj, key) {
                            return obj[key];
                        });
            var setter = this.getter || (function(obj, key, val) {
                            obj[key] = val;
                            return val;
                        });
            _obj = new archistry.data.ObjectAdapter(
                        _obj, getter, setter);
        }

        _key = getAttribute("property")
        if(!_self.editor)
        {
            _self.editor = _node.getAttribute("editor");
            if(_self.editor)
            {
                if(_self.editor instanceof String)
                {
                    _self.editor = new _self.editor();
                }
                else
                {
                    _self.editor = _global[_self.editor];
                }
            }
            else
            {
                _self.editor = new archistry.ui.editor.InlineTextEditor();
            }
        }

        // FIXME:  this doesn't work cross-browser
        if(!_self.clicksToEdit || _self.clicksToEdit === 2)
        {
            _node.ondblclick = onEdit;
        }
        else
        {
            _node.onclick = onEdit;
        }

        if(_node.getAttribute("title") === null)
        {
            var name = (_self.clicksToEdit == 2 ? "Double click" : "Click");
            _node.setAttribute("title", String.format("{0} on the text to edit it", [ name ]));
        }

        render();
    }

    /**
     * This is part of the EditingObserver interface that will
     * be called from the editors.
     *
     * @param context the context (in our case null)
     */

    this.editingCancelled = function(context)
    {
        render();
    };

    /**
     * This is part of the EditingObserver interface that will
     * be called when the editing function is completed.
     *
     * @param context the context of the edit
     */

    this.editingCompleted = function(context)
    {
        var _newval = _self.editor.value();
        if(_oldval != _newval)
        {
            H.appendAttr(_node, "class", archistry.ui.Styles.Grid.CELL_DIRTY);
            _obj.setProperty(_key, _newval);
        }
        render();
    };

    init();
};
