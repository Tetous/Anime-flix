/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */

define(function(require, exports, module) {
	var View = require('famous/core/View');
	var Transform = require('famous/core/Transform');
	var StateModifier= require('famous/modifiers/StateModifier');
	var Surface=require('famous/core/Surface');
	var ImageSurface = require('famous/surfaces/ImageSurface');
	function createNillaIcon(data)
	{
		var iconWidth=150;
		var iconHeight=iconWidth*1.555;

		var view = new View();
		view.data=data;
		var image=new ImageSurface({
				size:[iconWidth,iconHeight],
				content:data.series_image
			});
        
		var titleTransform=new StateModifier({
			transform:Transform.translate(0,iconHeight,1)
		});
		var title=new Surface({
			size:[iconWidth,true],
			content:data.series_title,
			properties:{
				textAlign:'center'
			}
		});
		image.on('click',function(){
			view._eventOutput.emit('click',view);
		});

		view.add(image);
		view.add(titleTransform).add(title);
		return view;
	}
	module.exports=createNillaIcon;
});