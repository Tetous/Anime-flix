/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */

define(function (require, exports, module)
{
    var View = require('famous/core/View');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Surface = require('famous/core/Surface');
    var ImageSurface = require('famous/surfaces/ImageSurface');

    function createSearchItemDisplay(searchItemParam)
    {
        var searchItem = searchItemParam;

        var height = 200;
        var view = new View({
            size:[undefined,height]
        });
        var background = new Surface({
            size: [undefined, height],
            properties: {
                backgroundColor: 'white',
                borderRadius: '5px',
                border: '2px solid black'
            }
        });
        view.add(background);

        var imageTransform = new StateModifier({
            transform:Transform.translate(5,5,1)
        });
        var image = new ImageSurface({
            size:[true,120]
        });
        view.add(imageTransform).add(image);

        var titleTransform = new StateModifier({
            transform:Transform.translate(105,5,1)
        });
        var title = new Surface({
            size:[undefined,true]
        });
        view.add(titleTransform).add(title);

        var descriptionTransform = new StateModifier({
            transform:Transform.translate(105,25,1)
        });
        var description = new Surface({
            size:[window.mainContext.getSize()[0]-10-100,height-20]
        });
        view.add(descriptionTransform).add(description);
        
        var eventCapTransform = new StateModifier({
            transform:Transform.translate(0,0,2)
        });
        var eventCapSurface = new Surface({
            size:[undefined,height]
        });
        eventCapSurface.on('click', function ()
        {
            view._eventOutput.emit('searchSeriesSelected',searchItem);
        });
        view.add(eventCapTransform).add(eventCapSurface);

        view.update = function (searchItemParam)
        {
            searchItem = searchItemParam;
            image.setContent(searchItem.image);
            title.setContent(searchItem.title);
            description.setContent(searchItem.synopsis);
        }

        view.update(searchItem);
        return view;
    }
    module.exports = createSearchItemDisplay;
});