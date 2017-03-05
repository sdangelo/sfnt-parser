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

// depends on tables.js

function parseValueRecord (SFNTParser, data, offset, parentOffset) {
	var ret = {
		value:	SFNTParser.toSHORT(data.slice(offset, offset + 2))
	};
	var o = SFNTParser.toUSHORT(data.slice(offset + 2, offset + 4));
	if (o != 0) {
		o += parentOffset;
		ret.deviceTable = SFNTParser.parseDeviceTable(
					data.slice(o, o + 8));
	}
	return ret;
};

function parseKernTable (SFNTParser, data, offset) {
	var count = SFNTParser.toUSHORT(data.slice(offset, offset + 2));
	var ret = new Array(count + 1);
	var o = offset + 2;
	var o2 = o + (count << 2);
	for (var i = 0; i < count; i++) {
		ret[i] = {
			maxHeight:
				parseValueRecord(SFNTParser, data, o, offset),
			kernValue:
				parseValueRecord(SFNTParser, data, o2, offset)
		};
		o += 4;
		o2 += 4;
	}
	ret[count] = {
		kernValue:	parseValueRecord(SFNTParser, data, o2, offset)
	};
	return ret;
};

function parseGlyphConstructionTable (SFNTParser, data, offset) {
	var ret = {
		variants:
			new Array(SFNTParser.toUSHORT(data, offset + 2,
						      offset + 4))
	};
	var o = offset + 4;
	for (var i = 0; i < ret.variants.length; i++) {
		ret.variants[i] = {
			glyphId:
				SFNTParser.toUSHORT(data.slice(o, o + 2)),
			advance:
				SFNTParser.toUSHORT(data.slice(o + 2, o + 4))
		};
		o += 4;
	}

	o = SFNTParser.toUSHORT(data.slice(offset, offset + 2));
	if (o != 0) {
		o += offset;
		ret.glyphAssembly = {
			italicsCorrection:
				parseValueRecord(SFNTParser, data, o, offset),
			parts:
				new Array(SFNTParser.toUSHORT(data, o + 4,
							      o + 6))
		};
		o += 6;
		for (var i = 0; i < ret.glyphAssembly.parts.length; i++) {
			ret.glyphAssembly.parts[i] = {
				glyphId:
					SFNTParser.toUSHORT(data.slice(o,
								       o + 2)),
				startConnectorLength:
					SFNTParser.toUSHORT(data.slice(o + 2,
								       o + 4)),
				endConnectorLength:
					SFNTParser.toUSHORT(data.slice(o + 4,
								       o + 6)),
				fullAdvance:
					SFNTParser.toUSHORT(data.slice(o + 6,
								       o + 8)),
				partFlags:
					SFNTParser.toUSHORT(data.slice(o + 8,
								       o + 10))
			};
			o += 10;
		}
	}

	return ret;
};

function addCoverageGlyphId (array, coverage) {
	if (coverage.format == 1)
		for (var i = 0; i < array.length; i++)
			array[i].glyphId = coverage.glyphArray[i];
	else {
		var j = 0;
		var k = 0;
		for (var i = 0; i < array.length; i++) {
			var g = coverage.ranges[j].start + k;
			if (g <= coverage.ranges[j].end) {
				array[i].glyphId = g;
				k++;
			} else {
				j++;
				array[i].glyphId = coverage.ranges[j].start;
				k = 1;
			}
		}
	}
};

module.exports = function (SFNTParser, font) {
	if (!font.tables.MATH)
		return;

	var data = font.tables.MATH.data;
	font.math = {
		version:	SFNTParser.toFixed(data.slice(0, 4))
	};
	if (font.math.version != 1.0)
		return;

	var o = SFNTParser.toUSHORT(data.slice(4, 6));
	font.math.constants = {
		scriptPercentScaleDown:
			SFNTParser.toSHORT(data.slice(o, o + 2)),
		scriptScriptPercentScaleDown:
			SFNTParser.toSHORT(data.slice(o + 2, o + 4)),
		delimitedSubFormulaMinHeight:
			SFNTParser.toUSHORT(data.slice(o + 4, o + 6)),
		displayOperatorMinHeight:
			SFNTParser.toUSHORT(data.slice(o + 6, o + 8)),
		mathLeading:
			parseValueRecord(SFNTParser, data, o + 8, o),
		axisHeight:
			parseValueRecord(SFNTParser, data, o + 12, o),
		accentBaseHeight:
			parseValueRecord(SFNTParser, data, o + 16, o),
		flattenedAccentBaseHeight:
			parseValueRecord(SFNTParser, data, o + 20, o),
		subscriptShiftDown:
			parseValueRecord(SFNTParser, data, o + 24, o),
		subscriptTopMax:
			parseValueRecord(SFNTParser, data, o + 28, o),
		subscriptBaselineDropMin:
			parseValueRecord(SFNTParser, data, o + 32, o),
		superscriptShiftUp:
			parseValueRecord(SFNTParser, data, o + 36, o),
		superscriptShiftUpCramped:
			parseValueRecord(SFNTParser, data, o + 40, o),
		superscriptBottomMin:
			parseValueRecord(SFNTParser, data, o + 44, o),
		superscriptBaselineDropMax:
			parseValueRecord(SFNTParser, data, o + 48, o),
		subSuperscriptGapMin:
			parseValueRecord(SFNTParser, data, o + 52, o),
		superscriptBottomMaxWithSubscript:
			parseValueRecord(SFNTParser, data, o + 56, o),
		spaceAfterScript:
			parseValueRecord(SFNTParser, data, o + 60, o),
		upperLimitGapMin:
			parseValueRecord(SFNTParser, data, o + 64, o),
		upperLimitBaseRiseMin:
			parseValueRecord(SFNTParser, data, o + 68, o),
		lowerLimitGapMin:
			parseValueRecord(SFNTParser, data, o + 72, o),
		lowerLimitBaseDropMin:
			parseValueRecord(SFNTParser, data, o + 76, o),
		stackTopShiftUp:
			parseValueRecord(SFNTParser, data, o + 80, o),
		stackTopDisplayStyleShiftUp:
			parseValueRecord(SFNTParser, data, o + 84, o),
		stackBottomShiftDown:
			parseValueRecord(SFNTParser, data, o + 88, o),
		stackBottomDisplayStyleShiftDown:
			parseValueRecord(SFNTParser, data, o + 92, o),
		stackGapMin:
			parseValueRecord(SFNTParser, data, o + 96, o),
		stackDisplayStyleGapMin:
			parseValueRecord(SFNTParser, data, o + 100, o),
		stretchStackTopShiftUp:
			parseValueRecord(SFNTParser, data, o + 104, o),
		stretchStackBottomShiftDown:
			parseValueRecord(SFNTParser, data, o + 108, o),
		stretchStackGapAboveMin:
			parseValueRecord(SFNTParser, data, o + 112, o),
		stretchStackGapBelowMin:
			parseValueRecord(SFNTParser, data, o + 116, o),
		fractionNumeratorShiftUp:
			parseValueRecord(SFNTParser, data, o + 120, o),
		fractionNumeratorDisplayStyleShiftUp:
			parseValueRecord(SFNTParser, data, o + 124, o),
		fractionDenominatorShiftDown:
			parseValueRecord(SFNTParser, data, o + 128, o),
		fractionDenominatorDisplayStyleShiftDown:
			parseValueRecord(SFNTParser, data, o + 132, o),
		fractionNumeratorGapMin:
			parseValueRecord(SFNTParser, data, o + 136, o),
		fractionNumeratorDisplayStyleGapMin:
			parseValueRecord(SFNTParser, data, o + 140, o),
		fractionRuleThickness:
			parseValueRecord(SFNTParser, data, o + 144, o),
		fractionDenominatorGapMin:
			parseValueRecord(SFNTParser, data, o + 148, o),
		fractionDenominatorDisplayStyleGapMin:
			parseValueRecord(SFNTParser, data, o + 152, o),
		skewedFractionHorizontalGap:
			parseValueRecord(SFNTParser, data, o + 156, o),
		skewedFractionVerticalGap:
			parseValueRecord(SFNTParser, data, o + 160, o),
		overbarVerticalGap:
			parseValueRecord(SFNTParser, data, o + 164, o),
		overbarRuleThickness:
			parseValueRecord(SFNTParser, data, o + 168, o),
		overbarExtraAscender:
			parseValueRecord(SFNTParser, data, o + 172, o),
		underbarVerticalGap:
			parseValueRecord(SFNTParser, data, o + 176, o),
		underbarRuleThickness:
			parseValueRecord(SFNTParser, data, o + 180, o),
		underbarExtraDescender:
			parseValueRecord(SFNTParser, data, o + 184, o),
		radicalVerticalGap:
			parseValueRecord(SFNTParser, data, o + 188, o),
		radicalDisplayStyleVerticalGap:
			parseValueRecord(SFNTParser, data, o + 192, o),
		radicalRuleThickness:
			parseValueRecord(SFNTParser, data, o + 196, o),
		radicalExtraAscender:
			parseValueRecord(SFNTParser, data, o + 200, o),
		radicalKernBeforeDegree:
			parseValueRecord(SFNTParser, data, o + 204, o),
		radicalKernAfterDegree:
			parseValueRecord(SFNTParser, data, o + 208, o),
		radicalDegreeBottomRaisePercent:
			SFNTParser.toSHORT(data.slice(o + 212, o + 216))
	};

	o = SFNTParser.toUSHORT(data.slice(6, 8));
	font.math.glyphInfo = {};

	var o2 = o + SFNTParser.toUSHORT(data.slice(o, o + 2));
	var coverage = SFNTParser.parseCoverageTable(data,
			o2 + SFNTParser.toUSHORT(data.slice(o2, o2 + 2)));
	if (coverage.format == 1 || coverage.format == 2) {
		var count = SFNTParser.toUSHORT(data.slice(o2 + 2, o2 + 4));
		font.math.glyphInfo.italicsCorrection = new Array(count);
		o2 += 4;
		for (var i = 0; i < count; i++) {
			font.math.glyphInfo.italicsCorrection[i] =
				parseValueRecord(SFNTParser, data, o2, o2 + 4);
			o2 += 4;
		}
		addCoverageGlyphId(font.math.glyphInfo.italicsCorrection,
				   coverage);
	}

	o2 = o + SFNTParser.toUSHORT(data.slice(o + 2, o + 4));
	coverage = SFNTParser.parseCoverageTable(data,
			o2 + SFNTParser.toUSHORT(data.slice(o2, o2 + 2)));
	if (coverage.format == 1 || coverage.format == 2) {
		var count = SFNTParser.toUSHORT(data.slice(o2 + 2, o2 + 4));
		font.math.glyphInfo.topAccentAttachment = new Array(count);
		o2 += 4;
		for (var i = 0; i < count; i++) {
			font.math.glyphInfo.topAccentAttachment[i] =
				parseValueRecord(SFNTParser, data, o2, o2 + 4);
			o2 += 4;
		}
		addCoverageGlyphId(font.math.glyphInfo.topAccentAttachment,
				   coverage);
	}

	o2 = SFNTParser.toUSHORT(data.slice(o + 4, o + 6));
	if (o2 != 0)
		font.math.glyphInfo.extendedShapeCoverage =
			SFNTParser.parseCoverageTable(data, o + o2);

	o2 = o + SFNTParser.toUSHORT(data.slice(o + 6, o + 8));
	coverage = SFNTParser.parseCoverageTable(data,
			o2 + SFNTParser.toUSHORT(data.slice(o2, o2 + 2)));
	if (coverage.format == 1 || coverage.format == 2) {
		var count = SFNTParser.toUSHORT(data.slice(o2 + 2, o2 + 4));
		font.math.glyphInfo.kernInfo = new Array(count);
		var o3 = o2 + 4;
		for (var i = 0; i < count; i++) {
			font.math.glyphInfo.kernInfo[i] = {};
			var o4 = SFNTParser.toUSHORT(data.slice(o3, o3 + 2));
			if (o4 != 0)
				font.math.glyphInfo.kernInfo[i].topRight =
					parseKernTable(SFNTParser, data,
						       o2 + o4);
			o4 = SFNTParser.toUSHORT(data.slice(o3 + 2, o3 + 4));
			if (o4 != 0)
				font.math.glyphInfo.kernInfo[i].topLeft =
					parseKernTable(SFNTParser, data,
						       o2 + o4);
			o4 = SFNTParser.toUSHORT(data.slice(o3 + 4, o3 + 6));
			if (o4 != 0)
				font.math.glyphInfo.kernInfo[i].bottomRight =
					parseKernTable(SFNTParser, data,
						       o2 + o4);
			o4 = SFNTParser.toUSHORT(data.slice(o3 + 6, o3 + 8));
			if (o4 != 0)
				font.math.glyphInfo.kernInfo[i].bottomLeft =
					parseKernTable(SFNTParser, data,
						       o2 + o4);
			o3 += 8;
		}
		addCoverageGlyphId(font.math.glyphInfo.kernInfo, coverage);
	}

	o = SFNTParser.toUSHORT(data.slice(8, 10));
	font.math.variants = {
		minConnectorOverlap:
			SFNTParser.toUSHORT(data.slice(o, o + 2))
	};

	o2 = o + SFNTParser.toUSHORT(data.slice(o + 2, o + 4));
	coverage = SFNTParser.parseCoverageTable(data, o2);
	var vCount = SFNTParser.toUSHORT(data.slice(o + 6, o + 8));
	if (coverage.format == 1 || coverage.format == 2) {
		font.math.variants.vertGlyphConstruction = new Array(vCount);
		o2 = o + 10;
		for (var i = 0; i < vCount; i++) {
			font.math.variants.vertGlyphConstruction[i] =
				parseGlyphConstructionTable(SFNTParser, data,
					o + SFNTParser.toUSHORT(
						data.slice(o2, o2 + 2)));
			o2 += 2;
		}
		addCoverageGlyphId(font.math.variants.vertGlyphConstruction,
				   coverage);
	}

	o2 = o + SFNTParser.toUSHORT(data.slice(o + 4, o + 6));
	coverage = SFNTParser.parseCoverageTable(data, o2);
	if (coverage.format == 1 || coverage.format == 2) {
		var count = SFNTParser.toUSHORT(data.slice(o + 8, o + 10));
		font.math.variants.horizGlyphConstruction = new Array(count);
		o2 = o + 10 + (count << 1);
		for (var i = 0; i < count; i++) {
			font.math.variants.horizGlyphConstruction[i] =
				parseGlyphConstructionTable(SFNTParser, data,
					o + SFNTParser.toUSHORT(
						data.slice(o2, o2 + 2)));
			o2 += 2;
		}
		addCoverageGlyphId(font.math.variants.horizGlyphConstruction,
				   coverage);
	}
};
