#!/usr/bin/env node

var fs = require("fs");
var SFNTParser = require("./sfnt-parser.js");
var plugins = [
	SFNTParser.plugins.head,
	SFNTParser.plugins.name,
	SFNTParser.plugins.hhea,
	SFNTParser.plugins.maxp,
	SFNTParser.plugins.cmap,
	SFNTParser.plugins.post,
	SFNTParser.plugins.os2,
	SFNTParser.plugins.hmtx,
	SFNTParser.plugins.math,
	SFNTParser.plugins.cff];

var font = SFNTParser.parseBuffer(fs.readFileSync(process.argv[2]), plugins);
delete font.tables;

Buffer.prototype.toJSON =
	function () { return Array.prototype.slice.call(this); };
console.log(JSON.stringify(font, null, 2));
