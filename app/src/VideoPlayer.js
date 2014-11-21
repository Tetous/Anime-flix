/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */

define(function (require, exports, module)
{
    var Engine = require('famous/core/Engine');
    var View = require('famous/core/View');
    var RenderController=require('famous/views/RenderController');
    var Lightbox = require('famous/views/Lightbox');
	var StateModifier= require('famous/modifiers/StateModifier');
    var Transform = require('famous/core/Transform');
    var Surface = require('RichFamous/Surface');
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
	    var contentType;
	    var english=false;
	    var streamSources = [];
	    var streamSourcesIndex = 0;
	    var dubStreamSources = [];
	    var dubStreamSourcesIndex = 0;
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
            preload : 'none',//'auto',
            poster: '/content/images/AnimeflixLogo.png'
        });
		playerSurface.on('becameActive', function ()
		{
		    titleBarRenderController.show(titleBarView, { duration: 1000, curve: Easing.outCubic });
		    languageSurface.setContent(language);
		    titleBar.setContent(playData.show.series_title + ' - Episode ' + playData.episode);
		    //titleBarModifier.setOpacity(0.8, { duration: 1000, curve: Easing.outCubic });
		});
		playerSurface.on('becameInactive', function ()
		{
		    titleBarRenderController.hide({ duration: 1000, curve: Easing.outCubic });
		    //titleBarModifier.setOpacity(0, { duration: 1000, curve: Easing.outCubic });
		});
		playerSurface.on('playerError', function (error)
		{
		    switch (error.code)
		    {
		        case 4:
		            switch (contentType)
		            {
		                case 'anime':
		                    if (english)
		                    {
		                        dubStreamSourcesIndex++;
		                        playerSurface.play(dubStreamSources[dubStreamSourcesIndex % dubStreamSources.length]);
		                    }
		                    else
		                    {
		                        streamSourcesIndex++;
		                        playerSurface.play(streamSources[streamSourcesIndex % streamSources.length]);
		                    }
		                    break;
		                case 'movie':
		                    playerSurface.reload();
		                    break;
		                default:
		                    break;
		            }
		            break;
		        default:
		            break;

		    }
		});
		videoPlayerNode.add(playerSurface);

		var titleBarHeight = 75;
		var titleBarRenderController = new RenderController();
		videoPlayerNode.add(titleBarRenderController);
		var titleBarView = new View();
		var titleBarModifier = new StateModifier({
            opacity: 0.8,
		    transform: Transform.translate(0, 0, 1)
		});
		var titleBarModifierNode = titleBarView.add(titleBarModifier);
		var titleBar = Surface({
		    size: [undefined, titleBarHeight],
		    properties: {
                color:'white',
		        backgroundColor: '#2A2A2A',
		        textAlign: 'center',
                verticalAlign:'middle'
		    }
		});
		titleBarModifierNode.add(titleBar);

		var backToBrowsingButtonTransform = new StateModifier({
		    transform:Transform.translate(0,0,2)
		});
		var backToBrowsingButton=new ImageSurface({
			size:[titleBarHeight,titleBarHeight],
			content:'/content/images/AnimeflixBack2.png',
		});
		function backToBrowsing(){
		    if (playerSurface.player != undefined)
		    {
		        //playerSurface.player.pause();
		        clear();
		        playerSurface.player.exitFullscreen();
		    }
		    videoPlayerNode._eventOutput.emit('backToBrowsing');
		}
		backToBrowsingButton.on('click',backToBrowsing);
		titleBarModifierNode.add(backToBrowsingButtonTransform).add(backToBrowsingButton);

		var nextEpisodeButtonRenderController = new RenderController();
		titleBarModifierNode.add(nextEpisodeButtonRenderController);
		var nextEpisodeButtonView = new View();
		var nextEpisodeButtonTransform = new StateModifier({
		    align: [1, 0],
		    origin: [1, 0],
            transform:Transform.translate(0,8,2)
		});
		var nextEpisodeButton = new ImageSurface({
            size:[true,59],
            content:'/content/images/AnimeflixNextEpisode.png'
		});
		nextEpisodeButton.on('click', nextEpisode);
		nextEpisodeButtonView.add(nextEpisodeButtonTransform).add(nextEpisodeButton);

		function nextEpisode()
		{
		    clear();
		    //update anime list
		    if (playData.episode > playData.show.my_watched_episodes)
		    {
		        playData.show.my_watched_episodes = playData.episode;
		    }

		    if (playData.episode + 1 > playData.show.series_episodes)
		    {
		        playData.show.my_status = 2;
		        if (playData.show.my_finish_date ='000-00-00')
		        {
		            var today = new Date();
		            var dd = today.getDate();
		            var mm = today.getMonth() + 1; //January is 0!
		            var yyyy = today.getFullYear();

		            if (dd < 10)
		            {
		                dd = '0' + dd
		            }

		            if (mm < 10)
		            {
		                mm = '0' + mm
		            }
		            playData.show.my_finish_date = yyyy + '-' + mm + '-' + dd;
		        }
		        lightbox.show(seriesEndScreen);
		    }
		    else
		    {
		        playData.episode++;
		        videoPlayerNode.play(playData.show, playData.episode);
		    }
		    updateAnime(playData.show);
		}

		var language = document.createElement('SELECT');
		var subOption = new Option('Sub', 1);
		language.options.add(subOption);
		var dubOption = new Option('Dub', 2);
		language.options.add(dubOption);
		language.addEventListener('change', function ()
		{
		    english = language.options[language.selectedIndex].value == 2;
		    var link = streamSources[streamSourcesIndex];
		    if (english)
		    {
		        link = dubStreamSources[dubStreamSourcesIndex];
		    }
		    playerSurface.playAtSameLocation(link);
		});

		var languageRenderController = new RenderController();
		titleBarModifierNode.add(languageRenderController);
		var languageView = new View();
		var languageTransform = new StateModifier({
		    align: [1, 0],
		    origin: [1, 0],
		    transform: Transform.translate(-130, 8, 2)
		});
		var languageSurface = Surface({
		    size: [true, titleBarHeight],
		    content: language,
		    properties: {
		        vertialAlign:'middle'
		    }
		});
		languageView.add(languageTransform).add(languageSurface);

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
		        switch (contentType)
		        {
		            case 'movie':
		                if (english)
		                {
		                    dubStreamSourcesIndex++;
		                    if (dubStreamSourcesIndex < dubStreamSources.length)
		                    {
		                        playerSurface.play(dubStreamSources[dubStreamSourcesIndex]);
		                    }
		                    else
		                    {
		                        if (playData.episode > playData.show.my_watched_episodes)
		                        {
		                            playData.show.my_watched_episodes = playData.episode;
		                        }
		                        playData.show.my_status = 2;
		                        lightbox.show(seriesEndScreen);
		                        updateAnime(playData.show);
		                    }
		                }
		                else
		                {
		                    streamSourcesIndex++;
		                    if (streamSourcesIndex < streamSources.length)
		                    {
		                        playerSurface.play(streamSources[streamSourcesIndex]);
		                    }
		                    else
		                    {
		                        if (playData.episode > playData.show.my_watched_episodes)
		                        {
		                            playData.show.my_watched_episodes = playData.episode;
		                        }
		                        playData.show.my_status = 2;
		                        lightbox.show(seriesEndScreen);
		                        updateAnime(playData.show);
		                    }
		                }
		                break;
		            case 'anime':
		                if (playData.episode > playData.show.my_watched_episodes)
		                {
		                    playData.show.my_watched_episodes = playData.episode;
		                }

		                if (playData.episode + 1 > playData.show.series_episodes)
		                {
		                    playData.show.my_status = 2;
		                    lightbox.show(seriesEndScreen);
		                }
		                else
		                {
		                    lightbox.show(transitionScreen);
		                    transitionScreen.startCountdown(playData.episode, playData.show.series_animedb_id);
		                }
		                updateAnime(playData.show);
		                break;
		            default:
		                break;
		        }
				
			});
			videoPlayerNode._eventOutput.emit('playerLoaded');
		});

		var dirtyLedger = false;
		var dirtyDubLedger = false;
		var ledgerSwaps=[];
		var showLedger = [];
		var dubLedger = [];
		if (localStorage.ledger)
		{
		    showLedger=JSON.parse(localStorage.ledger);
		}
		if (localStorage.dubLedger)
		{
		    dubLedger = JSON.parse(localStorage.dubLedger);
		}
		if (localStorage.swaps)
		{
		    ledgerSwaps = JSON.parse(localStorage.swaps);
		}

		function processLedger(body,terminator,type)
		{
		    var swapsRequest = new XMLHttpRequest();
		    swapsRequest.open('GET', '/content/data/LocalLedgerSwaps.xml', false);
		    swapsRequest.send();
		    var parser = new DOMParser();
		    var domObj = parser.parseFromString(swapsRequest.response, "text/xml");
		    ledgerSwaps = XML2jsobj(domObj).Root.swap;
		    localStorage.swaps = JSON.stringify(ledgerSwaps);

		    var resultLedger=[];

		    var index = body.indexOf('class="series_index"');
		    var showName = "";
		    while (showName !== terminator)
		    {
		        index = body.indexOf("<a href=\"", index) + 9;
		        var showLink = body.substring(index, body.indexOf("\"", index));
		        var index2 = body.indexOf(">", index) + 1;
		        showName = body.substring(index2, body.indexOf("<", index2));
		        resultLedger.push({ name: showName, link: showLink, contentType:type });
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
		                if (dirtyLedger)
		                {
		                    showLedger = [];
		                    dirtyLedger = false;
		                }
		                var processedLedger = processLedger(request.responseText, 'Dubbed Anime & Cartoon', 'anime');
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
		                if(dirtyLedger)
		                {
		                    showLedger = [];
		                    dirtyLedger = false;
		                }
		                showLedger = showLedger.concat(processLedger(request.responseText, 'Dubbed Anime & Cartoon', 'movie'));
		                localStorage.ledger = JSON.stringify(showLedger);
		            }
		        }
		    };
		    request.open("GET", url, true);
		    request.send();
		}
		function getDubAnimeLedger()
		{
		    var url = "http://www.anime-flix.com/requester.php?m=ledger&d=true";
		    var request = new XMLHttpRequest();
		    request.onreadystatechange = function ()
		    {
		        if (request.readyState == 4)
		        {
		            if (request.status == 200)
		            {
		                if (dirtyDubLedger)
		                {
		                    dubLedger = [];
		                    dirtyDubLedger = false;
		                }
		                var processedLedger = processLedger(request.responseText, 'Watch Anime', 'anime');
		                dubLedger = dubLedger.concat(processedLedger);
		                localStorage.dubLedger = JSON.stringify(dubLedger);
		            }
		        }
		    };
		    request.open("GET", url, true);
		    request.send();
		}
		function getDubMovieLedger()
		{
		    var url = "http://www.anime-flix.com/requester.php?m=movieLedger&d=true";
		    var request = new XMLHttpRequest();
		    request.onreadystatechange = function ()
		    {
		        if (request.readyState == 4)
		        {
		            if (request.status == 200)
		            {
		                if (dirtyDubLedger)
		                {
		                    dubLedger = [];
		                    dirtyDubLedger = false;
		                }
		                dubLedger = dubLedger.concat(processLedger(request.responseText.replace(' (Movie)', ''), 'Watch Anime', 'movie'));
		                localStorage.dubLedger = JSON.stringify(dubLedger);
		            }
		        }
		    };
		    request.open("GET", url, true);
		    request.send();
		}

	    function getLedger()
	    {
	        //showLedger = [];
	        dirtyLedger = true;
	        dirtyDubLedger = true;
	        getAnimeLedger();
	        getMovieLedger();
	        getDubAnimeLedger();
	        getDubMovieLedger();
	    }
	    getLedger();

	    videoPlayerNode.play = function (playObject, episode)
	    {
	        streamSources = undefined;
	        dubStreamSources = undefined;

	        playData.show = playObject;
	        playData.episode = episode;

	        lightbox.show(playerSurface);

	        var ledgerItem = getLedgerItem(playObject);
	        var dubLedgerItem = getLedgerItem(playObject, true);
	        contentType = ledgerItem.contentType;
	        if (contentType=='movie')
	        {
	            nextEpisodeButtonRenderController.hide();
	        }
	        else
	        {
	            nextEpisodeButtonRenderController.show(nextEpisodeButtonView);
	        }
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
	                            if (window.location.hash.indexOf('video')>-1)
	                            {
	                                var body = request.responseText;
	                                if (body == 'Link not found')
	                                {
	                                    window.alert('The episode can not be found. Sorry for the inconvenience. Please contact support@anime-flix.com and we will sort it out as soon as possible.');
	                                    backToBrowsing();
	                                }
	                                else
	                                {
	                                    streamSources = body.split(';');
	                                    streamSources.pop();
	                                    streamSourcesIndex = 0;
	                                    if (!english)
	                                    {
	                                        playerSurface.play(streamSources[0]);
	                                    }
	                                }
	                            }
	                            if (streamSources && dubStreamSources)
	                            {
	                                languageRenderController.show(languageView);
	                            }
	                            else
	                            {
	                                languageRenderController.hide();
	                            }
	                        }
	                    }
	                };
	                request.open('POST', url);
	                request.send(ledgerItem.link);
	            
                if (dubLedgerItem)
                {
                    //setting hash
                    //window.location.hash = 'video&' + playData.show.series_animedb_id + '&' + playData.episode;

                    //titleBar.setContent(playData.show.series_title + ' - Episode ' + episode);

                    url = 'http://www.anime-flix.com/requester.php?m=stream&t=' + dubLedgerItem.name + '&e=' + episode;
                    var dubRequest = new XMLHttpRequest();
                    dubRequest.onreadystatechange = function ()
                    {
                        if (dubRequest.readyState == 4)
                        {
                            if (dubRequest.status == 200)
                            {
                                if (window.location.hash.indexOf('video') > -1)
                                {
                                    var body = dubRequest.responseText;
                                    if (body == 'Link not found')
                                    {
                                        language.options.selectedIndex = 1;
                                        if (streamSources)
                                        {
                                            playerSurface.play(streamSources[0]);
                                        }
                                    }
                                    else
                                    {
                                        dubStreamSources = body.split(';');
                                        dubStreamSources.pop();
                                        dubStreamSourcesIndex = 0;
                                        if (english)
                                        {
                                            playerSurface.play(dubStreamSources[0]);

                                        }
                                    }
                                }
                                if (streamSources && dubStreamSources)
                                {
                                    languageRenderController.show(languageView);
                                }
                                else
                                {
                                    languageRenderController.hide();
                                }
                            }
                        }
                    };
                    dubRequest.open('POST', url);
                    dubRequest.send(dubLedgerItem.link);
                }
                else
                {
                    language.options.selectedIndex = 1;
                }
	        }
	        else
	        {
	            window.alert('The show could not be found. Sorry');
	            backToBrowsing();
	        }
	    };

		function getLedgerItem(show,dub)
	    {
		    var ledgerToCheck = showLedger;
		    if (dub)
		    {
		        ledgerToCheck = dubLedger;
		    }

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
			        for (var i = 0; i < ledgerToCheck.length && !done; i++)
			        {
			            if (ledgerToCheck[i].name.toLowerCase() == workingTitle.toLowerCase())
			            {
			                value = { name: titles[0], link: ledgerToCheck[i].link, contentType:ledgerToCheck[i].contentType };
			                if (j>0) {
			                    ledgerToCheck.push(value);
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
			        if (ledgerSwaps[i].malName.toLowerCase() == show.series_title.toLowerCase())
			        {
			            for (var j = 0; j < ledgerToCheck.length && !done; j++)
			            {
			                if (ledgerSwaps[i].ledgerName.toLowerCase() == ledgerToCheck[j].name.toLowerCase())
			                {
			                    value = { name: ledgerToCheck[j].name, link: ledgerToCheck[j].link, contentType: ledgerToCheck[i].contentType };
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
		    playerSurface.player.currentTime(0);
		    //var element=playerSurface.player.contentEl().childNodes[0];
		    //element.removeAttribute('src');
		    playerSurface.player.src('no src');
		    playerSurface.player.posterImage.show();
		};

		lightbox.show(playerSurface);
		return videoPlayerNode;
	}
	module.exports=createVideoPlayer;

});