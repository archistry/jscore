//////////////////////////////////////////////////////////////////////
//
// Copyright (c) 2010 Archistry Limited
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
// Name:		tree_util.js
// Created:		Sat Feb 20 11:12:27 GMT 2010
//
///////////////////////////////////////////////////////////////////////

namespace("archistry.data");

/**
 * This is a mixin class that provides some utility tree
 * walking functionality.
 */

archistry.data.TreeUtil = {
	/**
	 * This method is used to return the offset based on
	 * negative indexing.
	 *
	 * @param idx the specified index
	 * @param count the number of items
	 * @return the actual offset into the items
	 */

	mapIndex: function(idx, count)
	{
		if(count === 0)
		{
			return 0;
		}

		if(idx < 0 && (count - idx - 1 > -1))
		{
			return count - idx - 1;
		}
		else if(idx > -1)
		{
			return idx;
		}
		
		alert(printStackTrace());
		throw new Error(String.format("Index out of bounds: index: {0}; length: {1}", [ idx, count ]));
	},

	/**
	 * This helper is used to visit the path and apply the
	 * given callback to the node at each path element.
	 *
	 * @param root the start node
	 * @param path the path to visit
	 * @param childKey the key returning the array of child
	 *		nodes
	 * @param callback the function to execute for each node.
	 *		It MUST have the following signature:
	 *		  
	 *		  callback(path, node)
	 * @return the last path component node
	 */

	visitPath: function(root, path, childKey, callback)
	{
		var node = root;
		var n = null;

		for(var i = 0; i < path.length; ++i)
		{
			var pi = mapIndex(path[i], node[childKey].length);
			if((n = node[childKey][pi]))
			{
				if(callback)
					callback(path.slice(0, i + 1), n);
				node = n;
			}
			else
			{
				return;
			}
		}

		return node;
	},

	/**
	 * This helper is used to visit the parent nodes and apply
	 * the callback function to each parent of the start node.
	 *
	 * @param start the start node
	 * @param getParent the name of the node function to get the parent node
	 * @param callback the function to execute for each node.
	 *		It MUST have the following signature:
	 *		  
	 *		  callback(parent, node, depth)
	 * @return the depth of the node
	 */

	visitParents: function(start, getParent, callback)
	{
		var node = start;
		var parent = null;
		var depth = 0;
		
		while(node && (parent = node[getParent]()))
		{
			depth++;
			if(callback)
				callback(parent, node, depth);

			node = parent;
		}

		return depth;
	},
	
	/**
	 * This helper is used to visit the children of the node.
	 *
	 * @param root the start node
	 * @param childKey the key returning the array of child
	 *		nodes
	 * @param callback the function to execute for each node.
	 *		It MUST have the following signature:
	 *		  
	 *		  callback(parent, node, childIndex)
	 *		
	 *		If the callback returns false, the traversal will
	 *		be aborted for the specified node.
	 */

	visitChildren: function(root, childKey, callback)
	{
		if(!callback)
			return;
		
		var kidz = root[childKey];
		for(var i = 0; i < kidz.length; ++i)
		{
			if(callback(root, kidz[i], i))
				visitChildren(kidz[i], childKey, callback)
		}
	},

	/**
	 * This method determines if the indicated node is a leaf
	 * or not by the length of the childKey property.
	 *
	 * @param node the model node
	 * @param childKey the child nodes accessor
	 * @return true if node[childKey].length > 0
	 */

	isLeaf: function(node, childKey)
	{
		if(!node[childKey])
			return true;

		return node[childKey].length == 0;
	},

	/**
	 * This method returns the child count of the node.
	 *
	 * @param node the node
	 * @param childKey the child nodes accessor
	 * @return the length of the childKey array
	 */

	childCount: function(node, childKey)
	{
		if(!node[childKey])
			return 0;

		return node[childKey].length;
	},

	/**
	 * This method is used to retrieve the i-th child of the
	 * specified node.
	 *
	 * @param node the node
	 * @param childKey the child nodes accessor
	 * @param idx the index
	 * @return the child node at the specified index or null
	 *		if no child exists
	 */

	child: function(node, childKey, idx)
	{
		if(node[childKey].length === 0)
			return null;

		return node[childKey][mapIndex(idx, node[childKey].length)];
	},

	/**
	 * This method does a linear search of the child nodes to
	 * determine the result.
	 *
	 * @param parent the parent node
	 * @param childKey the child nodes accessor
	 * @param child the child node
	 * @return the index or -1 if the node is not a child of
	 *		the specified parent
	 */

	indexOfChild: function(parent, childKey, child)
	{
		if(parent[childKey].length === 0)
			return -1;

		for(var i = 0; i < parent[childKey].length; ++i)
		{
			if(child === parent[childKey][i])
				return i;
		}

		return -1;
	}
};
