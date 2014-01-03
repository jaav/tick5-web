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

		var getFilter = function (path) {
			var myRe = /_(\w*)\./g;
			var result = myRe.exec(path)[0];
			if (result) return result.substring(1, result.length - 1);
		}
		var about = 'We constantly scan all tweets published by a panel of about 2000 multidisciplinary techies, mostly software developers from all over the world. Every 15 minutes on the 15th minute, we filter out the 5 most important/popular entries and publish them here and on our <a href="">android app</a> (iOS is underway).';

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
			items.push('<div class="tweet"><img class="real" src="/repo/datatracker_images/' + val.image + '_cartoon.jpg"><img src="../images/template_w_b.png" class="border" /><div class="about"><a href="#"><img src="../images/db_sq_logo_32.png" /></a></div><div class="retweet"><a href="twitter://post?message='+encodeURIComponent(val.tweet)+' - via @'+val.author+' and @dblnd'+'"><img src="../images/share.png" /></a></div><div class="content_container"><div class="content">\"' + enrichedTweet + '\"</div>' + httpurls + '<div class="author"><a href="http://twitter.com/#!/' + val.author + '" target="_blank">@' + val.author + '</a></div></div><div class="about_container"><div class="about_header">Welcome to \'Double Blind\'</div><div class="about_content">'+about+'</div><div class="up"><a href="#"><img src="../images/up_32.png" /></a></div></div></div>');
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

		window.mySwipe = $('#mySwipe').Swipe().data('Swipe');

		$('.about').click(function(ev){
			ev.preventDefault();
			$('.about_header').show();
			$('.about_content').show();
			$('.up').show();
			$('html, body').animate({scrollTop:$(document).height()});
		});
		$('.up').click(function(ev){
			ev.preventDefault();
			$('html, body').animate({scrollTop:0}, function(){
				$('.about_header').hide();
				$('.about_content').hide();
				$('.up').hide();
			});
		});
	});
});