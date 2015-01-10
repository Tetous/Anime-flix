/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */

define(function (require, exports, module)
{
    var View = require('famous/core/View');
    var GridLayout = require("famous/views/GridLayout");
    var RenderController = require('famous/views/RenderController');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Surface = require('RichFamous/Surface');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var EventHandler = require('famous/core/EventHandler');

    function createMangePlayer()
    {
        var ledgerItem;
        var chapters;
        var readData = {manga:undefined,chapter:undefined,page:undefined};
        var view = new View();
        var background = Surface({
            properties: {
                backgroundColor:window.colorScheme.background
            }
        });
        view.add(background);

        var eventSurfaceTransform = new StateModifier({
            transform:Transform.translate(0,0,5)
        });
        var eventSurface = Surface();
        eventSurface.on('keyup', function (e)
        {
            var arrow=false;
            switch (e.keyCode)
            {
                case 37:
                    readData.page--;
                    arrow=true;
                    break;
                case 39:
                    readData.page++;
                    arrow=true;
                    break;
                default:
                    break;
            }
            if(arrow)
            {
                if(readData.page>=chapters[readData.chapter].length)
                {
                    readData.chapter++;
                    readData.page=0;
                }
                if(readData.page<0)
                {
                    readData.chapter--;
                    readData.page=chapters[readData.chapter].length-1;
                }
                leftPage.setContent(chapters[readData.chapter][readData.page]);
            }
            
        });
        view.add(eventSurfaceTransform).add(eventSurface);

        var gridTransform = new StateModifier();

        var grid = new GridLayout({
            dimensions: [1, 1]
        });

        view.add(gridTransform).add(grid);
        //#region Catagory Buttons
        var pages = [];
        grid.sequenceFrom(pages);

        var leftPage = new ImageSurface({
            size: [true, undefined],
            origin: [0.5,0.5],
            align:[0.5,0.5]
        });
        pages.push(leftPage);
        var rightPage = new ImageSurface({
            size:[true,undefined]
        });
        pages.push(rightPage);

        view.read = function (mangaSeries,chapter)
        {
            readData.manga = mangaSeries;
            readData.chapter = chapter;
            readData.page = 0;
            ledgerItem = window.ledger.getManga(mangaSeries);
            getPages(chapter,function(pages){
                chapters[chapter] = pages;
                leftPage.setContent(pages[page]);
            });
            if (chapter < mangaSeries.series_chapters)
            {
                getPages(chapter+1, function (pages)
                {
                    chapters[chapter+1] = pages;
                });
            }
            if (chapter > 1)
            {
                getPages(chapter - 1, function (pages)
                {
                    chapters[chapter - 1] = pages;
                });
            }
        }

        return view;
    }

    module.exports=createMangePlayer;
});