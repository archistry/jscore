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
// Name:        changeset.js
// Created:        Thu Jan 21 16:08:45 GMT 2010
//
///////////////////////////////////////////////////////////////////////

/**
 * @name archistry.data
 * @namespace
 *
 * This namespace provides various data-centric utility
 * classes.
 */

namespace("archistry.data");

/**
 * This is a static object that represents the names of the
 * change operations.
 */

archistry.data.ChangeOp = {
    OBJECT_ADDED        : "object-added",
    OBJECT_CHANGED      : "object-changed",
    OBJECT_DELETED      : "object-removed",
    PROPERTY_CHANGED    : "property-changed",
    PROPERTY_ADDED      : "property-added",
    PROPERTY_REMOVED    : "property-removed"
};

/**
 * @class
 *
 * This class represents object property changes and
 * implements the Memento pattern.  It is fully initialized by
 * the constructor.
 *
 * @param object the object that was changed
 * @param change the nature of the change as a ChangeOp
 *            property value
 * @param key (optional) the property key that was changed (optional)
 * @param value (optional) the property key value
 * @param old (optional) the previous property key value, if any
 */

archistry.data.ChangeMemento = function(object, change, key, value, old)
{
    this.object = function() { return object; };
    this.change = function() { return change; };
    this.key = function() { return key; };
    this.value = function() { return value; };
    this.oldValue = function() { return old; };

    this.equals = function(rhs)
    {
        return this.valueOf().equals(rhs.valueOf());
    };

    this.compare = function(rhs)
    {
        return this.valueOf().compare(rhs.valueOf());
    };

    this.valueOf = function()
    {
        return [ object, change, key, value, old ];
    };

    this.toString = function()
    {
        return "[ChangeMemento object: {0}, change: {1}, key: {2}, value: {3}; oldValue: {4} ]".format(object, change, key, value, old);
    };
};

/**
 * @class
 *
 * This class defines the signals that are used by the
 * ObjectChangeObserver protocol.
 * <p>
 * This class can simply be mixed in to any class that wishes
 * to support these signals as a signal source.
 * </p>
 *
 * @param sender the sender
 */

archistry.data.ObjectChangeSignalSource = function(sender)
{
    var ChangeMemento = archistry.data.ChangeMemento;
    var ChangeOp = archistry.data.ChangeOp;
    var _self = this;

    $A(this).mixin(new archistry.core.SignalSource(sender));
    this.addValidSignals([
        "object-added",
        "object-removed",
        "object-changed"
    ]);

    /**
     * This method should be used whenever an object would
     * like to support ChangeMemento notifications of new
     * objects being added to (or created by) the container
     * object.
     * <p>
     * This method will automatically create the appropriate
     * ChangeMemento instance and notify all registered
     * listeners.
     * </p>
     *
     * @param object the object added
     */

    this.fireObjectAdded = function(object)
    {
//        Console.println("{0} object added", sender.objectId());
        _self.signalEmit("object-added", new ChangeMemento(object,
                    ChangeOp.OBJECT_ADDED));
    };

    /**
     * This method should be used whenever an object would
     * like to support ChangeMemento notifications of object
     * changes, but no additional information about the change
     * is available.
     * <p>
     * This method will automatically create the appropriate
     * ChangeMemento instance and notify all registered
     * listeners.
     * </p>
     *
     * @param object the object changed
     */

    this.fireObjectChanged = function(object)
    {
        _self.signalEmit("object-changed", new ChangeMemento(object,
                    ChangeOp.OBJECT_CHANGED));
    };

    /**
     * This method should be used whenever an object would
     * like to support ChangeMemento notifications of objects
     * being removed (or deleted) from the instance.
     * <p>
     * This method will automatically create the appropriate
     * ChangeMemento instance and notify all registered
     * listeners.
     * </p>
     *
     * @param object the object being removed
     */

    this.fireObjectRemoved = function(object)
    {
        _self.signalEmit("object-removed", new ChangeMemento(object,
                    ChangeOp.OBJECT_REMOVED));
    };

    /**
     * This method should be used whenever an object would
     * like to support ChangeMemento notifications of object
     * properties being added to objects that the sender
     * manages.
     * <p>
     * This method will automatically create the appropriate
     * ChangeMemento instance and notify all registered
     * listeners.
     * </p>
     *
     * @param object the object that was changed
     * @param key the property key that was added
     * @param value the initial value for the property
     */

    this.fireObjectPropertyAdded = function(object, key, value)
    {
//        Console.println("{0} object property added", sender.objectId());
        _self.signalEmit("object-changed", new ChangeMemento(object,
                    ChangeOp.PROPERTY_ADDED, key, value));
    };

    /**
     * This method should be used whenever an object would
     * like to support ChangeMemento notifications of object
     * properties being removed from objects that the sender
     * manages.
     * <p>
     * This method will automatically create the appropriate
     * ChangeMemento instance and notify all registered
     * listeners.
     * </p>
     *
     * @param object the object that was changed
     * @param key the property key that was removed
     * @param value the property value when it was removed
     */

    this.fireObjectPropertyRemoved = function(object, key, value)
    {
        _self.signalEmit("object-changed", new ChangeMemento(object,
                    ChangeOp.PROPERTY_REMOVED, key, value));
    };

    /**
     * This method should be used whenever an object would
     * like to support ChangeMemento notifications of object
     * properties being changed for that the sender manages.
     * <p>
     * This method will automatically create the appropriate
     * ChangeMemento instance and notify all registered
     * listeners.
     * </p>
     *
     * @param object the object that was changed
     * @param key the property key that was removed
     * @param value the new value for the property
     * @param old the original or previous value for the
     *      property
     */

    this.fireObjectPropertyChanged = function(object, key, value, old)
    {
        _self.signalEmit("object-changed", new ChangeMemento(object,
                    ChangeOp.PROPERTY_CHANGED, key, value, old));
    };
};

/**
 * @class
 *
 * This class plays the role of the Caretaker in the Memento
 * pattern implementation.  It tracks a history of changes, so
 * can be used as the basis of an undo/redo facility.  It can
 * track changes automatically by being attached to a
 * ObjectChangeSignalSource, or change mementos can be
 * manually added to the changeset.
 *
 * @param options initializer options to be mixed in with the
 *        instance after it is created
 */

archistry.data.ChangeSet = function(options)
{
    $A(this).mixin(new archistry.data.ObjectChangeSignalSource(this))
    this.mixin(options);

    var _changes = [];
    var _self = this;

    /**
     * This method is used to add a new change to the
     * changeset.
     *
     * @param memento the change memento
     */

    this.add = function(memento)
    {
//        Console.println("{0} ChangeSet#add", _self.objectId());
        _changes.add(memento);
        _self.fireObjectAdded(memento);
    };

    /**
     * This method is used to delete a change from the
     * changeset.
     *
     * @param memento the instance to delete
     * @return a reference to the object removed or null if
     *        not in the changeset
     */

    this.remove = function(memento)
    {
        var obj = _changes.remove(memento);
        if(obj)
        {
            _self.fireObjectRemoved(obj);
        }
        return obj;
    };

    /**
     * This method is used to retrieve the specific memento by
     * item index.
     *
     * @param idx the index of the item
     * @return the change memento
     */

    this.get = function(idx)
    {
        return _changes[idx];
    };

    /** returns the number of items in the changeset */
    this.size = function() { return _changes.length; };
    
    /**
     * This method is used to attach the ChangeSet instance to
     * an ObjectChangeSignalSource so that all change mementos
     * are captured.
     *
     * @param source the signal source
     */

    this.attach = function(source)
    {
        source.signalConnect("object-added", _self.add);
        source.signalConnect("object-removed", _self.add);
        source.signalConnect("object-changed", _self.add);
    };

    /**
     * This method detaches the ChangeSet instance from the
     * ObjectChangeSignalSource.
     *
     * @param source the signal source
     */

    this.detach = function(source)
    {
        source.signalDisconnect("object-added", _self.add);
        source.signalDisconnect("object-removed", _self.add);
        source.signalDisconnect("object-changed", _self.add);
    };

};

/**
 * @class
 *
 * This is an implementation of a ChangeSet that only records
 * the last change for any object.  It is not suitable for
 * undo/redo operations, but it is useful for creating the
 * minimum of upates necessary to apply to some data store.
 *
 * @param options any additional configuration options or
 *        properties.
 */

archistry.data.CompactChangeSet = function(options)
{
    $A(this).mixin(new archistry.data.ObjectChangeSignalSource(this))
    this.mixin(options);
    if(!this.getKey)
    {
        this.getKey = function(memento)
        {
            return memento.object();
        };
    }

    var _self = this;
    var _changes = {};
    var _keys = [];

    /** @private */
    function getIdx(key)
    {
        for(var i = 0; i < _keys.length; ++i)
        {
            if(key === _keys[i])
                return i;
        }

        return null;
    }

    /**
     * This method is used to attach the ChangeSet instance to
     * an ObjectChangeSignalSource so that all change mementos
     * are captured.
     *
     * @param source the signal source
     */

    this.attach = function(source)
    {
        source.signalConnect("object-added", _self.add);
        source.signalConnect("object-removed", _self.add);
        source.signalConnect("object-changed", _self.add);
    };

    /**
     * This method detaches the ChangeSet instance from the
     * ObjectChangeSignalSource.
     *
     * @param source the signal source
     */

    this.detach = function(source)
    {
        source.signalDisconnect("object-added", _self.add);
        source.signalDisconnect("object-removed", _self.add);
        source.signalDisconnect("object-changed", _self.add);
    };

    /**
     * This method will store the specific change for the
     * object based on using the object as a key.  Therefore,
     * any previous change memento for that object will be
     * discarded.
     *
     * @param memento
     * @return the previous memento (if any)
     */

    this.add = function(memento)
    {
        var key = _self.getKey(memento);
//        Console.println("Generated key '{0}' for object '{1}'", key, (memento ? memento : "(null)"));
        var old = _changes[key];
        _changes[key] = memento;
        if(!old)
        {
            _keys.add(key);
            _self.fireObjectPropertyAdded(this, key, memento);
        }
        else
        {
            _self.fireObjectPropertyChanged(this, key, memento, old);
        }
        return old;
    };

    /**
     * This method will remove any memento currently stored
     * for the specified object.
     *
     * @param memento
     * @return the memento (if present)
     */

    this.remove = function(memento)
    {
        var key = _self.getKey(memento);
        var obj = _changes[key];
//        Console.println("retrieved '{0}' for key '{1}'", (obj ? obj : "(null)"), key);
        if(obj)
        {
            _keys.remove(key);
            delete _changes[key];
            _self.fireObjectPropertyRemoved(this, key, obj);
        }
        return obj;
    };

    /**
     * This method will retrieve the specific memento by the
     * item index (in this case, the object key).
     *
     * @param idx the index to the item
     * @return the change memento (if it exists)
     */

    this.get = function(idx)
    {
        if(typeof idx === "number")
            return _changes[_keys[idx]];

        return _changes[idx];
    };

    /**
     * This method will retrieve the size of the changeset
     */
    
    this.size = function() { return _keys.length; };
};
