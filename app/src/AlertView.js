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
    var Surface = require('famous/core/Surface');

    function createAlertView(options,button1Callback,button2Callback)
    {
        var open = false;

        var view = new View();
        view.button1Clicked = true;
        view.button2Clicked = true;
        var alertTransform = new StateModifier();
        var alertTransformNode = view.add(alertTransform);

        var background = new Surface(options);
        alertTransformNode.add(background);

        var button1Transform = new StateModifier({
            transform: Transform.translate(options.buttonBuffer, options.size[1] - options.buttonBuffer - options.buttonSize[1],1)
        });
        var button1 = new Surface({
            size: options.buttonSize,
            content: options.button1Content,
            properties: options.buttonProperties
        });
        button1.on('click', function ()
        {
            view.button1Clicked = true;
            view._eventOutput.emit('button1Clicked');
            hide();
        });
        alertTransformNode.add(button1Transform).add(button1);

        var button2Transform = new StateModifier({
            transform:Transform.translate(2*options.buttonBuffer+options.buttonSize[0],options.size[1]-options.buttonBuffer-options.buttonSize[1],1)
        });
        var button2 = new Surface({
            size: options.buttonSize,
            content: options.button2Content,
            properties: options.buttonProperties
        });
        button2.on('click', function ()
        {
            view.button2Clicked = true;
            view._eventOutput.emit('button2Clicked');
            hide();
        });
        alertTransformNode.add(button2Transform).add(button2);

        view.show = function ()
        {
            view.button1Clicked = false;
            view.button2Clicked = false;
            var windowSize=window.mainContext.getSize();
            alertTransform.setTransform(Transform.translate(windowSize[0] / 2 - options.size[0] / 2, windowSize[1] / 2 - options.size[1] / 2, 0), options.showTransitionable, function () { view._eventOutput.emit('shown') });
        }

        function hide()
        {
            var windowSize = window.mainContext.getSize();
            alertTransform.setTransform(Transform.translate(-options.size[0], -options.size[1], 0), options.hideTransitionable, function () { view._eventOutput.emit('hidden') });
        }
        alertTransform.setTransform(Transform.translate(-options.size[0], -options.size[1], 0));

        Engine.on('resize', function ()
        {
            if (open)
            {
                alertTransform.setTransform(Transform.translate(-options.size[0], -options.size[1], 0), options.showTransitionable);
            }
        });

        return view;
    }
    module.exports = createAlertView;
});