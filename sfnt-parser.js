/*
 * Copyright (C) 2017 Stefano D'Angelo <zanga.mail@gmail.com>
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

module.exports = require("./parser.js");
require("./glyphNames.js")(module.exports);
require("./tables.js")(module.exports);
require("./cffData.js")(module.exports);
module.exports.plugins = {
	head:	require("./head.js"),
	name:	require("./name.js"),
	hhea:	require("./hhea.js"),
	maxp:	require("./maxp.js"),
	cmap:	require("./cmap.js"),
	post:	require("./post.js"),
	os2:	require("./os2.js"),
	hmtx:	require("./hmtx.js"),
	math:	require("./math.js"),
	cff:	require("./cff.js")
};
