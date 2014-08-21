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

    function createSearchItemDisplay(searchItem)
    {
        var height = 100;
        var view = new View({
            size:[undefined,height]
        });
        var background = new Surface({
            size: [undefined, height],
            properties: {
                backgroundColor: 'gray',
                borderRadius:'5px'
            }
        });
        view.add(background);

        var imageTransform = new StateModifier({
            transform:Transfomr.translate(5,5,1)
        });
        var image = new ImageSurface();
        view.add(imageTransform).add(image);

        var descriptionTransform = new StateModifier({
            transform:Transform.translate(55,25,1)
        });
        var description = new Surface({
            size:[window.mainContext.getSize()[0]-10-50,height-20]
        });

        view.update = function (searchItem)
        {
            image.setContent(searchItem.image);
        }

        view.update(searchItem);
        return view;
    }
    module.exports = createSearchItemDisplay;
});