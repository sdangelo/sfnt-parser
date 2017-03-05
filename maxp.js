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
	var data = font.tables.maxp.data;

	var version = SFNTParser.toFixed(data.slice(0, 4));
	if (version == 0.3125) {
		font.maxp = {
			version:	0.5,
			numGlyphs:	SFNTParser.toUSHORT(data.slice(4, 6))
		};
	} else if (version == 1.0) {
		font.maxp = {
			version:	1.0,
			numGlyphs:	SFNTParser.toUSHORT(data.slice(4, 6)),
			maxPoints:	SFNTParser.toUSHORT(data.slice(6, 8)),
			maxContours:	SFNTParser.toUSHORT(data.slice(8, 10)),
			maxCompositePoints:
				SFNTParser.toUSHORT(data.slice(10, 12)),
			maxCompositeContours:
				SFNTParser.toUSHORT(data.slice(12, 14)),
			maxZones:	SFNTParser.toUSHORT(data.slice(14, 16)),
			maxTwilightPoints:
				SFNTParser.toUSHORT(data.slice(16, 18)),
			maxStorage:	SFNTParser.toUSHORT(data.slice(18, 20)),
			maxFunctionDefs:
				SFNTParser.toUSHORT(data.slice(20, 22)),
			maxInstructionDefs:
				SFNTParser.toUSHORT(data.slice(22, 24)),
			maxStackElements:
				SFNTParser.toUSHORT(data.slice(24, 26)),
			maxComponentElements:
				SFNTParser.toUSHORT(data.slice(26, 28)),
			maxComponentDepth:
				SFNTParser.toUSHORT(data.slice(28, 30))
		};
	} else {
		font.maxp = {
			version:	version
		};
	}
};
