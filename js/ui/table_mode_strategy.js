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
// Name:        table_mode_strategy.js
// Created:     Wed Mar 10 12:15:39 GMT 2010
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.ui");

/**
 * @class
 *
 * This class implements an event handling strategy to use the
 * TreeGrid in "table mode."  In this mode, the control acts
 * more like a regular HTML table than it does a tree or grid
 * control, but it does support edit actions.
 *
 * @param grid the TreeGrid instance
 * @param layout the GridLayout instance
 * @param options configuration options to alter the event
 *      handling behavior in small ways.
 */

archistry.ui.TableModeStrategy = function(grid, layout, options)
{
    var parentWithTag = archistry.ui.Helpers.parentWithTag;
    var eventTarget = archistry.ui.Helpers.eventTarget;
    var kc = archistry.ui.Helpers.keyCode;
    var _self = this;
    var _target = { element: null, clicks: 0, time: null };

    this.mixin(options);
    if(!this.clicksToEdit) this.clicksToEdit = 2;
    if(!this.dt) this.dt = 300;

    /**
     * @private
     *
     * This function takes care of the default mouse behavior
     * for the cells.
     *
     * @param event the event
     */

    function onMouseUp(event)
    {
        if(!event) event = window.event;
        
        if((event.which && event.which == 3)
                || (event.button && event.button == 2))
        {
            // right click, we don't care
            return true;
        }

        var target = eventTarget(event);
        if(_target.element != target)
        {
            _target.element = target;
            _target.clicks = 1;
        }
        else
        {
            _target.clicks++;
        }
  
        var now = new Date().getTime();
        if(!_target.time || (_target.time && (now - _target.time > _self.dt)))
        {
            Console.println("Timer reset");
            _target.time = now;
            _target.clicks = 1;
            if(_target.clicks < _self.clicksToEdit)
                return true;
        }

        var cell = parentWithTag(eventTarget(event), "td");
//        Console.println("clicksToEdit: {4}; clicks: {0}; this.dt: {5}; dt: {1}\n\ttarget: {2}\n\tcell: {3}", 
//                _target.clicks, now - _target.time,
//                target.toXML(), cell.toXML(), _self.clicksToEdit, _self.dt);

        if(!cell || (cell 
                && cell.parentNode.getAttribute("class").match(/header/)))
        {
            Console.println("Unable to find cell or attempt to edit header");
            return true;
        }

        if(_target.clicks === _self.clicksToEdit)
        {
            var path = grid.pathForElement(cell);
            Console.println("supposed to edit path: {0}", path);
            grid.editCell(path);
        
            _target.clicks = 0;
            event.cancelBubble = true;
            if(event.stopPropagation)
                event.stopPropagation();
            if(event.preventDefault)
                event.preventDefault();
           
            return false;
        }

        return true;
    }

    /**
     * This method is used to fake event capturing on IE.  It
     * may be called by bubble handlers to ensure that the
     * appropriate capture behavior always works as expected.
     */

    this.pushEvent = function(event)
    {
        if(!event) event = window.event;

        switch(event.type)
        {
            case "mouseup":
                return onMouseUp(event);
        }

        return true;
    };

    // register the default event handlers
    layout.root().onmouseup = onMouseUp;
};
