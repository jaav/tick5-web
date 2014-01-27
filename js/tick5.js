var pair_styles = ["toycamera", "squared", "vintage2", "cartoon", "thermography"];
var unpair_styles = ["toycamera", "squared", "vintage2", "cartoon", "thermography"];
var current_styles;
var current_style = "thermography";
var previousKey;
var historyCounter = 10;
$(document).ready(function () {

	previousKey = pub_key;
	doGetItems(pub_key);
	/*$("img.logo").click(function (ev) {
		ev.preventDefault();
		$(".title_container").animate({
			top: -20
		}, 400, function () {
			$('#dblnd').modal()
		});
	});*/
	/*$('#dblnd').on('hidden.bs.modal', function () {
		$(".title_container").animate({
			top: -336
		}, 400);
	});*/
	$('#footer a img').mouseover(function(ev){
		ev.preventDefault();
		$(this).animate({
			width: 32,
			marginTop: -12
		}, 200);
		$(this).parent().animate({
			marginRight: 8
		}, 200);
	});
	$('#footer a img').mouseout(function(ev){
		ev.preventDefault();
		$(this).animate({
			width: 20,
			marginTop: 0
		}, 200);
		$(this).parent().animate({
			marginRight: 20
		}, 200);
	});
	$('#share').click(function (e) {
		e.preventDefault();
		$(this).attr('href', "https://twitter.com/intent/tweet?text=Discovering 'Double Blind' showing the hottest tech news every quarter on the quarter - http://dblnd.com");
		twttr.events.bind('tweet', function (ev) {});
	});
	$('#history').click(function (e) {
		e.preventDefault();
		historyCounter--;
		if(historyCounter>0){
			var newKey = getPreviousKey();
			doGetItems(newKey);
			previousKey = newKey;
			removeOldTicks();
		}
		else{
			doGetItems(pub_key);
			previousKey = pub_key;
			removeOldTicks();
			$('#historyEnd').modal();
		}
	});
});

var removeOldTicks = function(){
	$('div#makeMeScrollable div.scrollWrapper div.scrollableArea div.tweet').each(function(index) {
		if(index<5)
	    $(this).remove();
		else return;
	});
}

var getPreviousKey = function(){
	//var previousKey = '2014_01_20_04_Q4';
	if(previousKey.indexOf('Q4')>0) return previousKey.substr(0, 15)+ '3';
	if(previousKey.indexOf('Q3')>0) return previousKey.substr(0, 15)+ '2';
	if(previousKey.indexOf('Q2')>0) return previousKey.substr(0, 15)+ '1';
	if(previousKey.indexOf('Q1')>0){
		var hour = parseInt(previousKey.substr(11, 2));
		if(hour>0 && hour<11) return previousKey.substr(0, 11)+ '0' +(hour-1)+ '_Q4';
		else if(hour > 10) return previousKey.substr(0, 11)+ (hour-1)+ '_Q4';
		else{
			var today = new Date();
			today.setDate(today.getDate() - 1);
			var dateString = today.format("yyyy_mm_dd_");
				return(dateString+'23_Q4');
		}

	}
}


var doGetItems = function(key){
	$.getJSON('/api/ticks/' + key, function (data) {
		var items = [];

		var enrichTweet = function (tweetContent, urls, pics) {
			if (urls != undefined && urls.length > 0) {
				tweetContent = replaceLinks(tweetContent, urls);
			}
			tweetContent = replaceHashtagsWithLinks(tweetContent);
			tweetContent = replaceMentionsWithLinks(tweetContent);
			if(tweetContent.indexOf('"')==0) return tweetContent;
			else return '"'+tweetContent+'"';
		}

		var replaceLinks = function(tweetContent, urls){
			var counter = -1;
			return tweetContent.replace(/https?:\/\/[^\s]*/g, function(i, match, c, d) {
					counter++;
					if(urls.length > counter){
						var tiny_url = urls[counter].substr(0, urls[counter].indexOf('/', 8))+'/...';
				    return '<a href="'+urls[counter]+'" target="_blank">'+tiny_url+'</a>';
					}
					else return '';
			});
		}

		var replaceMentionsWithLinks = function( text ) {
		    return text.replace(/@([a-z\d_]+)/ig, '<a href="http://twitter.com/$1" target="_blank">@$1</a>');
		}

		var replaceHashtagsWithLinks = function( text ) {
		    return text.replace(/\s#([a-z\d_]+)/ig, ' <a href="https://twitter.com/search?q=%23$1" target="_blank">#$1</a>');
		}


		$.each(data.tweets, function (key, val) {
			if (val.id.indexOf("Q2") > 0 || val.id.indexOf("Q4") > 0) current_styles = pair_styles;
			else current_styles = unpair_styles;
			var enrichedTweet = enrichTweet(val.tweet, val.urls);
			var urls = [];
			if (val.urls != undefined && val.urls.length > 0) {
				$.each(val.urls, function (i, el) {
					var myregex = /^(https?:\/\/[^/]+)/;
					var matches = myregex.exec(el);
					if (matches != null && matches[1] != null)
						var new_url = matches[1] + "/...";
					else var new_url = el;
					urls.push('<a href="' + el + '" target="_blank">' + new_url + '</a>');
				});
			}
			if (val.image == null || val.image.length == 'undefined') val.image = 'no_image';
			/*var httpurls = "";
			if (urls.length > 0)
				httpurls = '<div class="urls">' + urls.join(" - ") + '</div>';*/
			items.push('<div class="tweet"><img class="real" src="/repo/datatracker_images/' + val.image + '_' + current_styles[0] + '.jpg" width="420px"><img src="images/template_w.png" width="420" style="position:absolute;top:0;left:0;" /><div class="content_container"><div class="content">' + enrichedTweet + '</div><div class="retweet"><a href="https://twitter.com/intent/tweet?text='+encodeURIComponent(val.tweet)+' - via @'+val.author+' and @dblnd'+'"><img src="images/share.png" /></a></div><div class="author"><a href="http://twitter.com/#!/' + val.author + '" target="_blank">@' + val.author + '</a></div> </div></div > ');
		});

		$(items.join('')).appendTo('div#makeMeScrollable div.scrollWrapper div.scrollableArea');
		$("div#makeMeScrollable").smoothDivScroll({
			mousewheelScrolling: true,
			manualContinuousScrolling: true,
			touchScrolling: true,
			visibleHotSpotBackgrounds: "always",
			autoScrollingMode: ""});
		$('.tweet>img').click(function (ev) {
			ev.preventDefault();
			var prev_style = current_style;
			if (current_style == 'thermography') current_style = current_styles[0];
			else {
				var test = $.inArray(current_style, current_styles);
				current_style = current_styles[$.inArray(current_style, current_styles) + 1];
			}
			var fancyImage = $(this).closest('.tweet').children('img.real');
			var newSrc = $(fancyImage).attr('src').replace(prev_style, current_style);
			$(fancyImage).attr('src', newSrc);
		});
		$('.retweet a').click(function (ev) {
			ev.preventDefault();
			twttr.events.bind('tweet', function (ev) {
				alert('tweet');
			});
		});
	});
}

window.twttr = (function (d, s, id) {
	var t, js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) return;
	js = d.createElement(s);
	js.id = id;
	js.src = "//platform.twitter.com/widgets.js";
	fjs.parentNode.insertBefore(js, fjs);
	return window.twttr || (t = { _e: [], ready: function (f) {
		t._e.push(f);
	} });
}(document, "script", "twitter-wjs"));