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

        var scroll = new Scrollview({
            direction: 1,
            friction: 1,
            drag: 1,
            speedLimit: 1
        });
        scroll.sequenceFrom(searchItemDisplaysToShow);
        container.add(scroll);

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
            }
        }

        function search(searchText,callback)
        {
            var request = new XMLHttpRequest();
            request.onreadystatechange(function ()
            {
                if (request.responseType=4)
                {
                    if (request.readyState == 4)
                    {
                        if (request.status == 200)
                        {
                            obj = XML2jsobj(request.responseXML.documentElement);
                            callback(obj);
                        }
                    }
                }
            });
            request.open("GET", 'http://www.learnfamo.us/chard/requester.php?m=search&u=' + window.MALCreds.username + 'p=' + window.MALCreds.password);
            request.send();
        }
    }
    module.exports = createSearchView;
});