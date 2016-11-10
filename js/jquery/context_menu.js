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
// Name:		context_menu.js
// Created:		Mon Jan 25 14:29:42 GMT 2010
// 
// This implementation is based on the original
// jquery.contextMenu.js version 1.0 by Cory S.N. LaViska from
// A Beautiful Site (http://abeautifulsite.net/).  The
// original terms of use and licensing are copied below:
//
// Terms of Use
//
// This software is licensed under a Creative Commons License
// and is copyrighted (C)2008 by Cory S.N. LaViska.
//
// For details, visit
// http://creativecommons.org/licenses/by/3.0/us/
//
//////////////////////////////////////////////////////////////////////

if(jQuery)( function() {
	var styles = archistry.ui.Styles;

	$.extend($.fn, {
		
		contextMenu: function(o, callback) {
			// Defaults
			if( o.menu == undefined ) return false;
			if( o.inSpeed == undefined ) o.inSpeed = 150;
			if( o.outSpeed == undefined ) o.outSpeed = 75;
			// 0 needs to be -1 for expected results (no fade)
			if( o.inSpeed == 0 ) o.inSpeed = -1;
			if( o.outSpeed == 0 ) o.outSpeed = -1;
			// Loop each context menu
			$(this).each( function() {
				var el = $(this);
				var offset = $(el).offset();
				// Add contextMenu class
				var _menu = $('#' + o.menu)
				_menu.addClass(styles.Widget.CONTEXT_MENU).
					addClass("ui-widget ui-state-default ui-corner-all");
				_menu.find('li a').addClass('ui-corner-all');
				// Simulate a true right click
				$(this).mousedown( function(e) {
					var evt = e;
					$(this).mouseup( function(e) {
						var srcElement = $(this);
						$(this).unbind('mouseup');
						if( evt.button == 2 ) {
							// Hide context menus that may be showing
							$("." + styles.Widget.CONTEXT_MENU).hide();
							// Get this context menu
							var menu = $('#' + o.menu);
							
							if( $(el).hasClass(styles.State.DISABLED) ) return false;
							
							// Detect mouse position
							var d = {}, x, y;
							if( self.innerHeight ) {
								d.pageYOffset = self.pageYOffset;
								d.pageXOffset = self.pageXOffset;
								d.innerHeight = self.innerHeight;
								d.innerWidth = self.innerWidth;
							} else if( document.documentElement &&
								document.documentElement.clientHeight ) {
								d.pageYOffset = document.documentElement.scrollTop;
								d.pageXOffset = document.documentElement.scrollLeft;
								d.innerHeight = document.documentElement.clientHeight;
								d.innerWidth = document.documentElement.clientWidth;
							} else if( document.body ) {
								d.pageYOffset = document.body.scrollTop;
								d.pageXOffset = document.body.scrollLeft;
								d.innerHeight = document.body.clientHeight;
								d.innerWidth = document.body.clientWidth;
							}
							(e.pageX) ? x = e.pageX : x = e.clientX + d.scrollLeft;
							(e.pageY) ? y = e.pageY : x = e.clientY + d.scrollTop;
							
							// Show the menu
							$(document).unbind('click');
							$(menu).css({ top: y, left: x }).fadeIn(o.inSpeed);
							// Hover events
							$(menu).find('A').mouseover( function() {
								$(menu).find(styles.State.HOVER).removeClass(styles.State.HOVER).addClass(styles.State.DEFAULT);
								$(this).parent().removeClass(styles.State.DEFAULT).addClass(styles.State.HOVER);
							}).mouseout( function() {
								$(menu).find(styles.State.HOVER).removeClass(styles.State.HOVER).addClass(styles.State.DEFAULT);
								$(this).parent().removeClass(styles.State.HOVER).addClass(styles.State.DEFAULT);
							});
							
							// Keyboard
							$(document).keypress( function(e) {
								var _hover = "LI" + styles.State.HOVER;
								switch( e.keyCode ) {
									case 38: // up
										if( $(menu).find(_hover).size() == 0 ) {
											$(menu).find('LI:last').addClass(styles.State.HOVER);
										} else {
											$(menu).find(_hover).removeClass(styles.State.HOVER).prevAll('LI:not(' + styles.State.DISABLED + ')').eq(0).addClass(styles.State.HOVER);
											if( $(menu).find(_hover).size() == 0 ) $(menu).find('LI:last').addClass(styles.State.HOVER);
										}
									break;
									case 40: // down
										if( $(menu).find(_hover).size() == 0 ) {
											$(menu).find('LI:first').addClass(styles.State.HOVER);
										} else {
											$(menu).find(_hover).removeClass(styles.State.HOVER).nextAll('LI:not(' + styles.State.DISABLED + ')').eq(0).addClass(styles.State.HOVER);
											if( $(menu).find(_hover).size() == 0 ) $(menu).find('LI:first').addClass(styles.State.HOVER);
										}
									break;
									case 13: // enter
										$(menu).find('LI.' + styles.State.HOVER + ' A').trigger('click');
									break;
									case 27: // esc
										$(document).trigger('click');
									break
								}
							});
							
							// When items are selected
							$('#' + o.menu).find('A').unbind('click');
							$('#' + o.menu).find('LI:not(' + styles.State.DISABLED + ') A').click( function() {
								$(document).unbind('click').unbind('keypress');
								$("." + styles.Widget.CONTEXT_MENU).hide();
								// Callback
								if( callback ) callback( $(this).attr('href').substr(1), $(srcElement), {x: x - offset.left, y: y - offset.top, docX: x, docY: y} );
								return false;
							});
							
							// Hide bindings
							setTimeout( function() { // Delay for Mozilla
								$(document).click( function() {
									$(document).unbind('click').unbind('keypress');
									$(menu).fadeOut(o.outSpeed);
									return false;
								});
							}, 0);
						}
					});
				});
				
				// Disable text selection
				if( $.browser.mozilla ) {
					$('#' + o.menu).each( function() { $(this).css({ 'MozUserSelect' : 'none' }); });
				} else if( $.browser.msie ) {
					$('#' + o.menu).each( function() { $(this).bind('selectstart.disableTextSelect', function() { return false; }); });
				} else {
					$('#' + o.menu).each(function() { $(this).bind('mousedown.disableTextSelect', function() { return false; }); });
				}
				// Disable browser context menu (requires both selectors to work in IE/Safari + FF/Chrome)
				$(el).add('UL.ui-context-menu').bind('contextmenu', function() { return false; });
				
			});
			return $(this);
		},
		
		// Disable context menu items on the fly
		disableContextMenuItems: function(o) {
			if( o == undefined ) {
				// Disable all
				$(this).find('LI').addClass(styles.State.DISABLED);
				return( $(this) );
			}
			$(this).each( function() {
				if( o != undefined ) {
					var d = o.split(',');
					for( var i = 0; i < d.length; i++ ) {
						$(this).find('A[href="' + d[i] + '"]').parent().addClass(styles.State.DISABLED);
						
					}
				}
			});
			return( $(this) );
		},
		
		// Enable context menu items on the fly
		enableContextMenuItems: function(o) {
			if( o == undefined ) {
				// Enable all
				$(this).find('LI.disabled').removeClass(styles.State.DISABLED);
				return( $(this) );
			}
			$(this).each( function() {
				if( o != undefined ) {
					var d = o.split(',');
					for( var i = 0; i < d.length; i++ ) {
						$(this).find('A[href="' + d[i] + '"]').parent().removeClass(styles.State.DISABLED);
						
					}
				}
			});
			return( $(this) );
		},
		
		// Disable context menu(s)
		disableContextMenu: function() {
			$(this).each( function() {
				$(this).addClass(styles.state.Disabled);
			});
			return( $(this) );
		},
		
		// Enable context menu(s)
		enableContextMenu: function() {
			$(this).each( function() {
				$(this).removeClass(styles.state.Disabled);
			});
			return( $(this) );
		},
		
		// Destroy context menu(s)
		destroyContextMenu: function() {
			// Destroy specified context menus
			$(this).each( function() {
				// Disable action
				$(this).unbind('mousedown').unbind('mouseup');
			});
			return( $(this) );
		}
		
	});
})(jQuery);
