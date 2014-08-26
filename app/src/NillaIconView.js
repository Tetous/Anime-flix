/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */

define(function (require, exports, module)
{
    var Engine = require('famous/core/Engine');
	var View = require('famous/core/View');
	var Transform = require('famous/core/Transform');
	var Easing = require('famous/transitions/Easing');
	var StateModifier= require('famous/modifiers/StateModifier');
	var Surface=require('famous/core/Surface');
	var ContainerSurface=require('famous/surfaces/ContainerSurface');
	var ImageSurface = require('famous/surfaces/ImageSurface');
	var Scrollview=require('famous/views/Scrollview');
	var Icon=require('NillaIcon');

	function createNillaIconView() {
	    var iconStateMods = [];

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
			positionIcons(0);
		}

		function positionIcons(duration)
		{
		    var windowSize = window.mainContext.getSize();

		    var minIconBufferX = 50;
		    var iconWidth = 150;
		    var iconHeight = iconWidth * 1.555;
		    var imagesPerRow = Math.floor((windowSize[0] - minIconBufferX) / (iconWidth + minIconBufferX));

		    var iconBufferX = (windowSize[0]-(minIconBufferX + (minIconBufferX + iconWidth) * imagesPerRow))/(imagesPerRow+1)+minIconBufferX;

		    iconView.setOptions({ size: [undefined, 100 + Math.floor(iconStateMods.length / imagesPerRow + 0.95) * (iconHeight + 100)] });

		    for (var i = 0; i < iconStateMods.length; i++)
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