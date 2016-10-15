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

local lpeg = require "lpeg"

local maxified = io.read("*a")

local grammar = lpeg.P{
   "source_file";
   source_file = lpeg.Ct(lpeg.V"element"^1)*lpeg.P(-1);
   element = lpeg.V"whitespace"^1+lpeg.V"comment"+lpeg.V"quoted_string"
      +lpeg.V"alternate_string"+lpeg.V"regex"+lpeg.V"other";
   whitespace = lpeg.S" \t\r\n";
   comment = lpeg.V"oneline_comment"+lpeg.V"multiline_comment";
   oneline_comment = lpeg.P"//"*(1-lpeg.P"\n")^0;
   multiline_comment = lpeg.P"/*"*(1-lpeg.P"*/")^0*lpeg.P"*/";
   quoted_string = lpeg.C(lpeg.P"\""*((lpeg.P("\\")*1)+(1-lpeg.P"\""))^0
                             *lpeg.P"\"");
   alternate_string = lpeg.C(lpeg.P"'"*((lpeg.P("\\")*1)+(1-lpeg.P"'"))^0
                                *lpeg.P"'");
   -- this isn't QUITE right; it assumes that any / that isn't followed by a
   -- space is a regex
   regex = lpeg.C(lpeg.P"/"*(1-lpeg.P" ")*((lpeg.P("\\")*1)+(1-lpeg.P"/"))^0
                     *lpeg.P"/");
   other = lpeg.C((1-(lpeg.V"whitespace"+lpeg.S"/\"'"))^1);
}

local parsed = lpeg.match(grammar, maxified)
for n=#parsed,2,-1 do
   if (not not parsed[n]:match("^[$_a-zA-Z0-9]"))
   and (not not parsed[n-1]:match("[$_a-zA-Z0-9]$")) then
      table.insert(parsed, n, " ")
   end
end
for n=#parsed,3,-1 do
   if parsed[n]:sub(1,1) == "\"" and parsed[n-2]:sub(-1,-1) == "\""
   and parsed[n-1] == "+" then
      parsed[n-2] = parsed[n-2]:sub(1,-2)..parsed[n]:sub(2,-1)
      table.remove(parsed, n)
      table.remove(parsed, n-1)
   end
end

io.write("// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later\n")
io.write("// @source ./cya.js\n")
io.write(table.concat(parsed).."\n")
io.write("// @license-end\n")
