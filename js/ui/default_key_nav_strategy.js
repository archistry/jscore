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
// Name:        default_key_nav_strategy.js
// Created:     Fri Jan 15 10:45:10 GMT 2010
// Split:       Wed Mar 10 11:59:35 GMT 2010
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.ui");

/**
 * @class
 *
 * This class implements the default keyboard navigation
 * strategy for the grid control.  The idea is that various
 * strategies can be provided to mimic various types of
 * familar user navigation environments.
 */

archistry.ui.DefaultKeyNavStrategy = function(grid)
{
    var parentWithTag = archistry.ui.Helpers.parentWithTag;
    var eventTarget = archistry.ui.Helpers.eventTarget;
    var kc = archistry.ui.Helpers.keyCode;
    var _this = this;

    /** @private */
    function findNextCell(cell, forward, down)
    {
        var row = cell.parentNode;
//        Console.println("row: " + row.innerHTML);

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

    /** @private */
    function onKeyDown(event)
    {
        if(!event)
            event = window.event;

        var down = null;
        var keyCode = kc(event);
//        Console.println("KeyCode: " + keyCode);
        switch(keyCode)
        {
            case 9:        // TAB
                break;
//            case 13:    // ENTER
//                down = !event.shiftKey;
//                break;
            default:
                return true;
        }

        var thisCell = parentWithTag(eventTarget(event), "td");
        var nextCell = findNextCell(thisCell, !event.shiftKey, down)
//        if(nextCell && nextCell.outerHTML)
//            Console.println("nextCell: " + nextCell.outerHTML);
//        else
//            Console.println("nextCell: " + nextCell.toXML());
        if(nextCell)
        {
            var path = grid.pathForElement(nextCell);
            while(!grid.isCellEditable(path))
            {
//                Console.println("<<<< Cell({0}) is not editable", [ path ]);
                nextCell = findNextCell(nextCell, !event.shiftKey, down)
                if(!nextCell)
                    return true;

                path = grid.pathForElement(nextCell);
            }
            if(grid.completeEditing())
            {
                grid.editCell(path);
            }
            event.cancelBubble = true;
            if(event.stopPropagation)
                event.stopPropagation();
            if(event.preventDefault)
                event.preventDefault();
            
            return false;
        }

        return true;
    }

    this.pushEvent = function(event)
    {
        return onKeyDown(event);
    };

    /**
     * This is the public API that is used to notify the key
     * navigation strategy that a new cell has been added to
     * the grid.
     *
     * @param cell the cell element
     */

    this.onCellAdded = function(cell)
    {
        // We only register this handler if we're able to
        // capture the events
        if(cell.addEventListener)
        {
            cell.addEventListener("keydown", onKeyDown, true);
        }
//        else if(cell.attachEvent)
//        {
//            cell.attachEvent("onkeydown", onKeyDown);
//        }
//        else
//        {
//            cell.onkeydown = onKeyDown;
//        }
    };
};
