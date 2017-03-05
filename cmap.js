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

function addUVSTables(SFNTParser, record, data, tOffset, dOffset, ndOffset) {
	if (dOffset) {
		var o = dOffset + tOffset;

		var n = SFNTParser.toULONG(data.slice(o, o + 4));
		record.UVSRanges = new Array(n);
		o += 4;
		for (var i = 0; i < n; i++) {
			record.UVSRanges[i] = {
				startUnicodeValue:
					SFNTParser.toUINT24(
						data.slice(o, o + 3)),
				additionalCount:	data[o + 3]
			};
			o += 4;
		}
	}

	if (ndOffset) {
		var o = ndOffset + tOffset;

		var n = SFNTParser.toULONG(data.slice(o, o + 4));
		record.UVSMappings = new Array(n);
		o += 4;
		for (var i = 0; i < n; i++) {
			record.UVSMappings[i] = {
				unicodeValue:
					SFNTParser.toUINT24(
						data.slice(o, o + 3)),
				glyphId:
					SFNTParser.toUSHORT(
						data.slice(o + 3, o + 5))
			};
			o += 5;
		}
	}
};

module.exports = function (SFNTParser, font) {
	var data = font.tables.cmap.data;

	var version = SFNTParser.toUSHORT(data.slice(0, 2));

	if (version != 0) {
		font.cmap = {
			version:	version
		};
		return;
	}

	font.cmap = {
		version:	version,
		tables:		new Array(SFNTParser.toUSHORT(data.slice(2, 4)))
	};

	var o = 4;
	for (var i = 0; i < font.cmap.tables.length; i++) {
		font.cmap.tables[i] = {
			platformId:
				SFNTParser.toUSHORT(data.slice(o, o + 2)),
			encodingId:
				SFNTParser.toUSHORT(data.slice(o + 2, o + 4)),
		};
		var offset = SFNTParser.toULONG(data.slice(o + 4, o + 8));
		o += 8;

		font.cmap.tables[i].format =
			SFNTParser.toUSHORT(data.slice(offset, offset + 2));

		if (font.cmap.tables[i].format == 0) {

			font.cmap.tables[i].language =
				SFNTParser.toUSHORT(data.slice(offset + 4,
							       offset + 6));
			offset = offset + 6;

			font.cmap.tables[i].glyphIndexArray = new Array(256);
			for (var j = 0; j < 256; j++, offset++)
				font.cmap.tables[i].glyphIndexArray[j] =
					data[offset];

		} else if (font.cmap.tables[i].format == 2) {

			var length = SFNTParser.toUSHORT(data.slice(
					offset + 2, offset + 4));

			font.cmap.tables[i].language =
				SFNTParser.toUSHORT(data.slice(offset + 4,
							       offset + 6));
			offset = offset + 6;

			font.cmap.tables[i].subHeaderKeys = new Array(256);
			var shCount = 0;
			for (var j = 0; j < 256; j++) {
				var v = SFNTParser.toUSHORT(data.slice(
						offset, offset + 2)) >> 3;
				font.cmap.tables[i].subHeaderKeys[j] = v;
				offset += 2;
				if (v > shCount)
					shCount = v;
			}
			shCount++;

			font.cmap.tables[i].subHeaders = new Array(shCount);
			for (var j = 0; j < shCount; j++) {
				font.cmap.tables[i].subHeaders[j] = {
					firstCode:
						SFNTParser.toUSHORT(data.slice(
							offset, offset + 2)),
					entryCount:
						SFNTParser.toUSHORT(data.slice(
							offset + 2,
							offset + 4)),
					idDelta:
						SFNTParser.toSHORT(data.slice(
							offset + 4,
							offset + 6)),
					glyphIndexArrayFirst:
						(SFNTParser.toUSHORT(data.slice(
							offset + 6,
							offset + 8))
						 - ((shCount - j - 1) << 3))
						>> 1
				};
				offset += 8;
			}

			font.cmap.tables[i].glyphIndexArray =
				new Array((length - (shCount << 3) - 518) >> 1);
			for (var j = 0;
			     j < font.cmap.tables[i].glyphIndexArray.length;
			     j++) {
				font.cmap.tables[i].glypIndexArray[j] =
					SFNTParser.toUSHORT(data.slice(
						offset, offset + 2));
				offset += 2;
			}

		} else if (font.cmap.tables[i].format == 4) {

			font.cmap.tables[i].language =
				SFNTParser.toUSHORT(data.slice(offset + 4,
							       offset + 6));
			var length = SFNTParser.toUSHORT(data.slice(
					offset + 2, offset + 4));
			var segCountX2 = SFNTParser.toUSHORT(data.slice(
						offset + 6, offset + 8));
			var segCount = segCountX2 >> 1;

			font.cmap.tables[i].segments = new Array(segCount);
			offset += 14;
			var sOffset = offset + segCountX2 + 2;
			var idOffset = sOffset + segCountX2;
			var idroOffset = idOffset + segCountX2;
			var giaOffset = idroOffset + segCountX2;
			for (var j = 0; j < segCount; j++) {
				font.cmap.tables[i].segments[j] = {
					startCode:
						SFNTParser.toUSHORT(data.slice(
							sOffset, sOffset + 2)),
					endCode:
						SFNTParser.toUSHORT(data.slice(
							offset, offset + 2)),
					idDelta:
						SFNTParser.toSHORT(data.slice(
							idOffset,
							idOffset + 2))
				};

				var idRangeOffset =
					SFNTParser.toUSHORT(data.slice(
						idroOffset, idroOffset + 2));
				if (idRangeOffset != 0)
					font.cmap.tables[i].segments[j]
					    .glyphIndexArrayFirst =
						(idRangeOffset >> 1)
						- (segCount - j);

				offset += 2;
				sOffset += 2;
				idOffset += 2;
				idroOffset += 2;
			}

			font.cmap.tables[i].glyphIndexArray =
				new Array((length >> 1) - (8 + 2 * segCountX2));
			offset = giaOffset;
			for (var j = 0;
			     j < font.cmap.tables[i].glyphIndexArray.length;
			     j++) {
				font.cmap.tables[i].glyphIndexArray[j] =
					SFNTParser.toUSHORT(data.slice(
						offset, offset + 2));
				offset += 2;
			}

		} else if (font.cmap.tables[i].format == 6) {

			font.cmap.tables[i].language =
				SFNTParser.toUSHORT(data.slice(offset + 4,
							       offset + 6));
			font.cmap.tables[i].firstCode =
				SFNTParser.toUSHORT(data.slice(offset + 6,
							       offset + 8));
			font.cmap.tables[i].entryCount =
				SFNTParser.toUSHORT(data.slice(offset + 8,
							       offset + 10));

			font.cmap.tables[i].glyphIndexArray =
				new Array(font.cmap.tables[i].entryCount);
			offset += 10;
			for (var j = 0; j < font.cmap.tables[i].entryCount; j++)
			{
				font.cmap.tables[i].glyphIndexArray[j] =
					SFNTParser.toUSHORT(data.slice(offset,
								       offset + 2));
				offset += 2;
			}

		} else if (font.cmap.tables[i].format == 8) {

			font.cmap.tables[i].language =
				SFNTParser.toULONG(data.slice(offset + 8,
							      offset + 12));
			font.cmap.tables[i].is32 =
				data.slice(offset + 12, offset + 8204);

			var nGroups = SFNTParser.toULONG(data.slice(
					offset + 8204, offset + 8208));
			font.cmap.tables[i].groups = new Array(nGroups);
			offset += 8208;
			for (var j = 0; j < nGroups; j++) {
				font.cmap.tables[i].groups[j] = {
					startCharCode:
						SFNTParser.toULONG(data.slice(
							offset, offset + 4)),
					endCharCode:
						SFNTParser.toULONG(data.slice(
							offset + 4,
							offset + 8)),
					startGlyphId:
						SFNTParser.toULONG(data.slice(
							offset + 8,
							offset + 12))
				};
				offset += 12;
			}

		} else if (font.cmap.tables[i].format == 10) {

			font.cmap.tables[i].language =
				SFNTParser.toULONG(data.slice(offset + 8,
							      offset + 12));
			font.cmap.tables[i].startCharCode =
				SFNTParser.toULONG(data.slice(offset + 12,
							      offset + 16));

			var numChars =
				SFNTParser.toULONG(data.slice(offset + 16,
							      offset + 20))
				>> 1;
			font.cmap.tables[i].glyphIndexArray = new Array(numChars);
			offset += 20;
			for (var j = 0; j < numChars; j++) {
				font.cmap.tables[i].glyphIndexArray[j] =
					SFNTParser.toUSHORT(data.slice(
						offset, offset + 2));
				offset += 2;
			}

		} else if (font.cmap.tables[i].format == 12) {

			font.cmap.tables[i].language =
				SFNTParser.toULONG(data.slice(offset + 8,
							      offset + 12));

			var nGroups = SFNTParser.toULONG(data.slice(
					offset + 12, offset + 16));
			font.cmap.tables[i].groups = new Array(nGroups);
			offset += 16;
			for (var j = 0; j < nGroups; j++) {
				font.cmap.tables[i].groups[j] = {
					startCharCode:
						SFNTParser.toULONG(data.slice(
							offset, offset + 4)),
					endCharCode:
						SFNTParser.toULONG(data.slice(
							offset + 4,
							offset + 8)),
					startGlyphId:
						SFNTParser.toULONG(data.slice(
							offset + 8,
							offset + 12))
				};
				offset += 12;
			}

		} else if (font.cmap.tables[i].format == 13) {

			font.cmap.tables[i].language =
				SFNTParser.toULONG(data.slice(offset + 8,
							      offset + 12));

			var nGroups = SFNTParser.toULONG(data.slice(
					offset + 12, offset + 16));
			font.cmap.tables[i].groups = new Array(nGroups);
			offset += 16;
			for (var j = 0; j < nGroups; j++) {
				font.cmap.tables[i].groups[j] = {
					startCharCode:
						SFNTParser.toULONG(data.slice(
							offset, offset + 4)),
					endCharCode:
						SFNTParser.toULONG(data.slice(
							offset + 4,
							offset + 8)),
					glyphId:
						SFNTParser.toULONG(data.slice(
							offset + 8,
							offset + 12))
				};
				offset += 12;
			}

		} else if (font.cmap.tables[i].format == 14) {

			var tOffset = offset;
			var nRecords = SFNTParser.toULONG(data.slice(
					offset + 6, offset + 10));
			font.cmap.tables[i].varSelectorRecords =
				new Array(nRecords);
			offset += 10;
			for (var j = 0; j < nRecords; j++) {
				font.cmap.tables[i].varSelectorRecords[j] = {
					varSelector:
						SFNTParser.toUINT24(
							data.slice(offset,
								   offset + 3))
				};
				var dOffset = SFNTParser.toULONG(
						data.slice(offset + 3,
							   offset + 7));
				var ndOffset = SFNTParser.toULONG(
						data.slice(offset + 7,
							   offset + 11));
				addUVSTables(SFNTParser,
					     font.cmap.tables[i]
						 .varSelectorRecords[j],
					     data, tOffset, dOffset, ndOffset);
			}

		}
	}
};
