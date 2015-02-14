/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */

define(function (require, exports, module)
{
    var Engine = require('famous/core/Engine');
    var View = require('famous/core/View');
    var Easing = require('famous/transitions/Easing');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Surface = require('RichFamous/Surface');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var Scrollview = require('famous/views/Scrollview');
    var Timer = require('famous/utilities/Timer');
    var AlertView = require('AlertView');

    require('Anime-flixWebFunctions');

    function createSeriesDisplay()
    {
        var view=new View();
        var background=Surface({
            properties:{
                backgroundColor:window.colorScheme.second
            }
        });
        view.add(background);
        
        var imageTransform=new StateModifier({
            transform:Transform.translate();
        });
        
        return view;
    }
});