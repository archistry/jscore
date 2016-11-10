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
// Name:		styles.js
// Created:		Fri Jan 15 10:45:10 GMT 2010
// Split:       Wed Mar 10 12:03:41 GMT 2010
//
///////////////////////////////////////////////////////////////////////

/**
 * @name archistry.ui
 * @namespace
 *
 * This namespace contains all of the base UI classes and
 * constants which do not require any particular JavaScript
 * toolkit other than this one.
 */

namespace("archistry.ui");

/**
 * @namespace
 *
 * This object defines the base styles that are common across
 * all of the UI components.  They also include all of the
 * jQueryUI CSS Framework definitions where appropriate so
 * that the core controls will play nice with jQueryUI themes.
 */

archistry.ui.Styles = {

	/**
	 * These are layout styles that apply to UI widgets
     * @field
	 */

	Layout: {
        /* @field */
		HIDDEN				: "ui-helper-hidden",
        /* @field */
		HIDDEN_ACCESSIBLE	: "ui-helper-hidden-acessible",
        /* @field */
		RESET				: "ui-helper-reset",
        /* @field */
		CLEARFIX			: "ui-helper-clearfix",
        /* @field */
		ZFIX				: "ui-helper-zfix"
	},

	/**
	 * These are widget styles that can be used for all the
	 * widget elements.
     * @field
	 */

	Widget: {
        /* @field */
		CONTROL				: "ui-widget",
        /* @field */
		HEADER				: "ui-widget-header",
        /* @field */
		CONTENT				: "ui-widget-content",
        /* @field */
		CONTEXT_MENU		: "ui-context-menu",
        /* @field */
		BUTTON_ICON_LEFT	: "ui-button-icon-left",
        /* @field */
		BUTTON_ICON_RIGHT	: "ui-button-icon-right"
	},

	/**
	 * These are widget state styles
     * @field
	 */

	State: {
        /* @field */
		DEFAULT				: "ui-state-default",
        /* @field */
		HOVER				: "ui-state-hover",
        /* @field */
		FOCUS				: "ui-state-focus",
        /* @field */
		ACTIVE				: "ui-state-active",
        /* @field */
		HIGHLIGHT			: "ui-state-highlight",
        /* @field */
		ERROR				: "ui-state-error",
        /* @field */
		ERROR_TEXT			: "ui-state-error-text",
        /* @field */
		DISABLED			: "ui-state-disabled",
        /* @field */
		PRIORITY_PRIMARY	: "ui-state-priority-primary",
        /* @field */
		PRIORITY_SECONDARY	: "ui-state-priority-secondary",
        /* @field */
		EDITING				: "aui-editing"
	}
};

/**
 * This object defines the default styles used for the grid
 * as it creates the various control objects.
 */

archistry.ui.Styles.Grid = {
    GRID                : "aui-grid " + archistry.ui.Styles.Widget.CONTROL,
    CELL                : "aui-grid-cell",
    CELL_SELECTED       : "aui-grid-cell-selected " + archistry.ui.Styles.State.HIGHLIGHT,
    CELL_DIRTY          : "aui-grid-cell-dirty ", // + archistry.ui.Styles.State.DIRTY,
    ROW                 : "aui-grid-row",
    ROW_CONTENT         : "aui-grid-row-data",
    ROW_HEADER          : "aui-grid-header " + archistry.ui.Styles.Widget.HEADER,
    ROW_SELECTED        : "aui-grid-row-selected " + archistry.ui.Styles.State.HIGHLIGHT,
    ROW_DIRTY           : "aui-grid-row-dirty",
    ROW_SENTINAL        : "aui-grid-row-sentinal",
    COLUMN_BASE         : "aui-grid-col-"
};
