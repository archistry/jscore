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
// Name:		test_observer.js
// Created:		Wed Dec 16 19:53:19 GMT 2009
//
///////////////////////////////////////////////////////////////////////

Jester.testing("Observer functionality", {
	tests: [
		{
			what: "Simple signal handling works as expected",
			how: function(result)
			{
				var Actor = function(name)
				{
					this.mixin(new archistry.core.SignalSource(this));
					this.name = name;
					this.immediate = true;

					this.emit = function()
					{
						this.signalEmit("signal1", "one", 2, { one: 3, two: 4 }, [ 0, 1, 2 ]);
					};
				};

				var Observer = function(actor)
				{
					var _this = this;
                    _this.count = 0;

					var handler = function(arg1, arg2, arg3, arg4)
					{
						var name = this.name;
						result.check("signal handler called", {
							actual: [ this, name, arg1, arg2, arg3.one, arg3.two, arg4 ],
							expect: [ actor, actor.name, "one", 2, 3, 4, [ 0, 1, 2 ] ]
						});
                        _this.count++;
					}
					
					actor.signalConnect("signal1", handler);
				};

				var actor = new Actor("sam");
				var fred = new Actor("fred");
				var obs = new Observer(actor);
				var obs2 = new Observer(fred);
				actor.emit();
                fred.emit();

                result.check("signal handlers not called across observers", {
                    actual: [ obs.count, obs2.count ],
                    expect: [ 1, 1 ]
                });
			}
		},
		{
			what: "Valid signal checking  works as expected",
			how: function(result)
			{
				var Actor = function(name)
				{
					this.mixin(new archistry.core.SignalSource(this));
                    this.addValidSignals([ "signal1" ]);
					this.name = name;
					this.immediate = true;

					this.emit = function()
					{
						this.signalEmit("signal1", "one", 2, { one: 3, two: 4 });
					};
				};

				var Observer = function(actor)
				{
					var _this = this;
                    _this.count = 0;

					var handler = function(arg1, arg2, arg3)
					{
						var name = this.name;
						result.check("signal handler called", {
							actual: [ this, name, arg1, arg2, arg3.one, arg3.two ],
							expect: [ actor, actor.name, "one", 2, 3, 4 ]
						});
                        _this.count++;
					}
					
					actor.signalConnect("signal1", handler);
				};

				var actor = new Actor("sam");
				var obs = new Observer(actor);
				actor.emit();

                result.check("signal handler was called", {
                    actual: obs.count,
                    expect: 1
                });
			}
		},
		{
			what: "Unregistration of signals works as expected",
			how: function(result)
			{
				var Actor = function(name)
				{
					this.mixin(new archistry.core.SignalSource(this));
                    this.addValidSignals([ "signal1" ]);
					this.name = name;
					this.immediate = true;

					this.emit = function()
					{
						this.signalEmit("signal1", "one", 2, { one: 3, two: 4 });
					};
				};

				var Observer = function(actor)
				{
					var _this = this;
                    _this.count = 0;

					var handler = function(arg1, arg2, arg3)
					{
						var name = this.name;
						result.check("signal handler called", {
							actual: [ this, name, arg1, arg2, arg3.one, arg3.two ],
							expect: [ actor, actor.name, "one", 2, 3, 4 ]
						});
                        _this.count++;
					}
					
					actor.signalConnect("signal1", handler);

                    this.disconnect = function()
                    {
                        return actor.signalDisconnect("signal1", handler);
                    };

                    this.handler = function() { return handler; };
				};

				var actor = new Actor("sam");
				var obs = new Observer(actor);
				actor.emit();
                var handler = obs.disconnect();
                actor.emit();

                result.check("signal handler was called only once", {
                    actual: obs.count,
                    expect: 1
                });

                result.check("handler was returned to caller", {
                    actual: handler === obs.handler(),
                    expect: true
                });
			}
		},
		{
			what: "Using immediate signal emmitting returns value",
			how: function(result)
			{
				var Actor = function(name)
				{
					this.mixin(new archistry.core.SignalSource(this));
					this.name = name;
					this.immediate = true;

					this.emit = function()
					{
						this.signalEmit("signal1", "one", 2, { one: 3, two: 4 }, [ 0, 1, 2 ]);
					};

                    this.immediate = function()
                    {
						return this.signalEmitImmediate("signal2", "one", 2, { one: 3, two: 4 }, [ 0, 1, 2 ]);
                    };
				};

				var Observer = function(actor)
				{
					var _this = this;
                    _this.count = 0;

					var handler = function(arg1, arg2, arg3, arg4)
					{
						var name = this.name;
						result.check("signal handler called", {
							actual: [ this, name, arg1, arg2, arg3.one, arg3.two, arg4 ],
							expect: [ actor, actor.name, "one", 2, 3, 4, [ 0, 1, 2 ] ]
						});
                        _this.count++;
					};

                    var vetoable = function(arg1, arg2, arg3, arg4)
					{
						var name = this.name;
						result.check("signal handler called", {
							actual: [ this, name, arg1, arg2, arg3.one, arg3.two, arg4 ],
							expect: [ actor, actor.name, "one", 2, 3, 4, [ 0, 1, 2 ] ]
						});
                        _this.count++;
                        return false;
					};
					
					actor.signalConnect("signal1", handler);
					actor.signalConnect("signal2", vetoable);
				};

				var actor = new Actor("sam");
				var obs = new Observer(actor);
				actor.emit();

                result.check("immediate returned value from handler", {
                    actual: actor.immediate(),
                    expect: false
                });
                
                result.check("signal handler was called for both signals", {
                    actual: obs.count,
                    expect: 2
                });
			}
		}
	]
});
