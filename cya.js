"use strict";

var cya = {start_page:"start",ending_page:"ending",page_cache:{}};

var current_choices;

var choice_listener = function() {
    for(var i = 0; current_choices[i]; ++i) {
        var dis = current_choices[i];
        dis.node.removeAttribute("href");
        if(dis == this)
            dis.node.setAttribute("class","cya_accepted_choice");
        else
            dis.node.setAttribute("class","cya_rejected_choice");
        dis.node.removeEventListener("click", this.listener);
    }
    var target_page = this.target_page;
    if(this.code) {
        var code_page = this.code();
        if(code_page != undefined) target_page = code_page;
    }
    if(target_page) {
        cya.page(this.target_page);
        if(cya.scroll_view) {
            // inspired by: https://www.kirupa.com/html5
            // /get_element_position_using_javascript.htm
            var y = 0;
            var el = this.node;
            while(el != undefined && el != cya.scroll_view) {
                y += (el.offsetTop - el.scrollTop + el.clientTop);
                el = el.offsetParent;
            }
            cya.scroll_view.scrollTop = y;
        }
    }
}

var register_choice = function(real_node, source_node) {
    var choice = {node:real_node};
    current_choices.push(choice);
    if(source_node.hasAttribute("target")) {
        choice.target_page = source_node.getAttribute("target");
    }
    if(source_node.hasAttribute("execute")) {
        if(source_node.cached_code == undefined) {
            source_node.cached_code
                = new Function(source_node.getAttribute("execute"));
        }
        choice.code = source_node.cached_code;
    }
    choice.listener = choice_listener.bind(choice);
    real_node.addEventListener("click", choice.listener)
}

var deferred_pages = [];

var append_and_translate_children = function(target, source) {
    if(source.childNodes == undefined) return;
    for(var i = 0; source.childNodes[i]; ++i) {
        var child = source.childNodes[i];
        if(child.nodeType == document.ELEMENT_NODE) {
            switch(child.localName) {
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
                deferred_pages.push(cya.ending_page);
                break;
            case "var":
                target.appendChild(document.createTextNode(window[child.innerText]));
                break;
            case "if":
                if(child.cached_code == undefined) {
                    child.cached_code = new Function("return ("+child.getAttribute("condition")+")");
                }
                if(child.cached_code())
                    append_and_translate_children(target, child);
                break;
            case "eval":
                if(child.cached_code == undefined) {
                    child.cached_code = new Function("return ("+child.innerText+")");
                }
                // sneaky fall through...
            case "execute":
                if(child.cached_code == undefined) {
                    child.cached_code = new Function(child.innerText);
                }
                var result = child.cached_code();
                if(result != undefined) {
                    if(result instanceof Element)
                        target.appendChild(result);
                    else
                        target.appendChild(document.createTextNode(result));
                }
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

var inside_page = false;
cya.page = function(page) {
    if(inside_page) { deferred_pages.push(page); return; }
    inside_page = true;
    var target = document.getElementById("cya_playfield");
    if(target == undefined) {
        window.alert("cya_playfield not found! We can't do anything!");
        return;
    }
    var next_page = cya.page_cache[page];
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
        cya.page_cache[page] = next_page;
    }
    if(next_page == undefined) {
        window.alert("Page not found: "+page);
    }
    else {
        current_choices = [];
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

cya.findpages = function() {
    cya.pages = document.getElementsByTagName("page");
    cya.page_cache = {}
    for(var i = 0; cya.pages[i]; ++i) {
        var name = cya.pages[i].getAttribute("name");
        if(name != undefined) {
            cya.page_cache[name] = cya.pages[i];
        }
    }
}

var init = function() {
    cya.findpages();
    cya.page(cya.start_page);
    if(cya.scroll_view) {
        cya.scroll_view.scrollTop = 0;
    }
}

document.addEventListener("DOMContentLoaded", init);
