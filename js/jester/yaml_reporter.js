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
// Name:        yaml_reporter.js
// Created:     Mon Dec  7 00:31:36 GMT 2009
//
///////////////////////////////////////////////////////////////////////

/**
 * @class
 *
 * This reporter generates YAML output similar to the Ruby
 * Testy unit testing framework.
 */

jester.reporter.YAMLReporter = function()
{
    var output = "---";
    var started = new Date();
    var startedSuite = false;
    var failures = 0;
    var run = 0;
    var checks = 0;

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

        if(val === null || val === undefined)
        {
            // we can't print anything for YAML specification
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

    /**
     * This method is used to 'write' the output to the
     * specific string with the proper indent level required
     * by the YAML specification.
     *
     * @param indent the indent level
     * @param key the key to write
     * @param val the value to write
     */

    function write(indent, key, val)
    {
        var s = "\n";
        for(var i = 0; i < indent; ++i)
            s += "  ";

        s += key + ": " + format(val);
        output += s; 
    }

    /**
     * This method simply returns the output string as built
     * during processing the test execution.
     */

    this.toString = function() { return output; };
    
    /**
     * This method returns the number of failures counted by
     * the reporter.
     */

    this.failures = function() { return failures; };

    /**
     * This method is used to format the "suite enter"
     * information and is called either at the top context or
     * for each subsequent nested test context.
     *
     * @param desc the description of the tests
     * @param context the test context
     */

    this.suiteEnter = function(desc, context)
    {
        write(0, desc);
        if(this.showTimes)
        {
            write(1, "started", started);
        }
        startedSuite = true;
    };

    /**
     * This method is called whenever the overal test suite is
     * completed
     *
     * @param desc the description of the suite
     * @param context the test context
     */

    this.suiteExit = function(desc, context)
    {
        if(this.showTimes)
        {
            write(1, "elapsed", (new Date().getTime() - started.getTime()) / 100);
        }
    };

    /**
     * This method is called at the beginning of each test
     * context
     *
     * @param desc the description of the context
     * @param context the context to be executed
     */

    this.contextEnter = function(desc, context)
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
    };

    /**
     * This method is called at the end of each test context
     *
     * @param desc the description of the context
     * @param context the context that was exeucted
     * @param results the results list for the context
     */

    this.contextExit = function(desc, context, results)
    {
        if(this.showTimes)
        {
            write(context.indent + 1, "elapsed", (new Date().getTime() - context.started.getTime()) / 100);
        }
    };

    /**
     * This method retrieves the total number of tests run.
     */

    this.testCount = function() { return run; };

    /**
     * This method retrieves the total number of test checks run.
     */

    this.checkCount = function() { return checks; };

    /**
     * This method is called when the specific test is started
     *
     * @param context the test context
     * @param test the test about to be executed
     * @param result the result object passed to the test
     */

    this.testEnter = function(context, test, result)
    {
    };

    /**
     * This method is called after the test has been completed
     * and is responsible for actually performing the
     * determination of how the test reports should be
     * reported.
     *
     * @param context the test context
     * @param test the test that was executed
     * @param result the test results
     */

    this.testExit = function(context, test, result)
    {
        var indent = context.indent;
        write(indent, test);
        run++;
        checks += result.checks.length;

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
            var expect = [];
            var actual = [];
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
                else
                {
                    msg += "\n" + e.stacktrace();
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
    };
};
