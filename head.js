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
	var data = font.tables.head.data;

	var majorVersion = SFNTParser.toUSHORT(data.slice(0, 2));
	var minorVersion = SFNTParser.toUSHORT(data.slice(2, 4));
	if (majorVersion != 1 || minorVersion != 0) {
		font.head = {
			majorVersion:	majorVersion,
			minorVersion:	minorVersion
		};
		return;
	}

	font.head = {
		majorVersion:		majorVersion,
		minorVersion:		minorVersion,
		fontRevision:		SFNTParser.toFixed(data.slice(4, 8)),
		checkSumAdjustment:	SFNTParser.toULONG(data.slice(8, 12)),
		flags:			SFNTParser.toUSHORT(data.slice(16, 18)),
		unitsPerEm:		SFNTParser.toUSHORT(data.slice(18, 20)),
		created:
			SFNTParser.toLONGDATETIME(data.slice(20, 28)),
		modified:
			SFNTParser.toLONGDATETIME(data.slice(28, 36)),
		xMin:			SFNTParser.toSHORT(data.slice(36, 38)),
		yMin:			SFNTParser.toSHORT(data.slice(38, 40)),
		xMax:			SFNTParser.toSHORT(data.slice(40, 42)),
		yMax:			SFNTParser.toSHORT(data.slice(42, 44)),
		macStyle:		SFNTParser.toUSHORT(data.slice(44, 46)),
		lowestRecPPEM:		SFNTParser.toUSHORT(data.slice(46, 48)),
		fontDirectionHint:	SFNTParser.toSHORT(data.slice(48, 50)),
		indexToLocFormat:	SFNTParser.toSHORT(data.slice(50, 52)),
		glyphDataFormat:	SFNTParser.toSHORT(data.slice(52, 54))
	};
};
