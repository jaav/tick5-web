var pair_styles = ["toycamera", "squared", "vintage2", "cartoon", "thermography"];
var unpair_styles = ["toycamera", "squared", "vintage2", "cartoon", "thermography"];
var current_styles;
var current_style = "thermography";
var previousKey;
var historyCounter = 10;
$(document).ready(function () {

	$("#nav")
		.mmenu()
	  .on(
	     "closed.mm",
	     function(a, b, c){
		     if($('#about').parent().hasClass('mm-selected')){
			     $('#about_container').css('display', 'block');
			     $('html > body').animate({scrollTop:1000});
			     $('#about').parent().removeClass('mm-selected');
		     }
	     }
	  );
	previousKey = pub_key;
	doGetItems(pub_key);


	/*$('#about').click(function(ev){
		ev.preventDefault();
		//console.log("Before open. The height is "+$(document).height());
		$('#about_container').css('display', 'block');
		//console.log("Opened. Now the height is "+$(document).height());
		$('html > body').animate({scrollTop:300}, 1000);
		//unselect 'about' item in nav
		$('#about').parent().removeClass('mm-selected');
	});*/
	$('#up').click(function(ev){
		ev.preventDefault();
		$('html, body').animate({scrollTop:0}, function(){
			$('#about_container').css('display', 'none');
		});
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
		}
		else{
			$('#historyEnd').modal()
		}
	});
});


var removeOldTicks = function(){
	var ticks = $('div#mySwipe div.swipe-wrap div.tweet');
	if(ticks.length > 5){
		ticks.each(
			function(index) {
				if(index<5)
			    $(this).remove();
				else return;
			});
	}
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

		var enrichTweet = function (tweetContent, urls) {
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
		    return text.replace(/@([a-z\d_]+)/ig, '<a href="https://mobile.twitter.com/$1" target="_blank">@$1</a>');
		}

		var replaceHashtagsWithLinks = function( text ) {
		    return text.replace(/\s#([a-z\d_]+)/ig, ' <a href="https://mobile.twitter.com/search?q=%23$1" target="_blank">#$1</a>');
		}

		var getFilter = function (path) {
			var myRe = /_(\w*)\./g;
			var result = myRe.exec(path)[0];
			if (result) return result.substring(1, result.length - 1);
		}
		$.each(data.tweets, function (key, val) {
			if (val.id.indexOf("Q2") > 0 || val.id.indexOf("Q4") > 0) current_styles = pair_styles;
			else current_styles = unpair_styles;
			var enrichedTweet = enrichTweet(val.tweet, val.urls);
			/*var tags = [];
			 if(val.hashtags!=undefined && val.hashtags.length>0){
			 $.each(val.hashtags, function(i, el){
			 tags.push('<a href="https://twitter.com/search?q=%23'+el+'" target="_blank">#'+el+'</a>');
			 });
			 }*/
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
			items.push('<div class="tweet"><img class="real" src="/repo/datatracker_images/' + val.image + '_cartoon.jpg"><img src="../images/template_w_b.png" class="border" /><div class="retweet"><a href="https://twitter.com/intent/tweet?text='+encodeURIComponent(val.tweet)+' - via @'+val.author+' and @dblnd'+'"><img src="../images/share.png" /></a></div><div class="content_container"><div class="content">' + enrichedTweet + '</div><div class="author"><a href="http://twitter.com/#!/' + val.author + '" target="_blank">@' + val.author + '</a></div></div></div>');
		});

		$(items.join('')).appendTo('div#mySwipe div.swipe-wrap');
		$('div#mySwipe div.swipe-wrap div.tweet').each(function (index) {
			$(this).click(function () {
				var thisImage = $(this).children('img.real');
				var current_style = getFilter(thisImage.attr('src'));

				if (current_style == 'thermography') var new_style = current_styles[0];
				else {
					var new_style = current_styles[$.inArray(current_style, current_styles) + 1];
				}
				var newSrc = thisImage.attr('src').replace(current_style, new_style);
				thisImage.attr('src', newSrc);
			});
		});
		removeOldTicks();
		window.mySwipe = $('#mySwipe').Swipe().data('Swipe');

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