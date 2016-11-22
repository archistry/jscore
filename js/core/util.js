//////////////////////////////////////////////////////////////////////
//
// Copyright (c) 2010-2016 Archistry Limited
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
// Name:		util.js
// Created:		Mon Mar  1 11:55:19 GMT 2010
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.core");

/**
 * @class
 *
 * This is a static class that allows mix-in of some core
 * helper methods that are independent of the UI or data
 * classes.
 */

archistry.core.Util = {
	/**
	 * This method is used to ensure default values are set
	 * which don't override any options already set via mixin
	 * calls.
	 *
	 * @param key the property key that is to be checked
	 * @param val the default value if there is not already a
	 *		key set.
	 */

	setDefault: function(key, val)
	{
		if(this[key] === undefined)
		{
			this[key] = val;
		}
	},

    /**
     * This method is used to create a new error object with
     * the specified arguments.
     *
     * @param fmt the message format (per String#format)
     * @param args variable length arguments to String#format
     *
     * @return an Error object
     */

    createError: function(fmt)
    {
        var msg = String.format("{0}\n{1}", [
                String.format.apply(this, arguments),
                printStackTrace()
            ]);
        return new Error(msg);
    },

    /**
     * This method is used to represent the given object as a
     * hash using similar notation to Ruby.
     *
     * @param obj the object to format
     * @return the string represetnation of the object
     */

    toHashString: function(obj)
    {
        if(obj === undefined)
            return "undefined";

        if(obj.toHashString)
            return obj.toHashString();

        // BS stuff for IE
        if(!obj.objectId)
			obj = $AW(obj);

        var s = "{ ";
        var keys = obj.keys().sort();
        keys.each(function(i) {
            var key = (typeof this === 'string') ? '"{0}"'.format(this) : this;
            var val = obj[this];
            val = (typeof val === 'string') ? '"{0}"'.format(val) : val;
            try
            {
                // FIXME:  IE bitches that an object was
                // expected here, but I don't know how to
                // adequately test whether it's an object or
                // not.  typeof tells me it's an object, so
                // WTF????
                if(val instanceof Array)
                    val = "[{0}]".format(val.join(','));
            }
            catch(e)
            {
            }

            s += "{0} => {1}".format(key, val);
            if(i < keys.length - 1)
                s += ", ";
        });
        return s += " }";
    },

    /**
     * This method is used to convert a property key to a label
     *
     * @param key the property key
     * @return the "humanized" property key label
     */

    key2label: function(key)
    {
        var s = key.replace(/[-_]/g, " ");
        return s[0].toUpperCase() + s.substring(1);
    },

    /**
     * This method is used to convert a human-readible or
     * human-entered string into a valid proxy property key.
     *
     * @param label the label (or string) to process
     * @return the property key
     */

    label2key: function(label)
    {
        return label.replace(/\s+/g, "-").toLowerCase();
    },

	/**
	 * This method is used to resolve a scoped object based on
	 * a string value.
	 */

	resolve: function(nspath)
	{
		if(!nspath.match(/^[_a-zA-Z]+[_.a-zA-Z0-9]*$/))
		{
			throw new Error("ArgumentError: illegal object name '{0}'".format(nspath));
		}

		var global = (function() { return this; }).call();
		var path = nspath.split(".");
		var obj = global;
		for(var i = 0; i < path.length; ++i)
		{
			if((obj = obj[path[i]]) === undefined)
				return undefined;
		}

		if(obj === global)
			return undefined;

		return obj;
	}
};

/**
 * This function defines a mechanism to correctly unmarshal
 * user-defined types stored as JSON.  The value of the
 * marshalled object must have a __jsonClass key to trigger
 * this function, and the resolved class identifier must have
 * a #fromJSON method defined on the object/class (not the
 * class instance).
 *
 * @param key the JSON#parse callback key
 * @param val the JSON#parse callback value
 * @return the object or value
 */

archistry.core.Util.unmarshalJSON = function(key, val)
{
	if(!val || !val.__jsonClass)
		return val;

	var jcn = val.__jsonClass;
	var jci = null
	if((jci = archistry.core.Util.resolve(jcn)))
	{
		if(jci.fromJSON && typeof jci.fromJSON === 'function')
		{
			return jci.fromJSON(val);
		}
	}
	return val;
};
