/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */

define(function (require, exports, module) {
    var Engine=require('famous/core/Engine');
    var View = require('famous/core/View');
    var RenderController = require('famous/views/RenderController');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Surface = require('famous/core/Surface');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var EventHandler = require('famous/core/EventHandler');
    var Timer=require('famous/utilities/Timer');
    
    function createNillaIcon(data)
    {
        var isManga=data.series_mangadb_id!=undefined;;
        
        var iconWidth = 150;
        var iconHeight = iconWidth * 1.555;

        var view = new View();
        view.data = data;

        var iconEventHandler = new EventHandler();

        var bannerTransform = new StateModifier({
            transform: Transform.translate(0, 0, 5)
        });
        var bannerRenderController = new RenderController();
        var banner = new ImageSurface({
            size: [iconWidth, iconHeight],
            properties: {
                color:'white',
                borderRadius: '10px'
            }
        });
        banner.pipe(iconEventHandler);
        view.add(bannerTransform).add(bannerRenderController);
        //else
        //{
        //    crateNewEpisodebanner();
        //}
        var image = new ImageSurface({
            size: [iconWidth, iconHeight],
            properties: {
                borderRadius: '10px'
            }
        });
        image.pipe(iconEventHandler);
        var titleTransform = new StateModifier({
            transform: Transform.translate(0, iconHeight, 1)
        });
        var title = new Surface({
            size: [iconWidth, true],
            properties: {
                textAlign: 'center',
                color: 'white'
            }
        });
        iconEventHandler.on('click', function () {
            view._eventOutput.emit('click', view);
        });

        view.add(image);
        view.add(titleTransform).add(title);

        view.setSeries = function (series)
        {
            view.data = series;
            view.data.originalEpisodeCount = view.data.series_episodes;
            view.data.originalChapterCount = view.data.series_chapters;
            title.setContent(series.series_title);
            image.setContent(series.series_image);
            bannerRenderController.hide();
            if(view.data.my_status==1)
            {
                if(view.data.series_status == 1)
                {
                    banner.setContent(isManga?'content/images/NewChaptersBanner.png':'content/images/NewEpisodesBanner.png');
                    if(isManga)
                    {
                        var ledgerItem = window.ledger.getMangaLedgerItem(view.data);
                        getChapterCountAsync(ledgerItem, function (chapterCount)
                        {
                            view.data.series_chapters = chapterCount;
                            if(view.data.series_chapters > parseInt(view.data.my_read_chapters))
                            {
                                bannerRenderController.show(banner);
                            }
                        });
                    }
                    else
                    {
                        var ledgerItem = window.ledger.getLedgerItem(view.data);
                        getEpisodeCountAsync(ledgerItem, function (episodeCounts)
                        {
                            view.data.series_episodes = episodeCounts[0] ? episodeCounts[0] : episodeCounts[1];
                            if(view.data.series_episodes > parseInt(view.data.my_watched_episodes))
                            {
                                bannerRenderController.show(banner);
                            }
                        });
                    }
                }
                else
                {
                    banner.setContent(isManga?'content/images/UnreadChaptersBanner.png':'content/images/UnviewedEpisodesBanner.png');
                    if(isManga)
                    {
                        var ledgerItem = window.ledger.getMangaLedgerItem(view.data);
                        getChapterCountAsync(ledgerItem, function (chapterCount)
                        {
                            view.data.series_chapters = chapterCount;
                            if(view.data.series_chapters > parseInt(view.data.my_read_chapters))
                            {
                                bannerRenderController.show(banner);
                            }
                        });
                    }
                    else
                    {
                        if(parseInt(view.data.series_episodes) > parseInt(view.data.my_watched_episodes))
                            {
                        Timer.setTimeout(function(){

                                bannerRenderController.show(banner);
                            },3000);
                        }
                    }
                }
            }
        }

        view.setSeries(data);
        return view;
    }
    module.exports = createNillaIcon;
});