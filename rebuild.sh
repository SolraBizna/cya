#!/bin/sh

set -e

lua make_readme.lua
lua minify.lua < cya.js > cya.min.js
