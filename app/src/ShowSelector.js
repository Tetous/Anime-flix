/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */

define(function(require, exports, module) {
	var View = require('famous/core/View');
	var Easing = require('famous/transitions/Easing');
	var Transform = require('famous/core/Transform');
	var StateModifier= require('famous/modifiers/StateModifier');
	var Surface=require('famous/core/Surface');
	var ContainerSurface=require('famous/surfaces/ContainerSurface');
	var ImageSurface = require('famous/surfaces/ImageSurface');
	var Scrollview=require('famous/views/Scrollview');
	var HeaderFooterLayout = require("famous/views/HeaderFooterLayout");
	var GridLayout = require("famous/views/GridLayout");
	var Lightbox=require('famous/views/Lightbox');
	var IconView=require('NillaIconView');
	var Icon=require('NillaIcon');
	var SeriesDisplay=require('SeriesDisplay');

	require('xml2jsobj/xml2jsobj');

	function createShowSelector(animeList)
	{
		var malList;

		var watching=[];
		var completed=[];
		var onHold=[];
		var dropped=[];
		var planToWatch=[];

		var view=new View();

		var layout=new HeaderFooterLayout({
			headerSize:50,
			footerSize:25
		});
		view.add(layout);

		var headerNode=layout.header.add(new Surface({
			content:'Anime-flix',
			properties:{
				color:'white',
				backgroundColor:'#0066CC'
			}
		}));
		layout.footer.add(new Surface({
			content:'By Richard Kopelow',
			properties:{
				color:'white',
				backgroundColor:'#0066CC'
			}
		}));

		var gridTransform=new StateModifier({
			transform:Transform.translate(0,25,1)
		});

		var grid=new GridLayout({
			size:[undefined,25],
			dimensions:[6,1]
		});

		layout.header.add(gridTransform).add(grid);

		var buttons=[];
		grid.sequenceFrom(buttons);

		var buttonProps={
				textAlign:'center',
				verticalAlign:'middle',
				color:'white'
			};

		var watchingButton=new Surface({
			content:'Watching',
			properties:buttonProps
		});
		var buttonView=new View();
		buttonView.add(watchingButton);
		buttons.push(buttonView);
		watchingButton.on('click',function(){lightbox.show(watchingIconView);})

		var completedButton=new Surface({
			content:'Completed',
			properties:buttonProps
		});
		var buttonView=new View();
		buttonView.add(completedButton);
		buttons.push(buttonView);
		completedButton.on('click',function(){lightbox.show(completedIconView);})

		var onHoldButton=new Surface({
			content:'On-Hold',
			properties:buttonProps
		});
		var buttonView=new View();
		buttonView.add(onHoldButton);
		buttons.push(buttonView);
		onHoldButton.on('click',function(){lightbox.show(onHoldIconView);})

		var droppedButton=new Surface({
			content:'Dropped',
			properties:buttonProps
		});
		var buttonView=new View();
		buttonView.add(droppedButton);
		buttons.push(buttonView);
		droppedButton.on('click',function(){lightbox.show(droppedIconView);})

		var planToWatchButton=new Surface({
			content:'Plan To Watch',
			properties:buttonProps
		});
		var buttonView=new View();
		buttonView.add(planToWatchButton);
		buttons.push(buttonView);
		planToWatchButton.on('click',function(){lightbox.show(planToWatchIconView);})

		var searchButton=new Surface({
			content:'Search',
			properties:buttonProps
		});
		var buttonView=new View();
		buttonView.add(searchButton);
		buttons.push(buttonView);

	    //Series Display
		var seriesDisplayTransform = new StateModifier({
		    transform:Transform.translate(0,0,15)
		});
		var seriesDisplay = SeriesDisplay();
		view.add(seriesDisplayTransform).add(seriesDisplay);
		seriesDisplay.on('showSelected', function (data) {
		    view._eventOutput.emit('showSelected', data);
		});

        //Background
		var background=new Surface({
			properties:{
				backgroundColor:'white',
			}
		});
		layout.content.add(background);

		var screenWidth=window.mainContext.getSize()[0];

		var lightboxTransform=new StateModifier({
			transform:Transform.translate(0,0,1)
		});
		var lightbox=new Lightbox({
			inOpacity: 1,
			outOpacity: 1,
			inTransform: Transform.translate(screenWidth,0, 1),
			outTransform: Transform.translate(-1*screenWidth, 0, 1),
			inTransition: { duration: 500, curve: Easing.outBack },
			outTransition: { duration: 500, curve: Easing.easeOut }
		});

		function showSelectedPassThrough(data) {
		    var series = { listData: data };
		    seriesDisplay.setSeries(series);
		    seriesDisplay.show();
			//view._eventOutput.emit('showSelected',data);
		}

		var watchingIconView=IconView();
		watchingIconView.on('iconClick',showSelectedPassThrough);
		var completedIconView=IconView();
		completedIconView.on('iconClick', showSelectedPassThrough);
		var onHoldIconView=IconView();
		onHoldIconView.on('iconClick', showSelectedPassThrough);
		var droppedIconView=IconView();
		droppedIconView.on('iconClick', showSelectedPassThrough);
		var planToWatchIconView=IconView();
		planToWatchIconView.on('iconClick', showSelectedPassThrough);

		layout.content.add(lightboxTransform).add(lightbox);

		function getMALList()
	    {
	        var url="http://www.learnfamo.us/chard/requester.php?m=list&u="+window.MALCreds.username;
	        var request = new XMLHttpRequest();
	        request.open("GET", url,false);
	        request.send();
	        var body=request.responseText;

	        malList=XML2jsobj(request.responseXML.documentElement);
	        var i=0;
	    }
	    function sortMALList()
	    {
	    	malList.anime.forEach(function(anime){
	    		switch(anime.my_status)
	    		{
	    			case '1':
	    				watching.push(anime);
	    				break;
	    			case '2':
	    				completed.push(anime);
	    				break;
	    			case '3':
	    				onHold.push(anime);
	    				break;
	    			case '4':
	    				dropped.push(anime);
	    				break;
	    			case '6':
	    				planToWatch.push(anime);
	    				break;
	    		}
	    	});
	    }

		view.refreshList=function()
		{
			getMALList();
			sortMALList();
			watchingIconView.populate(watching);
			completedIconView.populate(completed);
			onHoldIconView.populate(onHold);
			droppedIconView.populate(dropped);
			planToWatchIconView.populate(planToWatch);

			lightbox.show(watchingIconView);
		}

		return view;
	}
	module.exports=createShowSelector;
});