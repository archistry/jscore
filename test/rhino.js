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
// Name:        rhino.js
// Created:     Mon Dec  7 17:39:41 GMT 2009
//
///////////////////////////////////////////////////////////////////////


function println(fmt)
{
    args = [];
    for(i = 1; i < arguments.length; ++i)
    {
        args[i - 1] = arguments[i];
    }
    print(String.format(fmt, args));
}

// load the core libraries
load('../archistry-core.min.js');
load('rhino-core-min.js');

try
{
    // load the tests
    load('js/core/test_util.js');
    load('js/core/test_hash.js');
    load('js/core/test_observer.js');
    load('js/core/test_path.js');
    load('js/core/test_string_format.js');
    load('js/data/test_indexer.js');
    load('js/data/test_changeset.js');
    load('js/data/test_object_adapter_manager.js');
    load('js/data/test_array_tree_model.js');
    load('js/data/test_object_tree_model.js');
    load('js/ui/test_tree_selection.js');
    load('js/ui/test_tree_selection_range.js');

    // print the results
    print(Jester.reporter.toString());
    println("Tests run: {0} ({1}); Failures: {2}", 
            Jester.reporter.testCount(), 
            Jester.reporter.checkCount(), 
            Jester.reporter.failures());
}
catch(e)
{
    println("caught unhandled error: {0}", e)
    print(printStackTrace(e));
}
java.lang.System.exit(Jester.reporter.failures());
