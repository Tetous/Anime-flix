/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */

define(function (require, exports, module)
{
    var Engine=require('famous/core/Engine');
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
        var reading=false;
        var ledgerItem;
        var chapters={};
        var readData = {manga:undefined,chapter:undefined,page:undefined};
        var view = new View();
        var background = Surface({
            properties: {
                backgroundColor:window.colorScheme.background
            }
        });
        view.add(background);

        Engine.on('keyup', function (e)
        {
            if(reading)
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
                    leftPage.setContent('<img style="max-width: 100%;max-height: 100%;" src="'+chapters[readData.chapter][readData.page]+'">');
                    
                    if (chapters[readData.chapter+1]==undefined&&readData.chapter < mangaSeries.series_chapters)
                    {
                        chapters[readData.chapter + 1]='fetching';
                        getPages(ledgerItem,readData.chapter+1, function (pages)
                        {
                            chapters[readData.chapter+1] = pages;
                        });
                    }
                    if (chapters[readData.chapter-1]==undefined&&readData.chapter > 1)
                    {
                        chapters[readData.chapter - 1]='fetching';
                        getPages(ledgerItem,readData.chapter - 1, function (pages)
                        {
                            chapters[readData.chapter - 1] = pages;
                        });
                    }
                    if (chapters[readData.chapter+2]==undefined&&readData.chapter < mangaSeries.series_chapters-1)
                    {
                        chapters[readData.chapter + 2]='fetching';
                        getPages(ledgerItem,readData.chapter+1, function (pages)
                        {
                            chapters[readData.chapter+2] = pages;
                        });
                    }
                    if (chapters[readData.chapter-2]==undefined&&readData.chapter > 2)
                    {
                        chapters[readData.chapter - 2]='fetching';
                        getPages(ledgerItem,readData.chapter - 1, function (pages)
                        {
                            chapters[readData.chapter - 2] = pages;
                        });
                    }
                }
            }
        });

        var gridTransform = new StateModifier();

        var grid = new GridLayout({
            dimensions: [1, 1]
        });

        view.add(gridTransform).add(grid);
        //#region Catagory Buttons
        var pages = [];
        grid.sequenceFrom(pages);
        
        var leftPageView=new View();
        var leftPageTransform=new StateModifier({
            origin: [0.5,0.5],
            align:[0.5,0.5]
        });
        var leftPage = Surface({
            //properties:{
            //    textAlign:'center'
            //}
        });
        leftPage.innerDiv.setAttribute('style','width: 100%;height: 100%;text-align:center;');
        leftPageView.add(leftPageTransform).add(leftPage);
        pages.push(leftPageView);
        var rightPage = new ImageSurface({
            size:[true,undefined]
        });
        pages.push(rightPage);

        view.read = function (mangaSeries,chapter)
        {
            reading=true;
            readData.manga = mangaSeries;
            readData.chapter = chapter;
            readData.page = 0;
            ledgerItem = window.ledger.getMangaLedgerItem(mangaSeries);
            getPages(ledgerItem,chapter,function(pages){
                chapters[chapter] = pages;
                leftPage.setContent('<img style="max-width: 100%;max-height: 100%;" src="'+chapters[readData.chapter][readData.page]+'">');
            });
            if (chapter < mangaSeries.series_chapters)
            {
                getPages(ledgerItem,chapter+1, function (pages)
                {
                    chapters[chapter+1] = pages;
                });
            }
            if (chapter > 1)
            {
                getPages(ledgerItem,chapter - 1, function (pages)
                {
                    chapters[chapter - 1] = pages;
                });
            }
        }

        return view;
    }

    module.exports=createMangePlayer;
});