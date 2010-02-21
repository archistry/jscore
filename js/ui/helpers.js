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
// Name:		helpers.js
// Created:		Fri Jan 15 10:45:10 GMT 2010
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.ui");

/**
 * This object defines the base styles that are common across
 * all of the UI components.  They also include all of the
 * jQueryUI CSS Framework definitions where appropriate so
 * that the core controls will play nice with jQueryUI themes.
 */

archistry.ui.Styles = {

	/** These are layout styles that apply to UI widgets */
	Layout: {
		HIDDEN				: "ui-helper-hidden",
		HIDDEN_ACCESSIBLE	: "ui-helper-hidden-acessible",
		RESET				: "ui-helper-reset",
		CLEARFIX			: "ui-helper-clearfix",
		ZFIX				: "ui-helper-zfix"
	},

	/**
	 * These are widget styles that can be used for all the
	 * widget elements.
	 */

	Widget: {
		CONTROL				: "ui-widget",
		HEADER				: "ui-widget-header",
		CONTENT				: "ui-widget-content",
		CONTEXT_MENU		: "ui-context-menu",
		BUTTON_ICON_LEFT	: "ui-button-icon-left",
		BUTTON_ICON_RIGHT	: "ui-button-icon-right"
	},

	/** These are widget state styles */
	State: {
		DEFAULT				: "ui-state-default",
		HOVER				: "ui-state-hover",
		FOCUS				: "ui-state-focus",
		ACTIVE				: "ui-state-active",
		HIGHLIGHT			: "ui-state-highlight",
		ERROR				: "ui-state-error",
		ERROR_TEXT			: "ui-state-error-text",
		DISABLED			: "ui-state-disabled",
		PRIORITY_PRIMARY	: "ui-state-priority-primary",
		PRIORITY_SECONDARY	: "ui-state-priority-secondary",
		EDITING				: "aui-editing"
	}
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
	 * This method is used to append the specified value to
	 * the given attribute.  It makes sure that it isn't
	 * already there, and it also makes sure that it is
	 * appropriately separated by whitespace.
	 *
	 * @param elt the element
	 * @param attr the attribute key
	 * @param val the value to add
	 * @return the element
	 */

	appendAttr: function(elt, attr, val)
	{
		var regex = new RegExp(val.trim());
		var s = elt.getAttribute(attr);
		if(s && s.length > 0)
		{
			var rc = s.match(regex);
			if(!rc || rc.length == 0)
			{
				s = s.trim() + " " + val;
				elt.setAttribute(attr, s);
			}
		}
		else
		{
			elt.setAttribute(attr, val);
		}

		return elt;
	},

	/**
	 * This method removes the value from the specified
	 * attribute.
	 *
	 * @param elt the element
	 * @param attr the attribute
	 * @param val the value
	 * @return the element
	 */

	removeAttr: function(elt, attr, val)
	{
		var s = elt.getAttribute(attr);
		if(s)
		{
			var regex = new RegExp(val.trim());
			elt.setAttribute(attr, s.replace(regex, ""));
		}
		return elt;
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
	},

	/**
	 * This is a short version of the println call
	 */

	println: function(fmt, args)
	{
		archistry.ui.Console.println(fmt, args);
	},

	/**
	 * This method will return the width of the
	 * element--including inline elements
	 *
	 * @param elt the element
	 * @param raw true to return without the px suffix
	 * @return the width in pixels
	 */

	ewidth: function(elt, raw)
	{
		var width = getStyle(elt, "width");
		if(getStyle(elt, "display") == "inline")
		{
			if(elt.clip)
			{
				width = elt.clip.width;
			}
			else
			{
				width = elt.offsetWidth;
			}
			width = width + "px";
		}
		if(!raw)
			return width;

		return parseInt(width.replace(/px$/, ""));
	},

	/**
	 * This method is used to ensure default values are set
	 * which don't override any options already set via mixin
	 * calls.
	 *
	 * @param key the property key that is to be checked
	 * @param val the default value if there is not already a
	 *		key set.
	 */

	setDefault: function(key, val)
	{
		if(this[key] === undefined)
		{
			this[key] = val;
		}
	}
};
