"3.4.0";
"0.33.0";
var CryptoJS = CryptoJS || function (a, b) {
	var c = {},
		d = c.lib = {},
		e = d.Base = function () {
			function a() {}
			return {
				extend: function (b) {
					a.prototype = this;
					var c = new a;
					return b && c.mixIn(b), c.$super = this, c
				},
				create: function () {
					var a = this.extend();
					return a.init.apply(a, arguments), a
				},
				init: function () {},
				mixIn: function (a) {
					for (var b in a) a.hasOwnProperty(b) && (this[b] = a[b]);
					a.hasOwnProperty("toString") && (this.toString = a.toString)
				},
				clone: function () {
					return this.$super.extend(this)
				}
			}
		}(),
		f = d.WordArray = e.extend({
			init: function (a, c) {
				a = this.words = a || [], this.sigBytes = c != b ? c : 4 * a.length
			},
			toString: function (a) {
				return (a || h).stringify(this)
			},
			concat: function (a) {
				var b = this.words,
					c = a.words,
					d = this.sigBytes,
					a = a.sigBytes;
				if (this.clamp(), d % 4)
					for (var e = 0; a > e; e++) b[d + e >>> 2] |= (c[e >>> 2] >>> 24 - 8 * (e % 4) & 255) << 24 - 8 * ((d + e) % 4);
				else if (65535 < c.length)
					for (e = 0; a > e; e += 4) b[d + e >>> 2] = c[e >>> 2];
				else b.push.apply(b, c);
				return this.sigBytes += a, this
			},
			clamp: function () {
				var b = this.words,
					c = this.sigBytes;
				b[c >>> 2] &= 4294967295 << 32 - 8 * (c % 4), b.length = a.ceil(c / 4)
			},
			clone: function () {
				var a = e.clone.call(this);
				return a.words = this.words.slice(0), a
			},
			random: function (b) {
				for (var c = [], d = 0; b > d; d += 4) c.push(4294967296 * a.random() | 0);
				return f.create(c, b)
			}
		}),
		g = c.enc = {},
		h = g.Hex = {
			stringify: function (a) {
				for (var b = a.words, a = a.sigBytes, c = [], d = 0; a > d; d++) {
					var e = b[d >>> 2] >>> 24 - 8 * (d % 4) & 255;
					c.push((e >>> 4).toString(16)), c.push((15 & e).toString(16))
				}
				return c.join("")
			},
			parse: function (a) {
				for (var b = a.length, c = [], d = 0; b > d; d += 2) c[d >>> 3] |= parseInt(a.substr(d, 2), 16) << 24 - 4 * (d % 8);
				return f.create(c, b / 2)
			}
		},
		i = g.Latin1 = {
			stringify: function (a) {
				for (var b = a.words, a = a.sigBytes, c = [], d = 0; a > d; d++) c.push(String.fromCharCode(b[d >>> 2] >>> 24 - 8 * (d % 4) & 255));
				return c.join("")
			},
			parse: function (a) {
				for (var b = a.length, c = [], d = 0; b > d; d++) c[d >>> 2] |= (255 & a.charCodeAt(d)) << 24 - 8 * (d % 4);
				return f.create(c, b)
			}
		},
		j = g.Utf8 = {
			stringify: function (a) {
				try {
					return decodeURIComponent(escape(i.stringify(a)))
				} catch (b) {
					throw Error("Malformed UTF-8 data")
				}
			},
			parse: function (a) {
				return i.parse(unescape(encodeURIComponent(a)))
			}
		},
		k = d.BufferedBlockAlgorithm = e.extend({
			reset: function () {
				this._data = f.create(), this._nDataBytes = 0
			},
			_append: function (a) {
				"string" == typeof a && (a = j.parse(a)), this._data.concat(a), this._nDataBytes += a.sigBytes
			},
			_process: function (b) {
				var c = this._data,
					d = c.words,
					e = c.sigBytes,
					g = this.blockSize,
					h = e / (4 * g),
					h = b ? a.ceil(h) : a.max((0 | h) - this._minBufferSize, 0),
					b = h * g,
					e = a.min(4 * b, e);
				if (b) {
					for (var i = 0; b > i; i += g) this._doProcessBlock(d, i);
					i = d.splice(0, b), c.sigBytes -= e
				}
				return f.create(i, e)
			},
			clone: function () {
				var a = e.clone.call(this);
				return a._data = this._data.clone(), a
			},
			_minBufferSize: 0
		});
	d.Hasher = k.extend({
		init: function () {
			this.reset()
		},
		reset: function () {
			k.reset.call(this), this._doReset()
		},
		update: function (a) {
			return this._append(a), this._process(), this
		},
		finalize: function (a) {
			return a && this._append(a), this._doFinalize(), this._hash
		},
		clone: function () {
			var a = k.clone.call(this);
			return a._hash = this._hash.clone(), a
		},
		blockSize: 16,
		_createHelper: function (a) {
			return function (b, c) {
				return a.create(c).finalize(b)
			}
		},
		_createHmacHelper: function (a) {
			return function (b, c) {
				return l.HMAC.create(a, c).finalize(b)
			}
		}
	});
	var l = c.algo = {};
	return c
}(Math);
! function () {
	var a = CryptoJS,
		b = a.lib,
		c = b.WordArray,
		b = b.Hasher,
		d = [],
		e = a.algo.SHA1 = b.extend({
			_doReset: function () {
				this._hash = c.create([1732584193, 4023233417, 2562383102, 271733878, 3285377520])
			},
			_doProcessBlock: function (a, b) {
				for (var c = this._hash.words, e = c[0], f = c[1], g = c[2], h = c[3], i = c[4], j = 0; 80 > j; j++) {
					if (16 > j) d[j] = 0 | a[b + j];
					else {
						var k = d[j - 3] ^ d[j - 8] ^ d[j - 14] ^ d[j - 16];
						d[j] = k << 1 | k >>> 31
					}
					k = (e << 5 | e >>> 27) + i + d[j], k = 20 > j ? k + ((f & g | ~f & h) + 1518500249) : 40 > j ? k + ((f ^ g ^ h) + 1859775393) : 60 > j ? k + ((f & g | f & h | g & h) - 1894007588) : k + ((f ^ g ^ h) - 899497514), i = h, h = g, g = f << 30 | f >>> 2, f = e, e = k
				}
				c[0] = c[0] + e | 0, c[1] = c[1] + f | 0, c[2] = c[2] + g | 0, c[3] = c[3] + h | 0, c[4] = c[4] + i | 0
			},
			_doFinalize: function () {
				var a = this._data,
					b = a.words,
					c = 8 * this._nDataBytes,
					d = 8 * a.sigBytes;
				b[d >>> 5] |= 128 << 24 - d % 32, b[(d + 64 >>> 9 << 4) + 15] = c, a.sigBytes = 4 * b.length, this._process()
			}
		});
	a.SHA1 = b._createHelper(e), a.HmacSHA1 = b._createHmacHelper(e)
}(),
function () {
	{
		var a = CryptoJS,
			b = a.lib,
			c = b.WordArray,
			d = a.enc;
		d.Base64 = {
			stringify: function (a) {
				var b = a.words,
					c = a.sigBytes,
					d = this._map;
				a.clamp();
				for (var e = [], f = 0; c > f; f += 3)
					for (var g = b[f >>> 2] >>> 24 - f % 4 * 8 & 255, h = b[f + 1 >>> 2] >>> 24 - (f + 1) % 4 * 8 & 255, i = b[f + 2 >>> 2] >>> 24 - (f + 2) % 4 * 8 & 255, j = g << 16 | h << 8 | i, k = 0; 4 > k && c > f + .75 * k; k++) e.push(d.charAt(j >>> 6 * (3 - k) & 63));
				var l = d.charAt(64);
				if (l)
					for (; e.length % 4;) e.push(l);
				return e.join("")
			},
			parse: function (a) {
				a = a.replace(/\s/g, "");
				var b = a.length,
					d = this._map,
					e = d.charAt(64);
				if (e) {
					var f = a.indexOf(e); - 1 != f && (b = f)
				}
				for (var g = [], h = 0, i = 0; b > i; i++)
					if (i % 4) {
						var j = d.indexOf(a.charAt(i - 1)) << i % 4 * 2,
							k = d.indexOf(a.charAt(i)) >>> 6 - i % 4 * 2;
						g[h >>> 2] |= (j | k) << 24 - h % 4 * 8, h++
					}
				return c.create(g, h)
			},
			_map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
		}
	}
}();
var TinCan;
! function () {
	"use strict";
	var a = {
		statementId: !0,
		voidedStatementId: !0,
		verb: !0,
		object: !0,
		registration: !0,
		context: !0,
		actor: !0,
		since: !0,
		until: !0,
		limit: !0,
		authoritative: !0,
		sparse: !0,
		instructor: !0,
		ascending: !0,
		continueToken: !0,
		agent: !0,
		activityId: !0,
		stateId: !0,
		profileId: !0,
		activity_platform: !0,
		grouping: !0,
		"Accept-Language": !0
	};
	TinCan = function (a) {
		this.log("constructor"), this.recordStores = [], this.actor = null, this.activity = null, this.registration = null, this.context = null, this.init(a)
	}, TinCan.prototype = {
		LOG_SRC: "TinCan",
		log: function (a, b) {
			TinCan.DEBUG && "undefined" != typeof console && console.log && (b = b || this.LOG_SRC || "TinCan", console.log("TinCan." + b + ": " + a))
		},
		init: function (a) {
			this.log("init");
			var b;
			if (a = a || {}, a.hasOwnProperty("url") && "" !== a.url && this._initFromQueryString(a.url), a.hasOwnProperty("recordStores") && void 0 !== a.recordStores)
				for (b = 0; b < a.recordStores.length; b += 1) this.addRecordStore(a.recordStores[b]);
			a.hasOwnProperty("activity") && (this.activity = a.activity instanceof TinCan.Activity ? a.activity : new TinCan.Activity(a.activity)), a.hasOwnProperty("actor") && (this.actor = a.actor instanceof TinCan.Agent ? a.actor : new TinCan.Agent(a.actor)), a.hasOwnProperty("context") && (this.context = a.context instanceof TinCan.Context ? a.context : new TinCan.Context(a.context)), a.hasOwnProperty("registration") && (this.registration = a.registration)
		},
		_initFromQueryString: function (b) {
			this.log("_initFromQueryString");
			var c, d, e, f = TinCan.Utils.parseURL(b).params,
				g = ["endpoint", "auth"],
				h = {},
				i = null;
			if (f.hasOwnProperty("actor")) {
				this.log("_initFromQueryString - found actor: " + f.actor);
				try {
					this.actor = TinCan.Agent.fromJSON(f.actor), delete f.actor
				} catch (j) {
					this.log("_initFromQueryString - failed to set actor: " + j)
				}
			}
			if (f.hasOwnProperty("activity_id") && (this.activity = new TinCan.Activity({
					id: f.activity_id
				}), delete f.activity_id), (f.hasOwnProperty("activity_platform") || f.hasOwnProperty("registration") || f.hasOwnProperty("grouping")) && (e = {}, f.hasOwnProperty("activity_platform") && (e.platform = f.activity_platform, delete f.activity_platform), f.hasOwnProperty("registration") && (e.registration = this.registration = f.registration, delete f.registration), f.hasOwnProperty("grouping") && (e.contextActivities = {}, e.contextActivities.grouping = f.grouping, delete f.grouping), this.context = new TinCan.Context(e)), f.hasOwnProperty("endpoint")) {
				for (c = 0; c < g.length; c += 1) d = g[c], f.hasOwnProperty(d) && (h[d] = f[d], delete f[d]);
				for (c in f) f.hasOwnProperty(c) && (a.hasOwnProperty(c) ? delete f[c] : (i = i || {}, i[c] = f[c]));
				null !== i && (h.extended = i), h.allowFail = !1, this.addRecordStore(h)
			}
		},
		addRecordStore: function (a) {
			this.log("addRecordStore");
			var b;
			b = a instanceof TinCan.LRS ? a : new TinCan.LRS(a), this.recordStores.push(b)
		},
		prepareStatement: function (a) {
			return this.log("prepareStatement"), a instanceof TinCan.Statement || (a = new TinCan.Statement(a)), null === a.actor && null !== this.actor && (a.actor = this.actor), null === a.target && null !== this.activity && (a.target = this.activity), null !== this.context && (null === a.context ? a.context = this.context : (null === a.context.registration && (a.context.registration = this.context.registration), null === a.context.platform && (a.context.platform = this.context.platform), null !== this.context.contextActivities && (null === a.context.contextActivities ? a.context.contextActivities = this.context.contextActivities : (null !== this.context.contextActivities.grouping && null === a.context.contextActivities.grouping && (a.context.contextActivities.grouping = this.context.contextActivities.grouping), null !== this.context.contextActivities.parent && null === a.context.contextActivities.parent && (a.context.contextActivities.parent = this.context.contextActivities.parent), null !== this.context.contextActivities.other && null === a.context.contextActivities.other && (a.context.contextActivities.other = this.context.contextActivities.other))))), a
		},
		sendStatement: function (a, b) {
			this.log("sendStatement");
			var c, d, e, f = this,
				g = this.prepareStatement(a),
				h = this.recordStores.length,
				i = [],
				j = [];
			if (h > 0)
				for ("function" == typeof b && (e = function (a, c) {
						var d;
						f.log("sendStatement - callbackWrapper: " + h), h > 1 ? (h -= 1, j.push({
							err: a,
							xhr: c
						})) : 1 === h ? (j.push({
							err: a,
							xhr: c
						}), d = [j, g], b.apply(this, d)) : f.log("sendStatement - unexpected record store count: " + h)
					}), d = 0; h > d; d += 1) c = this.recordStores[d], i.push(c.saveStatement(g, {
					callback: e
				}));
			else this.log("[warning] sendStatement: No LRSs added yet (statement not sent)"), "function" == typeof b && b.apply(this, [null, g]);
			return {
				statement: g,
				results: i
			}
		},
		getStatement: function (a, b) {
			this.log("getStatement");
			var c;
			return this.recordStores.length > 0 ? (c = this.recordStores[0], c.retrieveStatement(a, {
				callback: b
			})) : void this.log("[warning] getStatement: No LRSs added yet (statement not retrieved)")
		},
		voidStatement: function (a, b, c) {
			this.log("voidStatement");
			var d, e, f, g, h, i = this,
				j = this.recordStores.length,
				k = [],
				l = [];
			if (a instanceof TinCan.Statement && (a = a.id), "undefined" != typeof c.actor ? e = c.actor : null !== this.actor && (e = this.actor), f = new TinCan.Statement({
					actor: e,
					verb: {
						id: "http://adlnet.gov/expapi/verbs/voided"
					},
					target: {
						objectType: "StatementRef",
						id: a
					}
				}), j > 0)
				for ("function" == typeof b && (h = function (a, c) {
						var d;
						i.log("voidStatement - callbackWrapper: " + j), j > 1 ? (j -= 1, l.push({
							err: a,
							xhr: c
						})) : 1 === j ? (l.push({
							err: a,
							xhr: c
						}), d = [l, f], b.apply(this, d)) : i.log("voidStatement - unexpected record store count: " + j)
					}), g = 0; j > g; g += 1) d = this.recordStores[g], k.push(d.saveStatement(f, {
					callback: h
				}));
			else this.log("[warning] voidStatement: No LRSs added yet (statement not sent)"), "function" == typeof b && b.apply(this, [null, f]);
			return {
				statement: f,
				results: k
			}
		},
		getVoidedStatement: function (a, b) {
			this.log("getVoidedStatement");
			var c;
			return this.recordStores.length > 0 ? (c = this.recordStores[0], c.retrieveVoidedStatement(a, {
				callback: b
			})) : void this.log("[warning] getVoidedStatement: No LRSs added yet (statement not retrieved)")
		},
		sendStatements: function (a, b) {
			this.log("sendStatements");
			var c, d, e, f = this,
				g = [],
				h = this.recordStores.length,
				i = [],
				j = [];
			if (0 === a.length) "function" == typeof b && b.apply(this, [null, g]);
			else {
				for (d = 0; d < a.length; d += 1) g.push(this.prepareStatement(a[d]));
				if (h > 0)
					for ("function" == typeof b && (e = function (a, c) {
							var d;
							f.log("sendStatements - callbackWrapper: " + h), h > 1 ? (h -= 1, j.push({
								err: a,
								xhr: c
							})) : 1 === h ? (j.push({
								err: a,
								xhr: c
							}), d = [j, g], b.apply(this, d)) : f.log("sendStatements - unexpected record store count: " + h)
						}), d = 0; h > d; d += 1) c = this.recordStores[d], i.push(c.saveStatements(g, {
						callback: e
					}));
				else this.log("[warning] sendStatements: No LRSs added yet (statements not sent)"), "function" == typeof b && b.apply(this, [null, g])
			}
			return {
				statements: g,
				results: i
			}
		},
		getStatements: function (a) {
			this.log("getStatements");
			var b, c, d = {};
			return this.recordStores.length > 0 ? (b = this.recordStores[0], a = a || {}, c = a.params || {}, a.sendActor && null !== this.actor && ("0.9" === b.version || "0.95" === b.version ? c.actor = this.actor : c.agent = this.actor), a.sendActivity && null !== this.activity && ("0.9" === b.version || "0.95" === b.version ? c.target = this.activity : c.activity = this.activity), "undefined" == typeof c.registration && null !== this.registration && (c.registration = this.registration), d = {
				params: c
			}, "undefined" != typeof a.callback && (d.callback = a.callback), b.queryStatements(d)) : void this.log("[warning] getStatements: No LRSs added yet (statements not read)")
		},
		getState: function (a, b) {
			this.log("getState");
			var c, d;
			return this.recordStores.length > 0 ? (d = this.recordStores[0], b = b || {}, c = {
				agent: "undefined" != typeof b.agent ? b.agent : this.actor,
				activity: "undefined" != typeof b.activity ? b.activity : this.activity
			}, "undefined" != typeof b.registration ? c.registration = b.registration : null !== this.registration && (c.registration = this.registration), "undefined" != typeof b.callback && (c.callback = b.callback), d.retrieveState(a, c)) : void this.log("[warning] getState: No LRSs added yet (state not retrieved)")
		},
		setState: function (a, b, c) {
			this.log("setState");
			var d, e;
			return this.recordStores.length > 0 ? (e = this.recordStores[0], c = c || {}, d = {
				agent: "undefined" != typeof c.agent ? c.agent : this.actor,
				activity: "undefined" != typeof c.activity ? c.activity : this.activity
			}, "undefined" != typeof c.registration ? d.registration = c.registration : null !== this.registration && (d.registration = this.registration), "undefined" != typeof c.lastSHA1 && (d.lastSHA1 = c.lastSHA1), "undefined" != typeof c.contentType && (d.contentType = c.contentType, "undefined" != typeof c.overwriteJSON && !c.overwriteJSON && TinCan.Utils.isApplicationJSON(c.contentType) && (d.method = "POST")), "undefined" != typeof c.callback && (d.callback = c.callback), e.saveState(a, b, d)) : void this.log("[warning] setState: No LRSs added yet (state not saved)")
		},
		deleteState: function (a, b) {
			this.log("deleteState");
			var c, d;
			return this.recordStores.length > 0 ? (d = this.recordStores[0], b = b || {}, c = {
				agent: "undefined" != typeof b.agent ? b.agent : this.actor,
				activity: "undefined" != typeof b.activity ? b.activity : this.activity
			}, "undefined" != typeof b.registration ? c.registration = b.registration : null !== this.registration && (c.registration = this.registration), "undefined" != typeof b.callback && (c.callback = b.callback), d.dropState(a, c)) : void this.log("[warning] deleteState: No LRSs added yet (state not deleted)")
		},
		getActivityProfile: function (a, b) {
			this.log("getActivityProfile");
			var c, d;
			return this.recordStores.length > 0 ? (d = this.recordStores[0], b = b || {}, c = {
				activity: "undefined" != typeof b.activity ? b.activity : this.activity
			}, "undefined" != typeof b.callback && (c.callback = b.callback), d.retrieveActivityProfile(a, c)) : void this.log("[warning] getActivityProfile: No LRSs added yet (activity profile not retrieved)")
		},
		setActivityProfile: function (a, b, c) {
			this.log("setActivityProfile");
			var d, e;
			return this.recordStores.length > 0 ? (e = this.recordStores[0], c = c || {}, d = {
				activity: "undefined" != typeof c.activity ? c.activity : this.activity
			}, "undefined" != typeof c.callback && (d.callback = c.callback), "undefined" != typeof c.lastSHA1 && (d.lastSHA1 = c.lastSHA1), "undefined" != typeof c.contentType && (d.contentType = c.contentType, "undefined" != typeof c.overwriteJSON && !c.overwriteJSON && TinCan.Utils.isApplicationJSON(c.contentType) && (d.method = "POST")), e.saveActivityProfile(a, b, d)) : void this.log("[warning] setActivityProfile: No LRSs added yet (activity profile not saved)")
		},
		deleteActivityProfile: function (a, b) {
			this.log("deleteActivityProfile");
			var c, d;
			return this.recordStores.length > 0 ? (d = this.recordStores[0], b = b || {}, c = {
				activity: "undefined" != typeof b.activity ? b.activity : this.activity
			}, "undefined" != typeof b.callback && (c.callback = b.callback), d.dropActivityProfile(a, c)) : void this.log("[warning] deleteActivityProfile: No LRSs added yet (activity profile not deleted)")
		},
		getAgentProfile: function (a, b) {
			this.log("getAgentProfile");
			var c, d;
			return this.recordStores.length > 0 ? (d = this.recordStores[0], b = b || {}, c = {
				agent: "undefined" != typeof b.agent ? b.agent : this.actor
			}, "undefined" != typeof b.callback && (c.callback = b.callback), d.retrieveAgentProfile(a, c)) : void this.log("[warning] getAgentProfile: No LRSs added yet (agent profile not retrieved)")
		},
		setAgentProfile: function (a, b, c) {
			this.log("setAgentProfile");
			var d, e;
			return this.recordStores.length > 0 ? (e = this.recordStores[0], c = c || {}, d = {
				agent: "undefined" != typeof c.agent ? c.agent : this.actor
			}, "undefined" != typeof c.callback && (d.callback = c.callback), "undefined" != typeof c.lastSHA1 && (d.lastSHA1 = c.lastSHA1), "undefined" != typeof c.contentType && (d.contentType = c.contentType, "undefined" != typeof c.overwriteJSON && !c.overwriteJSON && TinCan.Utils.isApplicationJSON(c.contentType) && (d.method = "POST")), e.saveAgentProfile(a, b, d)) : void this.log("[warning] setAgentProfile: No LRSs added yet (agent profile not saved)")
		},
		deleteAgentProfile: function (a, b) {
			this.log("deleteAgentProfile");
			var c, d;
			return this.recordStores.length > 0 ? (d = this.recordStores[0], b = b || {}, c = {
				agent: "undefined" != typeof b.agent ? b.agent : this.actor
			}, "undefined" != typeof b.callback && (c.callback = b.callback), d.dropAgentProfile(a, c)) : void this.log("[warning] deleteAgentProfile: No LRSs added yet (agent profile not deleted)")
		}
	}, TinCan.DEBUG = !1, TinCan.enableDebug = function () {
		TinCan.DEBUG = !0
	}, TinCan.disableDebug = function () {
		TinCan.DEBUG = !1
	}, TinCan.versions = function () {
		return ["1.0.1", "1.0.0", "0.95", "0.9"]
	}, "object" == typeof module && (module.exports = TinCan)
}(),
function () {
	"use strict";
	TinCan.Utils = {
		getUUID: function () {
			return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (a) {
				var b = 16 * Math.random() | 0,
					c = "x" == a ? b : 3 & b | 8;
				return c.toString(16)
			})
		},
		getISODateString: function (a) {
			function b(a, b) {
				var c, d;
				for (("undefined" == typeof a || null === a) && (a = 0), ("undefined" == typeof b || null === b) && (b = 2), c = Math.pow(10, b - 1), d = a.toString(); c > a && c > 1;) d = "0" + d, c /= 10;
				return d
			}
			return a.getUTCFullYear() + "-" + b(a.getUTCMonth() + 1) + "-" + b(a.getUTCDate()) + "T" + b(a.getUTCHours()) + ":" + b(a.getUTCMinutes()) + ":" + b(a.getUTCSeconds()) + "." + b(a.getUTCMilliseconds(), 3) + "Z"
		},
		convertISO8601DurationToMilliseconds: function (a) {
			var b, c, d, e, f = a.indexOf("-") >= 0,
				g = a.indexOf("T"),
				h = a.indexOf("H"),
				i = a.indexOf("M"),
				j = a.indexOf("S");
			if (-1 === g || -1 !== i && g > i || -1 !== a.indexOf("D") || -1 !== a.indexOf("Y")) throw new Error("ISO 8601 timestamps including years, months and/or days are not currently supported");
			return -1 === h ? (h = g, b = 0) : b = parseInt(a.slice(g + 1, h), 10), -1 === i ? (i = g, c = 0) : c = parseInt(a.slice(h + 1, i), 10), d = parseFloat(a.slice(i + 1, j)), e = parseInt(1e3 * (60 * (60 * b + c) + d), 10), isNaN(e) && (e = 0), f && (e = -1 * e), e
		},
		convertMillisecondsToISO8601Duration: function (a) {
			var b, c, d, e = parseInt(a, 10),
				f = "",
				g = "";
			return 0 > e && (f = "-", e = -1 * e), b = parseInt(e / 36e5, 10), c = parseInt(e % 36e5 / 6e4, 10), d = e % 36e5 % 6e4 / 1e3, g = f + "PT", b > 0 && (g += b + "H"), c > 0 && (g += c + "M"), g += d + "S"
		},
		getSHA1String: function (a) {
			return CryptoJS.SHA1(a).toString(CryptoJS.enc.Hex)
		},
		getBase64String: function (a) {
			return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Latin1.parse(a))
		},
		getLangDictionaryValue: function (a, b) {
			var c, d = this[a];
			if ("undefined" != typeof b && "undefined" != typeof d[b]) return d[b];
			if ("undefined" != typeof d.und) return d.und;
			if ("undefined" != typeof d["en-US"]) return d["en-US"];
			for (c in d)
				if (d.hasOwnProperty(c)) return d[c];
			return ""
		},
		parseURL: function (a) {
			var b, c, d, e, f = /\+/g,
				g = /([^&=]+)=?([^&]*)/g,
				h = function (a) {
					return decodeURIComponent(a.replace(f, " "))
				};
			if (b = new RegExp(["^(https?:)//", "(([^:/?#]*)(?::([0-9]+))?)", "(/[^?#]*)", "(\\?[^#]*|)", "(#.*|)$"].join("")), c = a.match(b), d = {
					protocol: c[1],
					host: c[2],
					hostname: c[3],
					port: c[4],
					pathname: c[5],
					search: c[6],
					hash: c[7],
					params: {}
				}, d.path = d.protocol + "//" + d.host + d.pathname, "" !== d.search)
				for (; e = g.exec(d.search.substring(1));) d.params[h(e[1])] = h(e[2]);
			return d
		},
		getServerRoot: function (a) {
			var b = a.split("/");
			return b[0] + "//" + b[2]
		},
		getContentTypeFromHeader: function (a) {
			return String(a).split(";")[0]
		},
		isApplicationJSON: function (a) {
			return 0 === TinCan.Utils.getContentTypeFromHeader(a).toLowerCase().indexOf("application/json")
		}
	}
}(),
function () {
	"use strict";
	var a = TinCan.LRS = function (a) {
		this.log("constructor"), this.endpoint = null, this.version = null, this.auth = null, this.allowFail = !0, this.extended = null, this.init(a)
	};
	a.prototype = {
		LOG_SRC: "LRS",
		log: TinCan.prototype.log,
		init: function (a) {
			this.log("init");
			var b, c = TinCan.versions(),
				d = !1;
			if (a = a || {}, a.hasOwnProperty("alertOnRequestFailure") && this.log("'alertOnRequestFailure' is deprecated (alerts have been removed) no need to set it now"), !a.hasOwnProperty("endpoint") || null === a.endpoint || "" === a.endpoint) throw this.log("[error] LRS invalid: no endpoint"), {
				code: 3,
				mesg: "LRS invalid: no endpoint"
			};
			if (this.endpoint = String(a.endpoint), "/" !== this.endpoint.slice(-1) && (this.log("adding trailing slash to endpoint"), this.endpoint += "/"), a.hasOwnProperty("allowFail") && (this.allowFail = a.allowFail), a.hasOwnProperty("auth") ? this.auth = a.auth : a.hasOwnProperty("username") && a.hasOwnProperty("password") && (this.auth = "Basic " + TinCan.Utils.getBase64String(a.username + ":" + a.password)), a.hasOwnProperty("extended") && (this.extended = a.extended), this._initByEnvironment(a), "undefined" != typeof a.version) {
				for (this.log("version: " + a.version), b = 0; b < c.length; b += 1)
					if (c[b] === a.version) {
						d = !0;
						break
					}
				if (!d) throw this.log("[error] LRS invalid: version not supported (" + a.version + ")"), {
					code: 5,
					mesg: "LRS invalid: version not supported (" + a.version + ")"
				};
				this.version = a.version
			} else this.version = c[0]
		},
		_initByEnvironment: function () {
			this.log("_initByEnvironment not overloaded - no environment loaded?")
		},
		_makeRequest: function () {
			this.log("_makeRequest not overloaded - no environment loaded?")
		},
		_IEModeConversion: function () {
			this.log("_IEModeConversion not overloaded - browser environment not loaded.")
		},
		sendRequest: function (a) {
			this.log("sendRequest");
			var b, c = this.endpoint + a.url,
				d = {};
			if (0 === a.url.indexOf("http") && (c = a.url), null !== this.extended) {
				a.params = a.params || {};
				for (b in this.extended) this.extended.hasOwnProperty(b) && (a.params.hasOwnProperty(b) || null !== this.extended[b] && (a.params[b] = this.extended[b]))
			}
			d.Authorization = this.auth, "0.9" !== this.version && (d["X-Experience-API-Version"] = this.version);
			for (b in a.headers) a.headers.hasOwnProperty(b) && (d[b] = a.headers[b]);
			return this._makeRequest(c, d, a)
		},
		about: function (a) {
			this.log("about");
			var b, c, d;
			return a = a || {}, b = {
				url: "about",
				method: "GET",
				params: {}
			}, "undefined" != typeof a.callback && (d = function (b, c) {
				var d = c;
				null === b && (d = TinCan.About.fromJSON(c.responseText)), a.callback(b, d)
			}, b.callback = d), c = this.sendRequest(b), d ? void 0 : (null === c.err && (c.xhr = TinCan.About.fromJSON(c.xhr.responseText)), c)
		},
		saveStatement: function (a, b) {
			this.log("saveStatement");
			var c, d;
			b = b || {};
			try {
				d = a.asVersion(this.version)
			} catch (e) {
				return this.allowFail ? (this.log("[warning] statement could not be serialized in version (" + this.version + "): " + e), "undefined" != typeof b.callback ? void b.callback(null, null) : {
					err: null,
					xhr: null
				}) : (this.log("[error] statement could not be serialized in version (" + this.version + "): " + e), "undefined" != typeof b.callback ? void b.callback(e, null) : {
					err: e,
					xhr: null
				})
			}
			return c = {
				url: "statements",
				data: JSON.stringify(d),
				headers: {
					"Content-Type": "application/json"
				}
			}, null !== a.id ? (c.method = "PUT", c.params = {
				statementId: a.id
			}) : c.method = "POST", "undefined" != typeof b.callback && (c.callback = b.callback), this.sendRequest(c)
		},
		retrieveStatement: function (a, b) {
			this.log("retrieveStatement");
			var c, d, e;
			return b = b || {}, c = {
				url: "statements",
				method: "GET",
				params: {
					statementId: a
				}
			}, "undefined" != typeof b.callback && (e = function (a, c) {
				var d = c;
				null === a && (d = TinCan.Statement.fromJSON(c.responseText)), b.callback(a, d)
			}, c.callback = e), d = this.sendRequest(c), e || (d.statement = null, null === d.err && (d.statement = TinCan.Statement.fromJSON(d.xhr.responseText))), d
		},
		retrieveVoidedStatement: function (a, b) {
			this.log("retrieveVoidedStatement");
			var c, d, e;
			return b = b || {}, c = {
				url: "statements",
				method: "GET",
				params: {}
			}, "0.9" === this.version || "0.95" === this.version ? c.params.statementId = a : c.params.voidedStatementId = a, "undefined" != typeof b.callback && (e = function (a, c) {
				var d = c;
				null === a && (d = TinCan.Statement.fromJSON(c.responseText)), b.callback(a, d)
			}, c.callback = e), d = this.sendRequest(c), e || (d.statement = null, null === d.err && (d.statement = TinCan.Statement.fromJSON(d.xhr.responseText))), d
		},
		saveStatements: function (a, b) {
			this.log("saveStatements");
			var c, d, e, f = [];
			if (b = b || {}, 0 === a.length) return "undefined" != typeof b.callback ? void b.callback(new Error("no statements"), null) : {
				err: new Error("no statements"),
				xhr: null
			};
			for (e = 0; e < a.length; e += 1) {
				try {
					d = a[e].asVersion(this.version)
				} catch (g) {
					return this.allowFail ? (this.log("[warning] statement could not be serialized in version (" + this.version + "): " + g), "undefined" != typeof b.callback ? void b.callback(null, null) : {
						err: null,
						xhr: null
					}) : (this.log("[error] statement could not be serialized in version (" + this.version + "): " + g), "undefined" != typeof b.callback ? void b.callback(g, null) : {
						err: g,
						xhr: null
					})
				}
				f.push(d)
			}
			return c = {
				url: "statements",
				method: "POST",
				data: JSON.stringify(f),
				headers: {
					"Content-Type": "application/json"
				}
			}, "undefined" != typeof b.callback && (c.callback = b.callback), this.sendRequest(c)
		},
		queryStatements: function (a) {
			this.log("queryStatements");
			var b, c, d;
			a = a || {}, a.params = a.params || {};
			try {
				b = this._queryStatementsRequestCfg(a)
			} catch (e) {
				return this.log("[error] Query statements failed - " + e), "undefined" != typeof a.callback && a.callback(e, {}), {
					err: e,
					statementsResult: null
				}
			}
			return "undefined" != typeof a.callback && (d = function (b, c) {
				var d = c;
				null === b && (d = TinCan.StatementsResult.fromJSON(c.responseText)), a.callback(b, d)
			}, b.callback = d), c = this.sendRequest(b), c.config = b, d || (c.statementsResult = null, null === c.err && (c.statementsResult = TinCan.StatementsResult.fromJSON(c.xhr.responseText))), c
		},
		_queryStatementsRequestCfg: function (a) {
			this.log("_queryStatementsRequestCfg");
			var b, c, d = {},
				e = {
					url: "statements",
					method: "GET",
					params: d
				},
				f = ["agent", "actor", "object", "instructor"],
				g = ["verb", "activity"],
				h = ["registration", "context", "since", "until", "limit", "authoritative", "sparse", "ascending", "related_activities", "related_agents", "format", "attachments"],
				i = {
					verb: !0,
					registration: !0,
					since: !0,
					until: !0,
					limit: !0,
					ascending: !0
				},
				j = {.9: {
						supported: {
							actor: !0,
							instructor: !0,
							target: !0,
							object: !0,
							context: !0,
							authoritative: !0,
							sparse: !0
						}
					}, "1.0.0": {
						supported: {
							agent: !0,
							activity: !0,
							related_activities: !0,
							related_agents: !0,
							format: !0,
							attachments: !0
						}
					}
				};
			j[.95] = j[.9], j["1.0.1"] = j["1.0.0"], a.params.hasOwnProperty("target") && (a.params.object = a.params.target);
			for (c in a.params)
				if (a.params.hasOwnProperty(c) && "undefined" == typeof i[c] && "undefined" == typeof j[this.version].supported[c]) throw "Unrecognized query parameter configured: " + c;
			for (b = 0; b < f.length; b += 1) "undefined" != typeof a.params[f[b]] && (d[f[b]] = JSON.stringify(a.params[f[b]].asVersion(this.version)));
			for (b = 0; b < g.length; b += 1) "undefined" != typeof a.params[g[b]] && (d[g[b]] = a.params[g[b]].id);
			for (b = 0; b < h.length; b += 1) "undefined" != typeof a.params[h[b]] && (d[h[b]] = a.params[h[b]]);
			return e
		},
		moreStatements: function (a) {
			this.log("moreStatements: " + a.url);
			var b, c, d, e, f;
			return a = a || {}, e = TinCan.Utils.parseURL(a.url), f = TinCan.Utils.getServerRoot(this.endpoint), 0 === e.path.indexOf("/statements") && (e.path = this.endpoint.replace(f, "") + e.path, this.log("converting non-standard more URL to " + e.path)), 0 !== e.path.indexOf("/") && (e.path = "/" + e.path), b = {
				method: "GET",
				url: f + e.path,
				params: e.params
			}, "undefined" != typeof a.callback && (d = function (b, c) {
				var d = c;
				null === b && (d = TinCan.StatementsResult.fromJSON(c.responseText)), a.callback(b, d)
			}, b.callback = d), c = this.sendRequest(b), c.config = b, d || (c.statementsResult = null, null === c.err && (c.statementsResult = TinCan.StatementsResult.fromJSON(c.xhr.responseText))), c
		},
		retrieveState: function (a, b) {
			this.log("retrieveState");
			var c, d, e = {},
				f = {};
			if (e = {
					stateId: a,
					activityId: b.activity.id
				}, "0.9" === this.version ? e.actor = JSON.stringify(b.agent.asVersion(this.version)) : e.agent = JSON.stringify(b.agent.asVersion(this.version)), "undefined" != typeof b.registration && null !== b.registration && ("0.9" === this.version ? e.registrationId = b.registration : e.registration = b.registration), f = {
					url: "activities/state",
					method: "GET",
					params: e,
					ignore404: !0
				}, "undefined" != typeof b.callback && (d = function (c, d) {
					var e = d;
					if (null === c)
						if (404 === d.status) e = null;
						else if (e = new TinCan.State({
							id: a,
							contents: d.responseText
						}), e.etag = "undefined" != typeof d.getResponseHeader && null !== d.getResponseHeader("ETag") && "" !== d.getResponseHeader("ETag") ? d.getResponseHeader("ETag") : TinCan.Utils.getSHA1String(d.responseText), "undefined" != typeof d.contentType ? e.contentType = d.contentType : "undefined" != typeof d.getResponseHeader && null !== d.getResponseHeader("Content-Type") && "" !== d.getResponseHeader("Content-Type") && (e.contentType = d.getResponseHeader("Content-Type")), TinCan.Utils.isApplicationJSON(e.contentType)) try {
						e.contents = JSON.parse(e.contents)
					} catch (f) {
						this.log("retrieveState - failed to deserialize JSON: " + f)
					}
					b.callback(c, e)
				}, f.callback = d), c = this.sendRequest(f), !d && (c.state = null, null === c.err && 404 !== c.xhr.status && (c.state = new TinCan.State({
					id: a,
					contents: c.xhr.responseText
				}), c.state.etag = "undefined" != typeof c.xhr.getResponseHeader && null !== c.xhr.getResponseHeader("ETag") && "" !== c.xhr.getResponseHeader("ETag") ? c.xhr.getResponseHeader("ETag") : TinCan.Utils.getSHA1String(c.xhr.responseText), "undefined" != typeof c.xhr.contentType ? c.state.contentType = c.xhr.contentType : "undefined" != typeof c.xhr.getResponseHeader && null !== c.xhr.getResponseHeader("Content-Type") && "" !== c.xhr.getResponseHeader("Content-Type") && (c.state.contentType = c.xhr.getResponseHeader("Content-Type")), TinCan.Utils.isApplicationJSON(c.state.contentType)))) try {
				c.state.contents = JSON.parse(c.state.contents)
			} catch (g) {
				this.log("retrieveState - failed to deserialize JSON: " + g)
			}
			return c
		},
		saveState: function (a, b, c) {
			this.log("saveState");
			var d, e;
			return "undefined" == typeof c.contentType && (c.contentType = "application/octet-stream"), "object" == typeof b && TinCan.Utils.isApplicationJSON(c.contentType) && (b = JSON.stringify(b)), ("undefined" == typeof c.method || "POST" !== c.method) && (c.method = "PUT"), d = {
				stateId: a,
				activityId: c.activity.id
			}, "0.9" === this.version ? d.actor = JSON.stringify(c.agent.asVersion(this.version)) : d.agent = JSON.stringify(c.agent.asVersion(this.version)), "undefined" != typeof c.registration && null !== c.registration && ("0.9" === this.version ? d.registrationId = c.registration : d.registration = c.registration), e = {
				url: "activities/state",
				method: c.method,
				params: d,
				data: b,
				headers: {
					"Content-Type": c.contentType
				}
			}, "undefined" != typeof c.callback && (e.callback = c.callback), "undefined" != typeof c.lastSHA1 && null !== c.lastSHA1 && (e.headers["If-Match"] = c.lastSHA1), this.sendRequest(e)
		},
		dropState: function (a, b) {
			this.log("dropState");
			var c, d;
			return c = {
				activityId: b.activity.id
			}, "0.9" === this.version ? c.actor = JSON.stringify(b.agent.asVersion(this.version)) : c.agent = JSON.stringify(b.agent.asVersion(this.version)), null !== a && (c.stateId = a), "undefined" != typeof b.registration && null !== b.registration && ("0.9" === this.version ? c.registrationId = b.registration : c.registration = b.registration), d = {
				url: "activities/state",
				method: "DELETE",
				params: c
			}, "undefined" != typeof b.callback && (d.callback = b.callback), this.sendRequest(d)
		},
		retrieveActivityProfile: function (a, b) {
			this.log("retrieveActivityProfile");
			var c, d, e = {};
			if (e = {
					url: "activities/profile",
					method: "GET",
					params: {
						profileId: a,
						activityId: b.activity.id
					},
					ignore404: !0
				}, "undefined" != typeof b.callback && (d = function (c, d) {
					var e = d;
					if (null === c)
						if (404 === d.status) e = null;
						else if (e = new TinCan.ActivityProfile({
							id: a,
							activity: b.activity,
							contents: d.responseText
						}), e.etag = "undefined" != typeof d.getResponseHeader && null !== d.getResponseHeader("ETag") && "" !== d.getResponseHeader("ETag") ? d.getResponseHeader("ETag") : TinCan.Utils.getSHA1String(d.responseText), "undefined" != typeof d.contentType ? e.contentType = d.contentType : "undefined" != typeof d.getResponseHeader && null !== d.getResponseHeader("Content-Type") && "" !== d.getResponseHeader("Content-Type") && (e.contentType = d.getResponseHeader("Content-Type")), TinCan.Utils.isApplicationJSON(e.contentType)) try {
						e.contents = JSON.parse(e.contents)
					} catch (f) {
						this.log("retrieveActivityProfile - failed to deserialize JSON: " + f)
					}
					b.callback(c, e)
				}, e.callback = d), c = this.sendRequest(e), !d && (c.profile = null, null === c.err && 404 !== c.xhr.status && (c.profile = new TinCan.ActivityProfile({
					id: a,
					activity: b.activity,
					contents: c.xhr.responseText
				}), c.profile.etag = "undefined" != typeof c.xhr.getResponseHeader && null !== c.xhr.getResponseHeader("ETag") && "" !== c.xhr.getResponseHeader("ETag") ? c.xhr.getResponseHeader("ETag") : TinCan.Utils.getSHA1String(c.xhr.responseText), "undefined" != typeof c.xhr.contentType ? c.profile.contentType = c.xhr.contentType : "undefined" != typeof c.xhr.getResponseHeader && null !== c.xhr.getResponseHeader("Content-Type") && "" !== c.xhr.getResponseHeader("Content-Type") && (c.profile.contentType = c.xhr.getResponseHeader("Content-Type")), TinCan.Utils.isApplicationJSON(c.profile.contentType)))) try {
				c.profile.contents = JSON.parse(c.profile.contents)
			} catch (f) {
				this.log("retrieveActivityProfile - failed to deserialize JSON: " + f)
			}
			return c
		},
		saveActivityProfile: function (a, b, c) {
			this.log("saveActivityProfile");
			var d;
			return "undefined" == typeof c.contentType && (c.contentType = "application/octet-stream"), ("undefined" == typeof c.method || "POST" !== c.method) && (c.method = "PUT"), "object" == typeof b && TinCan.Utils.isApplicationJSON(c.contentType) && (b = JSON.stringify(b)), d = {
				url: "activities/profile",
				method: c.method,
				params: {
					profileId: a,
					activityId: c.activity.id
				},
				data: b,
				headers: {
					"Content-Type": c.contentType
				}
			}, "undefined" != typeof c.callback && (d.callback = c.callback), "undefined" != typeof c.lastSHA1 && null !== c.lastSHA1 ? d.headers["If-Match"] = c.lastSHA1 : d.headers["If-None-Match"] = "*", this.sendRequest(d)
		},
		dropActivityProfile: function (a, b) {
			this.log("dropActivityProfile");
			var c, d;
			return c = {
				profileId: a,
				activityId: b.activity.id
			}, d = {
				url: "activities/profile",
				method: "DELETE",
				params: c
			}, "undefined" != typeof b.callback && (d.callback = b.callback), this.sendRequest(d)
		},
		retrieveAgentProfile: function (a, b) {
			this.log("retrieveAgentProfile");
			var c, d, e = {};
			if (e = {
					method: "GET",
					params: {
						profileId: a
					},
					ignore404: !0
				}, "0.9" === this.version ? (e.url = "actors/profile", e.params.actor = JSON.stringify(b.agent.asVersion(this.version))) : (e.url = "agents/profile", e.params.agent = JSON.stringify(b.agent.asVersion(this.version))), "undefined" != typeof b.callback && (d = function (c, d) {
					var e = d;
					if (null === c)
						if (404 === d.status) e = null;
						else if (e = new TinCan.AgentProfile({
							id: a,
							agent: b.agent,
							contents: d.responseText
						}), e.etag = "undefined" != typeof d.getResponseHeader && null !== d.getResponseHeader("ETag") && "" !== d.getResponseHeader("ETag") ? d.getResponseHeader("ETag") : TinCan.Utils.getSHA1String(d.responseText), "undefined" != typeof d.contentType ? e.contentType = d.contentType : "undefined" != typeof d.getResponseHeader && null !== d.getResponseHeader("Content-Type") && "" !== d.getResponseHeader("Content-Type") && (e.contentType = d.getResponseHeader("Content-Type")), TinCan.Utils.isApplicationJSON(e.contentType)) try {
						e.contents = JSON.parse(e.contents)
					} catch (f) {
						this.log("retrieveAgentProfile - failed to deserialize JSON: " + f)
					}
					b.callback(c, e)
				}, e.callback = d), c = this.sendRequest(e), !d && (c.profile = null, null === c.err && 404 !== c.xhr.status && (c.profile = new TinCan.AgentProfile({
					id: a,
					agent: b.agent,
					contents: c.xhr.responseText
				}), c.profile.etag = "undefined" != typeof c.xhr.getResponseHeader && null !== c.xhr.getResponseHeader("ETag") && "" !== c.xhr.getResponseHeader("ETag") ? c.xhr.getResponseHeader("ETag") : TinCan.Utils.getSHA1String(c.xhr.responseText), "undefined" != typeof c.xhr.contentType ? c.profile.contentType = c.xhr.contentType : "undefined" != typeof c.xhr.getResponseHeader && null !== c.xhr.getResponseHeader("Content-Type") && "" !== c.xhr.getResponseHeader("Content-Type") && (c.profile.contentType = c.xhr.getResponseHeader("Content-Type")), TinCan.Utils.isApplicationJSON(c.profile.contentType)))) try {
				c.profile.contents = JSON.parse(c.profile.contents)
			} catch (f) {
				this.log("retrieveAgentProfile - failed to deserialize JSON: " + f)
			}
			return c
		},
		saveAgentProfile: function (a, b, c) {
			this.log("saveAgentProfile");
			var d;
			return "undefined" == typeof c.contentType && (c.contentType = "application/octet-stream"), ("undefined" == typeof c.method || "POST" !== c.method) && (c.method = "PUT"), "object" == typeof b && TinCan.Utils.isApplicationJSON(c.contentType) && (b = JSON.stringify(b)), d = {
				method: c.method,
				params: {
					profileId: a
				},
				data: b,
				headers: {
					"Content-Type": c.contentType
				}
			}, "0.9" === this.version ? (d.url = "actors/profile", d.params.actor = JSON.stringify(c.agent.asVersion(this.version))) : (d.url = "agents/profile", d.params.agent = JSON.stringify(c.agent.asVersion(this.version))), "undefined" != typeof c.callback && (d.callback = c.callback), "undefined" != typeof c.lastSHA1 && null !== c.lastSHA1 ? d.headers["If-Match"] = c.lastSHA1 : d.headers["If-None-Match"] = "*", this.sendRequest(d)
		},
		dropAgentProfile: function (a, b) {
			this.log("dropAgentProfile");
			var c, d;
			return c = {
				profileId: a
			}, d = {
				method: "DELETE",
				params: c
			}, "0.9" === this.version ? (d.url = "actors/profile", c.actor = JSON.stringify(b.agent.asVersion(this.version))) : (d.url = "agents/profile", c.agent = JSON.stringify(b.agent.asVersion(this.version))), "undefined" != typeof b.callback && (d.callback = b.callback), this.sendRequest(d)
		}
	}, a.syncEnabled = null
}(),
function () {
	"use strict";
	var a = TinCan.AgentAccount = function (a) {
		this.log("constructor"), this.homePage = null, this.name = null, this.init(a)
	};
	a.prototype = {
		LOG_SRC: "AgentAccount",
		log: TinCan.prototype.log,
		init: function (a) {
			this.log("init");
			var b, c = ["name", "homePage"];
			for (a = a || {}, "undefined" != typeof a.accountServiceHomePage && (a.homePage = a.accountServiceHomePage), "undefined" != typeof a.accountName && (a.name = a.accountName), b = 0; b < c.length; b += 1) a.hasOwnProperty(c[b]) && null !== a[c[b]] && (this[c[b]] = a[c[b]])
		},
		toString: function () {
			this.log("toString");
			var a = "";
			return null !== this.name || null !== this.homePage ? (a += null !== this.name ? this.name : "-", a += ":", a += null !== this.homePage ? this.homePage : "-") : a = "AgentAccount: unidentified", a
		},
		asVersion: function (a) {
			this.log("asVersion: " + a);
			var b = {};
			return a = a || TinCan.versions()[0], "0.9" === a ? (b.accountName = this.name, b.accountServiceHomePage = this.homePage) : (b.name = this.name, b.homePage = this.homePage), b
		}
	}, a.fromJSON = function (b) {
		a.prototype.log("fromJSON");
		var c = JSON.parse(b);
		return new a(c)
	}
}(),
function () {
	"use strict";
	var a = TinCan.Agent = function (a) {
		this.log("constructor"), this.name = null, this.mbox = null, this.mbox_sha1sum = null, this.openid = null, this.account = null, this.degraded = !1, this.init(a)
	};
	a.prototype = {
		objectType: "Agent",
		LOG_SRC: "Agent",
		log: TinCan.prototype.log,
		init: function (a) {
			this.log("init");
			var b, c, d = ["name", "mbox", "mbox_sha1sum", "openid"];
			for (a = a || {}, "undefined" != typeof a.lastName || "undefined" != typeof a.firstName ? (a.name = "", "undefined" != typeof a.firstName && a.firstName.length > 0 && (a.name = a.firstName[0], a.firstName.length > 1 && (this.degraded = !0)), "" !== a.name && (a.name += " "), "undefined" != typeof a.lastName && a.lastName.length > 0 && (a.name += a.lastName[0], a.lastName.length > 1 && (this.degraded = !0))) : ("undefined" != typeof a.familyName || "undefined" != typeof a.givenName) && (a.name = "", "undefined" != typeof a.givenName && a.givenName.length > 0 && (a.name = a.givenName[0], a.givenName.length > 1 && (this.degraded = !0)), "" !== a.name && (a.name += " "), "undefined" != typeof a.familyName && a.familyName.length > 0 && (a.name += a.familyName[0], a.familyName.length > 1 && (this.degraded = !0))), "object" == typeof a.name && null !== a.name && (a.name.length > 1 && (this.degraded = !0), a.name = a.name[0]), "object" == typeof a.mbox && null !== a.mbox && (a.mbox.length > 1 && (this.degraded = !0), a.mbox = a.mbox[0]), "object" == typeof a.mbox_sha1sum && null !== a.mbox_sha1sum && (a.mbox_sha1sum.length > 1 && (this.degraded = !0), a.mbox_sha1sum = a.mbox_sha1sum[0]), "object" == typeof a.openid && null !== a.openid && (a.openid.length > 1 && (this.degraded = !0), a.openid = a.openid[0]), "object" == typeof a.account && null !== a.account && "undefined" == typeof a.account.homePage && "undefined" == typeof a.account.name && (0 === a.account.length ? delete a.account : (a.account.length > 1 && (this.degraded = !0), a.account = a.account[0])), a.hasOwnProperty("account") && (this.account = a.account instanceof TinCan.AgentAccount ? a.account : new TinCan.AgentAccount(a.account)), b = 0; b < d.length; b += 1) a.hasOwnProperty(d[b]) && null !== a[d[b]] && (c = a[d[b]], "mbox" === d[b] && -1 === c.indexOf("mailto:") && (c = "mailto:" + c), this[d[b]] = c)
		},
		toString: function () {
			return this.log("toString"), null !== this.name ? this.name : null !== this.mbox ? this.mbox.replace("mailto:", "") : null !== this.mbox_sha1sum ? this.mbox_sha1sum : null !== this.openid ? this.openid : null !== this.account ? this.account.toString() : this.objectType + ": unidentified"
		},
		asVersion: function (a) {
			this.log("asVersion: " + a);
			var b = {
				objectType: this.objectType
			};
			return a = a || TinCan.versions()[0], "0.9" === a ? (null !== this.mbox ? b.mbox = [this.mbox] : null !== this.mbox_sha1sum ? b.mbox_sha1sum = [this.mbox_sha1sum] : null !== this.openid ? b.openid = [this.openid] : null !== this.account && (b.account = [this.account.asVersion(a)]), null !== this.name && (b.name = [this.name])) : (null !== this.mbox ? b.mbox = this.mbox : null !== this.mbox_sha1sum ? b.mbox_sha1sum = this.mbox_sha1sum : null !== this.openid ? b.openid = this.openid : null !== this.account && (b.account = this.account.asVersion(a)), null !== this.name && (b.name = this.name)), b
		}
	}, a.fromJSON = function (b) {
		a.prototype.log("fromJSON");
		var c = JSON.parse(b);
		return new a(c)
	}
}(),
function () {
	"use strict";
	var a = TinCan.Group = function (a) {
		this.log("constructor"), this.name = null, this.mbox = null, this.mbox_sha1sum = null, this.openid = null, this.account = null, this.member = [], this.init(a)
	};
	a.prototype = {
		objectType: "Group",
		LOG_SRC: "Group",
		log: TinCan.prototype.log,
		init: function (a) {
			this.log("init");
			var b;
			if (a = a || {}, TinCan.Agent.prototype.init.call(this, a), "undefined" != typeof a.member)
				for (b = 0; b < a.member.length; b += 1) this.member.push(a.member[b] instanceof TinCan.Agent ? a.member[b] : new TinCan.Agent(a.member[b]))
		},
		toString: function (a) {
			this.log("toString");
			var b = TinCan.Agent.prototype.toString.call(this, a);
			return b !== this.objectType + ": unidentified" && (b = this.objectType + ": " + b), b
		},
		asVersion: function (a) {
			this.log("asVersion: " + a);
			var b, c;
			if (a = a || TinCan.versions()[0], b = TinCan.Agent.prototype.asVersion.call(this, a), this.member.length > 0)
				for (b.member = [], c = 0; c < this.member.length; c += 1) b.member.push(this.member[c].asVersion(a));
			return b
		}
	}, a.fromJSON = function (b) {
		a.prototype.log("fromJSON");
		var c = JSON.parse(b);
		return new a(c)
	}
}(),
function () {
	"use strict";
	var a = {
			"http://adlnet.gov/expapi/verbs/experienced": "experienced",
			"http://adlnet.gov/expapi/verbs/attended": "attended",
			"http://adlnet.gov/expapi/verbs/attempted": "attempted",
			"http://adlnet.gov/expapi/verbs/completed": "completed",
			"http://adlnet.gov/expapi/verbs/passed": "passed",
			"http://adlnet.gov/expapi/verbs/failed": "failed",
			"http://adlnet.gov/expapi/verbs/answered": "answered",
			"http://adlnet.gov/expapi/verbs/interacted": "interacted",
			"http://adlnet.gov/expapi/verbs/imported": "imported",
			"http://adlnet.gov/expapi/verbs/created": "created",
			"http://adlnet.gov/expapi/verbs/shared": "shared",
			"http://adlnet.gov/expapi/verbs/voided": "voided"
		},
		b = TinCan.Verb = function (a) {
			this.log("constructor"), this.id = null, this.display = null, this.init(a)
		};
	b.prototype = {
		LOG_SRC: "Verb",
		log: TinCan.prototype.log,
		init: function (b) {
			this.log("init");
			var c, d, e = ["id", "display"];
			if ("string" == typeof b) {
				this.id = b, this.display = {
					und: this.id
				};
				for (d in a)
					if (a.hasOwnProperty(d) && a[d] === b) {
						this.id = d;
						break
					}
			} else {
				for (b = b || {}, c = 0; c < e.length; c += 1) b.hasOwnProperty(e[c]) && null !== b[e[c]] && (this[e[c]] = b[e[c]]);
				null === this.display && "undefined" != typeof a[this.id] && (this.display = {
					und: a[this.id]
				})
			}
		},
		toString: function (a) {
			return this.log("toString"), null !== this.display ? this.getLangDictionaryValue("display", a) : this.id
		},
		asVersion: function (b) {
			this.log("asVersion");
			var c;
			return b = b || TinCan.versions()[0], "0.9" === b ? c = a[this.id] : (c = {
				id: this.id
			}, null !== this.display && (c.display = this.display)), c
		},
		getLangDictionaryValue: TinCan.Utils.getLangDictionaryValue
	}, b.fromJSON = function (a) {
		b.prototype.log("fromJSON");
		var c = JSON.parse(a);
		return new b(c)
	}
}(),
function () {
	"use strict";
	var a = TinCan.Result = function (a) {
		this.log("constructor"), this.score = null, this.success = null, this.completion = null, this.duration = null, this.response = null, this.extensions = null, this.init(a)
	};
	a.prototype = {
		LOG_SRC: "Result",
		log: TinCan.prototype.log,
		init: function (a) {
			this.log("init");
			var b, c = ["completion", "duration", "extensions", "response", "success"];
			for (a = a || {}, a.hasOwnProperty("score") && null !== a.score && (this.score = a.score instanceof TinCan.Score ? a.score : new TinCan.Score(a.score)), b = 0; b < c.length; b += 1) a.hasOwnProperty(c[b]) && null !== a[c[b]] && (this[c[b]] = a[c[b]]);
			"Completed" === this.completion && (this.completion = !0)
		},
		asVersion: function (a) {
			this.log("asVersion");
			var b, c = {},
				d = ["success", "duration", "response", "extensions"],
				e = ["score"];
			for (a = a || TinCan.versions()[0], b = 0; b < d.length; b += 1) null !== this[d[b]] && (c[d[b]] = this[d[b]]);
			for (b = 0; b < e.length; b += 1) null !== this[e[b]] && (c[e[b]] = this[e[b]].asVersion(a));
			return null !== this.completion && ("0.9" === a ? this.completion && (c.completion = "Completed") : c.completion = this.completion), c
		}
	}, a.fromJSON = function (b) {
		a.prototype.log("fromJSON");
		var c = JSON.parse(b);
		return new a(c)
	}
}(),
function () {
	"use strict";
	var a = TinCan.Score = function (a) {
		this.log("constructor"), this.scaled = null, this.raw = null, this.min = null, this.max = null, this.init(a)
	};
	a.prototype = {
		LOG_SRC: "Score",
		log: TinCan.prototype.log,
		init: function (a) {
			this.log("init");
			var b, c = ["scaled", "raw", "min", "max"];
			for (a = a || {}, b = 0; b < c.length; b += 1) a.hasOwnProperty(c[b]) && null !== a[c[b]] && (this[c[b]] = a[c[b]])
		},
		asVersion: function (a) {
			this.log("asVersion");
			var b, c = {},
				d = ["scaled", "raw", "min", "max"];
			for (a = a || TinCan.versions()[0], b = 0; b < d.length; b += 1) null !== this[d[b]] && (c[d[b]] = this[d[b]]);
			return c
		}
	}, a.fromJSON = function (b) {
		a.prototype.log("fromJSON");
		var c = JSON.parse(b);
		return new a(c)
	}
}(),
function () {
	"use strict";
	var a = TinCan.InteractionComponent = function (a) {
		this.log("constructor"), this.id = null, this.description = null, this.init(a)
	};
	a.prototype = {
		LOG_SRC: "InteractionComponent",
		log: TinCan.prototype.log,
		init: function (a) {
			this.log("init");
			var b, c = ["id", "description"];
			for (a = a || {}, b = 0; b < c.length; b += 1) a.hasOwnProperty(c[b]) && null !== a[c[b]] && (this[c[b]] = a[c[b]])
		},
		asVersion: function (a) {
			this.log("asVersion");
			var b, c, d = {
					id: this.id
				},
				e = ["description"];
			for (a = a || TinCan.versions()[0], b = 0; b < e.length; b += 1) c = e[b], null !== this[c] && (d[c] = this[c]);
			return d
		},
		getLangDictionaryValue: TinCan.Utils.getLangDictionaryValue
	}, a.fromJSON = function (b) {
		a.prototype.log("fromJSON");
		var c = JSON.parse(b);
		return new a(c)
	}
}(),
function () {
	"use strict";
	var a = {
			"http://adlnet.gov/expapi/activities/course": "course",
			"http://adlnet.gov/expapi/activities/module": "module",
			"http://adlnet.gov/expapi/activities/meeting": "meeting",
			"http://adlnet.gov/expapi/activities/media": "media",
			"http://adlnet.gov/expapi/activities/performance": "performance",
			"http://adlnet.gov/expapi/activities/simulation": "simulation",
			"http://adlnet.gov/expapi/activities/assessment": "assessment",
			"http://adlnet.gov/expapi/activities/interaction": "interaction",
			"http://adlnet.gov/expapi/activities/cmi.interaction": "cmi.interaction",
			"http://adlnet.gov/expapi/activities/question": "question",
			"http://adlnet.gov/expapi/activities/objective": "objective",
			"http://adlnet.gov/expapi/activities/link": "link"
		},
		b = TinCan.ActivityDefinition = function (a) {
			this.log("constructor"), this.name = null, this.description = null, this.type = null, this.moreInfo = null, this.extensions = null, this.interactionType = null, this.correctResponsesPattern = null, this.choices = null, this.scale = null, this.source = null, this.target = null, this.steps = null, this.init(a)
		};
	b.prototype = {
		LOG_SRC: "ActivityDefinition",
		log: TinCan.prototype.log,
		init: function (b) {
			this.log("init");
			var c, d, e, f = ["name", "description", "moreInfo", "extensions", "correctResponsesPattern"],
				g = [];
			if (b = b || {}, b.hasOwnProperty("type") && null !== b.type) {
				for (e in a) a.hasOwnProperty(e) && a[e] === b.type && (b.type = a[e]);
				this.type = b.type
			}
			if (b.hasOwnProperty("interactionType") && null !== b.interactionType && (this.interactionType = b.interactionType, "choice" === b.interactionType || "sequencing" === b.interactionType ? g.push("choices") : "likert" === b.interactionType ? g.push("scale") : "matching" === b.interactionType ? (g.push("source"), g.push("target")) : "performance" === b.interactionType && g.push("steps"), g.length > 0))
				for (c = 0; c < g.length; c += 1)
					if (e = g[c], b.hasOwnProperty(e) && null !== b[e])
						for (this[e] = [], d = 0; d < b[e].length; d += 1) this[e].push(b[e][d] instanceof TinCan.InteractionComponent ? b[e][d] : new TinCan.InteractionComponent(b[e][d]));
			for (c = 0; c < f.length; c += 1) b.hasOwnProperty(f[c]) && null !== b[f[c]] && (this[f[c]] = b[f[c]])
		},
		toString: function (a) {
			return this.log("toString"), null !== this.name ? this.getLangDictionaryValue("name", a) : null !== this.description ? this.getLangDictionaryValue("description", a) : ""
		},
		asVersion: function (b) {
			this.log("asVersion");
			var c, d, e, f = {},
				g = ["name", "description", "interactionType", "correctResponsesPattern", "extensions"],
				h = ["choices", "scale", "source", "target", "steps"];
			for (b = b || TinCan.versions()[0], null !== this.type && (f.type = "0.9" === b ? a[this.type] : this.type), c = 0; c < g.length; c += 1) e = g[c], null !== this[e] && (f[e] = this[e]);
			for (c = 0; c < h.length; c += 1)
				if (e = h[c], null !== this[e])
					for (f[e] = [], d = 0; d < this[e].length; d += 1) f[e].push(this[e][d].asVersion(b));
			return 0 !== b.indexOf("0.9") && null !== this.moreInfo && (f.moreInfo = this.moreInfo), f
		},
		getLangDictionaryValue: TinCan.Utils.getLangDictionaryValue
	}, b.fromJSON = function (a) {
		b.prototype.log("fromJSON");
		var c = JSON.parse(a);
		return new b(c)
	}
}(),
function () {
	"use strict";
	var a = TinCan.Activity = function (a) {
		this.log("constructor"), this.objectType = "Activity", this.id = null, this.definition = null, this.init(a)
	};
	a.prototype = {
		LOG_SRC: "Activity",
		log: TinCan.prototype.log,
		init: function (a) {
			this.log("init");
			var b, c = ["id"];
			for (a = a || {}, a.hasOwnProperty("definition") && (this.definition = a.definition instanceof TinCan.ActivityDefinition ? a.definition : new TinCan.ActivityDefinition(a.definition)), b = 0; b < c.length; b += 1) a.hasOwnProperty(c[b]) && null !== a[c[b]] && (this[c[b]] = a[c[b]])
		},
		toString: function (a) {
			this.log("toString");
			var b = "";
			return null !== this.definition && (b = this.definition.toString(a), "" !== b) ? b : null !== this.id ? this.id : "Activity: unidentified"
		},
		asVersion: function (a) {
			this.log("asVersion");
			var b = {
				id: this.id,
				objectType: this.objectType
			};
			return a = a || TinCan.versions()[0], null !== this.definition && (b.definition = this.definition.asVersion(a)), b
		}
	}, a.fromJSON = function (b) {
		a.prototype.log("fromJSON");
		var c = JSON.parse(b);
		return new a(c)
	}
}(),
function () {
	"use strict";
	var a = TinCan.ContextActivities = function (a) {
		this.log("constructor"), this.category = null, this.parent = null, this.grouping = null, this.other = null, this.init(a)
	};
	a.prototype = {
		LOG_SRC: "ContextActivities",
		log: TinCan.prototype.log,
		init: function (a) {
			this.log("init");
			var b, c, d, e, f = ["category", "parent", "grouping", "other"];
			for (a = a || {}, b = 0; b < f.length; b += 1)
				if (d = f[b], a.hasOwnProperty(d) && null !== a[d])
					if ("[object Array]" === Object.prototype.toString.call(a[d]))
						for (c = 0; c < a[d].length; c += 1) this.add(d, a[d][c]);
					else e = a[d], this.add(d, e)
		},
		add: function (a, b) {
			return "category" === a || "parent" === a || "grouping" === a || "other" === a ? (null === this[a] && (this[a] = []), b instanceof TinCan.Activity || (b = "string" == typeof b ? {
				id: b
			} : b, b = new TinCan.Activity(b)), this[a].push(b), this[a].length - 1) : void 0
		},
		asVersion: function (a) {
			this.log("asVersion");
			var b, c, d = {},
				e = ["parent", "grouping", "other"];
			for (a = a || TinCan.versions()[0], b = 0; b < e.length; b += 1)
				if (null !== this[e[b]] && this[e[b]].length > 0)
					if ("0.9" === a || "0.95" === a) this[e[b]].length > 1 && this.log("[warning] version does not support multiple values in: " + e[b]), d[e[b]] = this[e[b]][0].asVersion(a);
					else
						for (d[e[b]] = [], c = 0; c < this[e[b]].length; c += 1) d[e[b]].push(this[e[b]][c].asVersion(a));
			if (null !== this.category && this.category.length > 0) {
				if ("0.9" === a || "0.95" === a) throw this.log("[error] version does not support the 'category' property: " + a), new Error(a + " does not support the 'category' property");
				for (d.category = [], b = 0; b < this.category.length; b += 1) d.category.push(this.category[b].asVersion(a))
			}
			return d
		}
	}, a.fromJSON = function (b) {
		a.prototype.log("fromJSON");
		var c = JSON.parse(b);
		return new a(c)
	}
}(),
function () {
	"use strict";
	var a = TinCan.Context = function (a) {
		this.log("constructor"), this.registration = null, this.instructor = null, this.team = null, this.contextActivities = null, this.revision = null, this.platform = null, this.language = null, this.statement = null, this.extensions = null, this.init(a)
	};
	a.prototype = {
		LOG_SRC: "Context",
		log: TinCan.prototype.log,
		init: function (a) {
			this.log("init");
			var b, c, d, e = ["registration", "revision", "platform", "language", "extensions"],
				f = ["instructor", "team"];
			for (a = a || {}, b = 0; b < e.length; b += 1) c = e[b], a.hasOwnProperty(c) && null !== a[c] && (this[c] = a[c]);
			for (b = 0; b < f.length; b += 1) c = f[b], a.hasOwnProperty(c) && null !== a[c] && (d = a[c], ("undefined" == typeof d.objectType || "Person" === d.objectType) && (d.objectType = "Agent"), "Agent" !== d.objectType || d instanceof TinCan.Agent ? "Group" !== d.objectType || d instanceof TinCan.Group || (d = new TinCan.Group(d)) : d = new TinCan.Agent(d), this[c] = d);
			a.hasOwnProperty("contextActivities") && null !== a.contextActivities && (this.contextActivities = a.contextActivities instanceof TinCan.ContextActivities ? a.contextActivities : new TinCan.ContextActivities(a.contextActivities)), a.hasOwnProperty("statement") && null !== a.statement && (a.statement instanceof TinCan.StatementRef ? this.statement = a.statement : a.statement instanceof TinCan.SubStatement ? this.statement = a.statement : "StatementRef" === a.statement.objectType ? this.statement = new TinCan.StatementRef(a.statement) : "SubStatement" === a.statement.objectType ? this.statement = new TinCan.SubStatement(a.statement) : this.log("Unable to parse statement.context.statement property."))
		},
		asVersion: function (a) {
			this.log("asVersion");
			var b, c = {},
				d = ["registration", "revision", "platform", "language", "extensions"],
				e = ["instructor", "team", "contextActivities", "statement"];
			if (a = a || TinCan.versions()[0], this.statement instanceof TinCan.SubStatement && "0.9" !== a && "0.95" !== a) throw this.log("[error] version does not support SubStatements in the 'statement' property: " + a), new Error(a + " does not support SubStatements in the 'statement' property");
			for (b = 0; b < d.length; b += 1) null !== this[d[b]] && (c[d[b]] = this[d[b]]);
			for (b = 0; b < e.length; b += 1) null !== this[e[b]] && (c[e[b]] = this[e[b]].asVersion(a));
			return c
		}
	}, a.fromJSON = function (b) {
		a.prototype.log("fromJSON");
		var c = JSON.parse(b);
		return new a(c)
	}
}(),
function () {
	"use strict";
	var a = TinCan.StatementRef = function (a) {
		this.log("constructor"), this.id = null, this.init(a)
	};
	a.prototype = {
		objectType: "StatementRef",
		LOG_SRC: "StatementRef",
		log: TinCan.prototype.log,
		init: function (a) {
			this.log("init");
			var b, c = ["id"];
			for (a = a || {}, b = 0; b < c.length; b += 1) a.hasOwnProperty(c[b]) && null !== a[c[b]] && (this[c[b]] = a[c[b]])
		},
		toString: function () {
			return this.log("toString"), this.id
		},
		asVersion: function (a) {
			this.log("asVersion");
			var b = {
				objectType: this.objectType,
				id: this.id
			};
			return "0.9" === a && (b.objectType = "Statement"), b
		}
	}, a.fromJSON = function (b) {
		a.prototype.log("fromJSON");
		var c = JSON.parse(b);
		return new a(c)
	}
}(),
function () {
	"use strict";
	var a = TinCan.SubStatement = function (a) {
		this.log("constructor"), this.actor = null, this.verb = null, this.target = null, this.result = null, this.context = null, this.timestamp = null, this.init(a)
	};
	a.prototype = {
		objectType: "SubStatement",
		LOG_SRC: "SubStatement",
		log: TinCan.prototype.log,
		init: function (a) {
			this.log("init");
			var b, c = ["timestamp"];
			for (a = a || {}, a.hasOwnProperty("object") && (a.target = a.object), a.hasOwnProperty("actor") && (("undefined" == typeof a.actor.objectType || "Person" === a.actor.objectType) && (a.actor.objectType = "Agent"), "Agent" === a.actor.objectType ? this.actor = a.actor instanceof TinCan.Agent ? a.actor : new TinCan.Agent(a.actor) : "Group" === a.actor.objectType && (this.actor = a.actor instanceof TinCan.Group ? a.actor : new TinCan.Group(a.actor))), a.hasOwnProperty("verb") && (this.verb = a.verb instanceof TinCan.Verb ? a.verb : new TinCan.Verb(a.verb)), a.hasOwnProperty("target") && (a.target instanceof TinCan.Activity || a.target instanceof TinCan.Agent || a.target instanceof TinCan.Group || a.target instanceof TinCan.SubStatement || a.target instanceof TinCan.StatementRef ? this.target = a.target : ("undefined" == typeof a.target.objectType && (a.target.objectType = "Activity"), "Activity" === a.target.objectType ? this.target = new TinCan.Activity(a.target) : "Agent" === a.target.objectType ? this.target = new TinCan.Agent(a.target) : "Group" === a.target.objectType ? this.target = new TinCan.Group(a.target) : "SubStatement" === a.target.objectType ? this.target = new TinCan.SubStatement(a.target) : "StatementRef" === a.target.objectType ? this.target = new TinCan.StatementRef(a.target) : this.log("Unrecognized target type: " + a.target.objectType))), a.hasOwnProperty("result") && (this.result = a.result instanceof TinCan.Result ? a.result : new TinCan.Result(a.result)), a.hasOwnProperty("context") && (this.context = a.context instanceof TinCan.Context ? a.context : new TinCan.Context(a.context)), b = 0; b < c.length; b += 1) a.hasOwnProperty(c[b]) && null !== a[c[b]] && (this[c[b]] = a[c[b]])
		},
		toString: function (a) {
			return this.log("toString"), (null !== this.actor ? this.actor.toString(a) : "") + " " + (null !== this.verb ? this.verb.toString(a) : "") + " " + (null !== this.target ? this.target.toString(a) : "")
		},
		asVersion: function (a) {
			this.log("asVersion");
			var b, c, d = ["timestamp"],
				e = ["actor", "verb", "result", "context"];
			for (b = {
					objectType: this.objectType
				}, a = a || TinCan.versions()[0], c = 0; c < d.length; c += 1) null !== this[d[c]] && (b[d[c]] = this[d[c]]);
			for (c = 0; c < e.length; c += 1) null !== this[e[c]] && (b[e[c]] = this[e[c]].asVersion(a));
			return null !== this.target && (b.object = this.target.asVersion(a)), "0.9" === a && (b.objectType = "Statement"), b
		}
	}, a.fromJSON = function (b) {
		a.prototype.log("fromJSON");
		var c = JSON.parse(b);
		return new a(c)
	}
}(),
function () {
	"use strict";
	var a = TinCan.Statement = function (a, b) {
		this.log("constructor"), b = "number" == typeof b ? {
			storeOriginal: b
		} : b || {}, "undefined" == typeof b.storeOriginal && (b.storeOriginal = null), "undefined" == typeof b.doStamp && (b.doStamp = !0), this.id = null, this.actor = null, this.verb = null, this.target = null, this.result = null, this.context = null, this.timestamp = null, this.stored = null, this.authority = null, this.version = null, this.degraded = !1, this.voided = null, this.inProgress = null, this.originalJSON = null, this.init(a, b)
	};
	a.prototype = {
		LOG_SRC: "Statement",
		log: TinCan.prototype.log,
		init: function (a, b) {
			this.log("init");
			var c, d = ["id", "stored", "timestamp", "version", "inProgress", "voided"];
			for (a = a || {}, b.storeOriginal && (this.originalJSON = JSON.stringify(a, null, b.storeOriginal)), a.hasOwnProperty("object") && (a.target = a.object), a.hasOwnProperty("actor") && (("undefined" == typeof a.actor.objectType || "Person" === a.actor.objectType) && (a.actor.objectType = "Agent"), "Agent" === a.actor.objectType ? this.actor = a.actor instanceof TinCan.Agent ? a.actor : new TinCan.Agent(a.actor) : "Group" === a.actor.objectType && (this.actor = a.actor instanceof TinCan.Group ? a.actor : new TinCan.Group(a.actor))), a.hasOwnProperty("authority") && (("undefined" == typeof a.authority.objectType || "Person" === a.authority.objectType) && (a.authority.objectType = "Agent"), "Agent" === a.authority.objectType ? this.authority = a.authority instanceof TinCan.Agent ? a.authority : new TinCan.Agent(a.authority) : "Group" === a.authority.objectType && (this.authority = a.actor instanceof TinCan.Group ? a.authority : new TinCan.Group(a.authority))), a.hasOwnProperty("verb") && (this.verb = a.verb instanceof TinCan.Verb ? a.verb : new TinCan.Verb(a.verb)), a.hasOwnProperty("target") && (a.target instanceof TinCan.Activity || a.target instanceof TinCan.Agent || a.target instanceof TinCan.Group || a.target instanceof TinCan.SubStatement || a.target instanceof TinCan.StatementRef ? this.target = a.target : ("undefined" == typeof a.target.objectType && (a.target.objectType = "Activity"), "Activity" === a.target.objectType ? this.target = new TinCan.Activity(a.target) : "Agent" === a.target.objectType ? this.target = new TinCan.Agent(a.target) : "Group" === a.target.objectType ? this.target = new TinCan.Group(a.target) : "SubStatement" === a.target.objectType ? this.target = new TinCan.SubStatement(a.target) : "StatementRef" === a.target.objectType ? this.target = new TinCan.StatementRef(a.target) : this.log("Unrecognized target type: " + a.target.objectType))), a.hasOwnProperty("result") && (this.result = a.result instanceof TinCan.Result ? a.result : new TinCan.Result(a.result)), a.hasOwnProperty("context") && (this.context = a.context instanceof TinCan.Context ? a.context : new TinCan.Context(a.context)), c = 0; c < d.length; c += 1) a.hasOwnProperty(d[c]) && null !== a[d[c]] && (this[d[c]] = a[d[c]]);
			b.doStamp && this.stamp()
		},
		toString: function (a) {
			return this.log("toString"), (null !== this.actor ? this.actor.toString(a) : "") + " " + (null !== this.verb ? this.verb.toString(a) : "") + " " + (null !== this.target ? this.target.toString(a) : "")
		},
		asVersion: function (a) {
			this.log("asVersion");
			var b, c = {},
				d = ["id", "timestamp"],
				e = ["actor", "verb", "result", "context", "authority"];
			for (a = a || TinCan.versions()[0], b = 0; b < d.length; b += 1) null !== this[d[b]] && (c[d[b]] = this[d[b]]);
			for (b = 0; b < e.length; b += 1) null !== this[e[b]] && (c[e[b]] = this[e[b]].asVersion(a));
			return null !== this.target && (c.object = this.target.asVersion(a)), ("0.9" === a || "0.95" === a) && null !== this.voided && (c.voided = this.voided), "0.9" === a && null !== this.inProgress && (c.inProgress = this.inProgress), c
		},
		stamp: function () {
			this.log("stamp"), null === this.id && (this.id = TinCan.Utils.getUUID()), null === this.timestamp && (this.timestamp = TinCan.Utils.getISODateString(new Date))
		}
	}, a.fromJSON = function (b) {
		a.prototype.log("fromJSON");
		var c = JSON.parse(b);
		return new a(c)
	}
}(),
function () {
	"use strict";
	var a = TinCan.StatementsResult = function (a) {
		this.log("constructor"), this.statements = null, this.more = null, this.init(a)
	};
	a.prototype = {
		LOG_SRC: "StatementsResult",
		log: TinCan.prototype.log,
		init: function (a) {
			this.log("init"), a = a || {}, a.hasOwnProperty("statements") && (this.statements = a.statements), a.hasOwnProperty("more") && (this.more = a.more)
		}
	}, a.fromJSON = function (b) {
		a.prototype.log("fromJSON");
		var c, d, e, f = [];
		try {
			c = JSON.parse(b)
		} catch (g) {
			a.prototype.log("fromJSON - JSON.parse error: " + g)
		}
		if (c) {
			for (e = 0; e < c.statements.length; e += 1) {
				try {
					d = new TinCan.Statement(c.statements[e], 4)
				} catch (h) {
					a.prototype.log("fromJSON - statement instantiation failed: " + h + " (" + JSON.stringify(c.statements[e]) + ")"), d = new TinCan.Statement({
						id: c.statements[e].id
					}, 4)
				}
				f.push(d)
			}
			c.statements = f
		}
		return new a(c)
	}
}(),
function () {
	"use strict";
	var a = TinCan.State = function (a) {
		this.log("constructor"), this.id = null, this.updated = null, this.contents = null, this.etag = null, this.contentType = null, this.init(a)
	};
	a.prototype = {
		LOG_SRC: "State",
		log: TinCan.prototype.log,
		init: function (a) {
			this.log("init");
			var b, c = ["id", "contents", "etag", "contentType"];
			for (a = a || {}, b = 0; b < c.length; b += 1) a.hasOwnProperty(c[b]) && null !== a[c[b]] && (this[c[b]] = a[c[b]]);
			this.updated = !1
		}
	}, a.fromJSON = function (b) {
		a.prototype.log("fromJSON");
		var c = JSON.parse(b);
		return new a(c)
	}
}(),
function () {
	"use strict";
	var a = TinCan.ActivityProfile = function (a) {
		this.log("constructor"), this.id = null, this.activity = null, this.updated = null, this.contents = null, this.etag = null, this.contentType = null, this.init(a)
	};
	a.prototype = {
		LOG_SRC: "ActivityProfile",
		log: TinCan.prototype.log,
		init: function (a) {
			this.log("init");
			var b, c = ["id", "contents", "etag", "contentType"];
			for (a = a || {}, a.hasOwnProperty("activity") && (this.activity = a.activity instanceof TinCan.Activity ? a.activity : new TinCan.Activity(a.activity)), b = 0; b < c.length; b += 1) a.hasOwnProperty(c[b]) && null !== a[c[b]] && (this[c[b]] = a[c[b]]);
			this.updated = !1
		}
	}, a.fromJSON = function (b) {
		a.prototype.log("fromJSON");
		var c = JSON.parse(b);
		return new a(c)
	}
}(),
function () {
	"use strict";
	var a = TinCan.AgentProfile = function (a) {
		this.log("constructor"), this.id = null, this.agent = null, this.updated = null, this.contents = null, this.etag = null, this.contentType = null, this.init(a)
	};
	a.prototype = {
		LOG_SRC: "AgentProfile",
		log: TinCan.prototype.log,
		init: function (a) {
			this.log("init");
			var b, c = ["id", "contents", "etag", "contentType"];
			for (a = a || {}, a.hasOwnProperty("agent") && (this.agent = a.agent instanceof TinCan.Agent ? a.agent : new TinCan.Agent(a.agent)), b = 0; b < c.length; b += 1) a.hasOwnProperty(c[b]) && null !== a[c[b]] && (this[c[b]] = a[c[b]]);
			this.updated = !1
		}
	}, a.fromJSON = function (b) {
		a.prototype.log("fromJSON");
		var c = JSON.parse(b);
		return new a(c)
	}
}(),
function () {
	"use strict";
	var a = TinCan.About = function (a) {
		this.log("constructor"), this.version = null, this.init(a)
	};
	a.prototype = {
		LOG_SRC: "About",
		log: TinCan.prototype.log,
		init: function (a) {
			this.log("init");
			var b, c = ["version"];
			for (a = a || {}, b = 0; b < c.length; b += 1) a.hasOwnProperty(c[b]) && null !== a[c[b]] && (this[c[b]] = a[c[b]])
		}
	}, a.fromJSON = function (b) {
		a.prototype.log("fromJSON");
		var c = JSON.parse(b);
		return new a(c)
	}
}(),
function () {
	"use strict";
	var LOG_SRC = "Environment.Browser",
		nativeRequest, xdrRequest, requestComplete, __delay, __IEModeConversion, env = {},
		log = TinCan.prototype.log;
	return "undefined" == typeof window ? void log("'window' not defined", LOG_SRC) : (window.JSON || (window.JSON = {
		parse: function (sJSON) {
			return eval("(" + sJSON + ")")
		},
		stringify: function (a) {
			var b, c, d = "";
			if (a instanceof Object) {
				if (a.constructor === Array) {
					for (b = 0; b < a.length; b += 1) d += this.stringify(a[b]) + ",";
					return "[" + d.substr(0, d.length - 1) + "]"
				}
				if (a.toString !== Object.prototype.toString) return '"' + a.toString().replace(/"/g, "\\$&") + '"';
				for (c in a) a.hasOwnProperty(c) && (d += '"' + c.replace(/"/g, "\\$&") + '":' + this.stringify(a[c]) + ",");
				return "{" + d.substr(0, d.length - 1) + "}"
			}
			return "string" == typeof a ? '"' + a.replace(/"/g, "\\$&") + '"' : String(a)
		}
	}), Date.now || (Date.now = function () {
		return +new Date
	}), env.hasCORS = !1, env.useXDR = !1, "undefined" != typeof XMLHttpRequest && "undefined" != typeof (new XMLHttpRequest).withCredentials ? env.hasCORS = !0 : "undefined" != typeof XDomainRequest && (env.hasCORS = !0, env.useXDR = !0), requestComplete = function (a, b, c) {
		log("requestComplete: " + c.finished + ", xhr.status: " + a.status, LOG_SRC);
		var d, e, f;
		return f = "undefined" == typeof a.status ? c.fakeStatus : 1223 === a.status ? 204 : a.status, c.finished ? d : (c.finished = !0, e = b.ignore404 && 404 === f, f >= 200 && 400 > f || e ? b.callback ? void b.callback(null, a) : d = {
			err: null,
			xhr: a
		} : (d = {
			err: f,
			xhr: a
		}, 0 === f ? log("[warning] There was a problem communicating with the Learning Record Store. Aborted, offline, or invalid CORS endpoint (" + f + ")", LOG_SRC) : log("[warning] There was a problem communicating with the Learning Record Store. (" + f + " | " + a.responseText + ")", LOG_SRC), b.callback && b.callback(f, a), d))
	}, __IEModeConversion = function (a, b, c, d) {
		var e;
		for (e in b) b.hasOwnProperty(e) && c.push(e + "=" + encodeURIComponent(b[e]));
		return "undefined" != typeof d.data && c.push("content=" + encodeURIComponent(d.data)), b["Content-Type"] = "application/x-www-form-urlencoded", a += "?method=" + d.method, d.method = "POST", d.params = {}, c.length > 0 && (d.data = c.join("&")), a
	}, nativeRequest = function (a, b, c) {
		log("sendRequest using XMLHttpRequest", LOG_SRC);
		var d, e, f, g, h = this,
			i = [],
			j = {
				finished: !1,
				fakeStatus: null
			},
			k = "undefined" != typeof c.callback,
			l = a,
			m = 2048;
		log("sendRequest using XMLHttpRequest - async: " + k, LOG_SRC);
		for (e in c.params) c.params.hasOwnProperty(e) && i.push(e + "=" + encodeURIComponent(c.params[e]));
		if (i.length > 0 && (l += "?" + i.join("&")), l.length >= m) {
			if ("undefined" != typeof b["Content-Type"] && "application/json" !== b["Content-Type"]) return g = new Error("Unsupported content type for IE Mode request"), "undefined" != typeof c.callback && c.callback(g, null), {
				err: g,
				xhr: null
			};
			if ("undefined" == typeof c.method) return g = new Error("method must not be undefined for an IE Mode Request conversion"), "undefined" != typeof c.callback && c.callback(g, null), {
				err: g,
				xhr: null
			};
			a = __IEModeConversion(a, b, i, c)
		} else a = l;
		d = "undefined" != typeof XMLHttpRequest ? new XMLHttpRequest : new ActiveXObject("Microsoft.XMLHTTP"), d.open(c.method, a, k);
		for (e in b) b.hasOwnProperty(e) && d.setRequestHeader(e, b[e]);
		"undefined" != typeof c.data && (c.data += ""), f = c.data, k && (d.onreadystatechange = function () {
			log("xhr.onreadystatechange - xhr.readyState: " + d.readyState, LOG_SRC), 4 === d.readyState && requestComplete.call(h, d, c, j)
		});
		try {
			d.send(f)
		} catch (n) {
			log("sendRequest caught send exception: " + n, LOG_SRC)
		}
		return k ? d : requestComplete.call(this, d, c, j)
	}, xdrRequest = function (a, b, c) {
		log("sendRequest using XDomainRequest", LOG_SRC);
		var d, e, f, g, h, i = this,
			j = [],
			k = {
				finished: !1,
				fakeStatus: null
			};
		if ("undefined" != typeof b["Content-Type"] && "application/json" !== b["Content-Type"]) return h = new Error("Unsupported content type for IE Mode request"), c.callback ? (c.callback(h, null), null) : {
			err: h,
			xhr: null
		};
		a += "?method=" + c.method;
		for (f in c.params) c.params.hasOwnProperty(f) && j.push(f + "=" + encodeURIComponent(c.params[f]));
		for (f in b) b.hasOwnProperty(f) && j.push(f + "=" + encodeURIComponent(b[f]));
		"undefined" != typeof c.data && j.push("content=" + encodeURIComponent(c.data)), e = j.join("&"), d = new XDomainRequest, d.open("POST", a), c.callback ? (d.onload = function () {
			k.fakeStatus = 200, requestComplete.call(i, d, c, k)
		}, d.onerror = function () {
			k.fakeStatus = 400, requestComplete.call(i, d, c, k)
		}, d.ontimeout = function () {
			k.fakeStatus = 0, requestComplete.call(i, d, c, k)
		}) : (d.onload = function () {
			k.fakeStatus = 200
		}, d.onerror = function () {
			k.fakeStatus = 400
		}, d.ontimeout = function () {
			k.fakeStatus = 0
		}), d.onprogress = function () {}, d.timeout = 0;
		try {
			d.send(e)
		} catch (l) {
			log("sendRequest caught send exception: " + l, LOG_SRC)
		}
		if (!c.callback) {
			for (g = 1e4 + Date.now(), log("sendRequest - until: " + g + ", finished: " + k.finished, LOG_SRC); Date.now() < g && null === k.fakeStatus;) __delay();
			return requestComplete.call(i, d, c, k)
		}
		return d
	}, TinCan.LRS.prototype._initByEnvironment = function (a) {
		log("_initByEnvironment", LOG_SRC);
		var b, c, d, e;
		if (a = a || {}, this._makeRequest = nativeRequest, this._IEModeConversion = __IEModeConversion, b = this.endpoint.toLowerCase().match(/([A-Za-z]+:)\/\/([^:\/]+):?(\d+)?(\/.*)?$/), null === b) throw log("[error] LRS invalid: failed to divide URL parts", LOG_SRC), {
			code: 4,
			mesg: "LRS invalid: failed to divide URL parts"
		};
		if (d = location.port, c = location.protocol.toLowerCase() === b[1], "" === d && (d = "http:" === location.protocol.toLowerCase() ? "80" : "https:" === location.protocol.toLowerCase() ? "443" : ""), e = !c || location.hostname.toLowerCase() !== b[2] || d !== (null !== b[3] && "undefined" != typeof b[3] && "" !== b[3] ? b[3] : "http:" === b[1] ? "80" : "https:" === b[1] ? "443" : ""))
			if (env.hasCORS) {
				if (env.useXDR && c) this._makeRequest = xdrRequest;
				else if (env.useXDR && !c) {
					if (!a.allowFail) throw log("[error] LRS invalid: cross domain request for differing scheme in IE with XDR", LOG_SRC), {
						code: 2,
						mesg: "LRS invalid: cross domain request for differing scheme in IE with XDR"
					};
					log("[warning] LRS invalid: cross domain request for differing scheme in IE with XDR (allowed to fail)", LOG_SRC)
				}
			} else {
				if (!a.allowFail) throw log("[error] LRS invalid: cross domain requests not supported in this browser", LOG_SRC), {
					code: 1,
					mesg: "LRS invalid: cross domain requests not supported in this browser"
				};
				log("[warning] LRS invalid: cross domain requests not supported in this browser (allowed to fail)", LOG_SRC)
			}
	}, __delay = function () {
		var a = new XMLHttpRequest,
			b = window.location + "?forcenocache=" + TinCan.Utils.getUUID();
		a.open("GET", b, !1), a.send(null)
	}, void(TinCan.LRS.syncEnabled = !0))
}();
