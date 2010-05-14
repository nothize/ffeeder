var Default = {
	"fid": '111',
	"markAsReadDelay": 5,
	"minScanInterval": 10,
	"maxScanInterval": 3600
}
window["Default"] = Default

var maxTid = 0

function popup_init() {
	console.log("popup_init")
	var fid = getFid();
	
	setTimeout(function() {
		markRead(maxTid)
	}, gd("markAsReadDelay") * 1000)
	
	$("<img src='" + chrome.extension.getURL("images/loading.gif") + "'/>").appendTo("#loading")
	
	var o = getForumData(fid, function(rez) {
		var forumInfo = rez.info
		var list = rez.threads
		
		var site = "www.discuss.com.hk/";
		$("#c").append("<div>" + createLink(site + forumInfo.groupHref, forumInfo.groupName) + "</div>");

		if ( list.length > 0 ) {
			maxTid = list[0].tid
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
	})
}

function getForumData(fid, f) {
	$.get("http://computer.discuss.com.hk/forumdisplay.php?fid=" + fid, function (data) {
		var html = $(data);
		var list = getThreadTopics(html);
		var info = getForumInfo(html);
		rez = { info: info, threads: list }
		f(rez)
	});
}

function markRead(tid) {
	s("lastTid", maxTid)
	s("unread", 0)
	chrome.browserAction.setBadgeText({text:""})
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
				var o = link.match(/tid=([0-9]+)/)
				var tid = o && o[1]
				counter = counter.split(" / ");
				var replies = counter[0];
				var read = counter[1];
				
				var time = t2s(new Date(lptime));
				
				list[list.length] = ({topic: topic, op: op, replies: replies, read: read, lptime: time, lpname: lpname, link: link, tid: tid});
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
	return gd("fid");
}
function setFid(fid) {
	s("fid", fid);
}

function g(k) {
	return localStorage[k]
}
function gi(k) {
	return parseInt(g(k), 10)
}
function gd(k) {
	return g(k) || Default[k]
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
window["gd"] = gd;
window["gi"] = gi;
window["getFid"] = getFid;
window["setFid"] = setFid;

window["t2s"] = t2s;
window["getForumInfo"] = getForumInfo;
window["getThreadTopics"] = getThreadTopics

function Monitor(fid) {
	this.getAtid = function() {
		return g("atid") || 0;
	}
	this.monitor = function() {
		var _this = this;
		
		$.get("http://www.discuss.com.hk/archiver/?fid-" + fid + ".html", 
//		$.get(chrome.extension.getURL("fid-" + fid + ".html"), 
		function (data) {
			var d = $(data)
			var atid = 0
			$("ul.archiver_threadlist a", d).each(function(i) {
				var m = this.href.match(/tid-([0-9]+)/)
				if ( m ) {
					var tid = parseInt(m[1], 10)
					atid += 3*tid % 4567
				}
			});
			if ( atid != _this.getAtid() ) {
				_this.updateAtid(atid)
			}
		});
		
		var msi = gd("minScanInterval");
		setTimeout(function() {_this.monitor()}, msi * 1000)
	}
	this.updateAtid = function(atid) {
		console.log("update atid to " + atid);
		s("atid", atid)
		this.checkNewPost()
	}
	this.addUnread = function(c) {
		var cnt = gi("unread") || 0
		s("unread", cnt += c)
		chrome.browserAction.setBadgeText({text:""+cnt})
		chrome.browserAction.setTitle({title:cnt + " unread since " + g("lpt")})
	}
	this.checkNewPost = function() {
		var _this = this
		getForumData(111, function(rez) {
			var threads = rez.threads
			var info = rez.info
			
			var cnt = 0
			var lpt = g("lpt") || 0
			console.log("b4 lpt = " + lpt)
			
			$.each(threads, function(i) {
				// here is a bug if the post time of two threads are the same, it won't be counted.
				if ( this.lptime <= lpt ) {
					return false
				}
				cnt++
			})
			console.log("a7 lpt = " + threads[0].lptime)
			s("lpt", threads[0].lptime)
			_this.addUnread(cnt)
		})
	}
}

function bg_onload() {
	var bg1 = new Monitor(111)
	bg1.addUnread(0)
	bg1.monitor()
}

window["bg_onload"] = bg_onload