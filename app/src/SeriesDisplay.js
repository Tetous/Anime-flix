/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */

define(function (require, exports, module) {
    var View = require('famous/core/View');
    var Easing = require('famous/transitions/Easing');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Surface = require('famous/core/Surface');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var ContainerSurface=require('famous/surfaces/ContainerSurface');
    var Scrollview = require('famous/views/Scrollview');

    require('MALSupportFunctions');

    function createSeriesDisplay() {
        var series;

        var transforms = [];
        var view = new View();

        var backgroundWidth=1000;
        var backgroundHeight=600;
        var backgroundTransform = new StateModifier();
        var background = new Surface({
            size: [backgroundWidth, backgroundHeight],
            properties: {
                backgroundColor: 'grey',
                borderRadius: '10px'
            }
        });
        transforms.push(backgroundTransform);
        view.add(backgroundTransform).add(background);

        var imageTransform = new StateModifier();
        var image = new ImageSurface({
            size: [150,233]
        });
        transforms.push(imageTransform);
        view.add(imageTransform).add(image);

        var titleTransform = new StateModifier();
        var title = new Surface({
            size: [true, true]
        });
        transforms.push(titleTransform);
        view.add(titleTransform).add(title);

        var descriptionTransform = new StateModifier();
        var descriptionContainer = new ContainerSurface({
            size: [750, 250],
            properties: {
                backgroundColor: 'white',
                borderRadius: '5px',
                overflow: 'hidden'
            }
        });
        var descriptionScroll = new Scrollview({
            direction: 1,
            friction: 1,
            drag: 1,
            speedLimit: 1
        });

        descriptionContainer.pipe(descriptionScroll);
        var description = new Surface({
            size:[undefined,true]
        });
        descriptionScroll.sequenceFrom([description]);
        descriptionContainer.add(descriptionScroll);
        transforms.push(descriptionTransform);
        view.add(descriptionTransform).add(descriptionContainer);

        var episodeDropdown = document.createElement('SELECT');
        var episodeDropdownTransform = new StateModifier();
        var episodeDropdownSurface = new Surface({
            size:[true,true],
            content:episodeDropdown
        });
        transforms.push(episodeDropdownTransform);
        view.add(episodeDropdownTransform).add(episodeDropdownSurface);

        var playButtonTransform = new StateModifier();
        var playButton = new Surface({
            size:[100,50],
            content: 'Play',
            properties: {
                //fontSize: fontSize + 'px',
                textAlign: 'center',
                lineHeight: 50 + 'px',
                verticalAlign: 'middle',
                backgroundColor: '#00fff8',
                borderRadius: 25 + 'px'
            }
        });
        playButton.on('click', function () {
            view._eventOutput.emit('showSelected', { show: series.listData, episode: parseInt(episodeDropdown.options[episodeDropdown.options.selectedIndex].text) });
            view.hide();
        });
        transforms.push(playButtonTransform);
        view.add(playButtonTransform).add(playButton);

        var updateButtonTransform = new StateModifier();
        var updateButton = new Surface({
            size: [100, 50],
            content: 'Update',
            properties: {
                //fontSize: fontSize + 'px',
                textAlign: 'center',
                lineHeight: 50 + 'px',
                verticalAlign: 'middle',
                backgroundColor: '#00fff8',
                borderRadius: 25 + 'px'
            }
        });
        updateButton.on('click', function ()
        {
            series.listData.my_watched_episodes = parseInt(episodeDropdown.options[episodeDropdown.options.selectedIndex].text) - 1;

            updateAnime(series.listData);
        });
        transforms.push(updateButtonTransform);
        view.add(updateButtonTransform).add(updateButton);

        var closeButtonTransform = new StateModifier({
        });
        var closeButton = new Surface({
            size: [30,30],
            content: 'X',
            properties: {
                //fontSize: fontSize + 'px',
                textAlign: 'center',
                lineHeight: 30 + 'px',
                verticalAlign: 'middle',
                //backgroundColor: '#00fff8',
                //borderRadius: 25 + 'px'
            }
        });
        closeButton.on('click', function ()
        {
            view.hide();
        });
        transforms.push(closeButtonTransform);
        view.add(closeButtonTransform).add(closeButton);
       
        view.setSeries = function (ser) {
            series = ser;
            image.setContent(ser.listData.series_image);
            title.setContent(ser.listData.series_title);
            description.setContent(ser.searchData.synopsis);
            while (episodeDropdown.options.length > 0) {
                episodeDropdown.options.remove(0);
            }
            for (var i = 1; i <= ser.listData.series_episodes; i++) {
                episodeDropdown.options.add(new Option(i.toString()));
            }
            var indexToSelect=ser.listData.my_watched_episodes;
            if (indexToSelect==episodeDropdown.options.length) {
                indexToSelect--;
            }
            episodeDropdown.options.selectedIndex = indexToSelect;
        }

        view.show = function () {
            var windowSize=window.mainContext.getSize();
            var backgroundPos=[(windowSize[0] - backgroundWidth) / 2, (windowSize[1] - backgroundHeight) / 2];
            backgroundTransform.setTransform(Transform.translate(backgroundPos[0],backgroundPos[1], 0), { duration: 1000, curve: Easing.outCubic });
            imageTransform.setTransform(Transform.translate(backgroundPos[0] + 10, backgroundPos[1] + 10, 1), { duration: 1000, curve: Easing.outCubic });
            titleTransform.setTransform(Transform.translate(backgroundPos[0] + 170, backgroundPos[1] + 10, 1), { duration: 1000, curve: Easing.outCubic });
            descriptionTransform.setTransform(Transform.translate(backgroundPos[0] + 170, backgroundPos[1] + 75, 1), { duration: 1000, curve: Easing.outCubic });
            episodeDropdownTransform.setTransform(Transform.translate(backgroundPos[0] + 170, backgroundPos[1] + 360, 1), { duration: 1000, curve: Easing.outCubic });
            playButtonTransform.setTransform(Transform.translate(backgroundPos[0] + 270, backgroundPos[1] + 360, 1), { duration: 1000, curve: Easing.outCubic });
            updateButtonTransform.setTransform(Transform.translate(backgroundPos[0] + 430, backgroundPos[1] + 360, 1), { duration: 1000, curve: Easing.outCubic });
            closeButtonTransform.setTransform(Transform.translate(backgroundPos[0]+backgroundWidth-30,backgroundPos[1], 2), { duration: 1000, curve: Easing.outCubic });
        }

        function getRandomPos() {
            var windowSize = window.mainContext.getSize();

            var leftRightUpDown = Math.floor(Math.random() * 3);
            var randomX = Math.random() * windowSize[0];
            var randomY = Math.random() * windowSize[1];
            var pos = [0, 0];
            switch (leftRightUpDown) {
                case 0:
                    pos[0] = -1000;
                    pos[1] = randomY;
                    break;
                case 1:
                    pos[0] = windowSize[0];
                    pos[1] = randomY;
                    break;
                case 2:
                    pos[1] = -600;
                    pos[0] = randomX;
                    break;
                    /*
                case 3:
                    pos[1] = windowSize[1];
                    pos[0] = randomX;
                    break;
                    */
            }
            return pos;
        }

        view.hide = function () {
            initialPositions(1000);
        }
        function initialPositions(duration) {
            for (var i = 0; i < transforms.length; i++)
            {
                var pos = getRandomPos();
                transforms[i].setTransform(Transform.translate(pos[0], pos[1], 1), { duration: duration, curve: Easing.outCubic });
            }
        }

        initialPositions(0);

        return view;
    }
    module.exports=createSeriesDisplay;
});
