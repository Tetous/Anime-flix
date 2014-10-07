/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */

define(function(require, exports, module) {
	var View = require('famous/core/View');
	var StateModifier= require('famous/modifiers/StateModifier');
    var Transform = require('famous/core/Transform');
    var Surface = require('famous/core/Surface');
    var ImageSurface=require('famous/surfaces/ImageSurface');
    var Easing = require('famous/transitions/Easing');
    var Timer = require('famous/utilities/Timer');
    var VideoJsSurface = require('RichFamous/VideoJsSurface/VideoJsSurface');
    var VideoTransitionScreen = require('videoTransitionScreen');

    require('xml2jsobj/xml2jsobj');
    require('MALSupportFunctions');

	function createVideoPlayer()
	{
		var focusedTransform;
		var countdown;
		var playData={show:undefined,episode:undefined};
		var videoPlayerNode=new View();


		var playerTransform=new StateModifier();
		focusedTransform=playerTransform;
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
		    if (focusedTransform == playerTransform)
		    {
		        titleBarModifier.setOpacity(0, { duration: 1000, curve: Easing.outCubic });
		    }
		});


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
		        transitionScreen.setContent('You have watched all of the episodes in this show!<br>Don\'t forget to check for sequels :)');
		        show(transitionScreenTransform);
		    }
		    else
		    {
		        playData.episode++;
		        videoPlayerNode.play(playData.show, playData.episode);
		    }
		    updateAnime(playData.show);
		}

		var transitionScreenTransform=new StateModifier({
			align:[1,0]
		});
		var transitionScreen = VideoTransitionScreen();
		transitionScreen.on('backToBrowsing', backToBrowsing);
		transitionScreen.on('finishedCountdown', function ()
		{
		    show(playerTransform, function ()
		    {
		        playData.episode++;
		        videoPlayerNode.play(playData.show, playData.episode);
		    });
		});
		transitionScreen.on('nextEpisode',nextEpisode);
		videoPlayerNode.add(transitionScreenTransform).add(transitionScreen);
        /*
		var transitionScreen=new Surface({
			properties:{
			    backgroundColor: '#4494FD',//'#00fff8',
				textAlign:'center',
				verticalAlign:'middle'
			}
		});
        */
		playerSurface.on('playerLoaded',function(){
		    playerSurface.player.on('ended', function ()
		    {
			    //update anime list
				if (playData.episode > playData.show.my_watched_episodes)
				{
				    playData.show.my_watched_episodes = playData.episode;
				}

				if (playData.episode+1 >= playData.show.series_episodes)
				{
				    playData.show.my_status = 2;
				    //replace with a more appropriate screen
				    transitionScreen.setContent('<div style="vertical-align: middle; display: table-cell">You have watched all of the episodes in this show!<br>Don\'t forget to check for sequels :)</div>');
				    show(transitionScreenTransform);
				}
				else
				{
				    show(transitionScreenTransform);
				    transitionScreen.startCountdown();
				}
				updateAnime(playData.show);
			});
			videoPlayerNode._eventOutput.emit('playerLoaded');
		});
		videoPlayerNode.add(playerTransform).add(playerSurface);

		var ledgerSwaps=[];
		var showLedger=[];

	    function getLedger()
		{
	        var swapsRequest = new XMLHttpRequest();
	        swapsRequest.open('GET', '/content/data/LocalLedgerSwaps.xml', false);
	        swapsRequest.send();
	        var parser = new DOMParser();
	        var domObj = parser.parseFromString(swapsRequest.response, "text/xml");
	        ledgerSwaps = XML2jsobj(domObj).Root.swap;

	        var url="http://www.learnfamo.us/chard/requester.php?m=ledger";
	        var request = new XMLHttpRequest();
	        request.onreadystatechange=function () {
                if (request.readyState==4)
	            {
	                if (request.status==200)
	                {
	                    var body=request.responseText;
	                    var index=body.indexOf("class=\"series_index\"");
	                    var showName="";
	                    while(showName!=="Login")
	                    {
	                        index=body.indexOf("<a href=\"",index)+9;
	                        var showLink=body.substring(index,body.indexOf("\"",index));
	                        var index2=body.indexOf(">",index)+1;
	                        showName=body.substring(index2,body.indexOf("<",index2));
	                        showLedger.push({name:showName,link:showLink});
	                    }
	                    showLedger.pop();
                        
	                    console.log('ledger loaded');
	                }
	            }
	        };
	        request.open("GET", url, true);
	        request.send();
	    }
	    getLedger();

		function show(trans, callback)
		{
			var curve=Easing.outBounce;
			var duration=2500;

			focusedTransform.setAlign([-1,0],{duration:duration,curve:curve});//function(){focusedTransform.setAlign([1,0]);}
			trans.setAlign([1,0]);
			trans.setAlign([0,0],{duration:duration,curve:curve},function(){focusedTransform=trans; if(callback!=undefined){callback();}});
		}

		videoPlayerNode.play=function (playObject,episode)
		{
			playData.show=playObject;
			playData.episode = episode;

			if (focusedTransform == transitionScreen)
			{
			    show(playerTransform);
			}

			var ledgerItem=getLedgerItem(playObject);
			if (ledgerItem != undefined)
			{
			    titleBar.setContent(playData.show.series_title+' - Episode '+episode);

			    url = 'http://www.learnfamo.us/chard/requester.php?m=stream&t=' + ledgerItem.name + '&e=' + episode;
			    var request = new XMLHttpRequest();
			    request.open('POST', url, false);
			    request.send(ledgerItem.link);

			    var body = request.responseText;
			    console.log(body);
			    playerSurface.play(body);
			}
			else {
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
			        console.log(workingTitle);
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
			                    showLedger[j].name = ledgerSwaps[i].malName;
			                    value = { name: showLedger[j].name, link: showLedger[j].link };
			                    showLedger.push(value);
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

		return videoPlayerNode;
	}
	module.exports=createVideoPlayer;

});