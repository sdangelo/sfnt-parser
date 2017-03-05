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

module.exports = function (SFNTParser, font) {
	var data = font.tables.name.data;

	font.name = {
		format:	SFNTParser.toUSHORT(data.slice(0, 2))
	};

	if (font.name.format != 0 && font.name.format != 1)
		return;

	var count = SFNTParser.toUSHORT(data.slice(2, 4));
	var sOffset = SFNTParser.toUSHORT(data.slice(4, 6));
	font.name.nameRecords = new Array(count);
	var o = 6;
	for (var i = 0; i < count; i++) {
		font.name.nameRecords[i] = {
			platformId:
				SFNTParser.toUSHORT(data.slice(o, o + 2)),
			encodingId:
				SFNTParser.toUSHORT(data.slice(o + 2, o + 4)),
			languageId:
				SFNTParser.toUSHORT(data.slice(o + 4, o + 6)),
			nameId:
				SFNTParser.toUSHORT(data.slice(o + 6, o + 8))
		};

		var length = SFNTParser.toUSHORT(data.slice(o + 8, o + 10));
		var offset = SFNTParser.toUSHORT(data.slice(o + 10, o + 12))
			     + sOffset;
		font.name.nameRecords[i].data = data.slice(offset,
							   offset + length);

		o += 12;
	}

	if (font.name.format != 1)
		return;

	var count = SFNTParser.toUSHORT(data.slice(o, o + 2));
	var langTags = new Array(count);
	o += 2;
	for (var i = 0; i < count; i++) {
		var length = SFNTParser.toUSHORT(data.slice(o, o + 2));
		var offset = SFNTParser.toUSHORT(data.slice(o + 2, o + 4));
		var d = new Uint16Array(data.slice(offset, offset + length)
					    .buffer);
		langTags[i] = "";
		for (var j = 0; j < d.length; j++)
			langTags[i] += String.fromCharCode(d[j]);
		o += 4;
	}
	for (var i = 0; i < font.name.nameRecords.length; i++) {
		var id = font.name.nameRecords[i].languageId
		if (id >= 0x8000)
			font.name.nameRecords[i].languageId =
				langTags[id - 0x8000];
	}
};
