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
// Name:        main.js
// Created:     Mon Dec  7 00:31:36 GMT 2009
//
///////////////////////////////////////////////////////////////////////

/**
 * @class
 *
 * This is the main class that is responsible for managing the
 * unit testing framework.  It is loosely based on ideas from
 * Ara T. Howard's Testy unit testing framework for Ruby.
 *
 * @property SYNC constant for synchronous tests
 * @property ASYNC constant for asynchronous tests
 * @property reporter the reporter to be used.  The default
 *      reporter is the YAML reporter for command-line output
 */

jester.JesterRunner = function()
{
    this.SYNC = "sync";
    this.ASYNC = "async";
    this.reporter = new jester.reporter.YAMLReporter();

    var sync = new jester.runner.SyncStrategy();
    var async = new jester.runner.AsyncStrategy();

    function run(reporter, c, ctx)
    {
        if(ctx.strategy != null && ctx.strategy.match(/^async/i))
        {
            async.run(reporter, c, ctx);
        }
        else
        {
            sync.run(reporter, c, ctx);
        }
    }

    /**
     * This is the primary method for starting a set of
     * related tests.  These test groups contain a description
     * of the group and a context object that describes the
     * tests to be performed.  Optionally, additional
     * sub-contects can be defined.
     *
     * @param desc the description of the test group
     * @param testenv the test context that is either the
     *      default context containing a <code>tests</code>
     *      property that is an array of test case objects.
     *      It may also define <code>setup</code> and
     *      <code>teardown</code> properties which are
     *      functions that will be executed before each test.
     *      <p>
     *      The testenv object MAY also contain sub-contexts
     *      that define additional test contexts.  Only one
     *      level of nesting is currently supported.
     *      </p>
     */

    this.testing = function(desc, testenv)
    {
        var setup = testenv.setup;
        var teardown = testenv.teardown;
        var started = false;

        for(var c in testenv)
        {
            if(typeof testenv[c] === 'string')
            {
                if(!started)
                {
                    this.reporter.suiteEnter(desc, testenv, setup, teardown);
                    started = true;
                }
                run(this.reporter, c, testenv[c]);
            }
        }

        run(this.reporter, desc, testenv);
        this.reporter.suiteExit(desc, testenv);
    };
};

/** This the global Jester object used by the tests */
var Jester = new jester.JesterRunner();
