//////////////////////////////////////////////////////////////////////
//
// Copyright (c) 2009-2016 Archistry Limited
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
// Name:        test_string.js
// Created:     Tue Dec  8 17:49:59 GMT 2009
// Split: Fri Nov 18 10:58:09 SAST 2016
//
///////////////////////////////////////////////////////////////////////

Jester.testing("String mixin functionality", {
    tests: [
        {
            what: "ensure String trim methods work correctly",
            how: function(result)
            {
                var leading = " \n \t foo";
                var trailing = "foo   \n \t";
                var both = "    foo   ";

                result.check("ltrim removes leading whitespace", {
                    actual: leading.ltrim(),
                    expect: "foo"
                });

                result.check("ltrim does not change original string", {
                    actual: leading,
                    expect: " \n \t foo"
                });

                result.check("rtrim removes trailing whitespace", {
                    actual: trailing.rtrim(),
                    expect: "foo"
                });

                result.check("rtrim does not change original string", {
                    actual: trailing,
                    expect: "foo   \n \t"
                });

                result.check("trim strips leading whitespace", {
                    actual: leading.trim(),
                    expect: "foo"
                });
                
                result.check("trim does not change original string", {
                    actual: leading,
                    expect: " \n \t foo"
                });

                result.check("trim removes trailing whitespace", {
                    actual: trailing.trim(),
                    expect: "foo"
                });

                result.check("trim does not change original string", {
                    actual: trailing,
                    expect: "foo   \n \t"
                });

                result.check("trim strips both leading & trailing", {
                    actual: both.trim(),
                    expect: "foo"
                });
            }
        }
    ]
});
