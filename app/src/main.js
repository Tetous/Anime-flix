/* globals define */
define(function (require, exports, module)
{
    'use strict';
    // import dependencies
    var Engine = require('famous/core/Engine');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Transform = require('famous/core/Transform');
    var Easing = require('famous/transitions/Easing');
    var Surface = require('RichFamous/Surface');
    var LoginScreen = require('LoginScreen');
    var ShowSelector = require('ShowSelector');
    var VideoPlayer = require('VideoPlayer');
    window.ledger = require('Ledger');

    require('MALSupportFunctions');

    window.loginZ = 100;
    window.showSelectorZ = 50;
    window.videoPlayerZ = 1;
    window.colorScheme = {
        main: 'black',//'#0066CC',
        second: 'white',
        third: '#A65F00',
        background: 'black'
    };
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
    /*window.scrollTo(0, 1);
    addEventListener("resize", function ()
    {
        var
              el = document.documentElement
            , rfs =
                   el.requestFullScreen
                || el.webkitRequestFullScreen
                || el.mozRequestFullScreen
        ;
        rfs.call(el);
    });
    */

    //CSS
    var vidCSS = document.createElement('link');
    vidCSS.rel = 'stylesheet';
    vidCSS.href = 'css/video-js.min.css';
    vidCSS.type = 'text/css';
    document.head.appendChild(vidCSS);

    //Read UserAgent
    var userAgent=navigator.userAgent;
    var isFirefox=userAgent.indexOf('Firefox')>-1;
    //Read Hash
    var hash = window.location.hash;

    //get CORS access
    var url = 'http://www.anime-flix.com/requester.php';
    var request = new XMLHttpRequest();
    request.open('GET', url, false);
    //request.send();

    // create the main context
    var mainContext = Engine.createContext();
    window.mainContext = mainContext;
    mainContext.setPerspective(0);

    Engine.nextTick(function ()
    {
        var flips=0;
        var centerSpinTransform = new StateModifier({
            align: [0.5, 0.5],
            origin: [0.5, 0.5]
        });
        var centerSpinRotation = new StateModifier();
        function spin()
        {
            mainContext.setPerspective(1500);
            centerSpinTransform.setTransform(Transform.translate(0, 0, -400), { duration: 1000, curve: Easing.outCubic }, function ()
            {
                flips++;
                centerSpinRotation.setTransform(Transform.rotateY(Math.PI * flips), { duration: 1500, curve: Easing.inOutCubic }, function ()
                {
                    centerSpinTransform.setTransform(Transform.translate(0, 0, 0), { duration: 1000, curve: Easing.outCubic }, function ()
                    {
                        mainContext.setPerspective(0);
                    });
                });
            });
        }
        var spinnerNode = mainContext.add(centerSpinTransform).add(centerSpinRotation);

        var loginScreenTransform = new StateModifier({ transform: Transform.translate(0, 0, window.loginZ) });
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
                        showData.my_watched_episodes = episode - 1;
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

        mainContext.add(loginScreenTransform).add(loginScreen);

        //#region Anime
        var videoPlayerTransform = new StateModifier({
            transform: Transform.translate(0, 0, window.videoPlayerZ)
        });
        var videoPlayer = VideoPlayer();
        videoPlayer.on('backToBrowsing', function ()
        {
            showSelector.refreshList();
            window.location.hash = 'sdisplay&' + showSelector.getShowingSection();
            showSelectorTransform.setAlign([0, 0], { duration: 0 });
            showSelectorTransform.setOpacity(1, { duration: 2000 });
        });
        videoPlayer.on('failedToFind', function ()
        {
            showSelectorTransform.halt();
            showSelectorTransform.setAlign([0, 0]);
            showSelectorTransform.setOpacity(1);
        });
        spinnerNode.add(videoPlayerTransform).add(videoPlayer);

        var showSelectorTransform = new StateModifier({
            transform: Transform.translate(0, 0, window.showSelectorZ)
        });
        var showSelector = ShowSelector();
        function showSelected(data)
        {
            showSelectorTransform.setOpacity(0, { duration: 2000, curve: Easing.outCubic }, function ()
            {
                showSelectorTransform.setAlign([0, -1]);
            });
            videoPlayer.play(data.show, data.episode);
        }
        showSelector.on('showSelected', showSelected);
        showSelector.on('manga', function () { spin()});
        spinnerNode.add(showSelectorTransform).add(showSelector);
        //#endregion
        //#region Manga
        var mangaRotation = new StateModifier({
            transform:Transform.rotateY(Math.PI)
        });
        var mangaTestSurface = Surface({
            content: 'Manga Coming Soon!',
            properties: {
                color:'white',
                backgroundColor: 'black',
                textAlign: 'center',
                verticalAlign: 'middle',
                fontSize:'30px'
            }
        });
        mangaTestSurface.on('click', function ()
        {
            spin();
        });
        spinnerNode.add(mangaRotation).add(mangaTestSurface);
        //#endregion

        function resize()
        {
            var size = mainContext.getSize();
            window.formatting.scale = 1;
            if (size[0] < 1000)
            {
                window.formatting.scale = size[0] / 1000;
            }
            if (size[1] < 600)
            {
                var rat = size[1] / 600;
                if (rat < window.formatting.scale)
                {
                    window.formatting.scale = rat;
                }
            }

            loginScreen.resize();
            showSelector.resize();
            //videoPlayer.resize();
        }
        Engine.on('resize', resize);
        resize();
    });
});
