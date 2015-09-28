/*global $, document, EnhancedPostMessage, TinCan, setTimeout, Handlebars*/

$(document).foundation();

EnhancedPostMessage({listeners: {getPageData: processPageData}});

function processPageData(pageData) {
	var title = document.getElementById('page-title-text-create'),
		thisFavicon = document.getElementById('favicon-create'),
		pageTitle = pageData[0],
		favicon = pageData[1],
		username = pageData[2],
		email = pageData[3],
		pageHref = pageData[4],
		selectedText = pageData[5],
		lrsEndpoint = pageData[6],
		lrsUsername = pageData[7],
		lrsPassword = pageData[8];
	thisFavicon.src = favicon;
	//temp
//	document.getElementById('tempfavicon').src = favicon;
//	document.getElementById('temptitle').innerHTML = pageTitle;
	//end temp
	title.innerHTML = pageTitle;
	$(title).removeClass('hidden').addClass('fadein');

	var userRating, learned, remember, quote, recommendAnswer,
	learnedLabel = $('label[for="learned"]')[0].innerHTML,
	rememberLabel = $('label[for="remember"]')[0].innerHTML,
	quoteLabel = $('label[for="quote"]')[0].innerHTML,
	recommendLabel = $('label[for="recommend"]')[0].innerHTML;

	$("#learned").blur(function() {learned = this.value;});
	$("#remember").blur(function() {remember = this.value;});
	$("#quote").blur(function() {quote = this.value;});

	$(".recommend").on('click', function() {
		recommendAnswer = $(".recommend:checked").val();
	});

	$(".userRating").on('click', function() {
		userRating = Number($(".userRating:checked").val());
	});

	$("#add-selected").on('click', function() {
		EnhancedPostMessage.trigger('getNewSelectionText', 'parent');
	});

	EnhancedPostMessage({listeners: {sendSelectedText: addNewSelected}});

	function addNewSelected(text) {
		selectedText = text;
		addSelected();
	}

	function addSelected() {
		var input = $('#quote');
		if (input.val().indexOf(selectedText) > -1) {return;}
		else {
			input.val(input.val() + selectedText);
			quote = input.val();
		}
		return false;
	}

	addSelected();

	// Tin Can config
	// ----------------------------------------------------------->>>
	var tincan = new TinCan({
		actor: {
			name: username,
			mbox: "mailto:" + email
		},
		recordStores: [{
			endpoint: lrsEndpoint,
			auth: "Basic " + TinCan.Utils.getBase64String(lrsUsername+":"+lrsPassword),
			allowFail: false
	}]
	});

	TinCan.DEBUG = true;


	var ruuid = TinCan.Utils.getUUID();

	var bookmarked = {
		id: "http://id.tincanapi.com/verb/bookmarked",
		display: { "en-US": "bookmarked" }
	};

	var thisActivity = {
		id: "http://id.tincanapi.com/recipe/bookmarklet/base/1",
		definition: {	type: "http://id.tincanapi.com/activitytype/recipe"	}
	};

	var qualityID = "http://id.tincanapi.com/extension/quality-rating",
			learnedID = "http://www.torrancelearning.com/xapi/bookmarklet/freeform/learned",
			rememberID = "http://www.torrancelearning.com/xapi/bookmarklet/freeform/remember",
			quoteID = "http://www.torrancelearning.com/xapi/bookmarklet/freeform/quote",
			recommendID = "http://www.torrancelearning.com/xapi/bookmarklet/recommend",
			faviconID = "http://www.torrancelearning.com/xapi/bookmarklet/favicon";

	var getStateCfg = {
		activity: thisActivity,
//		registration: ruuid,
		callback: getStateCallback
	};

	function uniq(a) {
		var seen = {};
		return a.filter(function(item) {
			return seen.hasOwnProperty(item) ? false : (seen[item] = true);
		});
	}

	var savedTags = [];

	function getStateCallback (error, state) {
		if (error !== null) {console.log('error:', error);}
		var	tagList = $('#tags');
		if (state !== null || undefined || "") {
			$('#tags').removeClass('hidden').addClass('fadein');
			savedTags = uniq(state.contents.tags);
			$(savedTags).each(function(index, tagName) {
				var newTag = document.createElement('a');
				newTag.href = '#';
				newTag.innerHTML = tagName + " ";
				tagList.append(newTag);
			});

			$('.tags-select a').click(function() {
				var value = $(this).text(),
						input = $('#user-tags-input');
				if (input.val().indexOf(value) > -1) {return;}
				else {input.val(input.val() + value);}
		//		$(this).addClass('hidden');
				return false;
			});
		}
		else {$(tagList).removeClass('hidden').html("No tags saved.");}
	}

	var getMore;
	function queryLRS() {
		tincan.getStatements({
			params: {
				//activity doesn't work on SCORM Cloud for some reason
				verb: bookmarked,
				limit: 5
			},
			callback: function (err, result) {
				if (err !== null) {
					// handle error
					return;
				}
				getMore = result.more;
				console.log('tincan:', tincan);
				console.log('getMore:', getMore);
				var retStmts = result.statements;
				compileHandlebars(retStmts);
				console.log("retStmts: ", retStmts);
				$(retStmts).each(function(){
					var extensions = this.context.extensions;
//					console.log('qualityID:', extensions[qualityID]);
//					console.log('learnedID:', extensions[learnedID]);
					console.log('favicon:', extensions[faviconID]);
					//search - document.documentElement.innerHTML.indexOf('text to search');
				});

			}
		});
	}

	function compileHandlebars(content) {
		var historyListSource   = $("#history-list-item-template").html();
		var historyListTemplate = Handlebars.compile(historyListSource);
		var html = historyListTemplate(content);
		console.log('content:', content);
		console.log('html:', html);
		$('#history-list').append(html);
	}

	Handlebars.registerHelper('favicon', function(extensions) {
		return extensions[faviconID];
	});

	function getMoreStmts() {
		tincan.recordStores[0].moreStatements({
			url: getMore,
			callback: function(err, response) {
				console.log('response:', response);
			}
		});
	}

	$('#test-button').on('click', getMoreStmts);

	tincan.getState("tags", getStateCfg);
	setTimeout(queryLRS, 2000);

	function createStmt() {
		if (userRating === undefined) {userRating = 0;}

		var userTags = [], xapiTags = [],
				tagInput = $('#user-tags-input')[0].value;
		tagInput = tagInput.trim();
		userTags = tagInput.split(" ");
		userTags = uniq(userTags);

		$(userTags).each(function(index, tagName){
			var thisTag = {
				id:"http://id.tincanapi.com/activity/tags/" + tagName,
				definition: {type:"http://id.tincanapi.com/activitytype/tag"}
			};
			xapiTags.push(thisTag);
		});

		var setStateCfg = {
			activity: thisActivity,
	//		registration: ruuid,
	//		lastSHA1: "", //TinCan.Utils.getSHA1String(a)
			contentType: "application/json",
			callback: function(err, setState) {
				console.log('err:', err);
				console.log('setState:', setState);
			}
		};

		var combinedTags = savedTags.concat(userTags);
			console.log('combinedTags:', combinedTags);
		var setStateTags = {"tags": combinedTags};

		tincan.setState("tags", setStateTags, setStateCfg);

	var bookmark = {
		verb: bookmarked,
		target: {
			id: pageHref,
			definition: {
				name: {
					"en-US": pageTitle
				},
				type: "http://activitystrea.ms/schema/1.0/page"
			}
		},
		context: {
			registration: ruuid,
			contextActivities: {
				category: thisActivity,
				other: xapiTags
			},
			extensions: {}
		}
	};

	bookmark.context.extensions[qualityID] = {
		"min":1,
		"max":5,
		"raw":userRating
	};

	bookmark.context.extensions[learnedID] = {
		"label": learnedLabel,
		"response": learned
	};

	bookmark.context.extensions[rememberID] = {
		"label": rememberLabel,
		"response": remember,
	};

	bookmark.context.extensions[quoteID] = {
		"label": quoteLabel,
		"response": quote,
	};

	bookmark.context.extensions[recommendID] = {
		"label": recommendLabel,
		"response": recommendAnswer,
	};

	bookmark.context.extensions[faviconID] = favicon;

	tincan.sendStatement(bookmark, sendCallback);
}

	$('#add-button').on('click', createStmt);

	$('#close-frame').on('click', function () {
		EnhancedPostMessage.trigger('closeBookmarklet', 'parent');
	});

	$(document).keydown(function(e) {
		if (e.keyCode === 27) {
			EnhancedPostMessage.trigger('closeBookmarklet', 'parent');
		}
	});

	function animateAlert(element) {
		$(element).removeClass('hidden').addClass('slide-up');
		setTimeout(function(){
			$(element).addClass('slide-down').removeClass('slide-up');
				setTimeout(function() {
					$(element).addClass('hidden').removeClass('slide-down');
				}, 500);
		}, 3000);
	}

	function sendCallback(status, stmtID) {
		var sentStatus = status[0].xhr.status;
		if (sentStatus === 0 || sentStatus === 400) {
			console.log("FAIL: sentStatus = " + sentStatus);
			animateAlert($('#tincan-fail'));
		} else {
			console.log("SUCCESS: sentStatus  = " + sentStatus);
			animateAlert($('#tincan-ok'));
		}
		console.log('stmtID:', stmtID);
	}

}//end processPageData
