//////////////////////////////////////////////////////////////////////
//
// Copyright (c) 2009 Archistry Limited
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
// Name:		observer.js
// Created:		Mon Dec 14 22:23:40 GMT 2009
//
///////////////////////////////////////////////////////////////////////

/**
 * @name archistry
 * @namespace
 *
 * The root namespace of Archistry Limited
 */

/**
 * @name archistry.core
 * @namespace
 *
 * This is the namespace for the core Archistry JavaScript
 * library.
 */

namespace("archistry.core");

/**
 * @class
 *
 * This class provides signal handling similar to GTK+ to
 * allow for fine-grained, chained notifications for a
 * particular signal.  It is a mixin, so it should be safe to
 * include into other implementation classes.
 * <p>
 * To effectively use this class as a mixin, the sender of the
 * event should be passed to the constructor.  In mixin
 * scenarios, this means that you'll have something similar
 * to:
 * <pre>
 *   var A = function()
 *   {
 *     this.mixin(new archistry.core.SignalSource(this));
 *     ...
 *   }
 * </pre>
 * </p>
 * <p>
 * Using this approach ensures that the signal handlers are
 * invoked with the instance of class A that actually emits
 * the signal as the 'this' pointer.
 * </p>
 *
 * @param sender the object that should be passed as the this
 *		reference to the signal handlers.
 */

archistry.core.SignalSource = function(sender)
{
    // NOTE:  the reason we use this variables here to keep
    // track of the signals is so that if multiple signal
    // source instances are mixed in, a unified list of
    // handlers will be maintained.

	/**
	 * @private
	 *
	 * This is a helper method to ensure that the signal has
	 * been correctly defined.
	 *
	 * @param signal the signal to track
	 * @return the array reference of the specified signal
	 */

	function sigarray(signal)
	{
		if(this.__validSignals != null)
		{
			if(!this.__validSignals.include(signal))
			{
				throw new Error("Signal '" + signal + "' is not supported by this object!");
			}
		}

		if(this.__signals == null)
		{
			this.__signals = {};
		}
		if(this.__signals[signal] == null)
		{
			this.__signals[signal] = [];
		}

		return this.__signals[signal];
	}
	
	/**
	 * This method is used to add valid signals for signal
	 * checks.
	 *
	 * @param signals an array of signals
	 */
	
	this.addValidSignals = function(sigs)
	{
		if(this.__validSignals == null)
		{
			this.__validSignals = [];
		}

		this.__validSignals.concat(sigs);
	};

	/**
	 * This method is used to delete signals from the valid
	 * signals for the handler.
	 *
	 * @param signals an array of signals
	 * @return an array of signals actually removed
	 */

	this.removeValidSignals = function(sigs)
	{
		if(this.__validSignals == null)
		{
			this.__validSignals = [];
			return [];
		}

		var deleted = [];
		for(var i = 0; i < sigs.length; ++i)
		{
			deleted.concat(this.__validSignals.remove(sigs[i]));
		}

		return deleted;
	};

	/**
	 * This method is used by objects who wish to receive
	 * notifications of particular signals to register the
	 * callback.
	 *
	 * @param signal the signal of interest
	 * @param fn the callback function
	 */

	this.signalConnect = function(signal, fn)
	{
		sigarray(signal).add(fn);
	};

	/**
	 * This method is used to disconnect from signal
	 * notifications.
	 *
	 * @param signal the signal of interest
	 * @param the function to disconnect
	 * @return the deleted object or null if it was not found
	 */
	
	this.signalDisconnect = function(signal, fn)
	{
		return sigarray(signal).remove(fn);
	}

	/**
	 * This method is used to fire the notification for the
	 * specific signal.  Variable arguments are used so that a
	 * variety of signal types can be supported.
	 * <p>
	 * <p>
	 * By convention, the first argument SHOULD be the sender
	 * of the signal.
	 * </p>
	 * NOTE:  this WILL NOT work correctly with array
	 * arguments passed to the emit signal due to the way that
	 * Array.slice seems to flatten the array first.  FFS!!!
	 * </p>
	 *
	 * @param signal the signal of interest
	 * @param arguments (implied)
	 */

	this.signalEmit = function(signal)
	{
		var args = [].slice.call(arguments, 1);
		var listeners = sigarray(signal);
		var fn = null;
		for(var i = 0; i < listeners.length; ++i)
		{
			var fn = listeners[i];

			// allow immediate sending of the signal for unit
			// testing
			if(this.immediate)
			{
				fn.apply(sender, args);
			}
			else
			{
				setTimeout(function() { fn.apply(sender, args); }, 50);
			}
		}
	};

	/**
	 * This method returns a list of the valid signals for the
	 * notifier.
	 */

	this.__defineGetter__("signals", function() {
		var rval = [];
		for(k in this.__signals)
		{
			rval.add(k);
		}
		return rval;
	});
};
