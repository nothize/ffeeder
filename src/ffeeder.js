var Default = {
	fid: '111'
}
window["Default"] = Default

function popup_init() {
	console.log("popup_init")
	var fid = getFid();
	
	$("<img src='" + chrome.extension.getURL("images/loading.gif") + "'/>").appendTo("#loading")
	
	$.get("http://computer.discuss.com.hk/forumdisplay.php?fid=" + fid, function (data) {
		var site = "www.discuss.com.hk/";
		var html = $(data);

		var forumInfo = getForumInfo(html);
		$("#c").append("<div>" + createLink(site + forumInfo.groupHref, forumInfo.groupName) + "</div>");

		var list = getThreadTopics(html);
		
		if ( list.length > 0 ) {
			var maxtime = list[0].lptime;
			console.log(localStorage.maxtime);
			localStorage.maxtime = maxtime;
		}

		var divs = [];

		$.each(list, function(i) {
			divs[divs.length] = createRow([i+1, this.lptime, this.lpname, {c:"rcell",t:this.replies}, {c:"rcell",t:this.read}, this.op, 
				createLink("computer.discuss.com.hk/" + this.link, "<div class='topic'>" + this.topic + "</div>")]);
		});

		var header = createRow(["#", "Last reply", "Last poster", {c:"rcell", t:"Replies"}, {c:"rcell", t:"Read"}, "Original poster", "Topic"], {rowClass:"hrow"});
		var c = $("<div class='table'>" + header + divs.join("") + "</div>");
		c.hide()
		$("#c").append(c);
		$("#loading").hide();
		c.show();
	});
}

window["popup_init"]=popup_init;

function createRow(cells, prop) {
	var rowClass = (prop && prop.rowClass) || "row";
	var s = ["<div class='" + rowClass + "'>"]
	$.each(cells, function() {
		var clz;
		var text;

		if ( typeof(this) != "string" && this.t ) {
			clz = this.c;
			text = this.t;
		} else {
			clz = "cell";
			text = this;
		}
		s[s.length] = "<div class='" + clz + "'>" + text + "</div>";
	});
	s[s.length] = "</div>";
	return s.join("");
}

function createLink(href, title) {
	return "<a target='_blank' href='http://referer.us/" + href + "'>" + title + "</a>";
}


function getForumInfo(d) {
	var mainbox = $(".mainbox a:first", d);
	var groupHref = mainbox.attr("href");
	var groupName = mainbox.text();
	
	return { groupHref: groupHref, groupName: groupName };
}

function getThreadTopics(d) {
	var cats = $(".category", d);
	var e;
	
	cats.each(function (i) {
		e = $(this).next().get(0);
		if ( /normalthread/.test(e.id) ) {
			return false;
		}
	});
	
	return extractTopics(e);

	function extractTopics(e) {
		var list = [];
		var topics = $("~ tbody", e).andSelf();
		
		topics.each(function() {
			if ( /normalthread/.test(this.id) ) {
				var topic = $("span:first", this).text();
				var op = $("td.author a", this).text();
				var counter = $("td.nums", this).text();
				var lastpost = $("td.lastpost", this);
				var lptime = $("span", lastpost).attr("title");
				var lpname = $("cite a", lastpost).text();
				var link = $("a:first", lastpost).attr("href");
				counter = counter.split(" / ");
				var replies = counter[0];
				var read = counter[1];
				
				var time = t2s(new Date(lptime));
				
				list[list.length] = ({topic: topic, op: op, replies: replies, read: read, lptime: time, lpname: lpname, link: link});
			}
		});
		
		return list;
	}
}

function t2s(time) {
	function lpad(n, i) {
		var s = "0000";
		var i = i || 2;
		s += n;
		return s.substring(s.length - i, s.length);
	}
	return time.getFullYear() + "-" + lpad(1+time.getMonth()) + "-" + lpad(time.getDate()) + " " + lpad(time.getHours()) + ":" + lpad(time.getMinutes());
}

function getFid() {
	return g("fid") || Default.fid;
}
function setFid(fid) {
	s("fid", fid);
}

function g(k) {
	return localStorage[k]
}

function s(k, v) {
	localStorage[k] = v
}

function gn0(n) {
	return document.getElementsByName(n)[0]
}
function id(n) {
	return document.getElementById(n)
}

window["id"] = id;
window["gn0"] = gn0;
window["s"] = s;
window["g"] = g;
window["getFid"] = getFid;
window["setFid"] = setFid;

window["t2s"] = t2s;
window["getForumInfo"] = getForumInfo;
window["getThreadTopics"] = getThreadTopics