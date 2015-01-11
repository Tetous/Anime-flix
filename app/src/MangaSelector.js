/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */


define(function (require, exports, module)
{
    //#region Requires
    var View = require('famous/core/View');
    var EventHandler = require('famous/core/EventHandler');
    var Easing = require('famous/transitions/Easing');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Surface = require('RichFamous/Surface');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var HeaderFooterLayout = require("famous/views/HeaderFooterLayout");
    var GridLayout = require("famous/views/GridLayout");
    var Lightbox = require('famous/views/Lightbox');
    var IconView = require('NillaIconView');
    var SeriesDisplay = require('SeriesDisplay');
    var SearchView = require('SearchView');

    require('xml2jsobj/xml2jsobj');
    require('Anime-flixWebFunctions');
    //#endregion

    function createMangaSelector()
    {
        var malList;

        var sectionDisplaying = 1;
        var reading = [];
        var completed = [];
        var onHold = [];
        var dropped = [];
        var planToRead = [];

        var view = new View();

        var headerHeight = 100;
        var footerHeight = 25;
        var layout = new HeaderFooterLayout();
        view.add(layout);

        var headerFooterColor = window.colorScheme.main;

        layout.header.add(Surface({
            properties: {
                backgroundColor: headerFooterColor
            }
        }));
        var date = new Date();
        var logoSizer = new StateModifier();
        var logo = new ImageSurface({
            content: 'content/images/AnimeflixLogo.png?' + date.getTime()
        });
        layout.header.add(logoSizer).add(logo);
        //#region Footer
        layout.footer.add(Surface({
            properties: {
                backgroundColor: headerFooterColor
            }
        }));

        var footerElements = [];
        var footerGrid = new GridLayout({
            size: [undefined, footerHeight],
            dimensions: [4, 1]
        });
        footerGrid.sequenceFrom(footerElements);
        layout.footer.add(footerGrid);

        var byRichard = Surface({
            content: 'By Richard Kopelow',
            properties: {
                size: [undefined, footerHeight],
                color: 'white',
                textAlign: 'center',
                verticalAlign: 'middle'
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

        var FAQButton = Surface({
            content: 'FAQ',
            properties: {
                size: [undefined, footerHeight],
                color: 'white',
                textAlign: 'center',
                verticalAlign: 'middle',
            }
        });
        FAQButton.on('click', function ()
        {
            view._eventOutput.emit('showFAQ');
        });
        footerElements.push(FAQButton);
        //#region IP Adress
        /*
         var ipAddress = Surface({
         properties: {
         size: [undefined, footerHeight],
         color: 'white',
         textAlign: 'center',
         verticalAlign: 'middle',
         }
         });
         footerElements.push(ipAddress);
         
         var RTCPeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
         
         var configuration = { "iceServers": [] };
         var pc;
         var localIP;
         
         if (RTCPeerConnection)
         {
         
         pc = new RTCPeerConnection(configuration);
         pc.createDataChannel('', { reliable: false });
         pc.onicecandidate = function (evt)
         {
         if (evt.candidate)
         {
         if (!localIP)
         {
         localIP = getIpFromString(evt.candidate.candidate);
         ipAddress.setContent('IP Address: ' + localIP);
         }
         }
         };
         
         pc.createOffer(function (offerDesc)
         {;
         pc.setLocalDescription(offerDesc);
         }, function (e) { console.warn("offer failed", e); });
         
         function getIpFromString(a)
         {
         var r = a.match(/\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/);
         return r[0];
         }
         
         } else
         {
         //browser doesn't support webrtc   
         }
         */
        //#endregion
        //#endregion

        var buttonProps = {
            textAlign: 'center',
            verticalAlign: 'middle',
            color: 'white'
        };

        var buttonColorEvents = new EventHandler();
        /*
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
         */
        var logoutButtonTransform = new StateModifier({
            origin: [1, 0],
            align: [1, 0],
            transform: Transform.translate(-5, -5, 1)
        });
        var logoutButton = Surface({
            size: [100, 40],
            content: 'Logout',
            properties: buttonProps
        });
        logoutButton.on('click', function ()
        {
            sessionStorage.username = undefined;
            sessionStorage.password = undefined;
            location.hash = '';
            location.reload();
        });
        logoutButton.pipe(buttonColorEvents);
        layout.header.add(logoutButtonTransform).add(logoutButton);

        var spinButtonTransform = new StateModifier({
            origin: [1, 0],
            align: [1, 0],
            transform: Transform.translate(-180, -5, 1)
        });
        var spinButton = Surface({
            size: [200, 40],
            content: 'Anime',
            properties: buttonProps
        });
        spinButton.on('click', function ()
        {
            view._eventOutput.emit('spin');
        });
        spinButton.pipe(buttonColorEvents);
        layout.header.add(spinButtonTransform).add(spinButton);

        var gridHeight = headerHeight / 2;
        var gridTransform = new StateModifier();

        var grid = new GridLayout({
            dimensions: [6, 1]
        });

        layout.header.add(gridTransform).add(grid);
        //#region Catagory Buttons
        var buttons = [];
        grid.sequenceFrom(buttons);

        var readingButton = Surface({
            size: [undefined, gridHeight],
            content: 'Reading',
            properties: buttonProps
        });
        var buttonView = new View();
        buttonView.add(readingButton);
        buttons.push(buttonView);
        readingButton.on('click', function ()
        {
            lightbox.show(readingIconView);
            sectionDisplaying = 1;
            window.location.hash = 'mdisplay&1';
        });
        readingButton.pipe(buttonColorEvents);

        var completedButton = Surface({
            size: [undefined, gridHeight],
            content: 'Completed',
            properties: buttonProps
        });
        var buttonView = new View();
        buttonView.add(completedButton);
        buttons.push(buttonView);
        completedButton.on('click', function ()
        {
            lightbox.show(completedIconView);
            sectionDisplaying = 2;
            window.location.hash = 'mdisplay&2';
        });
        completedButton.pipe(buttonColorEvents);

        var onHoldButton = Surface({
            size: [undefined, gridHeight],
            content: 'On-Hold',
            properties: buttonProps
        });
        var buttonView = new View();
        buttonView.add(onHoldButton);
        buttons.push(buttonView);
        onHoldButton.on('click', function ()
        {
            lightbox.show(onHoldIconView);
            sectionDisplaying = 3;
            window.location.hash = 'mdisplay&3';
        });
        onHoldButton.pipe(buttonColorEvents);

        var droppedButton = Surface({
            size: [undefined, gridHeight],
            content: 'Dropped',
            properties: buttonProps
        });
        var buttonView = new View();
        buttonView.add(droppedButton);
        buttons.push(buttonView);
        droppedButton.on('click', function ()
        {
            lightbox.show(droppedIconView);
            sectionDisplaying = 4;
            window.location.hash = 'mdisplay&4';
        });
        droppedButton.pipe(buttonColorEvents);

        var planToReadButton = Surface({
            size: [undefined, gridHeight],
            content: 'Plan To Read',
            properties: buttonProps
        });
        var buttonView = new View();
        buttonView.add(planToReadButton);
        buttons.push(buttonView);
        planToReadButton.on('click', function ()
        {
            lightbox.show(planToReadIconView);
            sectionDisplaying = 6;
            window.location.hash = 'mdisplay&6';
        });
        planToReadButton.pipe(buttonColorEvents);

        var searchButton = Surface({
            size: [undefined, gridHeight],
            content: 'Search',
            properties: buttonProps
        });
        var buttonView = new View();
        buttonView.add(searchButton);
        buttons.push(buttonView);
        searchButton.on('click', function ()
        {
            lightbox.show(searchView);
            sectionDisplaying = 7;
            window.location.hash = 'mdisplay&7';
        });
        searchButton.pipe(buttonColorEvents);
        //#endregion

        //#region Series Display
        var seriesDisplayTransform = new StateModifier({
            transform: Transform.translate(0, 0, 15)
        });
        var seriesDisplay = SeriesDisplay();
        view.add(seriesDisplayTransform).add(seriesDisplay);
        seriesDisplay.on('showSelected', function (data) {
            view._eventOutput.emit('showSelected', data);
        });
        seriesDisplay.on('mangaSelected', function (data) {
            view._eventOutput.emit('mangaSelected', data);
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
            readingButton.setOptions({
                size: [undefined, window.formatting.scale * gridHeight]});
            completedButton.setOptions({
                size: [undefined, window.formatting.scale * gridHeight]});
            onHoldButton.setOptions({
                size: [undefined, window.formatting.scale * gridHeight]});
            droppedButton.setOptions({
                size: [undefined, window.formatting.scale * gridHeight]});
            planToReadButton.setOptions({
                size: [undefined, window.formatting.scale * gridHeight]});
            searchButton.setOptions({
                size: [undefined, window.formatting.scale * gridHeight]});
            logoutButton.setOptions({
                size: [window.formatting.scale * 100, window.formatting.scale * gridHeight]
                });
            spinButton.setOptions({
                size: [window.formatting.scale * 200, window.formatting.scale * gridHeight]
                });
            readingButton.setProperties({
                fontSize: window.formatting.scale * 20 + 'px'});
            completedButton.setProperties({
                fontSize: window.formatting.scale * 20 + 'px'});
            onHoldButton.setProperties({
                fontSize: window.formatting.scale * 20 + 'px'});
            droppedButton.setProperties({
                fontSize: window.formatting.scale * 20 + 'px'});
            planToReadButton.setProperties({
                fontSize: window.formatting.scale * 20 + 'px'});
            searchButton.setProperties({
                fontSize: window.formatting.scale * 20 + 'px'});
            logoutButton.setProperties({
                fontSize: window.formatting.scale * 20 + 'px'});
            spinButton.setProperties({
                fontSize: window.formatting.scale * 20 + 'px'});
            byRichard.setProperties({
                fontSize: window.formatting.scale * 14 + 'px'});
            supportContact.setProperties({
                fontSize: window.formatting.scale * 14 + 'px'});
            featuresContact.setProperties({
                fontSize: window.formatting.scale * 14 + 'px'});
            FAQButton.setProperties({
                fontSize: window.formatting.scale * 14 + 'px'});
            //ipAddress.setProperties({ fontSize: window.formatting.scale * 14 + 'px' });
            layout.setOptions({
                headerSize: window.formatting.scale * headerHeight,
                footerSize: window.formatting.scale * footerHeight
            });
            logoSizer.setSize([true, window.formatting.scale * 50]);
            //logo.setProperties({ 'height': window.formatting.scale * 50 +'px'});
            gridTransform.setTransform(Transform.translate(0, window.formatting.scale * (headerHeight - gridHeight), 1));
            grid.setOptions({
                size: [undefined, window.formatting.scale * gridHeight]});
        }

        //#region Background
        var background = Surface({
            properties: {
                backgroundColor: window.colorScheme.background,
            }
        });
        layout.content.add(background);
        //#endregion

        //#region Lightbox
        var screenWidth = window.mainContext.getSize()[0];

        var lightboxTransform = new StateModifier({
            transform: Transform.translate(0, 0, 1)
        });
        var lightbox = new Lightbox({
            inOpacity: 1,
            outOpacity: 1,
            inTransform: Transform.translate(screenWidth, 0, 1),
            outTransform: Transform.translate(-1 * screenWidth, 0, 1),
            inTransition: {duration: 1000, curve: Easing.outBack},
            outTransition: {duration: 1000, curve: Easing.easeOut}
        });
        //#endregion
        function searchShowWithID(title, id, callback)
        {
            searchMALAsync(title,'manga', function (obj)
            {
                if(obj.entry.length == undefined)
                {
                    callback(obj.entry);
                }
                else
                {
                    for(var i = 0; i < obj.entry.length; i++)
                    {
                        if(obj.entry[i].id == id)
                        {
                            callback(obj.entry[i]);
                        }
                    }
                }
            });
        }

        function createBlankListData()
        {
            var date = new Date();
            return {
                series_mangadb_id: 0,
                series_title: "",
                series_type: 1,
                series_chapters: 0,
                series_status: 0,
                series_start: '0000-00-00',
                series_end: '0000-00-00',
                my_id: 0,
                my_read_chapters: 0,
                my_start_date: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
                my_finish_date: '000-00-00',
                my_score: 0,
                my_status: 6,
                my_rereading: 0,
                my_rereadingg_ep: 0,
                my_last_updated: 0
            };
        }
        function createListDataFromSearchData(data)
        {
            var baseData = createBlankListData();
            baseData.series_mangadb_id = data.id;
            baseData.series_title = data.title;
            baseData.series_image = data.image;
            baseData.series_status=data.status=='Publishing'?1:0;
            baseData.series_start = data.start_date;
            baseData.series_end = data.end_date;
            baseData.series_chapters = data.chapters;
            baseData.series_synonyms = data.synonyms + '; ' + data.english;
            baseData.localConstruction = true;
            return baseData;
        }

        function showSelectedPassThrough(data)
        {
            searchShowWithID(data.series_title, data.series_mangadb_id, function (obj)
            {
                var series = {listData: data, searchData: obj};
                seriesDisplay.setSeries(series);
                seriesDisplay.show();
            });
            //view._eventOutput.emit('showSelected',data);
        }

        var readingIconView = IconView();
        readingIconView.on('iconClick', showSelectedPassThrough);
        var completedIconView = IconView();
        completedIconView.on('iconClick', showSelectedPassThrough);
        var onHoldIconView = IconView();
        onHoldIconView.on('iconClick', showSelectedPassThrough);
        var droppedIconView = IconView();
        droppedIconView.on('iconClick', showSelectedPassThrough);
        var planToReadIconView = IconView();
        planToReadIconView.on('iconClick', showSelectedPassThrough);
        var searchView = SearchView('manga');
        searchView.on('searchSeriesSelected', function (data)
        {
            var listData;
            var bail = false;
            for(var i = 0; i < malList.manga.length && !bail; i++)
            {
                if(data.id == malList.manga[i].series_mangadb_id)
                {
                    listData = malList.manga[i];
                    bail = true;
                }
            }
            if(listData == undefined)
            {
                listData = createListDataFromSearchData(data);
            }
            var series = {listData: listData, searchData: data};
            seriesDisplay.setSeries(series);
            seriesDisplay.show();
        });

        layout.content.add(lightboxTransform).add(lightbox);

        function sortMALList()
        {
            reading = [];
            completed = [];
            onHold = [];
            dropped = [];
            planToRead = [];
            malList.manga.forEach(function (manga) {
                switch(manga.my_status)
                {
                    case '1':
                        reading.push(manga);
                        break;
                    case '2':
                        completed.push(manga);
                        break;
                    case '3':
                        onHold.push(manga);
                        break;
                    case '4':
                        dropped.push(manga);
                        break;
                    case '6':
                        planToRead.push(manga);
                        break;
                }
            });
        }

        view.refreshList = function ()
        {
            malList=getMALList(true);
            sortMALList();
            readingIconView.populate(reading);
            completedIconView.populate(completed);
            onHoldIconView.populate(onHold);
            droppedIconView.populate(dropped);
            planToReadIconView.populate(planToRead);

            //lightbox.show(readingIconView);
        }

        view.selectShowById = function (id)
        {
            for(var i = 0; i < malList.manga.length; i++)
            {
                if(malList.manga[i].series_mangadb_id == id)
                {
                    return malList.manga[i];
                }
            }
            var blank = createBlankMangaListData();
            blank.series_mangadb_id = id;
            blank.my_status = 1;
            blank.localConstruction = true;
            return blank;
        }
        view.showSection = function (section)
        {
            switch(section)
            {
                case '1':
                    lightbox.show(readingIconView);
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
                    lightbox.show(planToReadIconView);
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
    module.exports = createMangaSelector;
});