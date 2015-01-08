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
    var Surface = require('famous/core/Surface');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var EventHandler = require('famous/core/EventHandler');

    function createMangePlayer()
    {
        var ledgerItem;
        var readData = {manga:undefined,chapter:undefined,page:undefined};
        var view = new View();
        var background = Surface({
            properties: {
                backgroundColor:window.colorScheme.background
            }
        });

        var gridTransform = new StateModifier();

        var grid = new GridLayout({
            dimensions: [1, 1]
        });

        view.add(gridTransform).add(grid);
        //#region Catagory Buttons
        var pages = [];
        grid.sequenceFrom(buttons);

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
        }

        return view;
    }

    module.exports=createMangePlayer;
});