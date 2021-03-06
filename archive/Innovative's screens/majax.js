/*
 *   MAJAX - The Millennium AJAX Library
 *
 *   Copyright 2007 by Godmar Back godmar@gmail.com 
 *   and Annette Bailey, Virginia Tech.
 *
 *   License: This software is released under the LGPL license,
 *   See http://www.gnu.org/licenses/lgpl.txt
 *
 *   $Id: majax.js,v 1.10 2007/05/22 20:47:17 gback Exp gback $
 *
 *   Instructions:
 *   ------------
 *   This file must be placed into the /screens directory of a III
 *   Millennium installation.   Subsequently, other webpages can 
 *   include this file to make AJAX calls to the Millennium system.
 *
 */

/*
 * Add an event handler, browser-compatible.
 * This code taken from http://www.dustindiaz.com/rock-solid-addevent/
 * See also http://www.quirksmode.org/js/events_compinfo.html
 *          http://novemberborn.net/javascript/event-cache
 */
function addEvent( obj, type, fn ) {
        if (obj.addEventListener) {
                obj.addEventListener( type, fn, false );
                EventCache.add(obj, type, fn);
        }
        else if (obj.attachEvent) {
                obj["e"+type+fn] = fn;
                obj[type+fn] = function() { obj["e"+type+fn]( window.event ); }
                obj.attachEvent( "on"+type, obj[type+fn] );
                EventCache.add(obj, type, fn);
        }
        else {
                obj["on"+type] = obj["e"+type+fn];
        }
}

/* unload all event handlers on page unload to avoid memory leaks */
var EventCache = function(){
        var listEvents = [];
        return {
                listEvents : listEvents,
                add : function(node, sEventName, fHandler){
                        listEvents.push(arguments);
                },
                flush : function(){
                        var i, item;
                        for(i = listEvents.length - 1; i >= 0; i = i - 1){
                                item = listEvents[i];
                                if(item[0].removeEventListener){
                                        item[0].removeEventListener(item[1], item[2], item[3]);
                                };
                                if(item[1].substring(0, 2) != "on"){
                                        item[1] = "on" + item[1];
                                };
                                if(item[0].detachEvent){
                                        item[0].detachEvent(item[1], item[2]);
                                };
                                item[0][item[1]] = null;
                        };
                }
        };
}();
addEvent(window,'unload',EventCache.flush);
// end of rock-solid addEvent

// Begin MAJAX code

function majaxProcessRemainingSpans(spanElems) {
    var processed = 0;
    while (spanElems.length > 0) {
        var spanElem = spanElems.pop();
        if (spanElem.expanded)
            continue;

        var cName = spanElem.className;
        if (cName == null)
            continue;

        var mReq = { 
            span: spanElem, 
            removeTitle: function () {
                this.span.setAttribute('title', '');
            },
            success: new Array(),
            failure: new Array(),
            onsuccess: function (result) {
                for (var i = 0; i < this.success.length; i++)
                    try {
                        this.success[i](this, result);
                    } catch (er) { }
                this.removeTitle();
            },
            onfailure: function (status) {
                for (var i = 0; i < this.failure.length; i++)
                    try {
                        this.failure[i](this, status);
                    } catch (er) { }
                this.removeTitle();
            },
            searchitem: function () {
                var m, req = this.span.getAttribute('title');
                if ((m = req.match(/^i(\S*)/)) != null)
                    return "ISBN '" + m[1] + "'";
                else if ((m = req.match(/^t(\S*)/)) != null)
                    return "Title '" + m[1] + "'";
                else if ((m = req.match(/^\.(b\S*)/)) != null)
                    return "Bibrecord '" + m[1] + "'";
                return
                    return "illegal majax title: " + req;
            }
        };

        function addHandler(majaxClass, mReq) {
            // insert field datafield/subfield only
            var m = majaxClass.match(/majax-marc-(\d\d\d)-(\S)/);
            if (m == null) {
                m = majaxClass.match(/majax-marc-(\d\d\d)/);
            }
            if (m) {
                mReq.success.push(function (mReq, result) {
                    var msg;
                    var dfield = result.marc['f' + m[1]];
                    if (m[2]) {
                        msg = dfield[m[2]] + " ";
                    } else {
                        var _1 = "abcdefghijklmnopqrstuvwxyz0123456789";
                        msg = "";
                        for (var i = 0; i < _1.length; i++) {
                            var d = dfield[_1.charAt(i)];
                            if (d !== undefined)
                                msg += d + " ";
                        }
                    }
                    mReq.span.appendChild(document.createTextNode(msg));
                });
                return true;
            }

            var ms = majaxClass.match(/majax-syndetics-(\S+)/i);
            if (ms) {
                var clientid = ms[1];
                mReq.success.push(function (mReq, result) {
                    var req = mReq.span.getAttribute('title');
                    if (req.charAt(0) == 'i') {
                        var img = document.createElement("img");
                        var isbn = req.substring(1);
                        img.setAttribute('src', 
                                "http://syndetics.com/hw7.pl?isbn=" + isbn 
                                + "/SC.GIF&client=" + clientid);
                        mReq.span.appendChild(img);
                    }
                });
                return true;
            }

            switch (majaxClass) {
            case "majax-showholdings-div":
            case "majax-shd":
                mReq.success.push(function (mReq, result) {
                    var divHTML = "";
                    for (var i = 0; i < result.holdings.length; i++) {
                        divHTML += "Copy " + (i+1) + ": " 
                                + result.holdings[i].toLowerCase() + "<br />";
                    }
                    var div = document.createElement("div");
                    div.innerHTML = divHTML;
                    mReq.span.appendChild(div);
                });
                break;

            case "majax-newline":
            case "majax-nl":
                mReq.success.push(function (mReq, result) {
                    mReq.span.appendChild(document.createElement("br"));
                });
                break;

            case "majax-space":
            case "majax-s":
                mReq.success.push(function (mReq, result) {
                    mReq.span.appendChild(document.createTextNode(" "));
                });
                break;

            case "majax-showholdings-brief":
            case "majax-shb":
                mReq.success.push(function (mReq, result) {
                    var isAvailable = false;
                    var msg = "";
                    for (var i = 0; i < result.holdings.length; i++) {
                        if (result.holdings[i].match(/AVAILABLE/))
                            isAvailable = true;
                        msg += (i == 0 ? "" : " ") + result.holdings[i].toLowerCase();
                    }
                    if (isAvailable) {
                        msg = "This item is available";
                    } else {
                        switch (result.holdings.length) {
                        case 1:
                            msg = "This item is " + msg;
                            break;
                        case 0:
                            msg = "No copy held";
                            if (result.marc.f856 && result.marc.f856.u)
                                msg = "";
                            break;
                        default:
                            msg = "No copy currently available (copies are " + msg + ")";
                        }
                    }
                    mReq.span.appendChild(document.createTextNode(msg));
                });
                break;

            case "majax-showholdings":
            case "majax-sh":
                mReq.success.push(function (mReq, result) {
                    var msg = "";
                    var isAvailable = false;
                    for (var i = 0; i < result.holdings.length; i++) {
                        msg += (i == 0 ? "" : ", ") + result.holdings[i].toLowerCase();
                        if (result.holdings[i].match(/AVAILABLE/)) {
                            isAvailable = true;
                        }
                    }
                    switch (result.holdings.length) {
                    case 0:
                        msg = "No copies found."; 
                        if (result.marc.f856 && result.marc.f856.u)
                            msg = "";
                        break;
                    case 1:
                        msg = "1 copy is " + msg; break;
                    default:
                        msg = result.holdings.length + " copies found: " + msg;
                        break;
                    }
                    mReq.span.appendChild(document.createTextNode(msg));
                    // XXX: if !isAvailable && bibnumber given, add request button
                });
                break;

            case "majax-reportfailure":
            case "majax-rf":
                mReq.failure.push(function (mReq, status) {
                    var msg = mReq.searchitem() + " not found";
                    mReq.span.appendChild(document.createTextNode(msg));
                });
                break;

            case "majax-endnote":
            case "majax-en":
                mReq.success.push(function (mReq, result) {
                    var p = document.createElement("PRE");
                    p.className += "majax-endnote-style";
                    p.appendChild(document.createTextNode(result.endnote));
                    mReq.span.appendChild(p);
                });
                break;

            case "majax-endnote-switch":
            case "majax-ens":
                mReq.success.push(function (mReq, result) {
                    var p = result.majaxMakeEndnoteDisplay(document, 
                            " Endnote", "Show", "Hide", "majax-endnote-style");
                    mReq.span.appendChild(p);
                });
                break;

            case "majax-harvard-reference":
            case "majax-hr":
                mReq.success.push(function (mReq, result) {
                    mReq.span.innerHTML += result.majaxMakeHarvardReference();
                });
                break;

            case "majax-endnote-import":
            case "majax-eni":
                mReq.success.push(function (mReq, result) {
                    var a = result.majaxMakeEndnoteImport(document);
                    a.appendChild(document.createTextNode("Click here to import into EndNote"));
                    mReq.span.appendChild(a);
                });
                break;

            case "majax-ebook":
            case "majax-eb":
                mReq.success.push(function (mReq, result) {
                    try {
                        // do not consider this an electronic book if there is a 856|3.
                        // TBD: implement http://roytennant.com/proto/856/analysis.html
                        if (result.marc.f856.subfields['3'] != null) {
                            return;
                        }
                        var a = document.createElement("a");
                        a.setAttribute("href", result.marc.f856.u);
                        a.appendChild(document.createTextNode("[Electronic Book]"));
                        mReq.span.appendChild(a);
                    } catch (er) { }
                });
                break;

            case "majax-linktocatalog":
            case "majax-l":
                mReq.success.push(function (mReq, result) {
                    var p = mReq.span.parentNode;
                    var s = mReq.span.nextSibling;
                    p.removeChild(mReq.span);
                    var a = document.createElement("a");
                    a.setAttribute("href", majax.majaxSearchURL(mReq.span.title));
                    a.appendChild(mReq.span);
                    p.insertBefore(a, s);
                });
                break;

            default:
                return false;
            }
            return true;
        }

        var hasMajax = false;
        var classEntries = cName.split(/\s+/);
        for (var i = 0; i < classEntries.length; i++) {
            if (addHandler(classEntries[i], mReq))
                hasMajax = true;
        }

        if (!hasMajax)
            continue;

        mReq.span.expanded = true;      // optimistically
        majax.majaxSearch(spanElem.title.toLowerCase(), mReq);
        // send up to 2 requests every 100ms, that's 20 per second.
        if (++processed >= 2) {
            window.setTimeout(function () {
                majaxProcessRemainingSpans(spanElems);
            }, 100);
            return;
        }
    }
}

function majaxProcessSpans() {
    var span = document.getElementsByTagName("span");
    var spanElems = new Array();
    for (var i = 0; i < span.length; i++) {
        spanElems[i] = span[span.length - 1 - i];
    }
    majaxProcessRemainingSpans(spanElems);
}

var majax;
function majaxLoaded() {
    majax.debug = false;
    for (var i = 0; i < majaxLoadHandlers.length; i++) {
        majaxLoadHandlers[i]();
    }
    majax.loaded = true;
    majaxProcessSpans();
}

function majaxOnLoad() {
    try {
        var iframe = document.createElement("IFRAME");
        iframe.setAttribute("id", "hiddeniframe");
        iframe.setAttribute("name", "hiddeniframe");
        // find our install location, then replace majax.js with majax.html
        var scripts = document.getElementsByTagName('script');
        for (var si in scripts) {
            var script = scripts[si];
            if (script.src && script.src.match(/.*\/majax.js/)) {
                var html = script.src.replace(/.js$/, ".html");
                iframe.setAttribute("src", html);
                break;
            } 
        }
        iframe.style.display = "none";
        addEvent(iframe, "load", majaxLoaded);
        document.body.appendChild(iframe);
        majax = document.frames ? document.frames['hiddeniframe'] : 
                           document.getElementById("hiddeniframe").contentWindow;
    } catch (er) {
        alert(er);
    }
}

// array of functions which majax runs before doing the span processing.
var majaxLoadHandlers = new Array();

/*
 * Add a function to be run before processing spans
 * Conservatively, this function works even if called after MAJAX 
 * has completed loading and has already processed the spans once.
 */
function majaxRunBeforeSpanProcessing(func) {
    if (majax !== undefined && majax.loaded) {
        func();
        majaxProcessSpans();
    } else {
        majaxLoadHandlers.push(func);
    }
}

try {
    var superdomain = document.domain.replace(/.*\.(([^.]+\.){1}[^.]+)$/, "$1");
    document.domain = superdomain;
} catch (e) {
    alert("majax: Cannot set document.domain to " + superdomain);
}

addEvent(window, "load", majaxOnLoad);

