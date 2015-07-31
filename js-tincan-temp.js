	function a(b, c) {
		var d, e, f = document.createElement(b.tag);
		if ("undefined" != typeof b.cache && (I[b.cache] = f), "undefined" != typeof b.attrs)
			for (d in b.attrs) b.attrs.hasOwnProperty(d) && f.setAttribute(d, b.attrs[d]);
		if ("undefined" != typeof b.text && f.appendChild(document.createTextNode(b.text)), "undefined" != typeof b.children)
			for (e = 0; e < b.children.length; e += 1) a(b.children[e], f);
		return c.appendChild(f), f
	}

	function b() {
		var a, b;
		for (b = 0; b < J.length; b += 1) a = document.createElement("option"), a.value = J[b].id, a.text = J[b].display, I.verbSelect.add(a)
	}

	function c() {
		var a, b, c, d, e = TinCan.Utils.parseURL(document.URL);
		for (d = 0; d < L.length; d += 1) "undefined" != typeof e.params[L[d]] && (M[L[d]] = e.params[L[d]], delete e.params[L[d]]);
		if (a = e.path, Object.keys(e.params).length > 0) {
			a += "?", c = [];
			for (b in e.params) e.params.hasOwnProperty(b) && c.push(b + "=" + encodeURIComponent(e.params[b]));
			a += c.join("&")
		}
		u.id = a
	}

	function d() {
		I.closeBtn.addEventListener("click", f, !1), I.sendStatementBtn.addEventListener("click", h, !1), I.tags.addEventListener("click", function (a) {
			a.target && a.target.classList.contains("rbmTag") && (a.preventDefault(), n(a.target.textContent))
		}), I.tagInput.addEventListener("blur", function () {
			i(), g("")
		}), I.verbSelect.addEventListener("change", function () {
			i(), g("")
		}), I.ratingSelect.addEventListener("change", function () {
			i(), g("")
		})
	}

	function e(a) {
		a += .05, I.overlay.style.opacity = a, 1 > a && setTimeout(function () {
			e(a)
		}, 75)
	}

	function f() {
		I.overlay && (I.overlay.style.display = "none", I.overlay.parentNode.removeChild(I.overlay)), delete window.rbmAuth, delete window.rbmEndpoint, delete window.rbmEmail, delete window.rbmName, delete window.rbmIsActive
	}

	function g(a) {
		I.msg.firstChild.data = a
	}

	function h() {
		g("Sending statement..."), s.stamp(), q.saveStatement(s, {
			callback: function (a, b) {
				var c;
				return null !== a ? null !== b ? void g("Failed to send statement: " + b.responseText + " (" + b.status + ")") : void g("Failed to send statement: " + a) : (g("Statement sent!"), c = I.previousRecords.innerHTML, c = c === D ? j(s) : j(s) + "<br>" + c, I.previousRecords.innerHTML = c, void l())
			}
		})
	}

	function i() {
		var a, b = I.tagInput.value;
		if (r.verb = {
				id: I.verbSelect.value,
				display: {
					"en-US": I.verbSelect.options[I.verbSelect.selectedIndex].text
				}
			}, r.context.extensions[B] = {
				min: 1,
				max: 5,
				raw: Number(I.ratingSelect.value)
			}, "" !== b && (b = b.split(/[\s,]+/), b.length > 0))
			for (r.context.contextActivities.other = [], a = 0; a < b.length; a += 1) r.context.contextActivities.other.push({
				id: z + encodeURIComponent(b[a]),
				definition: {
					type: A,
					name: {
						und: b[a]
					}
				}
			}), K[b[a]] = 1;
		s = new TinCan.Statement(r, {
			doStamp: !1
		}), I.previewStatement.firstChild.data = j(s)
	}

	function j(a) {
		var b, c, d = [a.actor.toString(), " ", a.verb.toString("und"), ' "', a.target.toString("en-US"), '" and rated it ', a.context.extensions[B].raw, " out of 5"].join("");
		if (null !== a.timestamp && (d += " at " + a.timestamp), d += ".", null !== a.context.contextActivities.other && a.context.contextActivities.other.length > 0) {
			for (d += " (", b = 0; b < a.context.contextActivities.other.length; b += 1) c = a.context.contextActivities.other[b], c.definition.type === A && (b > 0 && (d += " "), d += c.toString("und"));
			d += ")"
		}
		return d
	}

	function k() {
		q.retrieveState(C, {
			agent: t,
			activity: p,
			callback: function (a, b) {
				return null !== a ? void(I.tags.firstChild.data = "Error loading tags") : null === b ? void(I.tags.firstChild.data = "<none>") : (K = b.contents, v = b.etag, void m())
			}
		})
	}

	function l() {
		var a = JSON.stringify(K);
		q.saveState(C, a, {
			agent: t,
			activity: p,
			contentType: "application/json",
			lastSHA1: v,
			callback: function (b) {
				return null !== b ? void(I.tags.firstChild.data = "Error loading tags") : (v = TinCan.Utils.getSHA1String(a), void m())
			}
		})
	}

	function m() {
		var a, b, c = [],
			d = "";
		if (null === K) return void(I.tags.firstChild.data = "<none>");
		for (b in K) K.hasOwnProperty(b) && c.push(b);
		for (c.sort(), a = 0; a < c.length; a += 1) d += ' <a href="' + c[a] + '" class="rbmTag">' + c[a] + "</a>";
		I.tags.innerHTML = d
	}

	function n(a) {
		var b, c = I.tagInput.value,
			d = c.split(/[\s,]+/),
			e = [],
			f = {};
		for (d.push(a), b = 0; b < d.length; b += 1) "" !== d[b] && "undefined" == typeof f[d[b]] && (e.push(d[b]), f[d[b]] = !0);
		e.sort(), I.tagInput.value = e.join(" "), i(), g("")
	}

	function o() {
		q.queryStatements({
			params: {
				agent: t,
				activity: u
			},
			callback: function (a, b) {
				var c, d = D;
				if (null !== a) return void(I.previousRecords.innerHTML = "Can't load past statements: " + a);
				if (b.statements.length > 0)
					for (d = "", c = 0; c < b.statements.length; c += 1) d += j(b.statements[c]), d += "<br>";
				I.previousRecords.innerHTML = d
			}
		})
	}
	if (!window.rbmIsActive) {
		window.rbmIsActive = !0, Object.keys || (Object.keys = function (a) {
			if (a !== Object(a)) throw new TypeError("Object.keys called on a non-object");
			var b, c = [];
			for (b in a) Object.prototype.hasOwnProperty.call(a, b) && c.push(b);
			return c
		});
		var p, q, r, s, t, u, v, w = "http://activitystrea.ms/schema/1.0/page",
			x = "http://id.tincanapi.com/recipe/bookmarklet/base/1",
			y = "http://id.tincanapi.com/activitytype/recipe",
			z = "http://id.tincanapi.com/activity/tags/",
			A = "http://id.tincanapi.com/activitytype/tag",
			B = "http://id.tincanapi.com/extension/quality-rating",
			C = "tags",
			D = "No past statements.",
			E = TinCan.Utils.getUUID(),
			F = 0,
			G = "padding-top: 10px;",
			H = {
				cache: "overlay",
				tag: "div",
				attrs: {
					id: "rbmOverlay",
					style: ["position: fixed;", "z-index: 2147483647;", "right: 10px;", "top: 10px;", "width: 300px;", "margin: 0px;", "opacity: " + F + ";", "font-family: Helvetica, Arial, sans-serif;", "font-size: 14px;", "line-height: 20px;", "color: rgb(51, 51, 51);", "background-color: white;", "border: 1px solid #ddd;", "border-radius: 4px;", "-webkit-box-shadow: 0 1px 1px rgba(0, 0, 0, .05);", "box-shadow: 0 1px 1px rgba(0, 0, 0, .05);"].join("")
				},
				children: [{
					tag: "div",
					attrs: {
						"class": "rbmHeader",
						style: ["padding: 7px 30px 7px 10px;", "border-bottom: 1px solid transparent;", "border-top-left-radius: 3px;", "border-top-right-radius: 3px;", "color: #333;", "background-color: #f5f5f5;", "border-color: #ddd;"].join("")
					},
					children: [{
						tag: "span",
						attrs: {
							"class": "rbmTitle",
							style: "font-weight: bold;"
						},
						text: "Tin Can Reporter"
					}, {
						cache: "closeBtn",
						tag: "button",
						attrs: {
							"class": "rbmCloseButton",
							style: ["position: absolute;", "top: 5px;", "right: 5px;"].join("")
						},
						text: "X"
					}]
				}, {
					tag: "div",
					attrs: {
						"class": "rbmContent",
						style: "padding: 0px 10px 7px 10px;"
					},
					children: [{
						tag: "div",
						attrs: {
							"class": "rbmContentSection",
							style: G
						},
						children: [{
							tag: "label",
							text: "Object: "
						}, {
							tag: "span",
							attrs: {
								"class": "rbmObject"
							},
							text: document.title
						}]
					}, {
						tag: "div",
						attrs: {
							"class": "rbmContentSection",
							style: G
						},
						children: [{
							tag: "label",
							text: "Verb: "
						}, {
							cache: "verbSelect",
							tag: "select",
							attrs: {
								"class": "rbmVerb"
							}
						}]
					}, {
						tag: "div",
						attrs: {
							"class": "rbmContentSection",
							style: G
						},
						children: [{
							tag: "label",
							text: "Rating: "
						}, {
							cache: "ratingSelect",
							tag: "select",
							children: [{
								tag: "option",
								attrs: {
									value: "1"
								},
								text: "1"
							}, {
								tag: "option",
								attrs: {
									value: "2"
								},
								text: "2"
							}, {
								tag: "option",
								attrs: {
									value: "3",
									selected: "selected"
								},
								text: "3"
							}, {
								tag: "option",
								attrs: {
									value: "4"
								},
								text: "4"
							}, {
								tag: "option",
								attrs: {
									value: "5"
								},
								text: "5"
							}]
						}]
					}, {
						tag: "div",
						attrs: {
							"class": "rbmContentSection",
							style: G
						},
						children: [{
							tag: "label",
							text: "Your Tags: "
						}, {
							cache: "tags",
							tag: "span",
							attrs: {
								"class": "rbmTags"
							},
							text: "Loading..."
						}]
					}, {
						tag: "div",
						attrs: {
							"class": "rbmContentSection",
							style: G
						},
						children: [{
							tag: "label",
							text: "Selected Tags (space delimited): "
						}, {
							cache: "tagInput",
							tag: "input",
							attrs: {
								"class": "rbmNewTags",
								style: "box-sizing: border-box; width: 100%;",
								type: "text"
							}
						}]
					}, {
						tag: "div",
						attrs: {
							"class": "rbmContentSection",
							style: "padding: 10px; margin-top: 10px; background-color: #f5f5f5; border: 1px solid #ddd;"
						},
						children: [{
							tag: "div",
							attrs: {
								style: "font-weight: bold;"
							},
							text: "Statement Preview"
						}, {
							cache: "previewStatement",
							tag: "span",
							attrs: {
								"class": "rbmPreviewStatement"
							},
							text: ""
						}]
					}, {
						tag: "div",
						attrs: {
							"class": "rbmContentSection",
							style: "padding: 10px; margin-top: 10px; background-color: #f5f5f5; border: 1px solid #ddd; font-size: 66%;"
						},
						children: [{
							tag: "div",
							attrs: {
								style: "font-weight: bold;"
							},
							text: "Previous Records"
						}, {
							cache: "previousRecords",
							tag: "div",
							attrs: {
								"class": "rbmPreviousRecords"
							},
							text: "Loading..."
						}]
					}, {
						tag: "div",
						attrs: {
							"class": "rbmContentSection",
							style: G
						},
						children: [{
							cache: "sendStatementBtn",
							tag: "button",
							attrs: {
								"class": "rbmSendStatement"
							},
							text: "Send Statement"
						}, {
							cache: "msg",
							tag: "span",
							attrs: {
								"class": "rbmMessage",
								style: "padding-left: 0.5em;"
							},
							text: ""
						}]
					}]
				}]
			},
			I = {},
			J = [{
				display: "experienced",
				id: "http://adlnet.gov/expapi/verbs/experienced"
			}, {
				display: "read",
				id: "http://activitystrea.ms/schema/1.0/read"
			}, {
				display: "bookmarked",
				id: "http://id.tincanapi.com/verb/bookmarked"
			}, {
				display: "tweeted",
				id: "http://id.tincanapi.com/verb/tweeted"
			}],
			K = {},
			L = ["utm_source", "utm_medium", "utm_term", "utm_content", "utm_campaign"],
			M = {};
		p = new TinCan.Activity({
			id: x,
			definition: {
				type: y
			}
		}), q = new TinCan.LRS({
			endpoint: window.rbmEndpoint,
			auth: window.rbmAuth,
			allowFail: !1
		}), t = new TinCan.Agent({
			mbox: window.rbmEmail,
			name: window.rbmName
		}), u = new TinCan.Activity({
			definition: {
				name: {
					"en-US": document.title
				},
				type: w
			}
		}), r = {
			actor: t,
			object: u,
			context: {
				registration: E,
				contextActivities: {
					category: [p]
				},
				extensions: {
					"http://id.tincanapi.com/extension/browser-info": {
						code_name: navigator.appCodeName,
						name: navigator.appName,
						version: navigator.appVersion,
						platform: navigator.platform,
						"user-agent-header": navigator.userAgent,
						"cookies-enabled": navigator.cookieEnabled
					}
				}
			}
		}, a(H, document.body), b(), c(), d(), i(), k(), o(), setTimeout(function () {
			e(F)
		}, 75)
	}
