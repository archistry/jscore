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
// Name:        console.js
// Created:        Mon Jan 18 17:55:32 GMT 2010
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.ui");

/**
 * @class
 *
 * The Console object provides a way to write output messages
 * to the current page in a consistent manner.
 */

archistry.ui.ConsoleImpl = function()
{
    var H = archistry.ui.Helpers;

    /**
     * This method is used to attach the console to an output
     * div.  The div is used to specify the overriding styles
     * for the console.
     *
     * @param divid the ID of the div
     */

    this.attach = function(divid)
    {
        this.div = H.e(divid);
//        this.div.innerHTML = "<div id='console-title' style='font-weight:bold;font-size:10pt;font-family:sans-serif;border: 1px solid #002654;background:#ddd0aa;color:#002654;padding:3px;position:relative;'>archistry.ui.Console <img id='console-clear' src='../images/gtk-clear.png' alt='clear' style='position:absolute;top:3px;right:0;' onclick='archistry.ui.Console.clear();'/></div><form action='javascript:void(0);'><textarea id='console-text' style='padding:3px;margin-top:.5em;color:#204067;background:#e6eaee;border: 1px solid #002654' rows='10' disabled='no'></textarea></form>";
        this.div.innerHTML = "<div id='console-title' style='font-weight:bold;font-size:10pt;font-family:sans-serif;border: 1px solid #002654;background:#ddd0aa;color:#002654;padding:3px;position:relative;overflow:auto'>archistry.ui.Console <img id='console-clear' src='../images/gtk-clear.png' alt='clear' style='position:absolute;top:3px;right:0;' onclick='archistry.ui.Console.clear();'/></div><form action='javascript:void(0);'><textarea id='console-text' style='padding:3px;margin-top:.5em;color:#204067;background:#e6eaee;border: 1px solid #002654' rows='10' ></textarea></form>";
        this.text = H.e("console-text");
        this.title = H.e("console-title");
        this.title.hasLayout = true;
        this.text.style.width = H.ewidth(this.title);
        this.attached = true;
        window.onresize = function() {
            archistry.ui.Console.onWindowResized();
        };
    };

    /**
     * This method is used to write a string to the console
     * without the trailing newline.
     *
     * @param fmt the format specifier
     * @param args the arguments
     */

    this.print = function(fmt, args)
    {
        if(this.attached)
        {
            this.text.value += String.format(fmt, args);
            this.text.scrollTop = this.text.scrollHeight;
        }
    };

    /**
     * This method is used to write messages to the console.
     *
     * @param fmt the format specifier
     * @param args the arguments (as per string.format())
     */

    this.println = function(fmt)
    {
        var args = [];
        if(arguments.length > 2 || arguments[1].length === undefined)
        {
            for(var i = 1; i < arguments.length; ++i)
                args[i-1] = arguments[i];
        }
        else
        {
            args = arguments[1];
        }

        this.print((fmt + "\n"), args);
    };

    /**
     * This method is used to reset the console.
     */

    this.clear = function()
    {
        if(this.attached)
        {
            this.text.value = "";
        }
    };

    this.onWindowResized = function()
    {
        this.text.style.width = H.ewidth(this.title);
    };
};

/**
 * This is the global instance of the console that is required
 * to allow embedded println calls to function properly even
 * when the console isn't displayed.
 */

archistry.ui.Console = new archistry.ui.ConsoleImpl();

/** Define a convenient reference to the console. */
Console = archistry.ui.Console;
