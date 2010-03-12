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
// Name:		string.js
// Created:		Sat Dec  5 22:40:26 GMT 2009
// Split:		Fri Mar 12 08:07:57 GMT 2010
//
///////////////////////////////////////////////////////////////////////

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
            return "";
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
                if(obj.toString)
                {
                    rval = obj.toString();
                }
                else
                {
                    rval = "" + obj;
                }
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

    if(arguments.length <= 1 || params === undefined)
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
//    if(!source.replace)
//    {
//    print("source: " + source);
//    print("arguments.length: " + arguments.length);
//    print("\n\nparams: " + params.join(", "));
//    print("params: " + params.inspect());
//    print("params.length: " + params.length);
//    }

    // FIXME:  not sure why this is needed, but sometimes it is...
    if(!source.replace)
        source = source.toString();

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
    var args = [ this ];
    for(var i = 0; i < arguments.length; ++i)
    {
        args.add(arguments[i]);
    }
    return String.format.apply(this, args);
};
