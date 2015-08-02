/*global $, document, EnhancedPostMessage, TinCan*/

$(document).foundation();

EnhancedPostMessage({listeners: {getPageData: processPageData}});

function processPageData(pageData) {
	var title = document.getElementById('page-title-text'),
		thisFavicon = document.getElementById('favicon'),
		pageTitle = pageData[0],
		favicon = pageData[1],
		username = pageData[2],
		email = pageData[3],
		pageHref = pageData[4];
	thisFavicon.src = favicon;
	title.innerHTML = pageTitle;
	$(title).removeClass('hidden').addClass('fadein');

	var userRating, learned, remember, recommendAnswer,
	learnedLabel = $('label[for="learned"]')[0].innerHTML,
	rememberLabel = $('label[for="remember"]')[0].innerHTML,
	recommendLabel = $('label[for="recommend"]')[0].innerHTML;

	$("#learned").blur(function() {learned = this.value;});
	$("#remember").blur(function() {remember = this.value;});

	$(".recommend").on('click', function() {
		recommendAnswer = $(".recommend:checked").val();
		console.log('recommendAnswer:', recommendAnswer);
	});

	$(".userRating").on('click', function() {
		userRating = Number($(".userRating:checked").val());
	});


	// Tin Can config
	// ----------------------------------------------------------->>>
	var tincan = new TinCan({
		actor: {
			name: username,
			mbox: "mailto:" + email
		},
		recordStores: [{
			// SCORM Cloud Test App(sandbox) ----->>
			endpoint: "https://cloud.scorm.com/tc/0JVWBNRYM0/sandbox/",
			auth: "Basic MEpWV0JOUllNMDpRejlrZ1oxUXpJa1JSNDZYVmlNcG81aHp6Qm1aY2RxRzNmYk5ESUNl",
			allowFail: false
	}]
	});

	TinCan.DEBUG = true;

	var ruuid = TinCan.Utils.getUUID();

	var thisActivity =  {
		id: "http://id.tincanapi.com/recipe/bookmarklet/base/1",
		definition: {
			type: "http://id.tincanapi.com/activitytype/recipe"
		}
	};

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

	function getStateCallback (err, state) {
		console.log('err:', err);
		if (state !== null || undefined || "") {
			$('#tag-row').removeClass('hidden').addClass('fadein');
		}
		var	tagList = $('#tags');
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

	tincan.getState("tags", getStateCfg);

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
		verb: {
			id: "http://id.tincanapi.com/verb/bookmarked",
			display: {
				"en-US": "bookmarked"
			}
		},
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
			extensions: {
				"http://id.tincanapi.com/extension/quality-rating": {
					"min":1,
					"max":5,
					"raw":userRating
				},
				"http://www.torrancelearning.com/xapi/bookmarklet/freeform/learned": {
					"label": learnedLabel,
					"response": learned,
				},
				"http://www.torrancelearning.com/xapi/bookmarklet/freeform/remember": {
					"label": rememberLabel,
					"response": remember,
				},
				"http://www.torrancelearning.com/xapi/bookmarklet/recommend": {
					"label": recommendLabel,
					"response": recommendAnswer,
				},
				"http://www.torrancelearning.com/xapi/bookmarklet/favicon": favicon
			}
		}
	};

	tincan.sendStatement(bookmark, sendCallback);
}

	$('#add-button').on('click', createStmt);

	$('#close-frame').on('click', function () {
		EnhancedPostMessage.trigger('closeBookmarklet', 'parent');
	});

	function sendCallback(status, stmtID) {
		var sentStatus = status[0].xhr.status;
		if (sentStatus === 0 || sentStatus === 400) {
			console.log("FAIL: sentStatus = " + sentStatus);
			$('#tincan-fail').removeClass('hidden').addClass('animate-up');
		} else {
			console.log("SUCCESS: sentStatus  = " + sentStatus);
			$('#tincan-ok').removeClass('hidden').addClass('animate-up');
		}
		console.log('stmtID:', stmtID);
	}

}//end processPageData
