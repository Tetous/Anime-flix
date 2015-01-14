/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */

define(function (require, exports, module)
{
    var Engine = require('famous/core/Engine');
    var View = require('famous/core/View');
    var GridLayout = require("famous/views/GridLayout");
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Surface = require('RichFamous/Surface');
    var ImageSurface = require('famous/surfaces/ImageSurface');

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
                        getPages(ledgerItem, readData.chapter + 2, function (pages)
                        {
                            chapters[readData.chapter + 2] = pages;
                        });
                    }
                    if(chapters[readData.chapter - 2] == undefined && readData.chapter > 2)
                    {
                        chapters[readData.chapter - 2] = 'fetching';
                        getPages(ledgerItem, readData.chapter - 2, function (pages)
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
                        header.setContent(readData.manga.series_title + ' - Chapter ' + readData.chapter+ ' Page '+(readData.page+1));
                        leftPage.setContent('<img style="max-width: 100%;max-height: 100%;" src="' + chapters[readData.chapter][readData.page] + '">');
                    }
                }
            }
        }

        Engine.on('keyup', function (e)
        {
            changePage(e.keyCode)
        });
        
        var controlsTransform=new StateModifier();
        var controlsNode=view.add(controlsTransform);
        function showControls()
        {
            controlsTransform.setOpacity(0.8,{duration:500});
            controlsTransform.setOpacity(0.8,{duration:1000});
            controlsTransform.setOpacity(0,{duration:1000});
        }
        var lastMousePos={
            pageX:0,
            pageY:0
        };
        Engine.on('mousemove',function(e){
            if(reading)
            {
                var windowSize=window.mainContext.getSize();
                var trigger=window.isMobile?e.pageX<windowSize[0]-125&&e.pageX>125:(e.pageX-lastMousePos.pageX)*(e.pageX-lastMousePos.pageX)+(e.pageY-lastMousePos.pageY)*(e.pageY-lastMousePos.pageY)>100;
                if(trigger)
                {
                    lastMousePos=e;
                    controlsTransform.halt();
                    showControls();
                }
            }
        });
        var headerTransform=new StateModifier({
            transform:Transform.translate(0,0,3)
        });
        var header=Surface({
            size:[undefined,85],
            properties:{
                color:'white',
                backgroundColor:'black',
                textAlign:'center',
                verticalAlign:'middle'
            }
        });
        controlsNode.add(headerTransform).add(header);
        
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
        controlsNode.add(backToBrowsingButtonTransform).add(backToBrowsingButton);
        
        var leftArrowSurfaceTransform=new StateModifier({
            transform:Transform.translate(0,0,4)
        });
        var leftArrowSurface=Surface({
            size:[125,undefined]
        });
        leftArrowSurface.on('click',function(){
            changePage(37);
        });
        controlsNode.add(leftArrowSurfaceTransform).add(leftArrowSurface);
        var leftArrowTransform=new StateModifier({
            origin:[0,0.5],
            align:[0,0.5]
        });
        var leftArrow=new ImageSurface({
            size:[125,125],
            content:'content/images/MangaLeft.png'
        });
        controlsNode.add(leftArrowTransform).add(leftArrow);
        
        var rightArrowSurfaceTransform=new StateModifier({
            transform:Transform.translate(0,0,4),
            origin:[1,0],
            align:[1,0]
        });
        var rightArrowSurface=Surface({
            size:[125,undefined]
        });
        rightArrowSurface.on('click',function(){
            changePage(39);
        });
        controlsNode.add(rightArrowSurfaceTransform).add(rightArrowSurface);
        var rightArrowTransform=new StateModifier({
            origin:[1,0.5],
            align:[1,0.5]
        });
        var rightArrow=new ImageSurface({
            size:[125,125],
            content:'content/images/MangaRight.png'
        });
        controlsNode.add(rightArrowTransform).add(rightArrow);

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
        leftPage.innerDiv.setAttribute('style', 'width: 100%;height: 100%;text-align:center;color:white;font-size:30px;');
        leftPageView.add(leftPageTransform).add(leftPage);
        pages.push(leftPageView);

        view.read = function (mangaSeries, chapter)
        {
            showControls();
            reading = true;
            hitEnd=false;
            chapters={};
            readData.manga = mangaSeries;
            readData.chapter = chapter;
            readData.page = 0;
            header.setContent(readData.manga.series_title + ' - Chapter ' + readData.chapter+ ' Page '+(readData.page+1));
            ledgerItem = window.ledger.getMangaLedgerItem(mangaSeries);
            leftPage.setContent('<img style="max-width: 100%;max-height: 100%;" src="content/images/MangaLoadingThubSucker.gif">');
            getPages(ledgerItem, chapter, function (pages) {
                chapters[chapter] = pages;
                leftPage.setContent('<img style="max-width: 100%;max-height: 100%;" src="' + chapters[readData.chapter][readData.page] + '">');
            });
            if(chapter < mangaSeries.series_chapters)
            {
                chapters[chapter + 1]='fetching';
                getPages(ledgerItem, chapter + 1, function (pages)
                {
                    chapters[chapter + 1] = pages;
                });
            }
            if(chapter > 1)
            {
                chapters[chapter-1]='fetching';
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