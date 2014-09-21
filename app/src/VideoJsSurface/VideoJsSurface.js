/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */

define(function (require, exports, module)
{
    'use strict';
    var Surface = require('famous/core/Surface');
    var EventHandler = require('famous/core/EventHandler');
    var VideoPlayer = require('VideoJsSurface/video-js/video.dev');

    function createVideoJsSurface(surfaceOptions, playerOptions, skinName)
    {
        var source;

        var vidTag = document.createElement("video");
        skinName = skinName || "vjs-default-skin";
        skinName = "video-js " + skinName;
        vidTag.setAttribute("class", skinName)

        surfaceOptions.content = vidTag;
        playerOptions.width = "100%";
        playerOptions.height = "100%";

        var surf = new Surface(surfaceOptions);

        var dunzo = false;
        surf.on("deploy", function ()
        {
            if (!dunzo)
            {
                surf.player = vjs(vidTag, playerOptions);
                surf.player.famousEvents = new EventHandler();
                surf.player.famousEvents.on('becameActive', function ()
                {
                    surf.emit('becameActive');
                });
                surf.player.famousEvents.on('becameInactive', function ()
                {
                    surf.emit('becameInactive');
                });
                surf.player.famousEvents.on('playerError', function (error)
                {
                    switch (error.code)
                    {
                        case 2:
                            console.log('started media reload');
                            var pos = surf.player.currentTime();
                            surf.play(source);

                            surf.player.one('loadeddata', function ()
                            {
                                surf.player.currentTime(pos);
                            });
                            break;
                        default:
                            break;
                    }
                });

                surf.emit("playerLoaded");
                dunzo = true;
            }
        });
        surf.play = function (src)
        {
            source = src;
            surf.player.src(src);
            surf.player.play();
        }
        return surf;
    }
    module.exports = createVideoJsSurface;
});