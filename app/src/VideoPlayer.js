/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */

define(function (require, exports, module)
{
    var Engine = require('famous/core/Engine');
    var View = require('famous/core/View');
    var Lightbox = require('famous/views/Lightbox');
	var StateModifier= require('famous/modifiers/StateModifier');
    var Transform = require('famous/core/Transform');
    var Surface = require('famous/core/Surface');
    var ImageSurface=require('famous/surfaces/ImageSurface');
    var Easing = require('famous/transitions/Easing');
    var Timer = require('famous/utilities/Timer');
    var VideoJsSurface = require('RichFamous/VideoJsSurface/VideoJsSurface');
    var VideoTransitionScreen = require('videoTransitionScreen');
    var SeriesEndScreen = require('SeriesEndScreen');

    require('xml2jsobj/xml2jsobj');
    require('MALSupportFunctions');

	function createVideoPlayer()
    {
		var countdown;
		var playData={show:undefined,episode:undefined};
		var videoPlayerNode = new View();
		var screenWidth = window.mainContext.getSize()[0];
		var lightboxTransform = new StateModifier({
		    transform:Transform.translate(0,0,1)
		});
		var lightbox = new Lightbox({
		    inOpacity: 1,
		    outOpacity: 1,
		    inTransform: Transform.translate(screenWidth, 0, 1),
		    outTransform: Transform.translate(-1 * screenWidth, 0, 1),
		    inTransition: { duration: 1000, curve: Easing.outBack },
		    outTransition: { duration: 1000, curve: Easing.inBack }
		});
		Engine.on('resize', function ()
		{
		    screenWidth = window.mainContext.getSize()[0];
		    lightbox.setOptions({
		        inTransform: Transform.translate(screenWidth, 0, 1),
		        outTransform: Transform.translate(-1 * screenWidth, 0, 1)
		    });
		});
		videoPlayerNode.add(lightboxTransform).add(lightbox);

		var playerSurface=VideoJsSurface({},
        { 
            width:'100%',
            height:'100%',
            controls : true,
            autoplay : false,
            preload : 'auto',
            poster: '/content/images/AnimeflixLogo.png'
        });
		playerSurface.on('becameActive', function ()
		{
		    titleBarModifier.setOpacity(0.8, { duration: 1000, curve: Easing.outCubic });
		});
		playerSurface.on('becameInactive', function ()
		{
		    titleBarModifier.setOpacity(0, { duration: 1000, curve: Easing.outCubic });
		});
		videoPlayerNode.add(playerSurface);

		var titleBarHeight = 75;
		var titleBarModifier = new StateModifier({
		    opacity: 0,
		    transform: Transform.translate(0, 0, 1)
		});
		var titleBarModifierNode = videoPlayerNode.add(titleBarModifier);
		var titleBar = new Surface({
		    size: [undefined, titleBarHeight],
		    properties: {
                color:'white',
		        backgroundColor: '#2A2A2A',
                textAlign:'center'
		    }
		});
		titleBarModifierNode.add(titleBar);

		var backToBrowsingButton=new ImageSurface({
			size:[titleBarHeight,titleBarHeight],
			content:'/content/images/AnimeflixBack2.png',
		});
		function backToBrowsing(){
		    if (playerSurface.player!=undefined) {
		        //playerSurface.player.pause();
		        clear();
		        playerSurface.player.exitFullscreen();
		    }
		    videoPlayerNode._eventOutput.emit('backToBrowsing');
		}
		backToBrowsingButton.on('click',backToBrowsing);
		titleBarModifierNode.add(backToBrowsingButton);

		var nextEpisodeButtonTransform = new StateModifier({
		    align: [1, 0],
		    origin: [1, 0],
            transform:Transform.translate(0,8,0)
		});
		var nextEpisodeButton = new ImageSurface({
            size:[true,59],
            content:'/content/images/AnimeflixNextEpisode.png'
		});
		nextEpisodeButton.on('click', nextEpisode);
		titleBarModifierNode.add(nextEpisodeButtonTransform).add(nextEpisodeButton);

		function nextEpisode()
		{
		    //update anime list
		    if (playData.episode > playData.show.my_watched_episodes)
		    {
		        playData.show.my_watched_episodes = playData.episode;
		    }

		    if (playData.episode + 1 > playData.show.series_episodes)
		    {
		        playData.show.my_status = 2;
		        //replace with a more appropriate screen
		        lightbox.show(seriesEndScreen);
		    }
		    else
		    {
		        playData.episode++;
		        videoPlayerNode.play(playData.show, playData.episode);
		    }
		    updateAnime(playData.show);
		}

		var transitionScreen = VideoTransitionScreen();
		transitionScreen.on('backToBrowsing', backToBrowsing);
		transitionScreen.on('finishedCountdown', function ()
		{
		    lightbox.show(playerSurface, function ()
		    {
		        playData.episode++;
		        videoPlayerNode.play(playData.show, playData.episode);
		        updateAnime(playData.show);
		    });
		});

		var seriesEndScreen = SeriesEndScreen();
		seriesEndScreen.on('backToBrowsing',backToBrowsing);

		playerSurface.on('playerLoaded',function(){
		    playerSurface.player.on('ended', function ()
		    {
			    //update anime list
				if (playData.episode > playData.show.my_watched_episodes)
				{
				    playData.show.my_watched_episodes = playData.episode;
				}

				if (playData.episode+1 > playData.show.series_episodes)
				{
				    playData.show.my_status = 2;
				    lightbox.show(seriesEndScreen);
				}
				else
				{
				    lightbox.show(transitionScreen);
				    transitionScreen.startCountdown();
				}
				updateAnime(playData.show);
			});
			videoPlayerNode._eventOutput.emit('playerLoaded');
		});

		var ledgerSwaps=[];
		var showLedger = [];
		if (localStorage.ledger)
		{
		    JSON.parse(localStorage.ledger);
		}

		function processLedger(body)
		{
		    var swapsRequest = new XMLHttpRequest();
		    swapsRequest.open('GET', '/content/data/LocalLedgerSwaps.xml', false);
		    swapsRequest.send();
		    var parser = new DOMParser();
		    var domObj = parser.parseFromString(swapsRequest.response, "text/xml");
		    ledgerSwaps = XML2jsobj(domObj).Root.swap;

		    var resultLedger=[];

		    var index = body.indexOf("class=\"series_index\"");
		    var showName = "";
		    while (showName !== "Login")
		    {
		        index = body.indexOf("<a href=\"", index) + 9;
		        var showLink = body.substring(index, body.indexOf("\"", index));
		        var index2 = body.indexOf(">", index) + 1;
		        showName = body.substring(index2, body.indexOf("<", index2));
		        resultLedger.push({ name: showName, link: showLink });
		    }
		    resultLedger.pop();

		    return resultLedger;
		}

		function getAnimeLedger()
		{
		    var url = "http://www.anime-flix.com/requester.php?m=ledger";
		    var request = new XMLHttpRequest();
		    request.onreadystatechange = function ()
		    {
		        if (request.readyState == 4)
		        {
		            if (request.status == 200)
		            {
		                var processedLedger = processLedger(request.responseText);
		                showLedger = showLedger.concat(processedLedger);
		                localStorage.ledger = JSON.stringify(showLedger);
		            }
		        }
		    };
		    request.open("GET", url, true);
		    request.send();
		}
		function getMovieLedger()
		{
		    var url = "http://www.anime-flix.com/requester.php?m=movieLedger";
		    var request = new XMLHttpRequest();
		    request.onreadystatechange = function ()
		    {
		        if (request.readyState == 4)
		        {
		            if (request.status == 200)
		            {
		                showLedger = showLedger.concat(processLedger(request.responseText));
		                localStorage.ledger = JSON.stringify(showLedger);
		            }
		        }
		    };
		    request.open("GET", url, true);
		    request.send();
		}

	    function getLedger()
	    {
	        showLedger = [];
	        getAnimeLedger();
	        getMovieLedger();
	    }
	    getLedger();

	    videoPlayerNode.play = function (playObject, episode)
	    {
	        playData.show = playObject;
	        playData.episode = episode;

	        lightbox.show(playerSurface);

	        var ledgerItem = getLedgerItem(playObject);
	        if (ledgerItem)
	        {
	            //setting hash
	            window.location.hash = 'video&' + playData.show.series_animedb_id+'&'+playData.episode;

	            titleBar.setContent(playData.show.series_title + ' - Episode ' + episode);

	            url = 'http://www.anime-flix.com/requester.php?m=stream&t=' + ledgerItem.name + '&e=' + episode;
	            var request = new XMLHttpRequest();
	            request.onreadystatechange = function ()
	            {
	                if (request.readyState == 4)
	                {
	                    if (request.status == 200)
	                    {
	                        var body = request.responseText;
	                        playerSurface.play(body);
	                    }
	                }
	            };
	            request.open('POST', url);
	            request.send(ledgerItem.link);
	        }
	        else
	        {
	            window.alert('The show could not be found. Sorry');
	            backToBrowsing();
	        }
	    };

		function getLedgerItem(show)
		{
			var value=false;
			var done=false;

			var titles;
			if((typeof show.series_synonyms)=='string')
			{
				titles=show.series_synonyms.split('; ');
			}
			else
			{
				titles=new Array();
			}
			titles.unshift(show.series_title);

			for (var j = 0; j < titles.length&&!done; j++)
			{
			    var workingTitle=titles[j];
			    while (workingTitle && !done)
			    {
			        for (var i = 0; i < showLedger.length && !done; i++)
			        {
			            if (showLedger[i].name == workingTitle)
			            {
			                value = { name: titles[0], link: showLedger[i].link };
			                if (j>0) {
			                    showLedger.push(value);
			                }
			                done = true;
			            };
			        };
			        workingTitle = trimTitle(workingTitle);
			    };
			};
			if (!value)
			{
			    for (var i = 0; i < ledgerSwaps.length&&!done; i++)
			    {
			        if (ledgerSwaps[i].malName == show.series_title)
			        {
			            for (var j = 0; j < showLedger.length && !done; j++)
			            {
			                if (ledgerSwaps[i].ledgerName == showLedger[j].name)
			                {
			                    value = { name: showLedger[j].name, link: showLedger[j].link };
			                    done = true;
			                }
			            }
			        }
			    }
			}
			return value;
		}

		function trimTitle(s)
		{
		    var index = s.lastIndexOf(' ');
		    var trimmedString = false;
		    if (index > -1)
		    {
		        trimmedString = s.substring(0, index);
		        if (trimmedString.charAt(trimmedString.length - 1) == ':')
		        {
		            trimmedString = trimmedString.substring(0, trimmedString.length - 1);
		        }
		    }
		    return trimmedString;
		}

		function clear()
		{
		    playerSurface.player.src('/content/images/AnimeflixNextEpisode.png');
		};

		lightbox.show(playerSurface);
		return videoPlayerNode;
	}
	module.exports=createVideoPlayer;

});