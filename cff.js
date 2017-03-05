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

// depends on cffData.js

function parseIndex(SFNTParser, data, offset) {
	var count = SFNTParser.toUSHORT(data.slice(offset, offset + 2));
	if (count == 0)
		return { end: offset + 2, data: [] };

	var offSize = data[offset + 2];
	var f;
	switch (offSize) {
	case 1:
		f = function (data, o) { return data[o]; };
		break;
	case 2:
		f = function (data, o) {
			return SFNTParser.toUSHORT(data.slice(o, o + 2));
		}
		break;
	case 3:
		f = function (data, o) {
			return SFNTParser.toUINT24(data.slice(o, o + 3));
		}
		break;
	case 4:
		f = function (data, o) {
			return SFNTParser.toULONG(data.slice(o, o + 4));
		}
		break;
	}

	var o = offSize + offset + 3;
	var o2 = o + count * offSize - 1;
	var start = o2 + 1;
	var nextStart;
	var iData = new Array(count);
	for (var i = 0; i < count; i++) {
		var nextStart = o2 + f(data, o);
		iData[i] = data.slice(start, nextStart);
		o += offSize;
		start = nextStart;
	}

	return { end: nextStart, data: iData };
}

function applyDefaults(dict, keys) {
	for (var i = 0; i < keys.length; i++)
		if (keys[i] && keys[i].defaultValue !== undefined)
			dict[keys[i].key] = keys[i].defaultValue;
}

function parseDict(SFNTParser, data, keys1, keys2) {
	var ret = {};

	applyDefaults(ret, keys1);
	applyDefaults(ret, keys2);

	var stack = [];
	for (var i = 0; i < data.length; i++) {
		var b = data[i];
		if (b == 12) {
			i++;
			var c = data[i];
			var v = stack.length > 1 ? stack : stack[0];
			ret[keys2[c].key] = keys2[c].map ? keys2[c].map(v) : v;
			stack = [];
		} else if (b <= 21) {
			var v = stack.length > 1 ? stack : stack[0];
			ret[keys1[b].key] = keys1[b].map ? keys1[b].map(v) : v;
			stack = [];
		} else if (b == 28) {
			stack.push(SFNTParser.toUSHORT(data.slice(i + 1,
								  i + 3)));
			i += 2;
		} else if (b == 29) {
			stack.push(SFNTParser.toULONG(data.slice(i + 1,
								 i + 5)));
			i += 4;
		} else if (b == 30) {
			var s = "";
			var v = ["0", "1", "2", "3", "4", "5", "6", "7", "8",
				 "9", ".", "e", "e-", "", "-", ""];
			while (true) {
				i++;
				var h = data[i] >> 4;
				var l = data[i] & 0xf;
				if (h == 0xf)
					break;
				s += v[h];
				if (l == 0xf)
					break;
				s += v[l];
			}
			stack.push(parseFloat(s));
		} else if (b >= 32 && b <= 246) {
			stack.push(b - 139);
		} else if (b >= 247 && b <= 250) {
			i++;
			stack.push((b - 247) * 256 + data[i] + 108);
		} else {
			i++;
			stack.push(-(b - 251) * 256 - data[i] - 108);
		}
	}
	return ret;
}

function sidToString(SFNTParser, strings, sid) {
	return sid < SFNTParser.cffStandardStrings.length
	       ? SFNTParser.cffStandardStrings[sid]
	       : strings[sid - SFNTParser.cffStandardStrings.length];
}

function parseEncoding(SFNTParser, strings, encoding, data) {
	if (encoding == 0)
		return SFNTParser.cffStandardEncoding;
	else if (encoding == 1)
		return SFNTParser.cffExpertEncoding;

	var o = encoding;
	var ret = { format: data[o] };

	var format = ret.format & 0x7f; 
	if (format == 0) {
		ret.codes = new Array(data[o + 1]);
		o += 2;
		for (var i = 0; i < ret.codes.length; i++) {
			ret.codes[i] = data[o];
			o++;
		}
	} else if (format == 1) {
		ret.ranges = new Array(data[o + 1]);
		o += 2;
		for (var i = 0; i < ret.ranges.length; i++) {
			ret.ranges[i] = {
				first:	data[o],
				nLeft:	data[o + 1]
			};
			o += 2;
		}
	}

	if (format <= 1 && ret.format & 0x80) {
		ret.supplements = new Array(data[o]);
		for (var i = 0; i < ret.supplements.length; i++) {
			ret.supplements[i] = {
				code:	data[o],
				name:	sidToString(SFNTParser, strings,
						SFNTParser.toUSHORT(
							data.slice(o + 1,
								   o + 3)))
			};
			o += 3;
		}
	}

	return ret;
}

function parseCharset(SFNTParser, strings, charset, isCID, nGlyphs, data) {
	if (charset == 0)
		return SFNTParser.cffISOAdobeCharset;
	else if (charset == 1)
		return SFNTParser.cffExpertCharset;
	else if (charset == 2)
		return SFNTParser.cffExpertSubsetCharset;

	var o = charset;
	var ret = { format: data[o] };

	var f = isCID ? function (x) { return x; }
		      : function (x) {
				return sidToString(SFNTParser, strings, x);
			};

	if (ret.format == 0) {
		ret.glyphs = new Array(nGlyphs - 1);
		o += 1;
		for (var i = 0; i < ret.glyphs.length; i++) {
			ret.glyphs[i] = f(SFNTParser.toUSHORT(
						data.slice(o, o + 2)));
			o += 2;
		}
	} else if (ret.format == 1) {
		var count = nGlyphs - 1;
		ret.glyphs = new Array(count);
		var i = 0;
		o += 1;
		while (count != 0) {
			var first = SFNTParser.toUSHORT(data.slice(o, o + 2));
			var left = data[o + 3];
			for (var j = 0; j <= left; j++) {
				ret.glyphs[i] = f(first + j);
				i++;
			}
			o += 3;
			count -= left + 1;
		}
	} else if (ret.format == 2) {
		var count = nGlyphs - 1;
		ret.glyphs = new Array(count);
		var i = 0;
		o += 1;
		while (count != 0) {
			var first = SFNTParser.toUSHORT(data.slice(o, o + 2));
			var left = SFNTParser.toUSHORT(data.slice(o + 2,
								  o + 4));
			for (var j = 0; j <= left; j++) {
				ret.glyphs[i] = f(first + j);
				i++;
			}
			o += 4;
			count -= left + 1;
		}
	}

	return ret;
}

function parsePrivateDict(SFNTParser, strings, data, offset, size) {
	function mapSid(v) { return sidToString(SFNTParser, strings, v); }
	function mapBool(v) { return !(!v); }

	var keys1 = [
		,,,,,,
		{ key: "blueValues" },
		{ key: "otherBlues" },
		{ key: "familyBlues" },
		{ key: "familyOtherBlues" },
		{ key: "stdHW" },
		{ key: "stdVW" },
		,,,,,,,
		{ key: "localSubrs" },
		{ key: "defaultWidthX", defaultValue: 0 },
		{ key: "nominalWidthX", defaultValue: 0 }
	];

	var keys2 = [
		,,,,,,,,,
		{ key: "blueScale", defaultValue: 0.039625 },
		{ key: "blueShift", defaultValue: 7 },
		{ key: "blueFuzz", defaultValue: 1 },
		{ key: "stemSnapH" },
		{ key: "stemSnapV" },
		{ key: "forceBold", map: mapBool, defaultValue: false },
		,,
		{ key: "languageGroup", defaultValue: 0 },
		{ key: "expansionFactor", defaultValue: 0.06 },
		{ key: "initialRandomSeed", defaultValue: 0 }
	];

	var ret = parseDict(SFNTParser, data.slice(offset, offset + size),
			    keys1, keys2);

	if (ret.localSubrs)
		ret.localSubrs = parseIndex(SFNTParser, data,
					    offset + ret.localSubrs).data;

	return ret;
}

function parseFontDict(SFNTParser, strings, data, dictData) {
	function mapSid(v) { return sidToString(SFNTParser, strings, v); }

	var keys1 = [,,,,,,,,,,,,,,,,,, { key: "privateDict" } ];
	var keys2 = [
		,,,,,,,
		{ key: "fontMatrix" },
		,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
		{ key: "fontName", map: mapSid }
	];

	var ret = parseDict(SFNTParser, dictData, keys1, keys2);
	ret.privateDict = parsePrivateDict(SFNTParser, strings, data,
					   ret.privateDict[1],
					   ret.privateDict[0]);
	return ret;
}

function parseTopDict(SFNTParser, strings, data, dictData) {
	function mapSid(v) { return sidToString(SFNTParser, strings, v); }
	function mapBool(v) { return !(!v); }
	function mapROS(v) {
		v[0] = mapSid(v[0]);
		v[1] = mapSid(v[1]);
		return v;
	}

	var keys1 = [
		{ key: "version", map: mapSid },
		{ key: "notice", map: mapSid },
		{ key: "fullName", map: mapSid },
		{ key: "familyName", map: mapSid },
		{ key: "weight", map: mapSid },
		{ key: "fontBBox", defaultValue: [0, 0, 0, 0] },
		,,,,,,,
		{ key: "uniqueId" },
		{ key: "XUID" },
		{ key: "charset", defaultValue: 0 },
		{ key: "encoding", defaultValue: 0 },
		{ key: "charStrings" },
		{ key: "privateDict" }
	];

	var keys2 = [
		{ key: "copyright", map: mapSid },
		{ key: "isFixedPitch", map: mapBool, defaultValue: false },
		{ key: "italicAngle", defaultValue: 0 },
		{ key: "underlinePosition", defaultValue: -100 },
		{ key: "underlineThickness", defaultValue: 50 },
		{ key: "paintType", defaultValue: 0 },
		{ key: "charstringType", defaultValue: 2 },
		{ key: "fontMatrix", defaultValue: [0.001, 0, 0, 0.001, 0, 0] },
		{ key: "strokeWidth", defaultValue: 0 },
		,,,,,,,,,,,
		{ key: "syntheticBase" },
		{ key: "postScript", map: mapSid },
		{ key: "baseFontName", map: mapSid },
		{ key: "baseFontBlend" },
		,,,,,,
		{ key: "ROS", map: mapROS },
		{ key: "CIDFontVersion", defaultValue: 0 },
		{ key: "CIDFontRevision", defaultValue: 0 },
		{ key: "CIDFontType", defaultValue: 0 },
		{ key: "CIDCount", defaultValue: 8720 },
		{ key: "UIDBase" },
		{ key: "FDArray" },
		{ key: "FDSelect" },
		{ key: "fontName", map: mapSid }
	];

	var ret = parseDict(SFNTParser, dictData, keys1, keys2);
	var isCID = !(!ret.ROS);

	if (ret.charStrings) {
		ret.charStrings = parseIndex(SFNTParser, data,
					     ret.charStrings).data;
		ret.charset = parseCharset(SFNTParser, strings, ret.charset,
					   isCID, ret.charStrings.length, data);
	} else
		delete ret.charset;

	ret.privateDict = parsePrivateDict(SFNTParser, strings, data,
					   ret.privateDict[1],
					   ret.privateDict[0]);

	if (isCID) {
		delete ret.encoding;

		ret.FDArray = parseIndex(SFNTParser, data, ret.FDArray).data;
		for (var i = 0; i < ret.FDArray.length; i++)
			ret.FDArray[i] = parseFontDict(SFNTParser, strings,
						       data, ret.FDArray[i]);

		var o = ret.FDSelect;
		ret.FDSelect = { format: data[o] };
		if (ret.FDSelect.format == 0) {
			ret.FDSelect.fds = new Array(ret.charStrings.length);
			o++;
			for (var i = 0; i < ret.charStrings.length; i++) {
				ret.FDSelect.fds[i] = data[o];
				o++;
			}
		} else if (ret.FDSelect.format == 3) {
			ret.FDSelect.ranges =
				new Array(SFNTParser.toUSHORT(
						data.slice(o + 1, o + 3)));
			o += 3;
			for (var i = 0; i < ret.FDSelect.ranges.length; i++) {
				ret.FDSelect.ranges[i] = {
					first:	SFNTParser.toUSHORT(
							data.slice(o, o + 2)),
					fd:	data[o + 2]
				};
				o += 3;
			}
		}
	} else {
		delete ret.CIDFontVersion;
		delete ret.CIDFontRevision;
		delete ret.CIDFontType;
		delete ret.CIDCount;
		ret.encoding = parseEncoding(SFNTParser, strings, ret.encoding,
					     data);
	}

	return ret;
}

module.exports = function (SFNTParser, font) {
	if (!font.tables["CFF "])
		return;

	var data = font.tables["CFF "].data;
	font.cff = {
		major:	data[0],
		minor:	data[1]
	};
	if (font.cff.major != 1)
		return;

	var nameIndex = parseIndex(SFNTParser, data, data[2]);
	var topDictIndex = parseIndex(SFNTParser, data, nameIndex.end);
	var stringIndex = parseIndex(SFNTParser, data, topDictIndex.end);
	var globalSubrIndex = parseIndex(SFNTParser, data, stringIndex.end);

	font.cff.name = String.fromCharCode.apply(null, nameIndex.data[0]);

	var strings = new Array(stringIndex.data.length);
	for (var i = 0; i < stringIndex.data.length; i++)
		strings[i] = String.fromCharCode.apply(null,
						       stringIndex.data[i]);

	font.cff.globalSubrs = globalSubrIndex.data;

	font.cff.topDict = parseTopDict(SFNTParser, strings, data,
					topDictIndex.data[0]);
}
