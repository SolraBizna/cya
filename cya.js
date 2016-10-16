// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later

/*
  Copyright (C) 2016 Solra Bizna

  CYA is free software: you can redistribute it and/or modify it under the
  terms of the GNU General Public License as published by the Free Software
  Foundation, either version 3 of the License, or (at your option) any later
  version.

  CYA is distributed in the hope that it will be useful, but WITHOUT ANY
  WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
  FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
  details.

  You should have received a copy of the GNU General Public License along with
  CYA.  If not, see <http://www.gnu.org/licenses/>.
*/

"use strict";

/**DEFINITION:Definitions
 */

/**Adventure
 * An HTML document designed to be used with the Engine, made of `Page`s.
 */
/**Engine
 * The JavaScript code that powers the Adventures.
 */
/**Page
 * A reference to a `<page>` element. `Page`s can either be referred to by
 * their `name` attribute or passed directly as `Element`s (the latter usually
 * being used for dynamically generated pages).
 */
/**Playfield
 * The `Element` into which the contents of `<page>`s are placed.
 */
/**Element
 * A DOM element object, corresponding to an element in the HTML. See
 * [the MDN page](https://developer.mozilla.org/en-US/docs/Web/API/Element).
 *
 * Simple Adventures don't have to care about this.
 *
 * Anywhere the Engine asks for an `Element`, and does not specify particular
 * handling for non-Element values, you may optionally pass a string giving the
 * ID of an `Element`. (Examples where this does not apply are `Page`
 * references and `<execute>`/`<eval>` elements.)
 */

/**ELEMENT:Structure of an Adventure
 * 
 * An Adventure is an ordinary HTML document for the most part. Including the
 * Engine script into the page changes the meaning of certain elements. _All_
 * styling is provided by the Adventure via a combination of CSS and HTML
 * outside the `Playfield`.
 *
 * Overall, the recommended structure of an Adventure looks like:
 *
 *     <html>
 *       <head>
 *         ...title, charset, etc.
 *         <script src="cya.min.js"></script>
 *         ...supplemental scripts, links, stylesheets, etc.
 *       </head>
 *       <body>
 *         <noscript>
 *           ...pretty message explaining that JavaScript is required
 *         </noscript>
 *         <script language="JavaScript">
 *           ...set any Engine Variables you want to customize here
 *         </script>
 *         <div id="cya_playfield"></div>
 *         <div style="display:none"> (or some other means of hiding the pages)
 *           <page name="start">
 *             ...contents of the starting page
 *           </page>
 *           ...more pages
 *         </div>
 *       </body>
 *     </html>
 *
 * There are many more possibilities. For instance, instead of being a `div`
 * that effectively takes up the entire browser window, you could have certain
 * information (e.g. inventory, character stats...) in a normal HTML layout and
 * make the playfield be a scrollable element of that layout. You could also
 * use the `<body>` directly as a playfield, though that limits your options
 * for styling.
 *
 * Certain elements are treated specially. The most important such elements are
 * the `<page>` and `<choice>` elements; every Adventure needs a few of them.
 */
/**<page>
 * A `<page>` element is the bread of an Adventure. It corresponds to an
 * individual page of a Choose Your Own Adventure book. The contents of a
 * `<page>` are added dynamically to the `Playfield` on demand; whether by the
 * action of a script, or (more usually) by the user selecting a `<choice>`.
 *
 * When a `<page>` is presented, its contents are styled by a surrounding
 * `<div class="cya_page">`, one for each `<page>`.
 *
 * A `<page>` element will almost always have a `name` attribute, (e.g.
 * `<page name="caves2">`. This name is how other parts of the Adventure
 * (including `<choice>`s) refer to the page. Any name that is valid in HTML
 * may be used. Some names are special; "start" is presented at the beginning
 * of the Adventure, and "ending" is presented whenever an `<ending>` element
 * is processed. (These names may be overridden with the `start_page` and
 * `end_page` external variables, respectively.)
 */
/**<choice>
 * A `<choice>` element presents a choice to the user. Each page will typically
 * end with one or more `<choice>`s, allowing the user to choose what they do
 * next in the Adventure. Only one of the available `<choice>`s can be taken.
 *
 * When a `<choice>` is presented, it is in one of three ways:
 *
 *     <a class="cya_choice" href="...">A choice currently available</a>
 *     <a class="cya_accepted_choice" href="...">A previously-available choice which the user selected</a>
 *     <a class="cya_rejected_choice" href="...">A previously-available choice which the user did not select</a>
 *
 * Most Adventures will want CSS like:
 *
 *     a.cya_rejected_choice {display:none;}
 *
 * so that rejected choices are hidden. Other Adventures may want to set
 * `pivot_choices` to true, so that the accepted choice is moved to the end of
 * the list (especially if they use `scroll_view`).
 *
 * Most `<choice>`s will have a `target` attribute naming the `<page>` that
 * will be presented if that choice is made. For nearly all Adventures, this is
 * all that's required. (e.g. `<choice target="caves4">`)
 *
 * Advanced Adventures may wish to execute some JavaScript code when a
 * particular choice is made. They can do so by providing an `execute`
 * attribute. The code within will be executed before the next page is
 * presented. If it `return`s a `Page`, that `Page` will be used in place of
 * the `target` attribute.
 *
 * If an `eval` attribute is present, then it contains a JavaScript expression
 * that is evaluated, and treated just like the return value of an `execute`
 * attribute. If both `eval` and `execute` are present, `execute` applies
 * first and then `eval` is evaluated.
 */
/**<ending>
 * When an `<ending>` element is encountered, the JavaScript variable `ending`
 * is set to the `<ending>` element's contents, and the "ending" page is called
 * upon.
 *
 * NOTE: This does _not_ result in the insertion of the "ending" `<page>`'s
 * contents at the point the `<ending>` element appears. Instead, they appear
 * _after_ the contents of the page that contained the `<ending>` element. In
 * addition, the two pages have separate containing `<div>`s.
 */
/**<execute>
 * `<execute>` contains JavaScript code that will be executed every time the
 * containing `<page>` is presented. It may optionally `return` an `Element`,
 * which will be inserted directly without further processing, or another
 * value, which will be inserted as plain text.
 *
 * Future Engine versions may process Engine-specific elements that result from
 * an `<execute>`, and may be extended to process arrays as if they were
 * `return`ed by sequential `<execute>`s.
 */
/**<eval>
 * Shorthand for `<execute>return (...)</execute>`. `<eval>` usually contains
 * a single, simple JavaScript expression so that the result is directly
 * inserted. For example: `You have <eval>player_hitpoints</eval> HP.`
 */
/**<if>
 * The contents of an `<if>` element are inserted directly, if (and _only_ if)
 * the `condition` is true.
 *
 * The `condition` attribute is a JavaScript expression used to decide whether
 * to insert the `<if>`'s contents.
 */

/**EXTERN:Engine Variables
 *
 * These are variables used by an Adventure to control the Engine's behavior.
 * Adventures that wish to override the defaults should do so in a `<script>`
 * element if they want the overridden values to apply from the beginning. (See
 * the example Adventure.)
 *
 * Unless otherwise specified, external variables may be changed at any time
 * and the changes will take effect immediately.
 */
var cya = {
    /**
     * The first `Page` that will be displayed after loading the document. This
     * value is only used by the Engine once, when the Adventure is loaded.
     *
     * User code may choose to respect this value with something like:
     *
     *     <choice eval="cya.start_page">Restart</choice>
     */
    start_page:"start",
    /**
     * The `Page` that will be displayed when an `<ending>` tag is encountered.
     */
    ending_page:"ending",
    /**
     * The `Element` that all processed `Page`s will be displayed in.
     */
    playfield:"cya_playfield",
    /**
     * The `Element` that will be scrolled when a `<choice>` is selected. May
     * be undefined, in which case automatic scrolling is disabled.
     *
     * A useful value is `document.body`.
     */
    scroll_view:undefined,
    /**
     * An `Element` that will have its height adjusted dynamically, so that the
     * `scroll_view` can always scroll at least as far down as the selected
     * choice. (Only applicable if `scroll_view` is also defined.)
     */
    scroll_spacer:undefined,
    /**
     * If `pivot_choices` is true, any `<choice>` selected by the player is
     * moved to the end of its page. This is useful if rejected choices are not
     * hidden, especially if `scroll_view` is used.
     */
    pivot_choices:false,
};

/**FUNCTION:Engine Functions
 *
 * Other than an occasional `cya.page()`, you will probably not need to call
 * any engine functions directly.
 */

// (we are hiding the rest of our state)
(function() {

    // Maps `Page` names to `Element`s
    var page_cache = {};

    // List of `choice`s that have been made active since last time a `choice`
    // was made (so we can disable previous `choice`s when one is made)
    // `choice` objects have no formal identity
    var current_choices = [];

    // Queue of `Page`s that were requested while a `Page` was already in the
    // process of being processed
    var deferred_pages = [];

    // Whether a `Page` is currently being processed. If `cya.page()` is called
    // while this is true, the `Page` will be added to `deferred_pages`
    // instead. (It will be processed before the original `cya.page()`
    // returns.)
    var inside_page = false;

    // If the parameter is an Element, returns it. Otherwise, attempt to find
    // an element with that ID.
    var element_parameter = function(el) {
        if(el == null) return null;
        else if(el instanceof Element) return el;
        else return document.getElementById(el);
    }
    
    // Disables all previously-active `choice`s. The parameter is a `choice`;
    // if it is found in `current_choices`, then that choice will be marked as
    // a `cya_accepted_choice` rather than a `cya_rejected_choice`.
    // Usually called when a choice is made.
    // TODO: Make this public to allow timed choices? (yuck)
    var clear_old_choices = function(accepted_choice) {
        var node_to_pop = undefined;
        var last_node = undefined;
        for(var i = 0; current_choices[i]; ++i) {
            var dis = current_choices[i];
            dis.node.removeAttribute("href");
            if(dis == accepted_choice) {
                dis.node.setAttribute("class","cya_accepted_choice");
                /* only pivot if there is more than one choice */
                if(cya.pivot_choices && current_choices[1] != undefined)
                    node_to_pop = dis.node;
            }
            else {
                dis.node.setAttribute("class","cya_rejected_choice");
                last_node = dis.node;
            }
            dis.node.removeEventListener("click",
                                         dis.listener);
        }
        if(node_to_pop != undefined && last_node != undefined
           && last_node.parentNode != undefined) {
            node_to_pop.remove();
            last_node.parentNode.appendChild(node_to_pop);
        }
        current_choices = [];
    }

    // The event listener attached to the `click` event of a `choice`.
    // (Actually, this function is not passed directly; it is first bound to
    // a particular `choice` object.)
    var choice_listener = function() {
        clear_old_choices(this);
        var target_page = this.target_page;
        if(this.code) {
            var code_page = this.code();
            if(code_page != undefined) target_page = code_page;
        }
        if(target_page) {
            cya.page(this.target_page);
            var scroll_view = element_parameter(cya.scroll_view);
            if(scroll_view != undefined) {
                // inspired by: https://www.kirupa.com/html5
                // /get_element_position_using_javascript.htm
                var y = 0;
                var el = this.node;
                while(el != undefined && el != scroll_view) {
                    y += (el.offsetTop - el.scrollTop + el.clientTop);
                    el = el.offsetParent;
                }
                if(el == scroll_view) {
                    var spacer = element_parameter(cya.scroll_spacer);
                    if(spacer != undefined) {
                        spacer.setAttribute("style", "height:100%");
                        var space = Math.max(0, scroll_view.clientHeight
                                             - (scroll_view.scrollHeight - y
                                                - spacer.clientHeight));
                        spacer.setAttribute("style", "height:"+space);
                    }
                    scroll_view.scrollTop = y;
                }
                else if(console != undefined)
                    console.log("A <choice> was selected that was not a child"
                                +" of the scroll_view!");
            }
        }
    }

    // When passed an `Element` that can have code, it returns a `Function`
    // for that code or null if there is no code. For other `Element`s, it
    // always returns `null`.
    //
    // If `lowerName` is specified, it overrides the value of node.localName.
    // It should be specified if the lowercased name of the node is already
    // known, so that it does not have to be redundantly retrieved and case
    // folded.
    var node_code = function(node, lowerName) {
        if(node.cached_code !== undefined) return node.cached_code;
        if(lowerName == undefined) lowerName = node.localName.toLowerCase();
        switch(lowerName) {
        case "choice":
            var all_code = [];
            if(node.hasAttribute("execute"))
                all_code.push(node.getAttribute("execute"));
            if(node.hasAttribute("eval"))
                all_code.push("return ("+node.getAttribute("eval")+")");
            if(all_code.length > 0)
                node.cached_code = new Function(all_code.join("\n"));
            break;
        case "if":
            if(node.hasAttribute("condition"))
                node.cached_code =
                new Function("return ("+node.getAttribute("condition")+")");
            break;
        case "eval":
            if(node.cached_code == undefined)
                node.cached_code = new Function("return ("+node.innerText+")");
            break;
        case "execute":
            if(node.cached_code == undefined)
                node.cached_code = new Function(node.innerText);
            break;
        }
        if(node.cached_code === undefined) node.cached_code = null;
        return node.cached_code;
    }

    // Creates a `choice` object for a given `<choice>` element (`source_node`)
    // which is being used to create a given `<a>` element (`real_node`), and
    // attaches that `choice` object to the `<a>` element. Extracts all
    // necessary information from the `<choice>` element.
    var register_choice = function(real_node, source_node) {
        var choice = {node:real_node};
        current_choices.push(choice);
        if(source_node.hasAttribute("target")) {
            choice.target_page = source_node.getAttribute("target");
        }
        choice.code = node_code(source_node, "choice");
        choice.listener = choice_listener.bind(choice);
        real_node.addEventListener("click", choice.listener)
    }

    // `source` is an `Element` from the tree of a `Page`. `target` is the
    // `Element` that is being created from `source`. Goes through each of
    // `source`'s children (if it has any), and preprocesses them as needed
    // before appending them to `target`.
    var append_and_translate_children = function(target, source) {
        if(source.childNodes == undefined) return;
        for(var i = 0; source.childNodes[i]; ++i) {
            var child = source.childNodes[i];
            if(child.nodeType == document.ELEMENT_NODE) {
                var lowerName = child.localName.toLowerCase();
                switch(lowerName) {
                case "choice":
                    var nu = document.createElement("a");
                    register_choice(nu, child);
                    nu.setAttribute("class","cya_choice");
                    nu.setAttribute("href","javascript:(void)0");
                    append_and_translate_children(nu, child);
                    target.appendChild(nu);
                    break;
                case "ending":
                    window.ending = child.innerText;
                    cya.page(cya.ending_page);
                    break;
                case "if":
                    var code = node_code(child, lowerName);
                    if(code) {
                        if(code())
                            append_and_translate_children(target, child);
                    }
                    else if(console != undefined)
                        console.log("There is an <if> without a condition");
                    break;
                case "eval":
                case "execute":
                    var code = node_code(child, lowerName);
                    if(code) {
                        var result = code();
                        if(result != undefined) {
                            if(result instanceof Element)
                                target.appendChild(result);
                            else
                                target.appendChild(document
                                                   .createTextNode(result));
                        }
                    }
                    /* code should never be undefined */
                    break;
                default:
                    var nu = child.cloneNode(false);
                    append_and_translate_children(nu, child);
                    target.appendChild(nu);
                    break;
                }
            }
            else {
                target.appendChild(child.cloneNode(true));
            }
        }
    }

    /**
     * Presents a given `Page` into the `playfield`. May be called at any time
     * after Adventure load; if called recursively (as from an `<execute>`
     * element inside a `<page>`), the page will be presented immediately after
     * all currently-processing `Page`s.
     */
    cya.page = function(page) {
        if(inside_page) { deferred_pages.push(page); return; }
        inside_page = true;
        var target = element_parameter(cya.playfield);
        if(target == undefined) {
            window.alert("Playfield not found! We can't do anything!");
            return;
        }
        var next_page;
        if(page instanceof Element) next_page = page;
        else next_page = page_cache[page];
        if(next_page == undefined) {
            if(cya.pages.namedItem) next_page = cya.pages.namedItem(page);
            if(next_page == undefined) {
                // try a linear search
                for(var i = 0; cya.pages[i]; ++i) {
                    if(cya.pages[i].getAttribute("name") == page) {
                        next_page = cya.pages[i];
                        break;
                    }
                }
            }
            page_cache[page] = next_page;
        }
        if(next_page == undefined) {
            window.alert("Page not found: "+page);
        }
        else {
            var to_append = document.createElement("div");
            to_append.setAttribute("class", "cya_page");
            append_and_translate_children(to_append, next_page);
            target.appendChild(to_append);
        }
        inside_page = false;
        var deferred_page = deferred_pages.shift();
        if(deferred_page != undefined)
            return cya.page(deferred_page);
    }

    /**
     * Locates all `<page>` elements in the Adventure, and caches their names
     * so they can be retrieved quickly.
     *
     * Normally you do not need to call this function, as it is called
     * automatically when the Adventure is loaded. You only need to call it if
     * you are dynamically adding or removing `<page>` elements from the
     * Adventure's DOM tree. (If you are building `<page>` `Elements`
     * dynamically and passing them around directly, you do _not_ need to call
     * this function as those are not being accessed by name.)
     */
    cya.findpages = function() {
        cya.pages = document.getElementsByTagName("page");
        page_cache = {}
        for(var i = 0; cya.pages[i]; ++i) {
            var name = cya.pages[i].getAttribute("name");
            if(name != undefined) {
                page_cache[name] = cya.pages[i];
            }
        }
    }

    // Initializes the Adventure. This consists of calling `cya.findpages()`,
    // presenting the `start_page`, and (if present) scrolling the
    // `scroll_view` to the top.
    // This is called automatically when the `DOMContentLoaded` event fires.
    var init = function() {
        cya.findpages();
        cya.page(cya.start_page);
        if(cya.scroll_view) {
            cya.scroll_view.scrollTop = 0;
        }
    }
    document.addEventListener("DOMContentLoaded", init);
})()

// @license-end
