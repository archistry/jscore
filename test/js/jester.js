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
// Name:        jester.js
// Created:     Mon Dec  7 00:31:36 GMT 2009
//
///////////////////////////////////////////////////////////////////////

var jester = {
    runner: {}
};

if(Array.prototype.equals === undefined)
{
    Array.prototype.equals = function(rhs)
    {
        if(this.length != rhs.length)
        {
            return false;
        }
        for(var i = 0; i < this.length; ++i)
        {
            var l = this[i];
            var r = rhs[i];
            if(l == null && r != null)
            {
                return false;
            }

            if(l.equals != null && r.equals != null)
            {
                if(!(l.equals(r)))
                    return false;
            }
            else
            {
                if(l != r)
                    return false;
            }
        }
        return true;
    };
}

/**
 * This class represents the result for a single test case.
 * Results can have multiple checks, but if any check fails,
 * the overall result of the test is failure.
 *
 * Normally, you won't create instances of this class
 * directly, but it needs to be externalized so that the
 * various strategy implementations can create them as
 * required.
 *
 * @param test the description of the test
 */

jester.runner.TestResult = function(test)
{
    var name = test
    var started = new Date();
    var finished = null;
    var checks = new Array();
    var failed = false;
    var exception = null;

    /**
     * This holder class actually tracks each call to the
     * check function separately.  If the check fails, it
     * adds itself to the failures array.
     */

    function Check(d, a, e)
    {
        function objEqual(l, r)
        {
            if((l === null && r !== null)
                    || (r === null && l !== null))
            {
//                println("A");
                return false;
            }
            else if(l === null && r === null)
            {
//                println("B");
                // special handling for the undefined case
                return true;
            }

            if(l.equals === null || r.equals === null)
            {
//                println("c");
                return l === r;
            }
            else
            {
//              println("d");
                return l.equals(r);
            }
        }

        this.name = d;
        this.actual = a;
        this.expect = e;

        // this is totally bogus, but we'll need to 
        this.failed = !(objEqual(a, e));

        checks[checks.length] = this;
        if(this.failed)
            failed = true;
    }

    return {
        checks: checks,
        finish: function() { finished = new Date(); },
        started: function() { return started; },
        exception: function() { return exception; },
        elapsed: function()
        {
            return (finished.getTime() - started.getTime()) / 100;
        },
        passed: function() { return !failed; },

        /**
         * This is the main function used within test
         * implementations.  To make a check, you must supply
         * the description and an object with properties for
         * actual and expected values, e.g.:
         *
         *   check("check #1", { actual: val, expect: 21 });
         *
         * @param desc the description of the check
         * @param params the object contining the actual and
         *        expected values.
         */

        check: function(desc, args)
        {
            new Check(desc, args.actual, args.expect);
        },

        /**
         * This method is used to log an exception/error
         * during execution.  It marks the test as failed
         */

        fail: function(e)
        {
            failed = true;
            exception = e;
        }
    };
};

/**
 * This reporter generates YAML output similar to the Ruby
 * Testy unit testing framework.  The output of the 
 */

jester.runner.YAMLReporter = function()
{
    var output = "---";
    var started = new Date();
    var startedSuite = false;
    var failures = 0;

    /**
     * This method is used to actually format the specific
     * value that should be displayed to the user.
     *
     * @param val
     * @return the string representation of the value
     */

    function format(val)
    {
        var s = "";

        if(val === undefined)
        {
            // s += "(undefined)";
            // We actually want to skip this one...
        }
        else if(val === null)
        {
            s += "(null)";
        }
        else if(val instanceof Array)
        {
            s += "[";
            for(var i = 0; i < val.length; ++i)
            {
                s += format(val[i]);
                if(i < val.length - 1)
                    s += ","
            }
            s += "]";
        }
        else
        {
            s += val;
        }
        return s;
    }

    function write(indent, key, val)
    {
        var s = "\n";
        for(var i = 0; i < indent; ++i)
            s += "  ";

        s += key + ": " + format(val);
        output += s; 
    }

    return {
        failures: function() { return failures; },
        toString: function() { return output; },
        suiteEnter: function(desc, contexts)
        {
            write(0, desc);
            if(this.showTimes)
            {
                write(1, "started", started);
            }
            startedSuite = true;
        },

        suiteExit: function(desc, contexts)
        {
            if(this.showTimes)
            {
                write(1, "elapsed", (new Date().getTime() - started.getTime()) / 100);
            }
        },

        contextEnter: function(desc, context)
        {
            context.started = new Date();
            if(startedSuite)
            {
                context.indent = 1;
                write(context.indent, desc);
            }
            else
            {
                context.indent = 0;
                write(context.indent, desc);
                context.indent = 1;
            }

            if(this.showTimes)
            {
                write(context.indent + 1, "started", context.started);
            }
        },

        contextExit: function(desc, context, results)
        {
            if(this.showTimes)
            {
                write(context.indent + 1, "elapsed", (new Date().getTime() - context.started.getTime()) / 100);
            }
        },

        testEnter: function(context, test, result)
        {
        },

        testExit: function(context, test, result)
        {
            var indent = context.indent;
            write(indent, test);

            if(this.showTimes)
            {
                write(indent + 1, "started", result.started());
                write(indent + 1, "elapsed", result.elapsed());
            }

            if(result.passed())
            {
                write(indent + 1, "success");
                for(var i = 0; i < result.checks.length; ++i)
                {
                    check = result.checks[i];
                    write(indent + 2, check.name, check.actual);
                }
            }
            else
            {
                var expect = new Array();
                var actual = new Array();
                for(var i = 0; i < result.checks.length; ++i)
                {
                    check = result.checks[i];
                    expect[i] = { name: check.name, val: check.expect };
                    actual[i] = { name: check.name, val: check.actual };

                    if(check.failed)
                    {
                        failures += 1;
                    }
                }
                write(indent + 1, "failure");
                var e = result.exception();
                if(e)
                {
                    var msg = e.toString();
                    if(e.fileName)
                    {
                        msg += " (" + e.fileName + "#" + e.lineNumber + ")"
                    }
                    write(indent + 2, "exception", msg);
                    failures += 1;
                }
                else
                {
                    write(indent + 2, "expect");
                    for(var i = 0; i < expect.length; ++i)
                    {
                        write(indent + 3, expect[i].name, expect[i].val);
                    }
                    write(indent + 2, "actual");
                    for(var i = 0; i < actual.length; ++i)
                    {
                        write(indent + 3, actual[i].name, actual[i].val);
                    }
                }
            }
        }
    };
};

/**
 * This class handles the linear or synchronous test case
 * execution strategy.  It is the default strategy used unless
 * the context specifies a strategy = async property.
 */

jester.runner.SyncStrategy = function()
{
    return {
        run: function(reporter, desc, ctx)
        {
            if(ctx.strategy != null)
            {
                if(ctx.strategy.match(/^async/i))
                {
                    throw "Internal error:  attempt to execute synchronous strategy with async context!";
                }
            }

            var results = new Array();
            reporter.contextEnter(desc, ctx);
            for(var i = 0; i < ctx.tests.length; ++i)
            {
                var result = new jester.runner.TestResult(ctx.tests[i].what);
                reporter.testEnter(ctx, ctx.tests[i].what, result)
                if(ctx.setup != null)
                {
                    ctx.setup(ctx);
                }
                if(ctx.tests[i].how != null)
                {
                    try
                    {
                        ctx.tests[i].how(ctx, result);
                    }
                    catch(e)
                    {
                        result.fail(e);
                    }
                }
                if(ctx.teardown != null)
                {
                    ctx.teardown(ctx);
                }
                result.finish();
                reporter.testExit(ctx, ctx.tests[i].what, result)
                results[result.length] = result;
            }
            reporter.contextExit(desc, ctx, results);
        }
    };
};

/**
 * This class handles the asynchronous test case execution
 * strategy.  This strategy is necessary when doing lots of
 * asynchronous activities in any of the setup, tests or
 * teardown functions.  Rather than move in a linear fashion
 * through the test sequence, the test sequence notifies the
 * strategy that it's ready for the next stage.
 * 
 * <p>
 * The required parameters to activate this strategy are:
 * <pre>
 *  "my test context": {
 *    strategy: async,
 *    ...
 *  }
 * </pre>
 * </p>
 * <p>
 * To trigger the strategy, tests MUST invoke the following
 * method from any async functions or at the end of any
 * standard setup/teardown block, e.g:
 *
 * <pre>
 *    Jester.testing("some feature", {
 *        "feature async tests": {
 *            strategy: "async",
 *            setup: function(context)
 *            {
 *                ...
 *                context.continue();
 *            },
 *            teardown: function(context)
 *            {
 *                ...
 *                context.continue();
 *            },
 *            tests: [
 *                {
 *                    what: "Function #1",
 *                    how: function(context, result)
 *                    {
 *                        myasyc({ callback: function()
 *                            {
 *                                result.check("condition #1", {
 *                                    actual: someval,
 *                                    expect: "value1"
 *                                });
 *                                context.continue();
 *                            }
 *                        });
 *
 *                        result.check("this is test #2", {
 *                            actual: "foo",
 *                            expect: "foo"
 *                        });
 *
 *                        // note that the test block exits, but
 *                        // the teardown function WILL NOT run
 *                        // until after the callback has
 *                        // finished.
 *                    }
 *                }
 *            ]
 *        }
 *    };
 *    </pre>
 *  </p> 
 */

jester.runner.AsyncStrategy = function()
{
    this.testSetup = function(reporter, ctx, test, result)
    {
        reporter.testEnter(ctx, test.what, result)
        if(ctx.setup != null)
        {
            ctx.setup(ctx);
        }
        else
        {
            // make sure we don't require a setup
            ctx.next();
        }
    }

    this.runTest = function(reporter, ctx, test, result)
    {
        if(test.how != null)
        {
            test.how(ctx, result);
            if(test.strategy == "sync")
            {
                // allow declarative synchronous tests
                ctx.next();
            }
        }
        else
        {
            // would be stupid to not have tests, but...
            ctx.next();
        }
    }

    this.testTeardown = function(reporter, ctx, test, result)
    {
        if(ctx.teardown != null)
        {
            ctx.teardown(ctx);
        }
        else
        {
            ctx.next();
        }
    }

    /**
     * This method tracks that the test has been finished.  If
     * all tests have been finished, then we close the
     * context.
     */

    this.testEnd = function(reporter, context, test, result)
    {
        reporter.testExit(context, test.what, result);
        this.completed += 1;
    }

    function State(strat, rep, ctx, tst)
    {
        var strategy = strat;
        var reporter = rep;
        var context = ctx;
        var test = tst;
        var result = new jester.runner.TestResult(test.what);
    
        this._afterTeardown = function()
        {
            this.nextOp = null;
            result.finish();
            ctx.results[result.length] = result;
            strategy.testEnd(reporter, ctx, test, result);
        }

        this._teardown = function()
        {
            this.nextOp = this._afterTeardown;
            strategy.testTeardown(reporter, this, test, result);
        }

        this._test = function()
        {
            this.nextOp = this._teardown;
            strategy.runTest(reporter, this, test, result);
        }

        this._setup = function()
        {
            this.nextOp = this._test;
            strategy.testSetup(reporter, this, test, result);
        }
        
        this.test = test;
        this.nextOp = this._setup;
        this.next = function() { this.nextOp(); }
    }

    this.initContext = function(reporter, context, test)
    {
        state = new State(this, reporter, context, test);

        // copy the context data variables
        for(var p in context)
        {
            state[p] = context[p];
        }
        return state;
    }

    this.waitForState = function()
    {
        if(this.state != null && this.state.nextOp != null)
        {
            setTimeout(this.waitForState, 200);
        }
        else
        {
            if(this.index == this.testCount)
            {
                return;
            }

            this.state = this.states[this.index];
            this.index += 1;
            this.state.next();
        }
    }

    this.run = function(reporter, desc, ctx)
    {
        if(ctx.strategy == null || ctx.strategy.match(/^sync/i))
        {
            throw "Internal error:  attempt to execute asynchronous strategy with non-async context!";
        }
        
        this.testCount = ctx.tests.length;
        this.completed = 0;
        ctx.results = new Array();
        ctx.desc = desc
        this.states = new Array();
        this.index = 0;
        reporter.contextEnter(desc, ctx);

        // build the test queue
        for(var i = 0; i < ctx.tests.length; ++i)
        {
            var state = this.initContext(reporter, ctx, ctx.tests[i]);
            this.states[this.states.length] = state
        }

        // FIXME:  this is a hack because we need to actually
        // wait for all the tests to complete when running on
        // the console.  I'm really not sure what the right
        // solution is for the browser.

        if(java == null)
        {
            for(var i = 0; i < states.length; ++i)
            {
                this.waitForState();
            }
        }
        else
        {
//            for(var i = 0; i < 60; ++i)
            for(;;)
            {
                this.waitForState();
                java.lang.Thread.sleep(500);
                if(this.index == this.testCount)
                {
                    break;
                }
            }
        }

        reporter.contextExit(ctx.desc,ctx, ctx.results);
    }
};

/**
 * This is the main class that is responsible for managing the
 * unit testing framework.  It is loosely based on ideas from
 * Ara T. Howard's Testy unit testing framework for Ruby.
 */

jester.JesterRunner = function()
{
    var reporter = new jester.runner.YAMLReporter();
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

    return {
        SYNC: "sync",
        ASYNC: "async",
        reporter: reporter,

        /**
         * The testing method is used to EITHER run the
         * testenv parameter as one of the following:
         *
         * - a default context.  The testenv is treated as a
         *     test context instance, and it MUST contain a
         *     tests property.  It can optionally contain
         *     setup and/or teardown properties.
         *
         * - an object containing at least one property that
         *   is a test context.  In this case, the testenv
         *   object MUST NOT include setup, teardown or tests
         *   properties.
         */

        testing: function(desc, testenv)
        {
            if(testenv.tests == null)
            {
                reporter.suiteEnter(desc, testenv);
                for(var c in testenv)
                {
                    var ctx = testenv[c];
                    run(this.reporter, c, ctx);
                }
            }
            else
            {
                run(this.reporter, desc, testenv);
            }
            reporter.suiteExit(desc, testenv);
        }
    };
};

var Jester = new jester.JesterRunner();
