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

// depends on glyphNames.js

function parseHeader(SFNTParser, data) {
	return {
		italicAngle:		SFNTParser.toFixed(data.slice(4, 8)),
		underlinePosition:	SFNTParser.toSHORT(data.slice(8, 10)),
		underlineThickness:	SFNTParser.toSHORT(data.slice(10, 12)),
		isFixedPitch:		SFNTParser.toULONG(data.slice(12, 16)),
		minMemType42:		SFNTParser.toULONG(data.slice(16, 20)),
		maxMemType42:		SFNTParser.toULONG(data.slice(20, 24)),
		minMemType1:		SFNTParser.toULONG(data.slice(24, 28)),
		maxMemType1:		SFNTParser.toULONG(data.slice(28, 32))
	};
};

module.exports = function (SFNTParser, font) {
	var data = font.tables.post.data;

	var version = SFNTParser.toFixed(data.slice(0, 4));

	if (version == 1.0 || version == 3.0) {

		font.post = parseHeader(SFNTParser, data);
		font.post.version = version;

	} else if (version == 2.0) {

		font.post = parseHeader(SFNTParser, data);
		font.post.version = version;
		font.post.numberOfGlyphs =
			SFNTParser.toUSHORT(data.slice(32, 34));
		var o = 34;

		font.post.glyphs = new Array(font.post.numberOfGlyphs);
		var newGlyphs = 0;
		for (var i = 0; i < font.post.numberOfGlyphs; i++) {
			font.post.glyphs[i] = {
				index:
				SFNTParser.toUSHORT(data.slice(o, o + 2)) };
			if (font.post.glyphs[i].index <= 258)
				font.post.glyphs[i].name =
					SFNTParser.glyphNames[
						font.post.glyphs[i].index];
			else
				newGlyphs++;
			o += 2;
		}

		var j = 0;
		for (var i = 0; i < newGlyphs; i++) {
			var l = data[o];
			o++;
			var next = o + l;
			var name = SFNTParser.toString(data.slice(o, next));
			o = next;

			while (font.post.glyphs[j].index <= 258)
				j++;

			font.post.glyphs[j].name = name;
			j++;
		}

	} else if (version == 2.3125) {

		font.post = parseHeader(SFNTParser, data);
		font.post.version = 2.5;
		font.post.numberOfGlyphs =
			SFNTParser.toUSHORT(data.slice(32, 34));
		var o = 34;

		font.post.glyphs = new Array(font.post.numberOfGlyphs);
		for (var i = 0; i < font.post.numberOfGlyphs; i++, o++) {
			var index = i + data[o];
			font.post.glyphs[i] = {
				index:	index,
				name:	SFNTParser.glyphNames[index]
			};
		};

	} else {

		font.post = {
			version:	version
		};

	}
};
