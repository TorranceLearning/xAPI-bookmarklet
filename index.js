/*global $*/
var username, email,
lrsEndpoint = $("#lrs-endpoint").val(),
lrsUsername = $("#lrs-username").val(),
lrsPassword = $("#lrs-password").val();
$("#username").blur(function() {username = this.value;});
$("#email").blur(function() {email = this.value;});
$("#lrs-endpoint").blur(function() {lrsEndpoint = this.value;});
$("#lrs-username").blur(function() {lrsUsername = this.value;});
$("#lrs-password").blur(function() {lrsPassword = this.value;});


var bookmark;

$('#createBtn').on('click', function(e) {
	e.preventDefault();
	if (username === undefined || email === undefined || lrsEndpoint === undefined || lrsUsername === undefined || lrsPassword === undefined) {
		return;
	}

	bookmark = "javascript:(function(){function rbm(){window.rbmName='"+username+"';window.rbmEmail='"+email+"';lrsEndpoint='"+lrsEndpoint+"';lrsUsername='"+lrsUsername+"';lrsPassword='"+lrsPassword+"';var a=document,b=a.createElement('sc'+'ript'),c=a.body;b.setAttribute('src', 'http://www.torrancelearning.com/xapi/bookmarklet/bookmarklet.js');c.appendChild(b);}rbm();void 0;})();"

	$('#bookmarklet').attr('href', bookmark);
	$('#instruction').addClass('hidden');
	$('#bookmark-fadein').removeClass('hidden').addClass('fadeIn');
	$('#bookmarklet').addClass('tada');
});
