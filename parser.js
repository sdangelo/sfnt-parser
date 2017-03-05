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

module.exports = {
	toCHAR: function (arr) {
		return arr[0] & 0x80 ? arr[0] - 0x100 : arr[0];
	},

	toUSHORT: function (arr) {
		return arr[0] << 8 | arr[1];
	},

	toSHORT: function (arr) {
		var v = this.toUSHORT(arr);
		return v & 0x8000 ? v - 0x10000: v;
	},

	toUINT24: function (arr) {
		return arr[0] << 16 | arr[1] << 8 | arr[2];
	},

	toLONG: function (arr) {
		return arr[0] << 24 | arr[1] << 16 | arr[2] << 8 | arr[3];
	},

	toULONG: function (arr) {
		var v = this.toLONG(arr);
		return v & 0x80000000 ? (v & 0x7fffffff) + 0x80000000 : v;
	},

	toFixed: function (arr) {
		var int = this.toSHORT(arr.slice(0, 2));
		var frac = this.toUSHORT(arr.slice(2, 4));
		return int + frac / 0x10000;
	},

	toF2DOT14: function (arr) {
		var int = this.toCHAR(arr[0]) >> 6;
		var frac = (arr[0] & 0x3f) << 8 | arr[1];
		return int + frac / 0x4000;
	},

	toLONGDATETIME: function (arr) {
		var h = this.toLONG(arr.slice(0, 4));
		var l = this.toULONG(arr.slice(4, 8));
		var v = h * 0x100000000 + l;
		return new Date(new Date(1904, 1, 1).getTime() + v * 1000);
	},

	toString: function (arr) {
		return String.fromCharCode.apply(String, arr);
	},

	parseFont: function (data, plugins, offset) {
		var sfntVersion = this.toULONG(data.slice(offset, offset + 4));
		if (sfntVersion != 0x00010000 && sfntVersion != 0x4f54544f)
			return { snftVersion: snftVersion };

		var numTables = this.toUSHORT(data.slice(offset + 4,
							 offset + 6));
		var tables = {};
		var to = offset + 12;
		for (var i = 0; i < numTables; i++, to += 16) {
			var tag = this.toString(data.slice(to, to + 4));
			var o = this.toULONG(data.slice(to + 8, to + 12));
			var l = this.toULONG(data.slice(to + 12, to + 16));
			tables[tag] = {
				data:		data.slice(o, o + l),
				checkSum:
					this.toULONG(data.slice(to + 4,
								to + 8)),
				offset:		o
			};
		}

		var font = {
			sfntVersion:	sfntVersion,
			tables:		tables
		};

		for (var i = 0; i < plugins.length; i++)
			plugins[i](this, font);

		return font;
	},

	parseFontCollection: function (data, plugins) {
		var version = this.toFixed(data.slice(4, 8));
		if (version != 1.0 && version != 2.0)
			return { version: version };

		var numFonts = this.toULONG(data.slice(8, 12));
		var fonts = new Array(numFonts);
		var index = 12;
		for (var i = 0; i < numFonts; i++) {
			var o = this.toULONG(data.slice(index, index + 4));
			fonts[i] = this.parseFont(data, plugins, o);
			fonts[i].offset = o;
			index += 4;
		}

		var fonts = { fonts: fonts, version: version };
		if (version == 2.0
		    && this.toULONG(data.slice(index, index + 4)) == 0x44534957)
		{
			var l = this.toULONG(data.slice(index + 4, index + 8));
			var o = this.toULONG(data.slice(index + 8, index + 12));
			fonts.dsig = { data: data.slice(o, o + l) };
		}

		return fonts;
	},

	parseBuffer: function (data, plugins) {
		if (!plugins)
			plugins = [];

		return this.toULONG(data.slice(0, 4)) == 0x74746366 /* "ttcf" */
		       ? this.parseFontCollection(data, plugins)
		       : this.parseFont(data, plugins, 0);
	}
};
