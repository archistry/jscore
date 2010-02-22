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
// Name:		controller.js
// Created:		Mon Feb 15 17:26:10 GMT 2010
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.ui");

/**
 * @class
 *
 * This class represents a framework Action.  Action instances
 * implement the GoF Command pattern, but they also have
 * additional state associated with them during the execution
 * of the page.
 */

archistry.ui.Action = function(callback, options)
{
	var _self = this;

	mixin(archistry.ui.Helpers);
	this.mixin(options);

	/**
	 * This method is called when the action is activated.  If
	 * the action is not disabled, it calls the callback
	 * function supplied in the constructor.
	 */

	this.execute = function(event)
	{
		if(this.sensitive)
			callback(this, event);
	};

	/**
	 * This attribute takes care of tracking the elements to
	 * which this action is bound.  This is required to ensure
	 * that the elements remain in sync with the action state.
	 */

	this.bindings = [];
	
	this.__defineGetter__("active", function() { return _active; });
	this.__defineGetter__("sensitive", function() { return _sensitive; });
	this.__defineGetter__("visible", function() { return _visible; });
	
	this.__defineSetter__("active", function(val) {
		for(var i = 0; i < _self.bindings.length; ++i)
		{
			var node = _self.bindings[i];
			if(val)
			{
				$(node).removeClass(archistry.ui.Styles.State.DEFAULT);
				$(node).addClass(archistry.ui.Styles.State.ACTIVE);
			}
			else
			{
				$(node).removeClass(archistry.ui.Styles.State.ACTIVE);
				$(node).addClass(archistry.ui.Styles.State.DEFAULT);
			}
		}
		_active = val;
	});
	
	this.__defineSetter__("sensitive", function(val) {
		for(var i = 0; i < _self.bindings.length; ++i)
		{
			var node = _self.bindings[i];
			if(val)
			{
				$(node).removeClass(archistry.ui.Styles.State.DISABLED);
				$(node).addClass(archistry.ui.Styles.State.DEFAULT);
			}
			else
			{
				$(node).removeClass(archistry.ui.Styles.State.DEFAULT);
				$(node).addClass(archistry.ui.Styles.State.DISABLED);
			}
		}
		_sensitive = val;
	});
	
	this.__defineSetter__("visible", function(val) {
		for(var i = 0; i < _self.bindings.length; ++i)
		{
			var node = _self.bindings[i];
			if(val)
			{
				$(node).removeClass(archistry.ui.Styles.Layout.HIDDEN);
			}
			else
			{
				$(node).addClass(archistry.ui.Styles.State.HIDDEN);
			}
		}
		_visible = val;
	});

	// make sure that we're initialized properly
	var _sensitive = this.sensitive;
	if(_sensitive === undefined)
	{
		_sensitive = true;
	}
	self.sensitive = _sensitive;

	var _active = this.active;
	if(_active === undefined)
	{
		_active = false;
	}
	self.active = _active;

	var _visible = this.visible;
	if(_visible === undefined)
	{
		_visible = true;
	}
	self.visible = _visible;
};

/**
 * @class
 *
 * This class provides a basic page controller object that is
 * responsible for binding actions to the actual DOM elements.
 * Actions are bound by associating the 'aj-action' class to
 * the given element.  Based on the element, specific binding
 * rules apply.
 * <p>
 * For A elements, the actions are specified via the href
 * attribute using the following naming convention:
 * </p>
 * <pre>
 *   [@action-set]#action-id
 * </pre>
 * </p>
 * <p>
 * The action-set value is optional, but is useful to prevent
 * unexpected things happening when the page is viewed if the
 * user has JavaScript disabled.  The action-id is bound to an
 * Action instance that is registered to the appropriate
 * action set.
 * </p>
 */

archistry.ui.Controller = function()
{
	const ACTION_REGEX	= /^(?:ajc:@([^\s#]+))?#(.*)$/;
	var _self = this;

	this.actions = {

		/** the default action group */
		default: {},

		/**
		 * This method is used to register an action with the
		 * controller.
		 *
		 * @param group the action group for the action.  If
		 *		an action with the given ID already exists, it
		 *		will be overwritten.  If null is passed as the
		 *		first parameter, the action will be added to
		 *		the default action group.
		 * @param actionId the key that will be used to bind
		 *		the code to the markup
		 * @param callback the function that will be executed
		 *		when the element is triggered.  It must take a
		 *		single argument which is the element that
		 *		triggered the event.
		 * @param options any default settings for the action
		 *		in terms of sensitivity, visibility or active
		 *		state.
		 */

		register: function(group, actionId, callback, options)
		{
			var target = _self.actions.default;
			if(group)
			{
				target = _self.actions[group];
				if(target === undefined)
				{
					target = _self.actions[group] = {};
				}
			}
			target[actionId] = new archistry.ui.Action(callback, options);
		}
	};

	/**
	 * This attribute allows centralized management of XHR
	 * instances from the controller.
	 */

	this.xhr = new archistry.core.XHRFactory();

	/**
	 * This method should be called automatically when the
	 * document is loaded and ready to be processed.
	 */

	this.initialize = function()
	{
		$(".aj-action").each(function(i) {
			var group = "default";
			var key = null;
			var action = null;
			var elt = this;

			switch(this.tagName.toLowerCase())
			{
				case "a":
					var match = ACTION_REGEX.exec($(this).attr("href"));
					if(match)
					{
						if(match[1])
						{
							group = match[1];
							if(_self.actions[group] === undefined)
								return;
						}
						key = match[2];
						action = _self.actions[group][key];
						if(action)
						{
							$(this).click(function(e) {
								action.execute(e);
								return false;
							});
							action.bindings.add(this);
						}
						else
						{
							$(this).addClass(archistry.ui.Styles.State.DISABLED);
						}
						// prevent bogus requests for all of
						// our magic links
						$(this).attr("href", "javascript:void(0)");
					}
					break;
			}
		});
	};
};
