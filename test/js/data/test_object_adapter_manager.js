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
// Name:		test_object_adapter_manager.js
// Created:		Thu Mar 11 22:17:57 GMT 2010
//
///////////////////////////////////////////////////////////////////////

var ObjectAdapterManager = archistry.data.ObjectAdapterManager;

Jester.testing("ObjectAdapterManager core functionality", {
	tests: [
		{
			what: "Basic API functionality with wrapping enabled",
			how: function(result)
			{
                var manager = new ObjectAdapterManager(true);
                var node = $A({ key: "foo" });
                var sobj = manager.setKey(1, node);
                var gobj = manager.getKey(1);

                result.check("set key returned non-null object", {
                    actual: (sobj !== null && sobj !== undefined),
                    expect: true
                });

                result.check("get key returned non-null object", {
                    actual: (gobj !== null && gobj !== undefined),
                    expect: true
                });

                result.check("set object and get object are equal", {
                    actual: sobj.equals(gobj),
                    expect: true
                });

                result.check("set object and get object have same ID", {
                    actual: sobj.objectId() === gobj.objectId(),
                    expect: true
                });

                result.check("size is correct", {
                    actual: manager.size(),
                    expect: 1
                });

                result.check("remove object returns object", {
                    actual: manager.removeKey(1),
                    expect: sobj
                });

                result.check("after remove, size is zero", {
                    actual: manager.size(),
                    expect: 0
                });

                result.check("after remove, get of key returns undefined", {
                    actual: manager.getKey(1),
                    expect: undefined
                });
			}
		}
	]
});
