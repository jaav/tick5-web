var pair_styles = ["toycamera", "squared", "vintage2", "cartoon", "thermography"];
var unpair_styles = ["toycamera", "squared", "vintage2", "cartoon", "thermography"];
var current_styles;
var current_style = "thermography";
$(document).ready(function () {


	$.getJSON('/api/ticks/' + pub_key, function (data) {
		var items = [];

		var enrichTweet = function (tweetContent, hashtags) {
			var myregex = /https?:\/\/[^\s]*/g;
			tweetContent = tweetContent.replace(myregex, ' ');
			if (hashtags != undefined && hashtags.length > 0) {
				for (var i = 0; i < hashtags.length; i++) {
					var tag = hashtags[i];
					var regex = new RegExp('#' + tag);
					tweetContent = tweetContent.replace(regex, '<a href="https://twitter.com/search?q=%23' + tag + '" target="_blank">#' + tag + '</a>');
				}
			}

			return tweetContent;
		}


		$.each(data.tweets, function (key, val) {
			if (val.id.indexOf("Q2") > 0 || val.id.indexOf("Q4") > 0) current_styles = pair_styles;
			else current_styles = unpair_styles;
			var enrichedTweet = enrichTweet(val.tweet, val.hashtags);
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
			var httpurls = "";
			if (urls.length > 0)
				httpurls = '<div class="urls">' + urls.join(" - ") + '</div>';
				items.push('<div class="tweet"><img class="real" src="/repo/datatracker_images/' + val.image + '_' + current_styles[0] + '.jpg" width="460px"><img src="images/template_w.png" width="480" style="position:absolute;top:0;left:0;" /><div class="content_container"><div class="content">\"' + enrichedTweet + '\"</div>' + httpurls + '<div class="retweet"><a href="https://twitter.com/intent/tweet?text='+encodeURIComponent(val.tweet)+' - via @'+val.author+' and @dblnd'+'"><img src="../images/share.png" /></a></div><div class="author"><a href="http://twitter.com/#!/' + val.author + '" target="_blank">@' + val.author + '</a></div> </div></div > ');
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
	$("img.logo").click(function (ev) {
		ev.preventDefault();
		$(".title_container").animate({
			top: -20
		}, 400, function () {
			$('#dblnd').modal()
		});
	});
	$('#dblnd').on('hidden.bs.modal', function () {
		$(".title_container").animate({
			top: -336
		}, 400);
	});
	$('#share').click(function (e) {
		e.preventDefault();
		$(this).attr('href', "https://twitter.com/intent/tweet?text=Discovering 'Double Blind' showing the hottest tech news every quarter on the quarter - http://dblnd.com");
		twttr.events.bind('tweet', function (ev) {
			alert('tweet');
		});

	});
});

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