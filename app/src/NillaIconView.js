/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */

define(function (require, exports, module)
{
    var Engine = require('famous/core/Engine');
    var View = require('famous/core/View');
    var RenderController = require('famous/views/RenderController');
	var Transform = require('famous/core/Transform');
	var Easing = require('famous/transitions/Easing');
	var StateModifier= require('famous/modifiers/StateModifier');
	var Surface=require('famous/core/Surface');
	var ContainerSurface=require('famous/surfaces/ContainerSurface');
	var ImageSurface = require('famous/surfaces/ImageSurface');
	var Scrollview=require('famous/views/Scrollview');
	var Icon=require('NillaIcon');

	function createNillaIconView()
	{
	    var numberOfRenderingIcons=0;
	    var iconStateMods = [];
	    var iconRenderControllers = [];
	    var surfaces = [];

		var view=new View();
		var container=new ContainerSurface({
			//size:window.mainContext.getSize(),
			properties: { overflow: 'hidden' }
		});

		var scroll=new Scrollview({
		    direction:1,
		    friction:1,
		    drag: 1,
		    speedLimit: 1
		  });

		var iconView=new View();
		container.pipe(scroll);

		scroll.sequenceFrom([iconView]);
		container.add(scroll);
		view.add(container);

		view.populate=function populate(shows)
		{
		    numberOfRenderingIcons = shows.length;
		    for (var i = 0; i < iconRenderControllers.length; i++)
		    {
		        iconRenderControllers[i].hide();
		    }
		    var iconsToReUse = 0;
		    var iconsToCreate = 0;
		    if (shows.length>surfaces.length)
		    {
		        iconsToReUse = surfaces.length;
		        iconsToCreate = shows.length - surfaces.length;
		    }
		    else
		    {
		        iconsToReUse = shows.length;
		        iconsToCreate = 0;
		    }
		    for (var i = 0; i < iconsToReUse; i++)
		    {
		        surfaces[i].setSeries(shows[i]);
		        iconRenderControllers[i].show(surfaces[i]);
		    }
		    for (var i = 0; i < iconsToCreate; i++)
		    {
		        var iconTransform = new StateModifier();
		        iconStateMods.push(iconTransform);
		        var iconRenderController = new RenderController();
		        iconRenderControllers.push(iconRenderController);
		        var icon = Icon(shows[i+iconsToReUse]);
		        icon.on('click', function (icon)
		        {
		            view._eventOutput.emit('iconClick', icon.data);
		        });
		        surfaces.push(icon);

		        iconView.add(iconTransform).add(iconRenderController);
		        iconRenderController.show(icon);
		    }
            /*
			for (var i = 0; i < shows.length; i++) {
				var showData=shows[i];

				var iconTransform = new StateModifier({});
				iconStateMods.push(iconTransform);
				var icon = Icon(showData);
				icon.on('click', function (icon)
				{
				    view._eventOutput.emit('iconClick', icon.data);
				});

				iconView.add(iconTransform).add(icon);
			};
            )*/
			positionIcons(1000);
		}

		function positionIcons(duration)
		{
		    var windowSize = window.mainContext.getSize();

		    var minIconBufferX = 50;
		    var iconWidth = 150;
		    var iconHeight = iconWidth * 1.555;
		    var imagesPerRow = Math.floor((windowSize[0] - minIconBufferX) / (iconWidth + minIconBufferX));

		    var iconBufferX=0;
		    if (imagesPerRow <= numberOfRenderingIcons)
		    {
		        iconBufferX = (windowSize[0] - (minIconBufferX + (minIconBufferX + iconWidth) * imagesPerRow)) / (imagesPerRow + 1) + minIconBufferX;
		    }
		    else
		    {
		        iconBufferX = minIconBufferX + (iconWidth + minIconBufferX) / (numberOfRenderingIcons+1);
		    }

		    iconView.setOptions({ size: [undefined, 100 + Math.floor(numberOfRenderingIcons / imagesPerRow + 0.95) * (iconHeight + 100)] });

		    for (var i = 0; i < numberOfRenderingIcons; i++)
		    {
		        iconStateMods[i].halt();
		        iconStateMods[i].setTransform(Transform.translate(i % imagesPerRow * (iconWidth + iconBufferX) + iconBufferX, 100 + Math.floor(i / imagesPerRow) * (iconHeight + 100), window.showSelectorZ + 10), { duration: duration, curve: Easing.outCubic });
		    }
		}

		Engine.on('resize', function ()
		{
		    positionIcons(1000);
		});

		return view;
	}
	module.exports=createNillaIconView;
});