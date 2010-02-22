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
			how: function(context, result)
			{
				var Actor = function(name)
				{
					this.mixin(new archistry.core.SignalSource(this));
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
					handler = function(arg1, arg2, arg3)
					{
						var name = this.name;
						result.check("signal handler called", {
							actual: [ name, arg1, arg2, arg3.one, arg3.two ],
							expect: [ actor.name, "one", 2, 3, 4 ]
						});
					}
					
					actor.signalConnect("signal1", handler);
				};

				var actor = new Actor("sam");
				var obs = new Observer(actor);
				actor.emit();
			}
		}
	]
});
