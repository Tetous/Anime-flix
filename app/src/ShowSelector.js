/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */


define(function (require, exports, module)
{
    //#region Requires
    var Engine = require('famous/core/Engine');
    var View = require('famous/core/View');
    var EventHandler = require('famous/core/EventHandler');
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
	require('MALSupportFunctions');
    //#endregion

	function createShowSelector(animeList)
	{
	    var malList;

	    var sectionDisplaying=1;
	    var watching=[];
	    var completed=[];
	    var onHold=[];
	    var dropped=[];
	    var planToWatch=[];

	    var view=new View();

	    var headerHeight = 100;
	    var footerHeight = 50;
	    var layout=new HeaderFooterLayout();
	    view.add(layout);

	    var headerFooterColor=window.colorScheme.main;

	    var headerNode=layout.header.add(Surface({
	        properties:{
	            backgroundColor: headerFooterColor
	        }
	    }));
	    var logoSizer = new StateModifier();
	    var logo = new ImageSurface({
	        content: 'content/images/AnimeflixLogo.png'
	    });
	    layout.header.add(logoSizer).add(logo);
	    //#region Footer
	    layout.footer.add(Surface({
	        properties: {
                backgroundColor:headerFooterColor
	        }
	    }));

	    var footerElements = [];
	    var footerGrid = new GridLayout({
	        size: [undefined, footerHeight],
            dimensions:[3,1]
	    });
	    footerGrid.sequenceFrom(footerElements);
	    layout.footer.add(footerGrid);
        
	    var byRichard = Surface({
	        content: 'By Richard Kopelow',
	        properties: {
                size:[undefined,footerHeight],
                color: 'white',
                textAlign:'center',
	            verticalAlign: 'middle',
	        }
	    });
	    footerElements.push(byRichard);
	    var supportContact = Surface({
	        content: '<a href="mailto:support@anime-flix.com">support@anime-flix.com</a>',
	        properties: {
	            size: [undefined, footerHeight],
	            color: 'white',
	            textAlign: 'center',
	            verticalAlign: 'middle',
	        }
	    });
	    footerElements.push(supportContact);
	    var featuresContact = Surface({
	        content: '<a href="mailto:features@anime-flix.com?subject=Feature Request">features@anime-flix.com</a>',
	        properties: {
	            size: [undefined, footerHeight],
	            color: 'white',
	            textAlign: 'center',
	            verticalAlign: 'middle',
	        }
	    });
	    footerElements.push(featuresContact);
        //#endregion

	    var buttonProps={
	        textAlign:'center',
	        verticalAlign:'middle',
	        color: 'white',
	        borderTopRightRadius: '5px',
	        borderTopLeftRadius: '5px'
	    };

	    var buttonColorEvents = new EventHandler();
	    buttonColorEvents.on('mouseover', function (button)
	    {
	        button.currentTarget.style.color = 'black';
	        button.currentTarget.style.backgroundColor = 'white';
	    });
	    buttonColorEvents.on('mouseout', function (button)
	    {
	        button.currentTarget.style.color = 'white';
	        button.currentTarget.style.backgroundColor = headerFooterColor;
	    });

	    var logoutButtonTransform = new StateModifier({
	        origin: [1,0],
	        align:[1,0],
	        transform:Transform.translate(-5,-5,1)
	    });
	    var logoutButton = Surface({
	        size:[100,40],
	        content: 'Logout',
	        properties:buttonProps
	    });
	    logoutButton.setProperties({
            borderRadius:'5px'
	    });
	    logoutButton.on('click', function ()
	    {
	        sessionStorage.username = undefined;
	        sessionStorage.password = undefined;
	        window.location.href = 'http://anime-flix.com';
	    });
		logoutButton.pipe(buttonColorEvents);
		layout.header.add(logoutButtonTransform).add(logoutButton);

		var gridHeight = headerHeight / 2;
		var gridTransform=new StateModifier();

		var grid=new GridLayout({
			dimensions:[6,1]
		});

		layout.header.add(gridTransform).add(grid);
        //#region Catagory Buttons
		var buttons=[];
		grid.sequenceFrom(buttons);

		var watchingButton = Surface({
		    size: [undefined, gridHeight],
			content:'Watching',
			properties:buttonProps
		});
		var buttonView=new View();
		buttonView.add(watchingButton);
		buttons.push(buttonView);
		watchingButton.on('click', function ()
		{
		    lightbox.show(watchingIconView);
		    sectionDisplaying = 1;
		    window.location.hash = 'sdisplay&1';
		});
		watchingButton.pipe(buttonColorEvents);

		var completedButton = Surface({
		    size: [undefined, gridHeight],
			content:'Completed',
			properties:buttonProps
		});
		var buttonView=new View();
		buttonView.add(completedButton);
		buttons.push(buttonView);
		completedButton.on('click', function ()
		{
		    lightbox.show(completedIconView);
		    sectionDisplaying = 2;
		    window.location.hash = 'sdisplay&2';
		});
		completedButton.pipe(buttonColorEvents);

		var onHoldButton = Surface({
		    size: [undefined, gridHeight],
			content:'On-Hold',
			properties:buttonProps
		});
		var buttonView=new View();
		buttonView.add(onHoldButton);
		buttons.push(buttonView);
		onHoldButton.on('click', function ()
		{
		    lightbox.show(onHoldIconView);
		    sectionDisplaying = 3;
		    window.location.hash = 'sdisplay&3';
		});
		onHoldButton.pipe(buttonColorEvents);

		var droppedButton = Surface({
		    size: [undefined, gridHeight],
			content:'Dropped',
			properties:buttonProps
		});
		var buttonView=new View();
		buttonView.add(droppedButton);
		buttons.push(buttonView);
		droppedButton.on('click', function ()
		{
		    lightbox.show(droppedIconView);
		    sectionDisplaying = 4;
		    window.location.hash = 'sdisplay&4';
		});
		droppedButton.pipe(buttonColorEvents);

		var planToWatchButton = Surface({
		    size: [undefined, gridHeight],
			content:'Plan To Watch',
			properties:buttonProps
		});
		var buttonView=new View();
		buttonView.add(planToWatchButton);
		buttons.push(buttonView);
		planToWatchButton.on('click', function ()
		{
		    lightbox.show(planToWatchIconView);
		    sectionDisplaying = 6;
		    window.location.hash = 'sdisplay&6';
		});
		planToWatchButton.pipe(buttonColorEvents);

		var searchButton = Surface({
		    size: [undefined, gridHeight],
			content:'Search',
			properties:buttonProps
		});
		var buttonView=new View();
		buttonView.add(searchButton);
		buttons.push(buttonView);
		searchButton.on('click', function ()
		{
		    lightbox.show(searchView);
		    sectionDisplaying = 7;
		    window.location.hash = 'sdisplay&7';
		});
		searchButton.pipe(buttonColorEvents);
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
		seriesDisplay.on('refreshList', function ()
		{
		    view.refreshList();
		});
	    //#endregion

		view.resize = function ()
		{
		    seriesDisplay.resize();
		    seriesDisplay.updatePosition();
		    watchingButton.setOptions({size:[undefined, window.formatting.scale * gridHeight]});
		    completedButton.setOptions({ size: [undefined, window.formatting.scale * gridHeight]});
		    onHoldButton.setOptions({ size: [undefined, window.formatting.scale * gridHeight]});
		    droppedButton.setOptions({ size: [undefined, window.formatting.scale * gridHeight]});
		    planToWatchButton.setOptions({ size: [undefined, window.formatting.scale * gridHeight]});
		    searchButton.setOptions({ size: [undefined, window.formatting.scale * gridHeight]});
		    logoutButton.setOptions({ size: [window.formatting.scale * 100, window.formatting.scale * gridHeight] });
		    watchingButton.setProperties({ fontSize: window.formatting.scale * 20 + 'px' });
		    completedButton.setProperties({fontSize: window.formatting.scale * 20 + 'px' });
		    onHoldButton.setProperties({ fontSize: window.formatting.scale * 20 + 'px' });
		    droppedButton.setProperties({ fontSize: window.formatting.scale * 20 + 'px' });
		    planToWatchButton.setProperties({ fontSize: window.formatting.scale * 20 + 'px' });
		    searchButton.setProperties({fontSize: window.formatting.scale * 20 + 'px' });
		    logoutButton.setProperties({ fontSize: window.formatting.scale * 20 + 'px' });
		    byRichard.setProperties({ fontSize: window.formatting.scale * 20 + 'px' });
		    supportContact.setProperties({ fontSize: window.formatting.scale * 20 + 'px' });
		    featuresContact.setProperties({ fontSize: window.formatting.scale * 20 + 'px' });
		    layout.setOptions({
		        headerSize: window.formatting.scale * headerHeight,
		        footerSize: window.formatting.scale * footerHeight
		    });
		    logoSizer.setSize([true, window.formatting.scale * 50]);
		    //logo.setProperties({ 'height': window.formatting.scale * 50 +'px'});
		    gridTransform.setTransform(Transform.translate(0, window.formatting.scale * (headerHeight - gridHeight), 1));
		    grid.setOptions({ size: [undefined, window.formatting.scale * gridHeight] });
		}

        //#region Background
		var background=Surface({
			properties:{
				backgroundColor:window.colorScheme.background,
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
		    var obj=searchMAL(title);
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
		        my_status: 6,
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
	        watching = [];
	        completed = [];
	        onHold = [];
	        dropped = [];
	        planToWatch = [];
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

			//lightbox.show(watchingIconView);
		}

		view.selectShowById = function (id)
		{
		    for (var i = 0; i < malList.anime.length; i++)
		    {
		        if (malList.anime[i].series_animedb_id==id)
		        {
		            return malList.anime[i];
		        }
		    }
		    var blank = createBlankListData();
		    blank.series_animedb_id = id;
		    blank.my_status = 1;
		    blank.localConstruction = true;
		    return blank;
		}
		view.showSection = function (section)
		{
		    switch (section)
		    {
		        case '1':
		            lightbox.show(watchingIconView);
		            break;
		        case '2':
		            lightbox.show(completedIconView);
		            break;
		        case '3':
		            lightbox.show(onHoldIconView);
		            break;
		        case '4':
		            lightbox.show(droppedIconView);
		            break;
		        case '6':
		            lightbox.show(planToWatchIconView);
		            break;
		        case '7':
		            lightbox.show(searchView);
		            break;
		    }
		}
		view.getShowingSection = function ()
		{
		    return sectionDisplaying;
		}

		return view;
	}
	module.exports=createShowSelector;
});