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

module.exports = function (SFNTParser) {
	function toS2 (value) {
		return value & 0x2 ? value - 0x4 : value;
	};

	function toS4 (value) {
		return value & 0x8 ? value - 0x10 : value;
	};

	SFNTParser.parseDeviceTable = function (data) {
		var ret = {
			startSize:	SFNTParser.toUSHORT(data.slice(0, 2)),
			endSize:	SFNTParser.toUSHORT(data.slice(2, 4)),
			deltaFormat:	SFNTParser.toUSHORT(data.slice(4, 6))
		};

		switch (ret.deltaFormat) {
		case 1:
			var delta = SFNTParser.toUSHORT(data.slice(6, 8));
			ret.deltaValue = new Array(8);
			ret.deltaValue[0] = toS2(delta >> 14);
			ret.deltaValue[1] = toS2((delta >> 12) & 0x3);
			ret.deltaValue[2] = toS2((delta >> 10) & 0x3);
			ret.deltaValue[3] = toS2((delta >> 8) & 0x3);
			ret.deltaValue[4] = toS2((delta >> 6) & 0x3);
			ret.deltaValue[5] = toS2((delta >> 4) & 0x3);
			ret.deltaValue[6] = toS2((delta >> 2) & 0x3);
			ret.deltaValue[7] = toS2(delta & 0x3);
			break;
		case 2:
			var delta = SFNTParser.toUSHORT(data.slice(6, 8));
			ret.deltaValue = new Array(4);
			ret.deltaValue[0] = toS4(delta >> 12);
			ret.deltaValue[1] = toS4((delta >> 8) & 0xf);
			ret.deltaValue[2] = toS4((delta >> 4) & 0xf);
			ret.deltaValue[3] = toS4(delta & 0xf);
			break;
		case 4:
			ret.deltaValue = new Array(2);
			ret.deltaValue[0] = SFNTParser.toCHAR(data[6]);
			ret.deltaValue[1] = SFNTParser.toCHAR(data[7]);
			break;
		}

		return ret;
	};

	SFNTParser.parseCoverageTable = function (data, offset) {
		var ret = {
			format:	SFNTParser.toUSHORT(data.slice(offset,
							       offset + 2))
		};

		if (ret.format == 1) {
			var count = SFNTParser.toUSHORT(data.slice(offset + 2,
								   offset + 4));
			ret.glyphArray = new Array(count);
			offset += 4;
			for (var i = 0; i < count; i++) {
				ret.glyphArray[i] =
					SFNTParser.toUSHORT(
						data.slice(offset, offset + 2));
				offset += 2;
			}
		} else if (ret.format == 2) {
			var count = SFNTParser.toUSHORT(data.slice(offset + 2,
								   offset + 4));
			ret.ranges = new Array(count);
			offset += 4;
			for (var i = 0; i < count; i++) {
				ret.ranges[i] = {
					start:	SFNTParser.toUSHORT(
							data.slice(offset,
								   offset + 2)),
					end:	SFNTParser.toUSHORT(
							data.slice(offset + 2,
								   offset + 4)),
					startCoverageIndex:
						SFNTParser.toUSHORT(
							data.slice(offset + 4,
								   offset + 6))
				};
				offset += 6;
			}
		}

		return ret;
	};
};
