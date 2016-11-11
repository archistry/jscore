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
// Name:        web_reporter.js
// Created:     Sat Mar  6 10:26:07 GMT 2010
//
///////////////////////////////////////////////////////////////////////

/**
 * @class
 *
 * At the moment, this class isn't very sophistocated, but it
 * is sufficient to verify that the tests will work in the
 * browser and provide the output required to determine if the
 * tests have passed or not.
 * <p>
 * NOTE:  this module has a dependency on Archistry Core
 * </p>
 *
 * @param elt the element ID of the containing div where the
 *      output should be placed
 */

jester.reporter.WebReporter = function(elt)
{
    var H = archistry.ui.Helpers;
    var _yaml = Jester.reporter;
    var _root = H.e(elt);
    var _failures = H.ne("p");
    var _tests = H.ne("p");
    var _output = H.ne("div");
    var _count = 0;

    _root.appendChild(_failures);
    _root.appendChild(_tests);
    _root.appendChild(_output);

    function update()
    {
        // NOTE:  IE re-parses on innerHTML, so it will lose
        // the newlines in the output unless you regenerate
        // the whole PRE tag.  FFS!
        _output.innerHTML = String.format("<pre>{0}</pre>", 
                _yaml.toString().replace(/failure/g, "<span style='background: red; color: white; font-weight: bold;'>failure</span>"));
        _failures.innerHTML = "Failures: {0}".format(_yaml.failures());
        _tests.innerHTML = "Tests: {0} ({1})".format(_yaml.testCount(), _yaml.checkCount());
    }

    this.failures = function() { return _yaml.failures(); };
    this.suiteEnter = function(desc, context)
    {
        _yaml.suiteEnter(desc, context);
    };

    this.suiteExit = function(desc, context)
    {
        _yaml.suiteExit(desc, context);
        update();
    };

    this.contextEnter = function(desc, context)
    {
        _yaml.contextEnter(desc, context);
    };

    this.contextExit = function(desc, context, results)
    {
        _yaml.contextExit(desc, context, results);
    };

    this.testEnter = function(context, test, result)
    {
    };

    this.testExit = function(context, test, result)
    {
        _yaml.testExit(context, test, result);
        _count++;
        update();
    };

    update();
};

