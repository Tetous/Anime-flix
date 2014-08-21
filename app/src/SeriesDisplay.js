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

    function createSeriesDisplay() {
        var series;
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
        view.add(backgroundTransform).add(background);

        var imageTransform = new StateModifier();
        var image = new ImageSurface({
            size: [150,233]
        });
        view.add(imageTransform).add(image);

        var titleTransform = new StateModifier();
        var title = new Surface({
            size: [true, true]
        });
        view.add(titleTransform).add(title);

        var descriptionTransform = new StateModifier();
        var description = new Surface({
            size: [750, 250],
            properties: {
                backgroundColor: 'white',
                borderRadius: '5px'
            }
        });
        view.add(descriptionTransform).add(description);

        var episodeDropdown = document.createElement('SELECT');
        var episodeDropdownTransform = new StateModifier();
        var episodeDropdownSurface = new Surface({
            size:[true,true],
            content:episodeDropdown
        });
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
        view.add(playButtonTransform).add(playButton);
       
        view.setSeries = function (ser) {
            series = ser;
            image.setContent(ser.listData.series_image);
            title.setContent(ser.listData.series_title);
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
            var backgroundPos = getRandomPos();
            backgroundTransform.setTransform(Transform.translate(backgroundPos[0], backgroundPos[1], 0), { duration: duration, curve: Easing.outCubic });
            var imagePos = getRandomPos();
            imageTransform.setTransform(Transform.translate(imagePos[0], imagePos[1], 2), { duration: duration, curve: Easing.outCubic });
            var titlePos = getRandomPos();
            titleTransform.setTransform(Transform.translate(titlePos[0], titlePos[1], 1), { duration: duration, curve: Easing.outCubic });
            var descriptionPos = getRandomPos();
            descriptionTransform.setTransform(Transform.translate(descriptionPos[0], descriptionPos[1], 1), { duration: duration, curve: Easing.outCubic });
            var episodeDropdownPos = getRandomPos();
            episodeDropdownTransform.setTransform(Transform.translate(episodeDropdownPos[0], episodeDropdownPos[1], 1), { duration: duration, curve: Easing.outCubic });
            var playButtonPos = getRandomPos();
            playButtonTransform.setTransform(Transform.translate(playButtonPos[0], playButtonPos[1], 1), { duration: duration, curve: Easing.outCubic });

        }

        initialPositions(0);

        return view;
    }
    module.exports=createSeriesDisplay;
});
