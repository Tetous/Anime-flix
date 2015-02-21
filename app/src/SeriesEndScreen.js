/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */

define(function (require, exports, module)
{
    var View = require('famous/core/View');
    var Timer = require('famous/utilities/Timer');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Transform = require('famous/core/Transform');
    var Surface = require('RichFamous/Surface');
    var ImageSurface = require('famous/surfaces/ImageSurface');

    function createSeriesEndScreen()
    {
        var view = new View();
        var backgroundSurface = Surface({
            content: 'You have finished this Anime!<br>Don\'t forget to check for sequels :)',
            properties: {
                color:'white',
                backgroundColor: window.colorScheme.main,
                textAlign: 'center',
                verticalAlign: 'middle',
                fontSize:'30px'
            }
        });
        view.add(backgroundSurface);

        var backToBrowsingButtonTransform = new StateModifier({
            origin: [0, 0],
            align: [0, 0],
            transform: Transform.translate(25, 25, 1)
        });
        var backToBrowsingButtonSize = 125;
        var backToBrowsingButton = new ImageSurface({
            size: [backToBrowsingButtonSize, backToBrowsingButtonSize],
            content: '/content/images/AnimeflixBack2.png',
        });
        backToBrowsingButton.on('click', function ()
        {
            view._eventOutput.emit('backToBrowsing');
        });
        view.add(backToBrowsingButtonTransform).add(backToBrowsingButton);

        view.setContent = function (content)
        {
            if(content==undefined)
            {
                content = 'You have watched all of the episodes in this show!<br>Don\'t forget to check for sequels :)';
            }
            backgroundSurface.setContent(content);
        }


        return view;
    }
    module.exports=createSeriesEndScreen;
});