/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */

define(function(require, exports, module) {
    var View = require('famous/core/View');
    var RenderController = require('famous/views/RenderController');
	var Transform = require('famous/core/Transform');
	var StateModifier= require('famous/modifiers/StateModifier');
	var Surface=require('famous/core/Surface');
	var ImageSurface = require('famous/surfaces/ImageSurface');
	var EventHandler = require('famous/core/EventHandler');
	function createNillaIcon(data)
	{
	    var iconWidth=150;
	    var iconHeight=iconWidth*1.555;

	    var view = new View();
	    view.data = data;

	    var iconEventHandler = new EventHandler();

	    var bannerTransform = new StateModifier({
	        transform: Transform.translate(0, 0, 1)
	    });
	    var bannerRenderController = new RenderController();
	    var banner = new ImageSurface({
	        size: [iconWidth, iconHeight],
	        content: 'content/images/newEpisodesbanner.png'
	    });
	    banner.pipe(iconEventHandler);
	    view.add(bannerTransform).add(bannerRenderController);
	    //else
	    //{
	    //    crateNewEpisodebanner();
	    //}
		var image=new ImageSurface({
		    size: [iconWidth, iconHeight],
		    properties: {
                borderRadius:'10px'
		    }
			});
		image.pipe(iconEventHandler);
		var titleTransform=new StateModifier({
			transform:Transform.translate(0,iconHeight,1)
		});
		var title=new Surface({
			size:[iconWidth,true],
			properties:{
			    textAlign: 'center',
                color:'white'
			}
		});
		iconEventHandler.on('click',function(){
			view._eventOutput.emit('click',view);
		});

		view.add(image);
		view.add(titleTransform).add(title);

		view.setSeries = function (series)
		{
		    view.data = series;
		    view.data.originalEpisodeCount = view.data.series_episodes;
		    title.setContent(series.series_title);
		    image.setContent(series.series_image);
		    bannerRenderController.hide();
		    if (data.series_status == 1)
		    {
		        var ledgerItem = window.ledger.getLedgerItem(view.data);
		        getEpisodeCountAsync(view.data.series_title, ledgerItem.link, function (episodeCounts)
		        {
		            view.data.series_episodes = episodeCounts[0] ? episodeCounts[0] : episodeCounts[1];

		            if (view.data.my_status == 1)
		            {
		                if (view.data.series_episodes > view.data.my_watched_episodes)
		                {
		                    bannerRenderController.show(banner);
		                }
		            }
		        });
		    }
		}

		view.setSeries(data);
		return view;
	}
	module.exports=createNillaIcon;
});