/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */


define(function (require, exports, module)
{
    //#region Requires
    var Engine = require('famous/core/Engine');
	var View = require('famous/core/View');
	var Easing = require('famous/transitions/Easing');
	var Transform = require('famous/core/Transform');
	var StateModifier= require('famous/modifiers/StateModifier');
	var Surface=require('RichFamous/Surface');
	var ContainerSurface=require('famous/surfaces/ContainerSurface');
	var ImageSurface = require('famous/surfaces/ImageSurface');
	var Scrollview=require('famous/views/Scrollview');
	var HeaderFooterLayout = require("famous/views/HeaderFooterLayout");
	var GridLayout = require("famous/views/GridLayout");
	var Lightbox=require('famous/views/Lightbox');
	var IconView=require('NillaIconView');
	var Icon=require('NillaIcon');
	var SeriesDisplay = require('SeriesDisplay');
	var SearchView = require('SearchView');

	require('xml2jsobj/xml2jsobj');
    //#endregion

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
			headerSize:100,
			footerSize:50
		});
		view.add(layout);

		var headerNode=layout.header.add(Surface({
			properties:{
			    backgroundColor: '#0066CC'
			}
		}));
		layout.header.add(new ImageSurface({
		    size: [true, 50],
            content: 'content/images/AnimeflixLogo.png'
		}));
		layout.footer.add(Surface({
			content:'By Richard Kopelow',
			properties:{
				color:'white',
				backgroundColor: '#0066CC',
				verticalAlign:'middle'
			}
		}));

		var gridTransform=new StateModifier({
			transform:Transform.translate(0,50,1)
		});

		var gridHeight = 50;
		var grid=new GridLayout({
		    size: [undefined, gridHeight],
			dimensions:[6,1]
		});

		layout.header.add(gridTransform).add(grid);
        //#region Catagory Buttons
		var buttons=[];
		grid.sequenceFrom(buttons);

		var buttonProps={
				textAlign:'center',
				verticalAlign:'middle',
				color:'white'
			};

		var watchingButton = Surface({
		    size: [undefined, gridHeight],
			content:'Watching',
			properties:buttonProps
		});
		var buttonView=new View();
		buttonView.add(watchingButton);
		buttons.push(buttonView);
		watchingButton.on('click',function(){lightbox.show(watchingIconView);})

		var completedButton = Surface({
		    size: [undefined, gridHeight],
			content:'Completed',
			properties:buttonProps
		});
		var buttonView=new View();
		buttonView.add(completedButton);
		buttons.push(buttonView);
		completedButton.on('click',function(){lightbox.show(completedIconView);})

		var onHoldButton = Surface({
		    size: [undefined, gridHeight],
			content:'On-Hold',
			properties:buttonProps
		});
		var buttonView=new View();
		buttonView.add(onHoldButton);
		buttons.push(buttonView);
		onHoldButton.on('click',function(){lightbox.show(onHoldIconView);})

		var droppedButton = Surface({
		    size: [undefined, gridHeight],
			content:'Dropped',
			properties:buttonProps
		});
		var buttonView=new View();
		buttonView.add(droppedButton);
		buttons.push(buttonView);
		droppedButton.on('click',function(){lightbox.show(droppedIconView);})

		var planToWatchButton = Surface({
		    size: [undefined, gridHeight],
			content:'Plan To Watch',
			properties:buttonProps
		});
		var buttonView=new View();
		buttonView.add(planToWatchButton);
		buttons.push(buttonView);
		planToWatchButton.on('click',function(){lightbox.show(planToWatchIconView);})

		var searchButton = Surface({
		    size: [undefined, gridHeight],
			content:'Search',
			properties:buttonProps
		});
		var buttonView=new View();
		buttonView.add(searchButton);
		buttons.push(buttonView);
		searchButton.on('click', function () { lightbox.show(searchView); });
        //#endregion

	    //#region Series Display
		var seriesDisplayTransform = new StateModifier({
		    transform:Transform.translate(0,0,15)
		});
		var seriesDisplay = SeriesDisplay();
		view.add(seriesDisplayTransform).add(seriesDisplay);
		seriesDisplay.on('showSelected', function (data) {
		    view._eventOutput.emit('showSelected', data);
		});
        //#endregion

        //#region Background
		var background=Surface({
			properties:{
				backgroundColor:'white',
			}
		});
		layout.content.add(background);
        //#endregion

        //#region Lightbox
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
        //#endregion

		function searchShowWithID(title,id)
		{
		    var request = new XMLHttpRequest();
		    request.open('POST', 'http://www.anime-flix.com/requester.php?m=search&s=' + title, false);
		    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		    request.send('u=' + sessionStorage.username + '&p=' + sessionStorage.password);
		    var parser = new DOMParser();
		    var decodedRes = request.response.replace(/&mdash;/g, '-').replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"').replace(/&rsquo;/g, '\'');
		    var domObj = parser.parseFromString(decodedRes, "text/xml");
		    var obj = XML2jsobj(domObj).anime;
		    if (obj.entry.length==undefined)
		    {
		        return obj.entry;
		    }
		    else
		    {
		        for (var i = 0; i < obj.entry.length; i++)
		        {
		            if (obj.entry[i].id == id)
		            {
		                return obj.entry[i];
		            }
		        }
		    }
		}

		function createBlankListData()
		{
		    var date=new Date();
		    return {
		        series_animedb_id: 0,
		        series_title: "",
		        series_type: 1,
		        series_episodes: 0,
		        series_status: 0,
		        series_start: '0000-00-00',
		        series_end:'0000-00-00',
		        my_id: 0,
		        my_watched_episodes: 0,
		        my_start_date: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
		        my_finish_date: '000-00-00',
		        my_score: 0,
		        my_status: 0,
		        my_rewatching: 0,
		        my_rewatching_ep: 0,
		        my_last_updated: 0
		    };
		}
		function createListDataFromSearchData(data)
		{
		    var baseData = createBlankListData();
		    baseData.series_animedb_id = data.id;
		    baseData.series_title = data.title;
		    baseData.series_image = data.image;
		    baseData.series_start = data.start_date;
		    baseData.series_end = data.end_date;
		    baseData.series_episodes = data.episodes;
		    baseData.series_synonyms = data.synonyms + '; ' + data.english;
		    baseData.localConstruction = true;
		    return baseData;
		}

		function showSelectedPassThrough(data) {
		    var series = { listData: data, searchData: searchShowWithID(data.series_title, data.series_animedb_id) };
		    seriesDisplay.setSeries(series);
		    seriesDisplay.show();
			//view._eventOutput.emit('showSelected',data);
		}

		Engine.on('resize', function ()
		{
		    seriesDisplay.updatePosition();
		});

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
		var searchView = SearchView();
		searchView.on('searchSeriesSelected', function (data)
		{
		    var listData;
		    var bail = false;
		    for (var i = 0; i < malList.anime.length&&!bail; i++)
		    {
		        if (data.id == malList.anime[i].series_animedb_id)
		        {
		            listData = malList.anime[i];
		            bail = true;
		        }
		    }
		    if (listData==undefined)
		    {
		        listData=createListDataFromSearchData(data);
		    }
		    var series = { listData: listData, searchData: data };
		    seriesDisplay.setSeries(series);
		    seriesDisplay.show();
		});

		layout.content.add(lightboxTransform).add(lightbox);

		function getMALList()
	    {
	        var url='http://www.anime-flix.com/requester.php?m=list';
	        var request = new XMLHttpRequest();
	        request.open("POST", url, false);
	        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	        request.send('u=' + sessionStorage.username + '&p=' + sessionStorage.password);
	        var body=request.responseText;

	        malList = XML2jsobj(request.responseXML.documentElement);
	        if (malList.anime==undefined)
	        {
	            malList.anime = [];
	        }
	        if (malList.anime.length==undefined)
	        {
	            malList.anime = [malList.anime];
	        }
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