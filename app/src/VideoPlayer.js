/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */

define(function (require, exports, module)
{
    var Engine = require('famous/core/Engine');
    var View = require('famous/core/View');
    var RenderController = require('famous/views/RenderController');
    var Lightbox = require('famous/views/Lightbox');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Transform = require('famous/core/Transform');
    var Surface = require('RichFamous/Surface');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var Easing = require('famous/transitions/Easing');
    var VideoJsSurface = require('RichFamous/VideoJsSurface/VideoJsSurface');
    var VideoTransitionScreen = require('videoTransitionScreen');
    var SeriesEndScreen = require('SeriesEndScreen');

    require('xml2jsobj/xml2jsobj');
    require('Anime-flixWebFunctions');

    function createVideoPlayer()
    {
        var contentType;
        var streamSources = [];
        var streamSourcesIndex = 0;
        var dubStreamSources = [];
        var dubStreamSourcesIndex = 0;
        var playData = {
            show: undefined, 
            episode: undefined
        };
        var view = new View();
        var screenWidth = window.mainContext.getSize()[0];
        var lightboxTransform = new StateModifier({
            transform: Transform.translate(0, 0, 1)
        });
        var lightbox = new Lightbox({
            inOpacity: 1,
            outOpacity: 1,
            inTransform: Transform.translate(screenWidth, 0, 1),
            outTransform: Transform.translate(-1 * screenWidth, 0, 1),
            inTransition: {
                duration: 1000,
                curve: Easing.outBack},
            outTransition: {
                duration: 1000,
                curve: Easing.inBack}
        });
        Engine.on('resize', function ()
        {
            screenWidth = window.mainContext.getSize()[0];
            lightbox.setOptions({
                inTransform: Transform.translate(screenWidth, 0, 1),
                outTransform: Transform.translate(-1 * screenWidth, 0, 1)
            });
        });
        view.add(lightboxTransform).add(lightbox);

        var playerSurface = VideoJsSurface({},
                {
                    width: '100%',
                    height: '100%',
                    controls: true,
                    autoplay: false,
                    preload: 'none', //'auto',
                    poster: '/content/images/AnimeflixLogo.png'
                });
        playerSurface.on('becameActive', function ()
        {
            titleBarRenderController.show(titleBarView, {
                duration: 1000,
                curve: Easing.outCubic});
            languageSurface.setContent(language);
            titleBar.setContent(playData.show.series_title + ' - Episode ' + playData.episode);
            //titleBarModifier.setOpacity(0.8, { duration: 1000, curve: Easing.outCubic });
        });
        playerSurface.on('becameInactive', function ()
        {
            titleBarRenderController.hide({
                duration: 1000,
                curve: Easing.outCubic});
            //titleBarModifier.setOpacity(0, { duration: 1000, curve: Easing.outCubic });
        });
        playerSurface.on('playerError', function (error)
        {
            switch(error.code)
            {
                case 4:
                    switch(contentType)
                    {
                        case 'anime':
                            if(localStorage.english == 'true')
                            {
                                dubStreamSourcesIndex++;
                                playerSurface.playAtSameLocation(dubStreamSources[dubStreamSourcesIndex % dubStreamSources.length]);
                            }
                            else
                            {
                                streamSourcesIndex++;
                                playerSurface.playAtSameLocation(streamSources[streamSourcesIndex % streamSources.length]);
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
            //Stupid Ass hack to remove the style attribute that chrome gives the video tag if an error is thrown
            Engine.nextTick(function(){
                        var playerEl=playerSurface.player.el();
                        playerEl.firstChild.setAttribute('style','');
                    });
        });
        view.add(playerSurface);

        var titleBarHeight = 75;
        var titleBarRenderController = new RenderController();
        view.add(titleBarRenderController);
        var titleBarView = new View();
        var titleBarModifier = new StateModifier({
            opacity: 0.8,
            transform: Transform.translate(0, 0, 1)
        });
        var titleBarModifierNode = titleBarView.add(titleBarModifier);
        var titleBar = Surface({
            size: [undefined, titleBarHeight],
            properties: {
                color: 'white',
                backgroundColor: '#2A2A2A',
                textAlign: 'center',
                verticalAlign: 'middle'
            }
        });
        titleBarModifierNode.add(titleBar);

        var backToBrowsingButtonTransform = new StateModifier({
            transform: Transform.translate(0, 0, 2)
        });
        var backToBrowsingButton = new ImageSurface({
            size: [titleBarHeight, titleBarHeight],
            content: '/content/images/AnimeflixBack2.png',
        });
        function backToBrowsing() {
            if(playerSurface.player != undefined)
            {
                //playerSurface.player.pause();
                clear();
                playerSurface.player.exitFullscreen();
            }
            view._eventOutput.emit('backToBrowsing');
        }
        backToBrowsingButton.on('click', backToBrowsing);
        titleBarModifierNode.add(backToBrowsingButtonTransform).add(backToBrowsingButton);

        var nextEpisodeButtonRenderController = new RenderController();
        titleBarModifierNode.add(nextEpisodeButtonRenderController);
        var nextEpisodeButtonView = new View();
        var nextEpisodeButtonTransform = new StateModifier({
            align: [1, 0],
            origin: [1, 0],
            transform: Transform.translate(0, 8, 2)
        });
        var nextEpisodeButton = new ImageSurface({
            size: [true, 59],
            content: '/content/images/AnimeflixNextEpisode.png'
        });
        nextEpisodeButton.on('click', nextEpisode);
        nextEpisodeButtonView.add(nextEpisodeButtonTransform).add(nextEpisodeButton);

        function nextEpisode()
        {
            clear();
            //update anime list
            if(playData.episode > playData.show.my_watched_episodes)
            {
                playData.show.my_watched_episodes = playData.episode;
            }

            if(playData.episode + 1 > playData.show.series_episodes)
            {
                if(playData.show.series_status == 1)
                {
                    seriesEndScreen.setContent('You have finished all of the episodes aired so far but there are more to come.<br>Check back soon.');
                }
                else
                {
                    seriesEndScreen.setContent();

                    playData.show.my_status = 2;
                    if(playData.show.my_finish_date = '000-00-00')
                    {
                        var today = new Date();
                        var dd = today.getDate();
                        var mm = today.getMonth() + 1; //January is 0!
                        var yyyy = today.getFullYear();

                        if(dd < 10)
                        {
                            dd = '0' + dd
                        }

                        if(mm < 10)
                        {
                            mm = '0' + mm
                        }
                        playData.show.my_finish_date = yyyy + '-' + mm + '-' + dd;
                    }
                }
                lightbox.show(seriesEndScreen);
            }
            else
            {
                playData.episode++;
                view.play(playData.show, playData.episode);
            }
            updateAnime(playData.show);
        }

        var language = document.createElement('SELECT');
        var subOption = new Option('Sub', 1);
        language.options.add(subOption);
        var dubOption = new Option('Dub', 2);
        language.options.add(dubOption);
        language.options.selectedIndex = localStorage.english == 'true' ? 1 : 0;
        language.addEventListener('change', function ()
        {
            localStorage.english = language.options[language.selectedIndex].value == 2;

            var link = streamSources[streamSourcesIndex];
            if(localStorage.english == 'true')
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
                vertialAlign: 'middle'
            }
        });
        languageView.add(languageTransform).add(languageSurface);

        var transitionScreen = VideoTransitionScreen();
        transitionScreen.on('backToBrowsing', backToBrowsing);
        transitionScreen.on('abortedCountdown', function ()
        {
            lightbox.show(playerSurface);
        });
        transitionScreen.on('finishedCountdown', function ()
        {
            lightbox.show(playerSurface, function ()
            {
                playData.episode++;
                view.play(playData.show, playData.episode);
                updateAnime(playData.show);
            });
        });

        var seriesEndScreen = SeriesEndScreen();
        seriesEndScreen.on('backToBrowsing', backToBrowsing);

        playerSurface.on('playerLoaded', function () {
            playerSurface.player.on('ended', function ()
            {
                //Reset the text in the seriesEndScreen
                seriesEndScreen.setContent();

                //update anime list
                switch(contentType)
                {
                    case 'movie':
                        if(localStorage.english == 'true')
                        {
                            dubStreamSourcesIndex++;
                            if(dubStreamSourcesIndex < dubStreamSources.length)
                            {
                                playerSurface.play(dubStreamSources[dubStreamSourcesIndex]);
                            }
                            else
                            {
                                if(playData.episode > playData.show.my_watched_episodes)
                                {
                                    playData.show.my_watched_episodes = playData.episode;
                                }
                                playData.show.my_status = 2;
                                seriesEndScreen.setContent('That is the end of the movie.<br>I hope you enjoyed it.');
                                lightbox.show(seriesEndScreen);
                                updateAnime(playData.show);
                            }
                        }
                        else
                        {
                            streamSourcesIndex++;
                            if(streamSourcesIndex < streamSources.length)
                            {
                                playerSurface.play(streamSources[streamSourcesIndex]);
                            }
                            else
                            {
                                if(playData.episode > playData.show.my_watched_episodes)
                                {
                                    playData.show.my_watched_episodes = playData.episode;
                                }
                                playData.show.my_status = 2;
                                seriesEndScreen.setContent('That is the end of the movie.<br>I hope you enjoyed it.');
                                lightbox.show(seriesEndScreen);
                                updateAnime(playData.show);
                            }
                        }
                        break;
                    case 'anime':
                        clear();
                        if(playData.episode > playData.show.my_watched_episodes)
                        {
                            playData.show.my_watched_episodes = playData.episode;
                        }

                        if(playData.episode + 1 > playData.show.series_episodes)
                        {
                            if(playData.show.series_status == 1)
                            {
                                seriesEndScreen.setContent('You have finished all of the episodes aired so far but there are more to come.<br>Check back soon.');
                            }
                            else
                            {
                                playData.show.my_status = 2;
                                if(playData.show.my_finish_date = '000-00-00')
                                {
                                    var today = new Date();
                                    var dd = today.getDate();
                                    var mm = today.getMonth() + 1; //January is 0!
                                    var yyyy = today.getFullYear();

                                    if(dd < 10)
                                    {
                                        dd = '0' + dd
                                    }

                                    if(mm < 10)
                                    {
                                        mm = '0' + mm
                                    }
                                    playData.show.my_finish_date = yyyy + '-' + mm + '-' + dd;
                                }
                            }
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
            view._eventOutput.emit('playerLoaded');
        });

        window.ledger.getLedger();

        view.play = function (playObject, episode)
        {
            streamSources = undefined;
            dubStreamSources = undefined;

            playData.show = playObject;
            playData.episode = episode;

            lightbox.show(playerSurface);

            var ledgerItem = window.ledger.getLedgerItem(playObject);
            var dubLedgerItem = window.ledger.getLedgerItem(playObject, true);
            contentType = ledgerItem.contentType;
            if(contentType == 'movie')
            {
                nextEpisodeButtonRenderController.hide();
            }
            else
            {
                nextEpisodeButtonRenderController.show(nextEpisodeButtonView);
            }
            if(ledgerItem)
            {

                //setting hash
                window.location.hash = 'video&' + playData.show.series_animedb_id + '&' + playData.episode;

                titleBar.setContent(playData.show.series_title + ' - Episode ' + episode);

                url = 'http://www.anime-flix.com/requester.php?m=stream&t=' + ledgerItem.name + '&e=' + episode;
                var request = new XMLHttpRequest();
                request.onreadystatechange = function ()
                {
                    if(request.readyState == 4)
                    {
                        if(request.status == 200)
                        {
                            if(window.location.hash.indexOf('video') > -1)
                            {
                                var body = request.responseText;
                                if(body == 'Link not found')
                                {
                                    window.alert('The episode can not be found. Sorry for the inconvenience. Please contact support@anime-flix.com and we will sort it out as soon as possible.');
                                    //backToBrowsing();
                                    view._eventOutput.emit('failedToFind');
                                }
                                else
                                {
                                    streamSources = body.split(';');
                                    streamSources.pop();
                                    streamSourcesIndex = 0;
                                    if(localStorage.english == 'false')
                                    {
                                        playerSurface.play(streamSources[0]);
                                    }
                                }
                            }
                            if(streamSources && dubStreamSources)
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

                if(dubLedgerItem)
                {
                    //setting hash
                    //window.location.hash = 'video&' + playData.show.series_animedb_id + '&' + playData.episode;

                    //titleBar.setContent(playData.show.series_title + ' - Episode ' + episode);

                    url = 'http://www.anime-flix.com/requester.php?m=stream&t=' + dubLedgerItem.name + '&e=' + episode;
                    var dubRequest = new XMLHttpRequest();
                    dubRequest.onreadystatechange = function ()
                    {
                        if(dubRequest.readyState == 4)
                        {
                            if(dubRequest.status == 200)
                            {
                                if(window.location.hash.indexOf('video') > -1)
                                {
                                    var body = dubRequest.responseText;
                                    if(body == 'Link not found')
                                    {
                                        localStorage.english = false;
                                        language.options.selectedIndex = 0;
                                        if(streamSources)
                                        {
                                            playerSurface.play(streamSources[0]);
                                        }
                                    }
                                    else
                                    {
                                        dubStreamSources = body.split(';');
                                        dubStreamSources.pop();
                                        dubStreamSourcesIndex = 0;
                                        if(localStorage.english == 'true')
                                        {
                                            playerSurface.play(dubStreamSources[0]);

                                        }
                                    }
                                }
                                if(streamSources && dubStreamSources)
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
                    localStorage.english = false;
                    language.options.selectedIndex = 0;
                }
            }
            else
            {
                window.alert('The show could not be found. Sorry');
                //backToBrowsing();
                view._eventOutput.emit('failedToFind');
            }
        };

        function clear()
        {
            playerSurface.player.currentTime(0);
            //var element=playerSurface.player.contentEl().childNodes[0];
            //element.removeAttribute('src');
            playerSurface.player.src('no src');
            playerSurface.player.posterImage.show();
        }
        ;

        lightbox.show(playerSurface);
        return view;
    }
    module.exports = createVideoPlayer;

});