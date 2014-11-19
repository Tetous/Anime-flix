/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */

define(function (require, exports, module)
{
    var View = require('famous/core/View');
    var Timer = require('famous/utilities/Timer');
    var StateModifier= require('famous/modifiers/StateModifier');
    var Transform = require('famous/core/Transform');
    var Surface = require('RichFamous/Surface');
    var ImageSurface = require('famous/surfaces/ImageSurface');

    require('MALSupportFunctions');

    function createVideoTransitionScreen()
    {
        var discussionURL = '';

        var view = new View();
        var backgroundSurface = Surface({
            properties: {
                backgroundColor:window.colorScheme.main,
                textAlign: 'center',
                verticalAlign:'middle'
            }
        });
        view.add(backgroundSurface);

        var backToBrowsingButtonTransform = new StateModifier({
            origin: [0, 0],
            align:[0,0],
            transform:Transform.translate(25,25,1)
        });
        var backToBrowsingButtonSize = 125;
        var backToBrowsingButton = new ImageSurface({
            size: [backToBrowsingButtonSize, backToBrowsingButtonSize],
            content: '/content/images/AnimeflixBack2.png',
        });
        backToBrowsingButton.on('click', function ()
        {
            countDown = -1;
            view._eventOutput.emit('backToBrowsing');
        });
        view.add(backToBrowsingButtonTransform).add(backToBrowsingButton);

        var nextEpisodeButtonTransform = new StateModifier({
            align: [1, 1],
            origin: [1, 1],
            transform: Transform.translate(-20, -20, 1)
        });
        var nextEpisodeButton = new ImageSurface({
            size: [true, 80],
            content: '/content/images/AnimeflixNextEpisode.png'
        });
        nextEpisodeButton.on('click', function () { countdown = 0; });
        view.add(nextEpisodeButtonTransform).add(nextEpisodeButton);
        /*
        var discussEpisodeButtonTransform = new StateModifier({
            origin: [0, 1],
            align:[0,1],
            transform:Transform.translate(20,-20,1)
        });
        var discussEpisodeButton = Surface({
            size:[200,50],
            content: 'Discuss this Episode',
            properties: {
                backgroundColor: 'white',
                borderRadius:'10px'
            }
        });
        discussEpisodeButton.on('click', function()
        {
            window.open(discussionURL);
        });
        view.add(discussEpisodeButtonTransform).add(discussEpisodeButton);
        */

        var countdown;
        view.startCountdown = function(episode,showId)
        {
            countdown = 10;
            backgroundSurface.setContent('<img src="content/images/player/Timer10.png" height="400" width="400">');
            Timer.setTimeout(timerTick, 1000);
            discussionURL = getDiscussionURL(episode, showId);

        }

        function timerTick()
        {
            if (countdown==-1)
            {
                return;
            }
            if (countdown == 0)
            {
                view._eventOutput.emit('finishedCountdown');
                return;
            }
            backgroundSurface.setContent('<img src="content/images/player/Timer'+countdown+'.png" height="400" width="400">');
            Timer.setTimeout(timerTick, 1000);
            countdown--;
        }

        return view;
    }
    module.exports = createVideoTransitionScreen;
});