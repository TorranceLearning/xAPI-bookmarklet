javascript: function rbm() {
	window.rbmAuth = "Basic VGVzdDpWR1Z6ZEZWelpYSTZjR0Z6YzNkdmNtUT0=",
		window.rbmEndpoint = "https://cloud.scorm.com/tc/public/",
		window.rbmEmail = "mpkliewer@gmail.com",
		window.rbmName = "Matthew";
	var a = document,
		b = a.createElement("sc" + "ript"),
		c = a.body,
		d = a.location;
	b.setAttribute("src", "http://www.torrancelearning.com/xapi/bookmarklet/bookmarklet.js");
	c.appendChild(b);
}
if (window.jQuery) {
		rbm();
} else {
		var a = document,
		b = a.createElement("sc" + "ript"),
		c = a.body,
		d = a.location;
		b.setAttribute("src", "http://code.jquery.com/jquery-2.1.3.js");
		c.appendChild(b);
		rbm();
}
void 0;
