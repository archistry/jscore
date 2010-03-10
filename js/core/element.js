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
// Name:		element.js
// Created:		Sat Dec  5 22:40:26 GMT 2009
//
///////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////
// Element class additions (isolated here so we can easily
// include core.js in command-line applications)
///////////////////////////////////////////////////////////////////////

try
{
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
        if(this.xml)
        {
            return this.xml;
        }
        else if(this.outerHTML)
        {
            return this.outerHTML;
        }

        // do it ourselves...
        if(str == null)
        {
            str = "";
        }
        var xmls = new XMLSerializer();
        return str + xmls.serializeToString(this);
    };
}
catch(e)
{
    // must be IE... :(
}
