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

///////////////////////////////////////////////////////////////////////
// Allow easy definition of namespaces 
///////////////////////////////////////////////////////////////////////

namespace = function(ns)
{
	if('string' != typeof ns)
	{
		throw new ReferenceError("Must specify namespace path to be defined as a string!");
	}

	var global = (function(){return this;}).call();
	var nspath = ns.split(".");
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
};

///////////////////////////////////////////////////////////////////////
// Object class additions
///////////////////////////////////////////////////////////////////////

/**
 * This method functions similarly to the Ruby include
 * directive to provide mixin behavior by including the
 * properties of the specified object into the receiver.
 *
 * If the receiver already has a property defined by the
 * prototype, the receiver's property is not altered.  Most of
 * the time, this is the behavior you'd expect, and it
 * prevents accidental loss of functionality in classes
 * including a prototype.
 *
 * There are two ways to use this method--each with slightly
 * different effects, but which in practice are nearly
 * equivalent.
 *
 * Case #1:
 *
 * Using the following construct, the prototype object will be
 * mixed in to both the instance of the function as well as
 * the function's prototype.
 *
 *   var P = { a: "a", b: function() {} };
 *   var A = function() {};
 *   A.mixin(P);
 *   var a = new A();
 *
 * Both the class A.a and A.b() will be defined as well as for
 * instances of A that are created afterwards, e.g. a.a == "foo"
 * and a.b == A.b.
 *
 * Case #2:
 *
 * This is a more likely scenario and is probably how it will
 * most often be used in practice as the including into the
 * prototype of the function really doesn't matter 99% of the
 * time.  This case is more like Ruby's include keyword,
 * except that it will only mixin the mixin object into
 * instances of the class, not the prototype of the class.
 *
 *   var A = function()
 *   {
 *		this.mixin(P);
 *	 };
 *
 *	 var a = new A();
 *	 (a.a == P.a); // true
 *	 (a.b == P.b); // true
 *	 (A.a == P.a); // false
 *	 (A.b == P.b); // false
 *
 * NOTES
 *  - Much of this method was inspired by both Crockford's
 *    "Prototypical Inheritance in JavaScript" article and
 *    Peter Michaux's "Transitioning from Java Classes to
 *    JavaScript Prototypes" blog post.
 *  
 *  - Use of 'inPrototype = false' may not have the effects
 *    you'd expect unless you really understand what's going
 *    on with prototypes.  This approach is useful to only
 *    limit the scope of the mixin behaior to the immediate
 *    receiver.  Any instances of the receiver created with
 *    'new SomeClass()' WILL NOT exhibit the mixin behavior.
 *    Occasionally, this could be what you want, but normally
 *    it isn't.
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
        if(this[p] == null)
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
	return "[" + this.toString() + "]";
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
		if(this[i].equals != null)
		{
			if(this[i].equals(obj))
			{
				return i;
			}
		}
		else if(this[i] == obj)
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
 * This method will attempt to remove the specified object
 * from the array.  It is based on the above implementation 
 * of removeRange (I changed the name).
 *
 * @param obj the object to remove
 * @return the object removed
 */

Array.prototype.remove = function(obj)
{
	var idx = this.indexOf(obj);
	if(idx != -1)
	{
		var mobj = this[idx];
		var rest = this.slice(idx + 1 || this.length);
		this.length = idx;
		this.push.apply(this, rest);
		return mobj;
	}
	return null;
};

///////////////////////////////////////////////////////////////////////
// Element class additions
///////////////////////////////////////////////////////////////////////

/**
 * This method allows you to approximate some of the
 * functionality in XPath DOM navigation by specifying
 * intermediate element names where you wish to locate a
 * nodelist of child elements.
 *
 * NOTE:  if any of the intermediate path elements contain
 * more than one instance, the results of the path will be
 * merged.
 *
 * FIXME:  this should really use XPath if it's available
 * rather than walking the DOM tree for performance.
 * Effectively, what this is doing is similar to the 
 * XPath: ".//path0//path1//...//pathN"
 *
 * @param path an array containing intermediate nodes
 * @return an Array containing the specified result nodes.
 */

Element.prototype.childElementsWithPath = function(path, lvl)
{
	var l = 0;
	var nodes = new Array();

	if(lvl != null)
	{
		l = lvl;
	}
	
	var tag = path[l];
	var list = this.getElementsByTagName(tag);
	
	l += 1;
	for(var i = 0; i < list.length; ++i)
	{
		if(l == path.length)
		{
			// we're at the leaf, so add the nodes
			nodes[nodes.length] = list[i];
		}
		else
		{
			// keep walking the tree path
			nodes = nodes.concat(list[i].childElementsWithPath(path, l));
		}
	}

	return nodes;
};

/**
 * This method is simply a shortcut to get XML out of an
 * arbitrary element.
 *
 * @param str the optional string to use to append the XML
 * @return the XML for this element and all of its children as
 *		a String
 */

Element.prototype.toXML = function(str)
{
	if(this.xml != null)
	{
		return this.xml;
	}

	// do it ourselves...
	if(str == null)
	{
		str = "";
	}
	var xmls = new XMLSerializer();
	return str + xmls.serializeToString(this);
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

// This implementation is from Blair Mitchelmore and was
// downloaded from http://blairmitchelmore.com/javascript/string.format
// on 2010-01-15T19:29 by ast

String.prototype.format = function() {
  return String.format(this, arguments.length == 1 ? arguments[0] : arguments);
};

String.format = function(source, params) {
  var _toString = function(obj, format) {
    var ctor = function(o) {
      if (typeof o == 'number')
        return Number;
      else if (typeof o == 'boolean')
        return Boolean;
      else if (typeof o == 'string')
        return String;
      else
        return o.constructor;
    }(obj);
    var proto = ctor.prototype;
    var formatter = typeof obj != 'string' ? proto ? proto.format || proto.toString : obj.format || obj.toString : obj.toString;
    if (formatter)
      if (typeof format == 'undefined' || format == "") 
        return formatter.call(obj);
      else
        return formatter.call(obj,format);
    else
      return "";
  };
  if ( arguments.length == 1 )
    return function() {
      return String.format.apply( null, [source].concat( Array.prototype.slice.call( arguments, 0 ) ) );
    };
  if ( arguments.length == 2 && typeof params != 'object' && typeof params != 'array')
    params = [ params ];
  if ( arguments.length > 2 ) 
    params = Array.prototype.slice.call(arguments, 1);
  source = source.replace(/\{\{|\}\}|\{([^}: ]+?)(?::([^}]*?))?\}/g, function(match, num, format) {
    if (match == "{{") return "{";
    if (match == "}}") return "}";
    if (typeof params[num] != 'undefined' && params[num] !== null) {
      return _toString(params[num], format);
    } else {
      return "";
    }
  });
  return source;
};

// end code from Blair Mitchelmore
