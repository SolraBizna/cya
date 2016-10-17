Introduction
============

CYA is a small JavaScript engine that allows you to make Choose Your Own
Adventure games with simple HTML and CSS. If your needs are simple, usage is
simple. If you want more power than "choice X leads to page Y"&mdash;dynamic
content or branching, for instance&mdash;then CYA has you covered there as
well, giving you the power of JavaScript in a convenient way.

Quick Start
-----------

1. Copy `cya.js` to the same directory as your HTML file
2. Add something like `<script src="cya.js"></script>` to the `<head>` of your
   HTML file
3. Mark an element of your HTML file as being the Playfield&mdash;the place
   where the game is played&mdash;by setting its id to `cya_playfield` (e.g.
   `<div id="cya_playfield"></div>`)
4. Begin adding named `<page>` elements to your HTML file (ideally inside an
   element such as `<div style="display:none">` that will hide them from the
   user)
5. Inside each `<page>`, place some HTML, and end it with one or more
   `<choice>` elements, with `target` attributes giving the name of the
   `<page>` each `<choice>` leads to

See `example.html` for an example Adventure, including some minimal CSS.

Minification
------------

If you want to save bandwidth by using a minified version of `cya.js`, you
_MUST_ provide a `@source` line in the minified version that points to the
_EXACT_ unmodified source code used to generate _THAT_ minified version. (This
is not an "extra requirement"; it's necessary to comply with the license in a
way that [LibreJS](https://www.gnu.org/software/librejs/) will detect.)

The minification tool included in this distribution assumes that you will place
`cya.js` alongside `cya.min.js` on your web server; if you don't need any
engine modifications, you can simply copy `cya.js` and `cya.min.js` from this
distribution onto your webserver.

Copyright Info
--------------

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

NOTE: The following scenarios _are_ specifically intended to be permitted:

- Distribution of `cya.js` alone, without the other files from this package.
  (as long as all copyright notices and `@license`-related lines are left
  intact)
- Distribution of a minified version of `cya.js`, with `@license`-related lines
  intact, and with a `@source` line pointing to the exact copy of `cya.js` from
  which the minified version was created.

Useful Git Hook
---------------

If you are making changes to `cya.js`, creating a `.git/hooks/pre-commit` with the following contents will make your life easier.

    #!/bin/sh
    
    if [ cya.js -nt cya.min.js -o cya.js -nt README.md ]; then
        echo "Did you forget to run rebuild.sh before committing?"
        exit 1
    fi

This won't prevent you from forgetting to include `cya.min.js` and `README.md`
in a commit, but it will protect you from a mistake I make frequently
(forgetting to rebuild them at all).

Definitions
===========

Adventure
---------

An HTML document designed to be used with the Engine, made of `Page`s.

Engine
------

The JavaScript code that powers the Adventures.

Page
----

A reference to a `<page>` element. `Page`s can either be referred to by
their `name` attribute or passed directly as `Element`s (the latter usually
being used for dynamically generated pages).

Playfield
---------

The `Element` into which the contents of `<page>`s are placed.

Element
-------

A DOM element object, corresponding to an element in the HTML. See
[the MDN page](https://developer.mozilla.org/en-US/docs/Web/API/Element).

Simple Adventures don't have to care about this.

Anywhere the Engine asks for an `Element`, and does not specify particular
handling for non-Element values, you may optionally pass a string giving the
ID of an `Element`. (Examples where this does not apply are `Page`
references and `<execute>`/`<eval>` elements.)

Structure of an Adventure
=========================

An Adventure is an ordinary HTML document for the most part. Including the
Engine script into the page changes the meaning of certain elements. _All_
styling is provided by the Adventure via a combination of CSS and HTML
outside the `Playfield`.

Overall, the recommended structure of an Adventure looks like:

    <html>
      <head>
        ...title, charset, etc.
        <script src="cya.min.js"></script>
        ...supplemental scripts, links, stylesheets, etc.
      </head>
      <body>
        <noscript>
          ...pretty message explaining that JavaScript is required
        </noscript>
        <script language="JavaScript">
          ...set any Engine Variables you want to customize here
        </script>
        <div id="cya_playfield"></div>
        <div style="display:none"> (or some other means of hiding the pages)
          <page name="start">
            ...contents of the starting page
          </page>
          ...more pages
        </div>
      </body>
    </html>

There are many more possibilities. For instance, instead of being a `div`
that effectively takes up the entire browser window, you could have certain
information (e.g. inventory, character stats...) in a normal HTML layout and
make the playfield be a scrollable element of that layout. You could also
use the `<body>` directly as a playfield, though that limits your options
for styling.

Certain elements are treated specially. The most important such elements are
the `<page>` and `<choice>` elements; every Adventure needs a few of them.

&lt;page&gt;
------------

A `<page>` element is the bread of an Adventure. It corresponds to an
individual page of a Choose Your Own Adventure book. The contents of a
`<page>` are added dynamically to the `Playfield` on demand; whether by the
action of a script, or (more usually) by the user selecting a `<choice>`.

When a `<page>` is presented, its contents are styled by a surrounding
`<div class="cya_page">`, one for each `<page>`.

A `<page>` element will almost always have a `name` attribute, (e.g.
`<page name="caves2">`. This name is how other parts of the Adventure
(including `<choice>`s) refer to the page. Any name that is valid in HTML
may be used. Some names are special; "start" is presented at the beginning
of the Adventure, and "ending" is presented whenever an `<ending>` element
is processed. (These names may be overridden with the `start_page` and
`end_page` external variables, respectively.)

&lt;choice&gt;
--------------

A `<choice>` element presents a choice to the user. Each page will typically
end with one or more `<choice>`s, allowing the user to choose what they do
next in the Adventure. Only one of the available `<choice>`s can be taken.

When a `<choice>` is presented, it is in one of three ways:

    <a class="cya_choice" href="...">A choice currently available</a>
    <a class="cya_accepted_choice" href="...">A previously-available choice which the user selected</a>
    <a class="cya_rejected_choice" href="...">A previously-available choice which the user did not select</a>

Most Adventures will want CSS like:

    a.cya_rejected_choice {display:none;}

so that rejected choices are hidden. Other Adventures may want to set
`pivot_choices` to true, so that the accepted choice is moved to the end of
the list (especially if they use `scroll_view`).

Most `<choice>`s will have a `target` attribute naming the `<page>` that
will be presented if that choice is made. For nearly all Adventures, this is
all that's required. (e.g. `<choice target="caves4">`)

Advanced Adventures may wish to execute some JavaScript code when a
particular choice is made. They can do so by providing an `execute`
attribute. The code within will be executed before the next page is
presented. If it `return`s a `Page`, that `Page` will be used in place of
the `target` attribute.

If an `eval` attribute is present, then it contains a JavaScript expression
that is evaluated, and treated just like the return value of an `execute`
attribute. If both `eval` and `execute` are present, `execute` applies
first and then `eval` is evaluated.

&lt;ending&gt;
--------------

When an `<ending>` element is encountered, the JavaScript variable `ending`
is set to the `<ending>` element's contents, and the "ending" page is called
upon.

NOTE: This does _not_ result in the insertion of the "ending" `<page>`'s
contents at the point the `<ending>` element appears. Instead, they appear
_after_ the contents of the page that contained the `<ending>` element. In
addition, the two pages have separate containing `<div>`s.

&lt;execute&gt;
---------------

`<execute>` contains JavaScript code that will be executed every time the
containing `<page>` is presented. It may optionally `return` an `Element`,
which will be inserted directly without further processing, or another
value, which will be inserted as plain text.

Future Engine versions may process Engine-specific elements that result from
an `<execute>`, and may be extended to process arrays as if they were
`return`ed by sequential `<execute>`s.

&lt;eval&gt;
------------

Shorthand for `<execute>return (...)</execute>`. `<eval>` usually contains
a single, simple JavaScript expression so that the result is directly
inserted. For example: `You have <eval>player_hitpoints</eval> HP.`

&lt;if&gt;
----------

The contents of an `<if>` element are inserted directly, if (and _only_ if)
the `condition` is true.

The `condition` attribute is a JavaScript expression used to decide whether
to insert the `<if>`'s contents.

Engine Variables
================

These are variables used by an Adventure to control the Engine's behavior.
Adventures that wish to override the defaults should do so in a `<script>`
element if they want the overridden values to apply from the beginning. (See
the example Adventure.)

Unless otherwise specified, external variables may be changed at any time
and the changes will take effect immediately.

`cya.start_page`
----------------

Default value: `"start"`

The first `Page` that will be displayed after loading the document. This
value is only used by the Engine once, when the Adventure is loaded.

User code may choose to respect this value with something like:

    <choice eval="cya.start_page">Restart</choice>

`cya.ending_page`
-----------------

Default value: `"ending"`

The `Page` that will be displayed when an `<ending>` tag is encountered.

`cya.playfield`
---------------

Default value: `"cya_playfield"`

The `Element` that all processed `Page`s will be displayed in.

`cya.scroll_view`
-----------------

Default value: `undefined`

The `Element` that will be scrolled when a `<choice>` is selected. May
be undefined, in which case automatic scrolling is disabled.

A useful value is `document.body`.

`cya.scroll_spacer`
-------------------

Default value: `undefined`

An `Element` that will have its height adjusted dynamically, so that the
`scroll_view` can always scroll at least as far down as the selected
choice. (Only applicable if `scroll_view` is also defined.)

`cya.pivot_choices`
-------------------

Default value: `false`

If `pivot_choices` is true, any `<choice>` selected by the player is
moved to the end of its page. This is useful if rejected choices are not
hidden, especially if `scroll_view` is used.

`cya.validate_on_load`
----------------------

Default value: `false`

tl;dr: Set this to true to check your Adventure for errors every time it
loads.

If `validate_on_load` is true, `cya.validate()` is automatically called
on every `<page>` that `cya.findpages()` finds. (`cya.findpages()` is
called automatically when the Adventure first loads.) This will slow
down loading, especially for large Adventures. You may wish to set it to
`true` while testing your Adventure, and `false` when you deploy.

Engine Functions
================

Other than an occasional `cya.page()`, you will probably not need to call
any engine functions directly.

`cya.page(page)`
----------------

Presents a given `Page` into the `playfield`. May be called at any time
after Adventure load; if called recursively (as from an `<execute>`
element inside a `<page>`), the page will be presented immediately after
all currently-processing `Page`s.

`cya.validate(page)`
--------------------

Validates a `<page>`. Makes sure that all of its JavaScript code
compiles, and none of its `<choice>` elements refer to a nonexistent
page. (Note: `<choice>` elements that select a nonexistent page through
JavaScript cannot be detected.)

Returns `true` if the page validated, and `false` if it didn't.

`cya.findpages()`
-----------------

Locates all `<page>` elements in the Adventure, and caches their names
so they can be retrieved quickly.

Normally you do not need to call this function, as it is called
automatically when the Adventure is loaded. You only need to call it if
you are dynamically adding or removing `<page>` elements from the
Adventure's DOM tree. (If you are building `<page>` `Elements`
dynamically and passing them around directly, you do _not_ need to call
this function as those are not being accessed by name.)

Returns true if all pages validated (or no pages were checked), and
false if validation of at least one page failed.

