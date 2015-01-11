/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */

define(function (require, exports, module)
{
    var Engine = require('famous/core/Engine');
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
        var reading = false;
        var hitEnd=false;
        var ledgerItem;
        var chapters = {};
        var readData = {
            manga: undefined, 
            chapter: undefined, 
            page: undefined
        };
        var view = new View();
        var background = Surface({
            properties: {
                backgroundColor: window.colorScheme.background
            }
        });
        view.add(background);

        var backToBrowsingButtonTransform = new StateModifier({
            transform: Transform.translate(0, 0, 5)
        });
        var backToBrowsingButton = new ImageSurface({
            size: [75, 75],
            content: '/content/images/AnimeflixBack2.png',
        });
        function backToBrowsing() {
            leftPage.setContent(' ');
            view._eventOutput.emit('backToBrowsing');
        }
        backToBrowsingButton.on('click', backToBrowsing);
        view.add(backToBrowsingButtonTransform).add(backToBrowsingButton);

        function changePage(key)
        {
            if(reading)
            {
                var arrow = false;
                switch(key)
                {
                    case 37:
                        readData.page--;
                        arrow = true;
                        hitEnd=false;
                        break;
                    case 39:
                        if(!hitEnd)
                        {
                            readData.page++;
                            arrow = true;
                        }
                        break;
                    default:
                        break;
                }
                if(arrow)
                {
                    if(readData.page >= chapters[readData.chapter].length)
                    {
                        readData.chapter++;
                        readData.page = 0;
                    }
                    if(readData.page < 0)
                    {
                        if(readData.chapter > 1)
                        {
                            readData.chapter--;
                            readData.page = chapters[readData.chapter].length - 1;
                        }
                        else
                        {
                            readData.page=0;
                            readData.chapter=1;
                        }
                    }

                    if(readData.chapter < readData.manga.series_chapters)
                    {
                        if(chapters[readData.chapter + 1] == undefined)
                        {
                            chapters[readData.chapter + 1] = 'fetching';
                            getPages(ledgerItem, readData.chapter + 1, function (pages)
                            {
                                chapters[readData.chapter + 1] = pages;
                            });
                        }
                    }
                    else
                    {
                        if(readData.chapter > readData.manga.series_chapters)
                        {
                            hitEnd=true;
                            readData.chapter--;
                            readData.page = chapters[readData.chapter].length;
                            if(readData.manga.series_status==1) {
                                leftPage.setContent("You have finished all of the chapters released so far but should be more to come.<br>Check back soon.");
                            }
                            else
                            {
                                leftPage.setContent("You have finished all of the chapters in this manga.");
                                readData.manga.my_status=2;
                            }
                            readData.manga.my_read_chapters = readData.chapter;
                            updateManga(readData.manga);
                        }
                    }

                    if(readData.chapter > 1)
                    {
                        if(chapters[readData.chapter - 1] == undefined)
                        {
                            chapters[readData.chapter - 1] = 'fetching';
                            getPages(ledgerItem, readData.chapter - 1, function (pages)
                            {
                                chapters[readData.chapter - 1] = pages;
                            });
                        }
                    }

                    if(chapters[readData.chapter + 2] == undefined && readData.chapter < readData.manga.series_chapters - 1)
                    {
                        chapters[readData.chapter + 2] = 'fetching';
                        getPages(ledgerItem, readData.chapter + 1, function (pages)
                        {
                            chapters[readData.chapter + 2] = pages;
                        });
                    }
                    if(chapters[readData.chapter - 2] == undefined && readData.chapter > 2)
                    {
                        chapters[readData.chapter - 2] = 'fetching';
                        getPages(ledgerItem, readData.chapter - 1, function (pages)
                        {
                            chapters[readData.chapter - 2] = pages;
                        });
                    }
                    if(readData.chapter - 1 > readData.manga.my_read_chapters)
                    {
                        readData.manga.my_read_chapters = readData.chapter - 1;
                        updateManga(readData.manga);
                    }
                    
                    if(!hitEnd) {
                        leftPage.setContent('<img style="max-width: 100%;max-height: 100%;" src="' + chapters[readData.chapter][readData.page] + '">');
                    }
                }
            }
        }

        Engine.on('keyup', function (e)
        {
            changePage(e.keyCode)
        });
        
        var leftArrowTransform=new StateModifier({
            transform:Transform.translate(0,0,4)
        });
        var leftArrow=Surface({
            size:[125,undefined]
        });
        leftArrow.on('click',function(){
            changePage(37);
        });
        view.add(leftArrowTransform).add(leftArrow);
        
        var rightArrowTransform=new StateModifier({
            transform:Transform.translate(0,0,4),
            origin:[1,0],
            align:[1,0]
        });
        var rightArrow=Surface({
            size:[125,undefined]
        });
        rightArrow.on('click',function(){
            changePage(39);
        });
        view.add(rightArrowTransform).add(rightArrow);

        var gridTransform = new StateModifier();

        var grid = new GridLayout({
            dimensions: [1, 1]
        });

        view.add(gridTransform).add(grid);
        //#region Catagory Buttons
        var pages = [];
        grid.sequenceFrom(pages);

        var leftPageView = new View();
        var leftPageTransform = new StateModifier({
            origin: [0.5, 0.5],
            align: [0.5, 0.5]
        });
        var leftPage = Surface({
            /*
            properties:{
                color:'white',
                textAlign: 'center',
                verticalAlign: 'middle',
                fontSize:'30px'
            }
            */
        });
        leftPage.innerDiv.setAttribute('style', 'width: 100%;height: 100%;text-align:center;');
        leftPageView.add(leftPageTransform).add(leftPage);
        pages.push(leftPageView);
        var rightPage = new ImageSurface({
            size: [true, undefined]
        });
        pages.push(rightPage);

        view.read = function (mangaSeries, chapter)
        {
            reading = true;
            hitEnd=false;
            chapters={};
            readData.manga = mangaSeries;
            readData.chapter = chapter;
            readData.page = 0;
            ledgerItem = window.ledger.getMangaLedgerItem(mangaSeries);
            leftPage.setContent('<img style="max-width: 100%;max-height: 100%;" src="content/images/MangaLoadingThubSucker.gif">');
            getPages(ledgerItem, chapter, function (pages) {
                chapters[chapter] = pages;
                leftPage.setContent('<img style="max-width: 100%;max-height: 100%;" src="' + chapters[readData.chapter][readData.page] + '">');
            });
            if(chapter < mangaSeries.series_chapters)
            {
                getPages(ledgerItem, chapter + 1, function (pages)
                {
                    chapters[chapter + 1] = pages;
                });
            }
            if(chapter > 1)
            {
                getPages(ledgerItem, chapter - 1, function (pages)
                {
                    chapters[chapter - 1] = pages;
                });
            }
        }

        return view;
    }

    module.exports = createMangePlayer;
});