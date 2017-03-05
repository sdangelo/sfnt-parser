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
	var data = font.tables.hhea.data;

	var majorVersion = SFNTParser.toUSHORT(data.slice(0, 2));
	var minorVersion = SFNTParser.toUSHORT(data.slice(2, 4));
	if (majorVersion != 1 || minorVersion != 0) {
		font.head = {
			majorVersion:	majorVersion,
			minorVersion:	minorVersion
		};
		return;
	}

	font.hhea = {
		majorVersion:		majorVersion,
		minorVersion:		minorVersion,
		ascender:		SFNTParser.toSHORT(data.slice(4, 6)),
		descender:		SFNTParser.toSHORT(data.slice(6, 8)),
		lineGap:		SFNTParser.toSHORT(data.slice(8, 10)),
		advanceWidthMax:	SFNTParser.toUSHORT(data.slice(10, 12)),
		minLeftSideBearing:	SFNTParser.toSHORT(data.slice(12, 14)),
		minRightSideBearing:	SFNTParser.toSHORT(data.slice(14, 16)),
		xMaxExtent:		SFNTParser.toSHORT(data.slice(16, 18)),
		caretSlopeRise:		SFNTParser.toSHORT(data.slice(18, 20)),
		caretSlopeRun:		SFNTParser.toSHORT(data.slice(20, 22)),
		caretOffset:		SFNTParser.toSHORT(data.slice(22, 24)),
		numberOfHMetrics:	SFNTParser.toUSHORT(data.slice(34, 36))
	};
};
