/*global window, document, requestAnimationFrame, EnhancedPostMessage, setTimeout*/

var s = document.createElement('script');
s.src = 'http://www.torrancelearning.com/xapi/bookmarklet/EnhancedPostMessage.js';
s.type= 'text/javascript';

document.getElementsByTagName('head')[0].appendChild(s);

function animate() {

	var animationStartTime = 0;
	var animationDuration = 400;
	var target = document.querySelector('.iframe-animate');

	this.startAnimation = function() {
		animationStartTime = Date.now();
		animationStartTime = animationStartTime + 250;
		requestAnimationFrame(update);
	};

	function update() {
		var currentTime = Date.now();
		var positionInAnimation = (currentTime - animationStartTime) / animationDuration;

		var xPosition = positionInAnimation * -430;
		var yPosition = 0;
//		var yPosition = positionInAnimation * 100;

		target.style.transform = 'translate(' + xPosition + 'px, ' + yPosition + 'px)';
//		target.style.animation = 'move 0.5s ease';
		target.style.animationTimingFunction = 'ease-in-out';

		if (positionInAnimation <= 1) {
			requestAnimationFrame(update);
		}
	}
}

if (document.getElementById('iframe-bookmarklet')) {
	closeBookmarklet();
}

function loadFrame() {
var a = document,
		c = a.body,
		d = a.createElement("iframe");
	d.setAttribute("src", "http://www.torrancelearning.com/xapi/bookmarklet/bookmarklet.html");
	d.setAttribute("id", "iframe-bookmarklet");
	d.setAttribute("class", "iframe-animate");
//	d.setAttribute("sandbox", "allow-same-origin allow-scripts allow-forms");
	d.setAttribute("style", "border-radius: 8px; border:none; box-shadow: -10px 10px 40px #333; position:fixed; top:20px; right:-420px; z-index: 1000000; width:420px; height: 750px;");
	c.appendChild(d);
	var flyIn = new animate();
	flyIn.startAnimation();
	setTimeout(startPostMessage, 1000);
}

function closeBookmarklet(){
var thisFrame = document.getElementById('iframe-bookmarklet');
	document.body.removeChild(thisFrame);
}

var text = "";

function getSelectionText() {
	if (window.getSelection) {
		text = window.getSelection().toString();
	} else if (document.selection && document.selection.type != "Control") {
		text = document.selection.createRange().text;
	}
	return text;
}

setTimeout(loadFrame, 200);

function startPostMessage() {
	getSelectionText();
	EnhancedPostMessage({
		sources: {
			frameSource: document.getElementById('iframe-bookmarklet'),
		},
		listeners: {
			closeBookmarklet: closeBookmarklet,
			getNewSelectionText: getNewSelectionText
		}
	});
	var pageSource = document.title,
			thisDomain = window.location.host,
			thisHref = window.location.href,
			thisFavicon = "http://www.google.com/s2/favicons?domain=" + thisDomain,
			username = window.rbmName,
			email = window.rbmEmail,
			pageData = [pageSource, thisFavicon, username, email, thisHref, text];
	EnhancedPostMessage.trigger('getPageData', 'frameSource', pageData);
}

function getNewSelectionText() {
	getSelectionText();
	EnhancedPostMessage.trigger('sendSelectedText', 'frameSource', text);
}

