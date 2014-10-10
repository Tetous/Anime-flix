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
    require('MALSupportFunctions');

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
        var textBoxTransform = new StateModifier({
            transform: Transform.translate(0, 0, window.showSelectorZ + 15)
        });
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
        container.add(textBoxTransform).add(textBox);
        
        var scrollTransform = new StateModifier({
            transform: Transform.translate(0, 30, 1 + window.showSelectorZ + 1)
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
            var entries;
            if (data.entry.length==undefined)
            {
                entries = [data.entry];
            }
            else
            {
                entries = data.entry;
            }
            var displaysToConvert = ((allCreatedSearchItemDisplays.length < entries.length) ? allCreatedSearchItemDisplays.length : entries.length);
            var displaysToCreate = ((allCreatedSearchItemDisplays.length < entries.length) ? entries.length - allCreatedSearchItemDisplays.length : 0);

            searchItemDisplaysToShow = [];
            var entryCounter = 0;
            for (var i = 0; i < displaysToConvert; i++,entryCounter++)
            {
                allCreatedSearchItemDisplays[i].update(entries[entryCounter]);
                searchItemDisplaysToShow.push(allCreatedSearchItemDisplays[i]);
            }
            for (var i = 0; i < displaysToCreate; i++,entryCounter++)
            {
                var searchDisplay = SearchItemDisplay(entries[entryCounter]);
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
            searchMALAsync(searchText,callback);
        }
        return view;
    }
    module.exports = createSearchView;
});