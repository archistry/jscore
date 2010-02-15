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
// Name:		menu.js
// Created:		Mon Jan 25 17:29:45 GMT 2010
//
//////////////////////////////////////////////////////////////////////

namespace("archistry.jquery");

/**
 * This class defines the basic behavior required for a popup
 * menu.  It is inspired by both some of the examples from the
 * Filament Group as well as the jQuery Context Menu plugin.
 *
 * @param selector the jQuery element selector that's used to
 *		identify the ul that defines the menu
 * @param options the options that can set various defaults
 */

archistry.jquery.Menu = function(selector, options)
{
	var node = $(selector);
	var _self = this;
	var _styles = {
		CORNER_ALL: "ui-corner-all",
		MENU: "ui-menu",
		HOVER: archistry.ui.Styles.State.ACTIVE,
		DEFAULT: archistry.ui.Styles.State.DEFAULT
	};

	this.mixin(options);
	this.mixin({ showSpeed: 150, hideSpeed: 75, width: "8em" });

	/**
	 * This method is used to hide any visible menus.
	 */

	function hideMenus()
	{
		$("." + _styles.MENU).hide();
		node.find('li a').removeClass(_styles.HOVER);
		$(document).unbind('click', hideMenus);
		$(document).unbind('keydown');
	}

	/**
	 * This method is used to activate the particular item.
	 * 
	 * @param link the link that was activated
	 */

	function activate(link)
	{
		hideMenus();
		alert("item clicked: " + link.inspect());
	}

	function init()
	{
		node.css({width: _self.width});
		node.addClass(_styles.MENU).addClass("ui-widget ui-widget-content ui-corner-all");
		node.find('ul, li a').addClass(_styles.CORNER_ALL);
		node.find('a').click(function() {
			activate(this);
			return false;
		});
		node.find("li a").hover(
			function()
			{
				var item = $(this);
				$("." + _styles.HOVER).removeClass(_styles.HOVER).blur();
				$(this).addClass(_styles.HOVER).focus();
			},
			function()
			{
				$(this).removeClass(_styles.HOVER).blur();
			}
		);
	}

	/**
	 * This method is used to show the menu at the specified
	 * location (or the default location of not specified).
	 *
	 * @param x the x coordinate (optional)
	 * @param y the y coordinate (optional)
	 */

	this.show = function(x, y)
	{
		hideMenus();
		node.show().click(function() { hideMenus(); return false; });
		$(document).click(hideMenus);

		// Keyboard events
		$(document).keypress(function(event)
		{
			switch(event.keyCode) {
				case 38: // up arrow
					if($(eventTarget(event)).is('.' + _styles.HOVER))
					{
						var prev = $(eventTarget(event)).parent().prev();
						if(prev.is("li.ui-separator"))
						{
							prev = prev.prev();
						}
						prev = prev.find("a:first");

						if(prev.size() > 0)
						{
							$(eventTarget(event)).trigger("mouseout");
							prev.trigger("mouseover");
						}
					}
					else
					{
						$(eventTarget(event)).trigger("mouseout");
						node.find("a:last").trigger("mouseover");
					}
					return false;
				case 40: // down arrow
					if($(eventTarget(event)).is('.' + _styles.HOVER))
					{
						var nextl = $(eventTarget(event)).parent().next();
						if(nextl.is("li.ui-separator"))
						{
							nextl = nextl.next();
						}
						nextl = nextl.find("a:first");

						if(nextl.size() > 0)
						{
							$(eventTarget(event)).trigger("mouseout");
							nextl.trigger("mouseover");
						}
					}
					else
					{
						$(eventTarget(event)).trigger("mouseout");
						node.find("a:first").trigger("mouseover");
					}
					return false;
				case 27: // ESC key
					hideMenus();
					break;

				case 13: // ENTER key
					$(eventTarget(event)).trigger("click");
					return false;
			}
		});

		if(x && y)
		{
			node.css({ left: x, top: y }).fadeIn(this.showSpeed);
		}
	};

	init();
};
