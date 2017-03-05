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
	var data = font.tables["OS/2"].data;

	font["OS/2"] = {
		version:	SFNTParser.toUSHORT(data.slice(0, 2))
	};
	var os2 = font["OS/2"];

	if (os2.version > 5)
		return;

	os2.xAvgCharWidth = SFNTParser.toSHORT(data.slice(2, 4));
	os2.usWeightClass = SFNTParser.toUSHORT(data.slice(4, 6));
	os2.usWidthClass = SFNTParser.toUSHORT(data.slice(6, 8));
	os2.fsType = SFNTParser.toUSHORT(data.slice(8, 10));
	os2.ySubscriptXSize = SFNTParser.toSHORT(data.slice(10, 12));
	os2.ySubscriptYSize = SFNTParser.toSHORT(data.slice(12, 14));
	os2.ySubscriptXOffset = SFNTParser.toSHORT(data.slice(14, 16));
	os2.ySubscriptYOffset = SFNTParser.toSHORT(data.slice(16, 18));
	os2.ySuperscriptXSize = SFNTParser.toSHORT(data.slice(18, 20));
	os2.ySuperscriptYSize = SFNTParser.toSHORT(data.slice(20, 22));
	os2.ySuperscriptXOffset = SFNTParser.toSHORT(data.slice(22, 24));
	os2.ySuperscriptYOffset = SFNTParser.toSHORT(data.slice(24, 26));
	os2.yStrikeoutSize = SFNTParser.toSHORT(data.slice(26, 28));
	os2.yStrikeoutPosition = SFNTParser.toSHORT(data.slice(28, 30));
	os2.sFamilyClass = SFNTParser.toSHORT(data.slice(30, 32));
	os2.panose = {};
	os2.panose.bFamilyType = data[32];
	os2.panose.bSerifStyle = data[33];
	os2.panose.bWeight = data[34];
	os2.panose.bProportion = data[35];
	os2.panose.bContrast = data[36];
	os2.panose.bStrokeVariation = data[37];
	os2.panose.bArmStyle = data[38];
	os2.panose.bLetterform = data[39];
	os2.panose.bMidline = data[40];
	os2.panose.bXHeight = data[41];
	if (os2.version > 0) {
		os2.ulUnicodeRange1 = SFNTParser.toULONG(data.slice(42, 46));
		os2.ulUnicodeRange2 = SFNTParser.toULONG(data.slice(46, 50));
		os2.ulUnicodeRange3 = SFNTParser.toULONG(data.slice(50, 54));
		os2.ulUnicodeRange4 = SFNTParser.toULONG(data.slice(54, 58));
	}
	os2.achVendId = "";
	for (var i = 58; i < 62; i++) {
		var c = String.fromCharCode(data[i]);
		if (c == '\0')
			break;
		os2.achVendId += c;
	}
	os2.fsSelection = SFNTParser.toUSHORT(data.slice(62, 64));
	os2.usFirstCharIndex = SFNTParser.toUSHORT(data.slice(64, 66));
	os2.usLastCharIndex = SFNTParser.toUSHORT(data.slice(66, 68));
	os2.sTypoAscender = SFNTParser.toSHORT(data.slice(68, 70));
	os2.sTypoDescender = SFNTParser.toSHORT(data.slice(70, 72));
	os2.sTypoLineGap = SFNTParser.toSHORT(data.slice(72, 74));
	os2.usWinAscent = SFNTParser.toUSHORT(data.slice(74, 76));
	os2.usWinDescent = SFNTParser.toUSHORT(data.slice(76, 78));

	if (os2.version == 0)
		return;

	os2.ulCodePageRange1 = SFNTParser.toULONG(data.slice(78, 82));
	os2.ulCodePageRange2 = SFNTParser.toULONG(data.slice(82, 86));

	if (os2.version == 1)
		return;

	os2.sxHeight = SFNTParser.toSHORT(data.slice(86, 88));
	os2.sCapHeight = SFNTParser.toSHORT(data.slice(88, 90));
	os2.usDefaultChar = SFNTParser.toUSHORT(data.slice(90, 92));
	os2.usBreakChar = SFNTParser.toUSHORT(data.slice(92, 94));
	os2.usMaxContext = SFNTParser.toUSHORT(data.slice(94, 96));

	if (os2.version == 5) {
		os2.usLowerOpticalPointSize =
			SFNTParser.toUSHORT(data.slice(96, 98));
		os2.usUpperOpticalPointSize =
			SFNTParser.toUSHORT(data.slice(98, 100));
	}
}
