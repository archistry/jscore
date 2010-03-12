//////////////////////////////////////////////////////////////////////
//
// Copyright (c) 2009-2010 Archistry Limited
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
// Name:		object.js
// Created:		Sat Dec  5 22:40:26 GMT 2009
// Split:       Fri Mar 12 08:05:59 GMT 2010
//
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
//    println("Object#equals called for: {0} vs. {1}".format(this, rhs));
    if(rhs === undefined || rhs === null)
        return false;

    var lval = this;
    var rval = rhs;
    if(this.valueOf)
        lval = this.valueOf();

    if(rhs.valueOf)
        rval = rhs.valueOf();

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
//    println("Object#compare called for: {0} vs. {1}".format(this, rhs));
    var tval = this;
    var rval = rhs;

    if(rhs === undefined)
        return 0;

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
        try
        {
            if(this[k] instanceof Function && !includeMethods)
                continue;
            keys.add(k);
        }
        catch(e)
        {
            // ignored: likely called by jQuery on an element
        }
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
