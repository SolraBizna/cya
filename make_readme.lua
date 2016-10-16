--
-- Copyright (C) 2016 Solra Bizna
--
-- This file is part of CYA.
--
-- CYA is free software: you can redistribute it and/or modify it under the
-- terms of the GNU General Public License as published by the Free Software
-- Foundation, either version 3 of the License, or (at your option) any later
-- version.
--
-- CYA is distributed in the hope that it will be useful, but WITHOUT ANY
-- WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
-- FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
-- details.
--
-- You should have received a copy of the GNU General Public License along with
-- CYA.  If not, see <http://www.gnu.org/licenses/>.
--
--------
--
-- This file parses cya.js, extracts the documentation from it, and creates
-- README.md from it.
--
-- This is accomplished using a custom documentation language that is specific
-- to this project. Its grammar is _very_ particular.
--
-- The reason for doing things this way is so that all of the documentation and
-- supplementary information necessary to use CYA can be included in the (non-
-- minified) `cya.js`, while still providing a more conventional documentation
-- format for those who want it.
--

local lpeg = require "lpeg"

local grammar = lpeg.P{
   "element";
   element=lpeg.V"start"*(lpeg.V"block_def"+lpeg.V"inline_el"+lpeg.V"extern_el"
                             +lpeg.V"function_el")*lpeg.Cp();
   start=lpeg.P("/**");
   whitespace=lpeg.S" \t\r\n";
   eol=lpeg.P"\r"^-1*lpeg.P"\n";
   block_def=lpeg.Cc"block"*lpeg.C(lpeg.R"AZ"^1)*lpeg.P":"
      *lpeg.C((1-lpeg.V"eol")^1)*lpeg.V"eol"*lpeg.V"contents";
   inline_el=lpeg.Cc"inline"*lpeg.C((1-lpeg.V"eol")^1)*lpeg.V"eol"
      *lpeg.V"contents";
   extern_el=lpeg.Cc"extern"*lpeg.V"bare_block"*lpeg.V"whitespace"^0
      *lpeg.C(lpeg.V"js_val")*lpeg.V"whitespace"^0*lpeg.P":"
      *lpeg.V"whitespace"^0*lpeg.C(lpeg.V"js_val");
   function_el=lpeg.Cc"function"*lpeg.V"bare_block"*lpeg.V"whitespace"^0
      *lpeg.C((1-lpeg.V"whitespace")^1)*lpeg.V"whitespace"^0
      *lpeg.P"="*lpeg.V"whitespace"^0
      *lpeg.P"function"*lpeg.V"whitespace"^0*lpeg.P"("*lpeg.V"js_param_list"
      *lpeg.P")";
   bare_block=lpeg.V"eol"*lpeg.V"contents";
   contents=lpeg.Ct(lpeg.V"content_line"^0)*lpeg.V"end_of_element";
   end_of_element=lpeg.V"whitespace"^0*lpeg.P"*/";
   content_line=(lpeg.V"whitespace"-lpeg.V"eol")^1*lpeg.P"*"*
      (((lpeg.V"whitespace"-lpeg.V"eol")^-1
               *lpeg.C((1-lpeg.V"eol")^0)*lpeg.V"eol")-lpeg.P"/");
   js_param_list=lpeg.Ct(((lpeg.C(lpeg.V"js_val")*lpeg.P",")^0*lpeg.C(lpeg.V"js_val"))+true);
   js_val=lpeg.V"quoted_string"+lpeg.V"identifier";
   quoted_string=lpeg.P"\""*lpeg.V"quoted_string_char"^0*lpeg.P"\"";
   quoted_string_char=lpeg.P"\\\""+(1-lpeg.P"\"");
   identifier=(lpeg.S"$_"+lpeg.R"az"+lpeg.R"AZ")*
      (lpeg.S"$_"+lpeg.R"az"+lpeg.R"AZ"+lpeg.R"09")^0;
}

local f = assert(io.open("cya.js","rb"))
local contents = f:read("*a")
f:close()

local sections = {}

local function process_body(body)
   while #body > 0 and not body[#body]:match("[^ \t]") do body[#body] = nil end
   while #body > 0 and not body[1]:match("[^ \t]") do table.remove(body, 1) end
   return table.concat(body, "\n")
end

-- later we may have a more explicit structure, but for now, we ignore the
-- sections and present everything in the order it's in the file.

f = assert(io.open("README.md","wb"))
f:write[[
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

]]
local function outf(format,...) return f:write(format:format(...)) end

local htmlpad = {
   ["<"]="&lt;",
   [">"]="&gt;",
}

local start = 1
repeat
   local result = {lpeg.match(grammar, contents, start)}
   if not result[1] then
      start = start + 1
   else
      start = result[#result]
      --print(require"erebor".build(result):gsub("\"([^\"][^\"][^\"][^\"][^\"])[^\"]+\"", "\"%1...\""))
      result[#result] = nil
      local match_type = table.remove(result, 1)
      if match_type == "block" then
         local rawname,cookedname,body = table.unpack(result)
         body = process_body(body)
         outf("%s\n%s\n\n", cookedname, ("="):rep(#cookedname))
         if #body > 0 then outf("%s\n\n", body) end
      elseif match_type == "inline" then
         local wat,body = table.unpack(result)
         body = process_body(body)
         wat = wat:gsub("[<>]",htmlpad)
         outf("%s\n%s\n\n", wat, ("-"):rep(#wat))
         if #body > 0 then outf("%s\n\n", body) end
      elseif match_type == "extern" then
         local body,wat,default = table.unpack(result)
         body = process_body(body)
         outf("`cya.%s`\n%s\n\nDefault value: `%s`\n\n", wat, ("-"):rep(#wat+6), default)
         if #body > 0 then outf("%s\n\n", body) end
      elseif match_type == "function" then
         local body,name,params = table.unpack(result)
         body = process_body(body)
         params = table.concat(params, ", ")
         outf("`%s(%s)`\n%s\n\n", name, params, ("-"):rep(#name+4+#params))
         if #body > 0 then outf("%s\n\n", body) end
      else
         error("unknown match_type: "..match_type)
      end
   end
until start > #contents

f:close()
