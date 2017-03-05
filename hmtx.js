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

// depends on hhea and maxp

module.exports = function (SFNTParser, font) {
	var data = font.tables.hmtx.data;

	if (!font.hhea || !font.hhea.numberOfHMetrics
	    || !font.maxp || !font.maxp.numGlyphs)
		return;

	font.hmtx = new Array(font.maxp.numGlyphs);

	var o = 0;
	var i = 0;
	for (; i < font.hhea.numberOfHMetrics; i++) {
		font.hmtx[i] = {
			advanceWidth:
				SFNTParser.toUSHORT(data.slice(o, o + 2)),
			leftSideBearing:
				SFNTParser.toSHORT(data.slice(o + 2, o + 4))
		};
		o += 4;
	}

	var w = font.hmtx[i - 1].advanceWidth;
	for (; i < font.maxp.numGlyphs; i++) {
		font.hmtx[i] = {
			advanceWidth:		w,
			leftSideBearing:
				SFNTParser.toSHORT(data.slice(o, o + 2))
		};
		o += 2;
	}
}
