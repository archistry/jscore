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
// Name:        jester.js
// Created:     Mon Dec  7 00:31:36 GMT 2009
//
///////////////////////////////////////////////////////////////////////

/*!
 * @package_name@
 * Version @version@
 *
 * Copyright 2009-2010 Archistry Limited.  All Rights Reserved.
 * http://software.archistry.com/
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *     * Redistributions of source code must retain the above
 *       copyright notice, this list of conditions and the following
 *       disclaimer.
 *
 *     * Redistributions in binary form must reproduce the above
 *       copyright notice, this list of conditions and the following
 *       disclaimer in the documentation and/or other materials provided
 *       with the distribution.
 *
 *     * Neither the name Archistry Limited nor the names of its
 *       contributors may be used to endorse or promote products derived
 *       from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 * COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @name jester
 * @namespace
 *
 * This is the root namespace for the Jester test framework.
 */

var jester = {

    /**
     * @name jester.runner
     * @namespace
     */
    runner: {},

    /**
     * @name jester.reporter
     * @namespace
     */
    reporter: {},

    /**
     * @name jester.util
     * @namespace
     */

    util: {}
};

/**
 * This is a static function that compares objects for
 * equality.  If the objects implement the
 * <code>#equals</code> method, that is used in favor of the
 * built-in <code>===</code> operator.  Additionally, if the
 * object defines a custom <code>#valueOf</code> operator,
 * that will be used in place of the actual object value for
 * comparison.
 * <p>
 * This implementation is adapted from the version in the
 * Archistry Core JavaScript Library, but has been modified to
 * not extend the base object class so that it doesn't
 * interfere with the library under test.
 * </p>
 *
 * @param lhs the left object
 * @param rhs the right object
 * @return true if equal; false otherwise
 */

jester.util.objectEquals = function(lhs, rhs)
{
    var l = lhs, r = rhs;

    if(l !== r)
    {
        if(l && l.sort !== undefined && r && r.sort !== undefined)
        {
            // maybe it's an array, so try that
            return jester.util.arrayEquals(lhs, rhs);
        }

        // it's an object or a literal
        if(l && l.equals !== undefined && l.equals(r))
        {
            return true;
        }
        else if(r && r.equals !== undefined && r.equals(l))
        {
            return true;
        }
        else
        {
            if(l && l.valueOf)
            {
                l = l.valueOf();
            }
            if(r && r.valueOf)
            {
                r = r.valueOf();
            }

            if(l === r)
            {
                return true;
            }
        }

        return false;
    }

    return true;
};

/**
 * This is a static function that will compare Arrays for
 * equality.  If the objects in the array implement an
 * <code>#equals</code> method, that method will be used in
 * place of the <code>===</code> operator.
 * <p>
 * This implementation is based on the version in the
 * Archistry Core JavaScript library,  but has been modified
 * to be an external function so that there are no potential
 * conflicts with the library under test.
 * </p>
 *
 * @param lhs the left array
 * @param rhs the right array
 * @return true if arrays are equal; false otherwise
 */

jester.util.arrayEquals = function(lhs, rhs)
{
    if(lhs.length != rhs.length)
        return false;
    
    for(var i = 0; i < lhs.length; ++i)
    {
        if(!jester.util.objectEquals(lhs[i], rhs[i]))
            return false;
    }
    return true;
};

/**
 * @class
 *
 * This class represents the result for a single test case.
 * Results can have multiple checks, but if any check fails,
 * the overall result of the test is failure.
 * <p>
 * Normally, you won't create instances of this class
 * directly, but it needs to be externalized so that the
 * various strategy implementations can create them as
 * required.
 * </p>
 *
 * @param name the description of the test
 */

jester.runner.TestResult = function(name)
{
    /**
     * The Check instances representing the individual checks
     * performed in the test.
     */

    this.checks = [];

    var objEqual = jester.util.objectEquals;
    var _started = new Date();
    var _finished = null;
    var _failed = false;
    var _exception = null;
    var _stacktrace = null;
    var _self = this;

    /**
     * @class
     * @private
     *
     * This holder class actually tracks each call to the
     * check function separately.  If the check fails, it
     * adds itself to the failures array.
     */

    function Check(d, a, e)
    {
        this.name = d;
        this.actual = a;
        this.expect = e;

        // this is totally bogus, but we'll need to 
        this.failed = !(objEqual(a, e));

        _self.checks[_self.checks.length] = this;
        if(this.failed)
            _failed = true;
    }

    /**
     * Records the finish time for the test case
     */

    this.finish = function() { _finished = new Date(); };

    /**
     * Returns the datetime when the test was started
     */

    this.started = function() { return _started; };

    /**
     * Returns the exception encountered during the test or
     * NULL if no exception was thrown.
     */

    this.exception = function() { return _exception; };

    /**
     * Returns the elapsed time for this test case
     */

    this.elapsed = function()
    {
        return (_finished.getTime() - _started.getTime()) / 100;
    };

    /**
     * Indicates whether this test passed and all the checks
     * were successful.
     *
     * @returns true/false
     */

    this.passed = function() { return !_failed; };

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

    this.check = function(desc, args)
    {
        new Check(desc, args.actual, args.expect);
    };

    /**
     * This method is used to log an exception/error
     * during execution.  It marks the test as failed
     */

    this.fail = function(e)
    {
        _failed = true;
        _exception = e;
        _stacktrace = printStackTrace();
    };

    this.stacktrace = function() { return _stacktrace; };
};

/**
 * @class
 *
 * This class handles the linear or synchronous test case
 * execution strategy.  It is the default strategy used unless
 * the context specifies a strategy = async property.
 */

jester.runner.SyncStrategy = function()
{
    var TestResult = jester.runner.TestResult;

    /**
     * This is the primary method in the Strategy interface
     * and is used to run a set of tests.
     *
     * @param reporter the reporter instance to be used for
     *      recording the test results.
     * @param desc the description of the test suite of
     *      related tests
     * @param ctx the test context that will be passed to each
     *      test case as the this reference
     * @param setup (optional) the global setup function
     *      defined on the root context
     * @param teardown (optional) the global teardown function
     *      defined on the root context
     */

    this.run = function(reporter, desc, ctx, setup, teardown)
    {
        if(ctx.strategy && ctx.strategy.match(/^async/i))
        {
            throw new Error("Internal error:  attempt to execute synchronous strategy with async context!");
        }

        if(!ctx.tests)
        {
            throw new Error("Definition error:  no test cases defined.");
        }

        var results = [];
        reporter.contextEnter(desc, ctx);
        for(var i = 0; i < ctx.tests.length; ++i)
        {
            var result = new TestResult(ctx.tests[i].what);
            reporter.testEnter(ctx, ctx.tests[i].what, result)
            if(setup)
                setup.apply(ctx);

            if(ctx.setup)
                ctx.setup.apply(ctx);
            
            if(ctx.tests[i].how)
            {
				if(Jester.config.catchExceptions)
				{
					try
					{
						ctx.tests[i].how.apply(ctx, [ result ]);
					}
					catch(e)
					{
						result.fail(e);
					}
				}
				else
				{
					ctx.tests[i].how.apply(ctx, [ result ]);
				}
            }
            if(ctx.teardown)
                ctx.teardown.apply(ctx);

            if(teardown)
                teardown.apply(ctx);

            result.finish();
            reporter.testExit(ctx, ctx.tests[i].what, result)
            results[result.length] = result;
        }
        reporter.contextExit(desc, ctx, results);
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

// FIXME: this whole thing needs to be revisited/refactored!

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

