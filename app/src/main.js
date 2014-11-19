/* globals define */
define(function (require, exports, module)
{
    'use strict';
    // import dependencies
    var Engine = require('famous/core/Engine');
    var RenderNode = require('famous/core/RenderNode');
    var Modifier = require('famous/core/Modifier');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Transform = require('famous/core/Transform');
    var Surface = require('famous/core/Surface');
    var Easing = require('famous/transitions/Easing');
    var Transitionable = require('famous/transitions/Transitionable');
    var LoginScreen = require('LoginScreen');
    var ShowSelector = require('ShowSelector');
    var VideoPlayer = require('VideoPlayer');

    require('MALSupportFunctions');

    window.loginZ = 100;
    window.showSelectorZ = 50;
    window.videoPlayerZ = 0;
    window.colorScheme = {
        main: '#FF9200',//'#0066CC',
        second: '#BF8230',
        third: '#A65F00',
        background:'white'
    }
    window.formatting = { scale: 1 };

    function detectmob()
    {
        if (navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
        )
        {
            return true;
        }
        else
        {
            return false;
        }
    }
    window.isMobile = detectmob();
    if (window.isMobile)
    {

    }

    //CSS
    var vidCSS = document.createElement("link");
    vidCSS.rel = "stylesheet";
    vidCSS.href = "css/video-js.min.css";
    vidCSS.type = "text/css";
    document.head.appendChild(vidCSS);

    //Read UserAgent
    var userAgent=navigator.userAgent;
    var isFirefox=userAgent.indexOf('Firefox')>-1;
    //Read Hash
    var hash = window.location.hash;

    //get CORS access
    var url = 'http://www.anime-flix.com/requester.php';
    var request = new XMLHttpRequest();
    request.open("GET", url, false);
    request.send();

    // create the main context
    var mainContext = Engine.createContext();
    window.mainContext = mainContext

    Engine.nextTick(function ()
    {
        var videoPlayerTransform = new StateModifier({
            transform: Transform.translate(0, 0, window.videoPlayerZ)
        });
        var videoPlayer = VideoPlayer();
        videoPlayer.on('backToBrowsing', function ()
        {
            showSelector.refreshList();
            window.location.hash = 'sdisplay&'+showSelector.getShowingSection();
            showSelectorTransform.setAlign([0, 0], { duration: 2000, curve: Easing.outCubic });
        });
        mainContext.add(videoPlayerTransform).add(videoPlayer);

        var showSelectorTransform = new StateModifier({
            transform: Transform.translate(0, 0, window.showSelectorZ)
        });
        var showSelector = ShowSelector();
        function showSelected(data)
        {
            showSelectorTransform.setAlign([0, -1], { duration: 2000, curve: Easing.outCubic });
            videoPlayer.play(data.show, data.episode);
        }
        showSelector.on('showSelected', showSelected);
        mainContext.add(showSelectorTransform).add(showSelector);

        var loginScreenTransform = new Modifier({ transform: Transform.translate(0, 0, window.loginZ) });
        var loginScreen = LoginScreen(mainContext.getSize());
        loginScreen.on('loggedIn', function ()
        {
            sessionStorage.username = loginScreen.username;
            sessionStorage.password = loginScreen.password;
            showSelector.refreshList();
            //#region Process Hash
            var params = hash.split('&');
            switch (params[0])
            {
                case '#video':
                    var episode = parseInt(params[2]);
                    var showData = showSelector.selectShowById(parseInt(params[1]));
                    if (episode > showData.my_watched_episodes)
                    {
                        showData.my_watched_episodes = episode-1;
                    }
                    updateAnime(showData);
                    showSelected({ show: showData, episode: episode });
                    showSelector.showSection('1');
                    break;
                case '#sdisplay':
                    showSelector.showSection(params[1]);
                    break;
                default:
                    showSelector.showSection('1');
                    break;
            }
            //#endregion
        });

        Engine.on('resize', function ()
        {

        });
        
        mainContext.add(loginScreenTransform).add(loginScreen);
    });
});
