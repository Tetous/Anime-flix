/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */

define(function (require, exports, module)
{
    var View = require('famous/core/View');
    var Easing = require('famous/transitions/Easing');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Surface = require('famous/core/Surface');
    var InputSurface=require('famous/surfaces/InputSurface');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var Scrollview = require('famous/views/Scrollview');
    var SearchItemDisplay = require('SearchItemDisplay');

    require('xml2jsobj/xml2jsobj');

    function createSearchView()
    {
        var allCreatedSearchItemDisplays = [];
        var searchItemDisplaysToShow = [];

        var view = new View();
        
        var container = new ContainerSurface({
            //size:window.mainContext.getSize(),
            properties: { overflow: 'hidden' }
        });
        view.add(container);
        /*
        view.add(new Surface({
            properties: {
                backgroundColor:'blue'
            }
        }));
        */
        var textboxProperties = {
            fontSize: '12px',
            border: '1px solid gray',
            //borderRadius: '5px',
            resize: 'none',
            outline: 'none',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
        };

        var textBox=new InputSurface({
            size: [undefined,30],
            type:'text',
            placeholder:'Search',
            //properties: textboxProperties
        });
        textBox.on('keypress', function (k)
        {
            if (k.keyCode == 13)
            {
                //Clear search results
                searchItemDisplaysToShow = [];
                //TODO: Add spinner

                //Start search
                search(textBox.getValue(), searchCallback);
            };
        });
        container.add(textBox);
        
        var scrollTransform = new StateModifier({
            transform: Transform.translate(0, 30, 0)
        });
        var scroll = new Scrollview({
            //size:[undefined,undefined],
            direction: 1,
            friction: 1,
            drag: 1,
            speedLimit: 1
        });
        scroll.sequenceFrom(searchItemDisplaysToShow);
        container.pipe(scroll);
        container.add(scrollTransform).add(scroll);

        function searchCallback(data)
        {
            var displaysToConvert = ((allCreatedSearchItemDisplays.length < data.entry.length) ? allCreatedSearchItemDisplays.length : data.entry.length);
            var displaysToCreate = ((allCreatedSearchItemDisplays.length < data.entry.length) ? data.entry.length - allCreatedSearchItemDisplays.length : 0);

            searchItemDisplaysToShow = [];
            var entryCounter = 0;
            for (var i = 0; i < displaysToConvert; i++,entryCounter++)
            {
                allCreatedSearchItemDisplays[i].update(data.entry[entryCounter]);
                searchItemDisplaysToShow.push(allCreatedSearchItemDisplays[i]);
            }
            for (var i = 0; i < displaysToCreate; i++,entryCounter++)
            {
                var searchDisplay = SearchItemDisplay(data.entry[entryCounter]);
                allCreatedSearchItemDisplays.push(searchDisplay);
                searchItemDisplaysToShow.push(searchDisplay);
                searchDisplay.on('searchSeriesSelected', function (data)
                {
                    view._eventOutput.emit('searchSeriesSelected', data);
                });
            }
            scroll.sequenceFrom(searchItemDisplaysToShow);
        }

        function search(searchText,callback)
        {
            var request = new XMLHttpRequest();
            request.onreadystatechange = function ()
            {
                if (request.readyState == 4)
                {
                    if (request.status == 200)
                    {
                        parser = new DOMParser();
                        var domObj = parser.parseFromString(request.response, "text/xml");
                        obj = XML2jsobj(domObj).anime;
                        //obj = XML2jsobj(request.responseXML.documentElement);
                        callback(obj);
                    }
                }
            };
            request.open("POST", 'http://www.learnfamo.us/chard/requester.php?m=search&s=' + searchText, true);
            request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            request.send('u=' + window.MALCreds.username + '&p=' + window.MALCreds.password);
        }
        return view;
    }
    module.exports = createSearchView;
});