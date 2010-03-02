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
// Name:		core.js
// Created:		Sat Dec  5 22:40:26 GMT 2009
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

// this variable is a hack for working namespace support in
// all browser contexts.  "Global" isn't "global" in
// JavaScript unless it's created with the var keyword or as a
// regular variable declaration.

var __ajs_ns = {};

/**
 * This function is used to define an object hierarchy that
 * represents a "namespace" entry.  It will create
 * intermediate objects (including the top-level global
 * holder) that represent the string path.
 * <p>
 * For example, to declare the "com.example" namespace, you
 * would simply write:
 *
 * <pre>
 *   namespace("com.example");
 * </pre>
 *
 * And further in the code, you could define new classes as:
 * <pre>
 *   com.example.MyClass = function() { ... }
 * </pre>
 * </p>
 *
 * @param ns the namespace string to create
 */

namespace = function(ns)
{
	if('string' != typeof ns)
	{
		throw new ReferenceError("Must specify namespace path to be defined as a string!");
	}

    if(!ns.match(/^[_a-zA-Z]+[_.a-zA-Z0-9]*$/))
    {
        throw new Error("Syntax error:  Illegal namespace declaration");
    }

	var _global = (function(){return this;}).call();
	var global = __ajs_ns;
	var nspath = ns.split(".");
    var base = nspath[0];
	var root = global;
	var pc = "";
	for(var i = 0; i < nspath.length; ++i)
	{
		pc = nspath[i];
		if(root[pc] == null)
		{
			root[pc] = { };
		}
		root = root[pc];
	}

    if(!_global[base]) _global[base] = __ajs_ns[base];

    // NOTE:  this is necessary to ensure that the namespace
    // reference is defined "globally" so that it will be
    // available across window contexts in the browser
    // environment.  The _global reference above is only the
    // *initial* thing that happens to be global (depending on
    // the environment).  It WILL NOT always be the global,
    // because in the browser, new Window objects get created
    // and set as the global scope.
    if(typeof load !== 'function')
    {
        // only do this if not running console Rhino runtime
        if(!Window.prototype[base])
            Window.prototype[base] = __ajs_ns[base];
    }
};

///////////////////////////////////////////////////////////////////////
// Object class additions
///////////////////////////////////////////////////////////////////////

/**
 * This method functions similarly to the Ruby include
 * directive to provide mixin behavior by including the
 * properties of the specified object into the receiver.
 * <p>
 * If the receiver already has a property defined by the
 * prototype, the receiver's property is not altered.  Most of
 * the time, this is the behavior you'd expect, and it
 * prevents accidental loss of functionality in classes
 * including a prototype.
 * </p>
 * <p>
 * There are two ways to use this method--each with slightly
 * different effects, but which in practice are nearly
 * equivalent.
 * </p>
 * <p>
 * NOTE:  specifying an object (or function) as the argument
 * of this method that has attribute accessors
 * (getters/setters) defined, will only mix in the VALUES of
 * those attributes and not the methods themselves.  I don't
 * know of a good way around this issue...
 * </p>
 * <h3>
 * Case #1:
 * </h3>
 * <p>
 * Using the following construct, the prototype object will be
 * mixed in to both the instance of the function as well as
 * the function's prototype.
 * <pre>
 *   var P = { a: "a", b: function() {} };
 *   var A = function() {};
 *   A.mixin(P);
 *   var a = new A();
 * </pre>
 * </p>
 * <p>
 * Both the class A.a and A.b() will be defined as well as for
 * instances of A that are created afterwards, e.g. a.a == "foo"
 * and a.b == A.b.
 * </p>
 * <h3>
 * Case #2:
 * </h3>
 * <p>
 * This is a more likely scenario and is probably how it will
 * most often be used in practice as the including into the
 * prototype of the function really doesn't matter 99% of the
 * time.  This case is more like Ruby's include keyword,
 * except that it will only mixin the mixin object into
 * instances of the class, not the prototype of the class.
 * <pre>
 *   var A = function()
 *   {
 *     this.mixin(P);
 *   };
 *
 *   var a = new A();
 *   (a.a == P.a); // true
 *   (a.b == P.b); // true
 *   (A.a == P.a); // false
 *   (A.b == P.b); // false
 * </pre>
 * <p>
 * NOTES
 * <ul>
 *  <li>Much of this method was inspired by both Crockford's
 *    "Prototypical Inheritance in JavaScript" article and
 *    Peter Michaux's "Transitioning from Java Classes to
 *    JavaScript Prototypes" blog post.
 *  </li>
 *  <li>Use of 'inPrototype = false' may not have the effects
 *    you'd expect unless you really understand what's going
 *    on with prototypes.  This approach is useful to only
 *    limit the scope of the mixin behaior to the immediate
 *    receiver.  Any instances of the receiver created with
 *    'new SomeClass()' WILL NOT exhibit the mixin behavior.
 *    Occasionally, this could be what you want, but normally
 *    it isn't.
 *  </li>
 *
 * @param obj the prototype object
 * @param inPrototype optional parameter specifying if the
 *		prototype of the receiver should also receive the
 *		properties of the obj argument.  By default, this is
 *		true.
 * @return this
 */

Object.prototype.mixin = function(obj, inPrototype)
{
	if(!obj)
	{
		return this;
	}

	var src = obj;
	var p = null;
	if(typeof obj === 'function')
	{
		src = new obj();
	}
    for(p in src)
    {
		if(!this[p] && src[p] !== undefined)
		{
			this[p] = src[p];
		}
		if(this.prototype != null && this.prototype[p] == null && inPrototype != false)
		{
			this.prototype[p] = src[p];
		}
    }

	// mixin the prototype properties
	if(src.prototype != null)
	{
		for(p in src.prototype)
		{
			if(this[p] == null)
			{
				this[p] = src[p];
			}
			if(this.prototype != null && inPrototype != false)
			{
				this.prototype[p] = src[p];
			}
		}
	}

    return this;
};

/**
 * This function is used to dump the properties of the
 * specified object.
 */

Object.prototype.inspect = function()
{
	var s = "#<" + this.toString();
	for(var p in this)
	{
		// fix required for Firefox/jQuery
		if("domConfig" === p)
			return "";

		s += " " + p + "=";
		if(this[p] && typeof this[p] === 'function')
		{
			s += "function() {...}";
		}
		else
		{
// FIXME:  I don't know why this makes the browser go quite so
// slowly, but it doesn't seem to like the introspection... :(
//			if(this[p] instanceof Object)
//				s += this[p].inspect();
//			else
				s += this[p];
		}
	}

	s += ">";
	return s;
};

/**
 * This method returns a unique object ID for each object.  It
 * depends on having both the Math.uuid.js and md5.js
 * functions available.
 *
 * @return the unique object ID for this instance
 */

Object.prototype.object_id = function()
{
	if(this.__ajs_id)
	{
		return this.__ajs_id;
	}

	this.__ajs_id = "0x" + hex_md5(Math.uuid());
	return this.__ajs_id;
};

/**
 * This method provides a default implementation of
 * Object#equals that provides a framework for objects
 * implementing custom equality tests based on private values.
 * <p>
 * If both objects have a #valueOf method defined, it is
 * invoked and the value is compared using the strict equality
 * operator <code>===</code>.  NOTE:  in this case, if you are
 * defining a custom valueOf method that can return a mixture
 * of boxed and unboxed value types, you MUST define the
 * method as:
 * <pre>
 *   var A = function(val)
 *   {
 *      this.valueOf = function() { return val.valueOf(); };
 *   }
 * </pre>
 * If you don't, then you might get the scenario where on
 * instance is initialized with a this reference to a number
 * and your comparison value is manually initialized with a
 * number.  Since they are of different types, the
 * <code>===</code> check will fail.  However, ensuring that
 * the valueOf() operator is called as part of the valueOf
 * override will prevent any ambiguity (and possibly save you
 * an hour or two trying to figure out why things don't work
 * quite as you might've expected).
 * </p>
 * <p>
 * If both objects do not have a #valueOf method, the strict
 * equality test is performed on the two objects.
 * </p>
 * <h3>
 * Rationale
 * </h3>
 * <p>
 * The rationale behind this approach is that when writing
 * well-encapsulated JavaScript objects, it doesn't make sense
 * to expose all of the data via accessor methods.  Since
 * there's no concept of privileged access in JavaScript,
 * there needs to be a way to have some opaque way to get
 * visibility inside an arbitrary JavaScript object to get a
 * comparision value.
 * </p>
 * <p>
 * JavaScript already does something similar when strings and
 * objects are compared using the <code>==</code> operator,
 * but it does not do this same type of implicit conversion
 * when comparing two objects.  As a result, it seems like the
 * best approach to get an opaque value for each object will
 * be to implement the #valueOf method in your custom object
 * as follows:
 * <pre>
 *   var A = function(val)
 *   {
 *      this.valueOf = function()
 *      {
 *          return val;
 *      };
 *   };
 * </pre>
 * </p>
 * <p>
 * Once implemented, then the following equality tests will
 * show the indicated values:
 * <pre>
 * var a1 = new A(1);
 * var a2 = new A(1);
 *
 * print(a1 == a2);         // false
 * print(a1 === a2);        // false
 * print(a1.equals(a2));    // true
 * </pre>
 * </p>
 *
 * @param rhs the "right hand side" object to be compared with
 *      the receiver
 * @returns true or false
 */

Object.prototype.equals = function(rhs)
{
    if(rhs === undefined || rhs === null)
        return false;

    var lval = this;
    var rval = rhs;
    if(this.valueOf)
        lval = this.valueOf();

    if(rhs.valueOf)
        rval = rhs.valueOf();

//    println("lval: {0} vs. rval: {1}", [ lval, rval ]);
//    println("typeof lval: " + typeof lval);
//    println("typeof rval: " + typeof rval);
//    println("equal? " + (lval === rval));
    return lval === rval;
};

/**
 * This method uses the same approach with a user-defined
 * #valueOf operator to provide a generalized object
 * comparison method #compare.
 * <p>
 * Implementing the single #valueOf method will provide the
 * expected behavior for both object equality and comparison
 * operators, or the object can override the methods
 * themselves if all of the comparison values are public
 * properties.
 * </p>
 * <p>
 * The actual comparison of either the value returned by
 * #valueOf or the objects themselves is handled by the
 * built-in <code>===</code> and <code>&lt;</code> operators.
 * </p>
 *
 * @param rhs the "right hand side" object to compare
 * @returns -1, 0 or 1 depending on comparison of the value
 *      returned from #valueOf or the native object.
 */

Object.prototype.compare = function(rhs)
{
    var tval = this;
    var rval = rhs;

    if(this.valueOf) tval = this.valueOf();
    if(rhs.valueOf) rval = rhs.valueOf();

    if(tval === rval)
        return 0;
    else if(tval < rval)
        return -1;
    else
        return 1;
};

/**
 * This method is used to retrieve all of the property keys
 * for an object as an array.
 * <p>
 * By default, only non-method keys are returned.  However,
 * this behavior can be changed by passing 'true' as the
 * optional argument to retrieve all properties of the object.
 * </p>
 *
 * @param includeMethods (optional) set to true to include
 *      property keys whose values are functions.
 * @return the property key values as an array
 */

Object.prototype.keys = function(includeMethods)
{
    var keys = [];
    for(var k in this)
    {
        if(typeof this[k] === 'function' && !includeMethods)
            continue;

        keys.add(k);
    }

    return keys;
};

///**
// * This method redefines the default toString to display the
// * object id rather than the meaningless [object Object]
// * toString that's the default implementation.
// *
// * @return a string containing the object ID
// */
//
//Object.prototype.toString = function()
//{
//	return "[object: " + this.object_id() + "]";
//};

///////////////////////////////////////////////////////////////////////
// Array class additions
///////////////////////////////////////////////////////////////////////

/**
 * This method allows objects to be added to the array without
 * having to deal with the length stuff.
 *
 * @param obj the object to add
 * @returns this so that you can chain the invocations
 */

if(Array.prototype.add == null)
{
	Array.prototype.add = function(obj)
	{
		this[this.length] = obj;
		return this;
	};
}

/**
 * This method is used to override the inspect behavior for
 * arrays.
 */

Array.prototype.inspect = function()
{
	var s = "[ ";
	for(var i = 0; i < this.length; ++i)
	{
		s += this[i].inspect();
		if(i < this.length - 1)
		{
			s += ", "
		}
	}
	return s + "]";
};

/**
 * This method will return the index if the element exists in
 * the array or -1 if it does not.
 *
 * @param obj the object to check
 * @return the integer index of the matching object or -1 if
 *		not found
 */

Array.prototype.indexOf = function(obj)
{
	var idx = -1;
	for(var i = 0; i < this.length; ++i)
	{
		if(this[i].equals)
		{
			if(this[i].equals(obj))
			{
				return i;
			}
		}
		else if(this[i] === obj)
		{
			return i;
		}
	}
	return idx;
};

/**
 * This method will return true if the array includes the
 * indicated object or false if it does not.
 */

Array.prototype.includes = function(obj)
{
	return this.indexOf(obj) != -1;
};

Array.prototype.include = Array.prototype.includes;

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.removeRange = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

/**
 * This method will remove the specified object at the given
 * index.  It is based on the above implementation
 * of removeRange (I changed the name), but it returns the
 * object that was removed.
 *
 * @param idx the index of the object to remove
 * @return the item or null
 */

Array.prototype.removeAtIndex = function(idx)
{
    if(idx >=0 && idx < this.length)
    {
		var mobj = this[idx];
		var rest = this.slice(idx + 1 || this.length);
		this.length = idx;
		this.push.apply(this, rest);
		return mobj;
    }
    return null;
};

/**
 * This method will attempt to remove the specified object
 * from the array.
 *
 * @param obj the object to remove
 * @return the object removed
 */

Array.prototype.remove = function(obj)
{
	return this.removeAtIndex(this.indexOf(obj));
};

/**
 * This method allows the array to be cleared without creating
 * another array instance.
 */

Array.prototype.clear = function()
{
    this.splice(0, this.length);
    return this;
};

/**
 * This method provides an each iterator and calls the
 * callback with the this reference set to the array element
 * and the index of the item in the array.  To abort the
 * traversal of the array, the callback should return a
 * value.
 *
 * @param callback the callback function
 * @return reference to the array or the return value of
 *      the callback
 */

Array.prototype.each = function(callback)
{
    var rc = null;
    for(var i = 0; i < this.length; ++i)
    {
        rc = callback.apply(this[i], [ i ]);
        if(rc !== undefined)
            return rc;
    }

    return this;
};

/**
 * This method provides an each iterator and calls the
 * callback with the this reference set to the array element
 * and the index of the item in the array.  Like the
 * forward iterator, to abort the traversal, return a
 * value from the callback
 *
 * @param callback the callback function
 * @return reference to the array
 */

Array.prototype.reverseEach = function(callback)
{
    var rc = null;
    for(var i = this.length - 1; i >= 0; --i)
    {
        rc = callback.apply(this[i], [ i ]);
        if(rc !== undefined)
            return rc;
    }

    return this;
};

/**
 * This method allows equality checks of array values.  If the
 * arrays are the same length and the elements are the same,
 * they are considered equal.
 *
 * @param rhs the right hand side to test
 * @returns true if equal; false otherwise
 */

Array.prototype.equals = function(rhs)
{
    if(this.length != rhs.length)
        return false;

    for(var i = 0; i < this.length; ++i)
    {
        var l = this[i];
        var r = rhs[i];
        if(!l && r)
            return false;

        if(l.equals && r.equals)
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

/**
 * This method is used to compare two arrays.  The rules for
 * ordering will be as follows:
 * <ul>
 * <li>Shorter arrays will be ordered first</li>
 * <li>If the arrays are the same length, they will be ordered
 * by comparing the elements in them</li>
 * </ul>
 *
 * @param rhs the "right hand side" array
 * @return -1, 0, or 1
 */

Array.prototype.compare = function(rhs)
{
    if(!rhs.length)
        return 1;

    if(this.length < rhs.length)
        return -1;
    else if(this.length > rhs.length)
        return 1;

    var rval = this.each(function(i) {
        var l = this;
        var r = rhs[i];
        var rc = 0;
        if(l.compare)
        {
            rc = l.compare(r);
            if(rc !== 0)
                return rc;
        }
        else if(r.compare)
        {
            rc = r.compare(l);
            if(rc !== 0)
                return 1 - rc;
        }
        if(l.valueOf) l = l.valueOf();
        if(r.valueOf) r = r.valueOf();

        if(l < r)
            return -1;
        else if(l > r)
            return 1;
    });

    if(rval === undefined)
        return 0;

    return rval;
};

// I can't believe JS doesn't have a string trim function...or
// a working clone...FFS!!!

/**
 * This method trims leading whitespace from the string and
 * returns a copy.  The original string is not changed.
 */

String.prototype.ltrim = function()
{
	var s = this;
	return s.replace(/^\s*/, "");
};

/**
 * This method trims trailing whitespace from the string and
 * returns a copy.  The original string is not changed.
 */

String.prototype.rtrim = function()
{
	var s = this;
	return s.replace(/\s*$/, "");
};

/**
 * This method strips both leading and trailing whitespace
 * from the string and returns a copy.  The original string is
 * not changed.
 */

String.prototype.trim = function()
{
	var s = this;
	return s.ltrim().rtrim();
};

/**
 * This method provides a way to format strings in a similar
 * manner to the <a
 * href="http://msdn.microsoft.com/en-us/library/system.string.format%28VS.71%29.aspx">C#
 * String#format method</a> and was originally written by <a
 * href="http://blairmitchelmore.com/javascript/string.format">Blair
 * Mitchelmore</a> (<em>accessed on 210-01-15T19:29</em>).
 * However, it has been mostly rewritten to more closely implement
 * the C# String#format specification and to "do the right
 * thing" when giving it a single object argument that isn't a
 * string.
 * <h3>
 * Format Specifiers
 * </h3>
 * <p>
 * Format specifiers take the basic form of { <em>N [, M ][:
 * format ]</em> } where:
 * <ul>
 * <li>
 * <p>
 * <em>N</em> is a zero-based reference to parameters
 * specified after the format string.  This implementation
 * allows all parameters to be specified as either members of
 * a single array parameter, or as a variable-length list of
 * parameters that should be used as the arguments to this
 * method.  If the requested parameter is not present in the
 * argument list, the empty string will be substituted in its
 * place.
 * </p>
 * </li>
 * <li>
 * <p>
 * <em>M</em> is an optional integer indicating the
 * minimum width of the formatted value.  If <em>M</em> is
 * negative, then the value will be left justified.  If
 * <em>M</em> is positive, the the value will be right
 * justified.  If the vaule of <em>M</em> is not specified or
 * the length of the value is greater than specified, the
 * value is ignored and the width of the substition will be
 * the width of the formatted value.
 * </p>
 * </li>
 * <li>
 * <p>
 * <em>format</em> is an optional string that is passed to
 * either a custom formatter or the toString method of the
 * specific object to allow further formatting to be performed
 * in a class-specific manner.  Custom formatters may be
 * defined for either the object or the class prototype, but
 * they MUST have the following signature:
 * <pre>
 *   function formatString(<em>format</em>) {
 *     // apply custom formatting to this reference
 *     return formattedString;
 *   }
 * </pre>
 * </p>
 * <p>
 * If the <code>#formatString</code> method exists in either
 * the object or the prototype, it will be used in preference
 * to the <code>#toString</code> method, as per Blair's
 * original implementation.
 * </p>
 * </li>
 * </ul>
 * </p>
 * <p>
 * Like the C# implementation, to include a literal
 * <code>{</code> or <code>}</code> in the resulting string,
 * it must be doubled, e.g. <code>String.format("{{my
 * braces}}")</code> will generate the string:
 * <code>"{my braces}"</code>.
 * </p>
 * <p>
 * Unlike the original version, if the first argument to the
 * method is not a string, it will be automatically converted
 * to the string representation of the object and no
 * additional formatting will be performed.
 * </p>
 *
 * @param fmt either a format string following the format
 *      specifiers above or one of a literal or an object
 *      instance to be converted as a string.
 * @param args the remaining arguments (if any) will be
 *      treated as objects to be formatted.  If the second
 *      argument is a single array, it MUST contain the
 *      objects referenced by the format string.
 * @returns the formatted string
 */

String.format = function(source, params) {
    var val = null;
    var _toString = function(obj, width, format) {
        if(obj === null || obj === undefined)
        {
            return "(null)";
        }

        if(typeof obj === 'number')
        {
            obj = new Number(obj);
        }
        else if(typeof obj === 'boolean')
        {
            obj = new Boolean(obj);
        }

//        print("obj: " + obj);
//        print("typeof obj: " + typeof obj);
//        print("width: " + width);
//        print("format: " + format);

        var rval = "";
        if(obj.formatString)
        {
            rval = obj.formatString(format);
        }
        else
        {
            if(format)
            {
                if(format.match(/^\d+$/))
                {
                    format = parseInt(format);
                }
                else if(format.match(/^\d+.\d+$/))
                {
                    format = parseFloat(format);
                }
                rval = obj.toString(format);
            }
            else
            {
                rval = obj.toString();
            }
        }
        
        if(width !== undefined)
        {
            width = parseInt(width);
            var pad = 0;
//            print("rval.length: " + rval.length);
//            print("pad: " + (width + rval.length));
//            print("pad2: " + (rval.length - width));
            if(width < 0 && (pad = width + rval.length) < 0)
            {
                for(var i = pad; i < 0; ++i)
                {
                    rval += " ";
                }
            }
            else if(width > 0 && (pad = rval.length - width) < 0)
            {
                var s = "";
                for(var i = pad; i < 0; ++i)
                {
                    s += " ";
                }
                rval = s + rval;
            }
        }

        return rval;
    };

    if(arguments.length === 1 || !params)
    {
        return source.toString();
    }
    else if(arguments.length === 2 && !(params instanceof Array))
    {
        params = [ params ];
    }
    else if(arguments.length > 2)
    {
        params = [].slice.call(arguments, 1);
    }
//    print("\n\nparams: " + params.join(", "));
//    print("params: " + params.inspect());
//    print("params.length: " + params.length);

    val = source.replace(/\{\{|\}\}|\{(\d+)(?:,(-?\d+))?(?::([^}]*))?\}/g,
            function(match, index, width, format) {
        if("{{" === match) return "{";
        if("}}" === match) return "}";
//        print("typeof index: " + typeof index);
        index = parseInt(index);
        if(params[index] !== undefined)
        {
            return _toString(params[index], width, format);
        }
        else
        {
            return "";
        }
    });

//    print("returning: " + val);
    return val;
};

/**
 * This method allows the string instance to be
 * directly used as the format specifier to format the
 * arguments per {@link String#format}.
 *
 * @param args the arguments to {@link String#format}
 * @return the formatted string
 */

String.prototype.format = function() {
    return String.format(this, [].slice.call(arguments));
};
