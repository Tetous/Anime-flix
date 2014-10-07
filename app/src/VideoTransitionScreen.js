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

    function createVideoTransitionScreen()
    {
        var view = new View();
        var backgroundSurface = Surface({
            properties: {
                backgroundColor:'#002EB8',
                textAlign: 'center',
                verticalAlign:'middle'
            }
        });
        view.add(backgroundSurface);

        var backToBrowsingButtonTransform = new StateModifier({
            transform:Transform.translate(25,25,1)
        });
        var backToBrowsingButtonSize = 125;
        var backToBrowsingButton = new ImageSurface({
            size: [backToBrowsingButtonSize, backToBrowsingButtonSize],
            content: '/content/images/AnimeflixBack2.png',
        });
        backToBrowsingButton.on('click', function () { view._eventOutput.emit('backToBrowsing'); });
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
        nextEpisodeButton.on('click', function () { view._eventOutput.emit('nextEpisode'); });
        view.add(nextEpisodeButtonTransform).add(nextEpisodeButton);

        var countdown;
        view.startCountdown = function()
        {
            countdown = 10;
            backgroundSurface.setContent('<img src="content/images/player/Timer10.png" height="400" width="400">');
            Timer.setTimeout(timerTick, 1000);
        }

        function timerTick()
        {
            countdown--;
            if (countdown == 0)
            {
                view._eventOutput.emit('finishedCountdown');
                return;
            };
            backgroundSurface.setContent('<img src="content/images/player/Timer'+countdown+'.png" height="400" width="400">');
            Timer.setTimeout(timerTick, 1000);
        }

        return view;
    }
    module.exports = createVideoTransitionScreen;
});