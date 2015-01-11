/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */

define(function (require, exports, module)
{
    var Engine = require('famous/core/Engine');
    var View = require('famous/core/View');
    var Easing = require('famous/transitions/Easing');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Surface = require('RichFamous/Surface');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var Scrollview = require('famous/views/Scrollview');
    var Timer = require('famous/utilities/Timer');
    var AlertView = require('AlertView');

    require('Anime-flixWebFunctions');

    function createSeriesDisplay()
    {
        var opened = false;

        var contentType;

        var series;
        var transforms = [];
        var view = new View();

        var backgroundTransform = new StateModifier();
        var background = Surface({
            properties: {
                backgroundColor: window.colorScheme.second,
            }
        });
        var transformNode = view.add(backgroundTransform);
        transformNode.add(background);

        var imageTransform = new StateModifier();
        var image = new ImageSurface({
            properties: {
                borderRadius: '10px'
            }
        });
        transforms.push(imageTransform);
        transformNode.add(imageTransform).add(image);

        var titleTransform = new StateModifier();
        var title = Surface({
            size: [true, true]
        });
        transforms.push(titleTransform);
        transformNode.add(titleTransform).add(title);

        var typeTransform = new StateModifier();
        var type = Surface({
            size: [true, true]
        });
        transforms.push(typeTransform);
        transformNode.add(typeTransform).add(type);

        var airedTransform = new StateModifier();
        var aired = Surface({
            size: [true, true]
        });
        transforms.push(airedTransform);
        transformNode.add(airedTransform).add(aired);

        var descriptionTransform = new StateModifier();
        var descriptionContainer = new ContainerSurface({
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
        var description = Surface({
            size: [undefined, 0]
        });
        descriptionScroll.sequenceFrom([description]);
        descriptionContainer.add(descriptionScroll);
        transforms.push(descriptionTransform);
        transformNode.add(descriptionTransform).add(descriptionContainer);

        var myStatusLabelTransform = new StateModifier();
        var myStatusLabel = Surface({
            size: [true, true],
            content: 'My Status:'
        });
        transforms.push(myStatusLabelTransform);
        transformNode.add(myStatusLabelTransform).add(myStatusLabel);

        var myStatus = document.createElement('SELECT');
        var myStatusTransform = new StateModifier();
        var myStatusSurface = Surface({
            size: [true, true],
            content: myStatus
        });
        transforms.push(myStatusTransform);
        transformNode.add(myStatusTransform).add(myStatusSurface);

        var scoreLabelTransform = new StateModifier();
        var scoreLabel = Surface({
            size: [true, true],
            content: 'Score:'
        });
        transforms.push(scoreLabelTransform);
        transformNode.add(scoreLabelTransform).add(scoreLabel);

        var score = document.createElement('SELECT');
        score.options.add(new Option((10).toString()));
        score.options.add(new Option((9).toString()));
        score.options.add(new Option((8).toString()));
        score.options.add(new Option((7).toString()));
        score.options.add(new Option((6).toString()));
        score.options.add(new Option((5).toString()));
        score.options.add(new Option((4).toString()));
        score.options.add(new Option((3).toString()));
        score.options.add(new Option((2).toString()));
        score.options.add(new Option((1).toString()));
        var scoreTransform = new StateModifier();
        var scoreSurface = Surface({
            size: [true, true],
            content: score
        });
        transforms.push(scoreTransform);
        transformNode.add(scoreTransform).add(scoreSurface);

        var statusTransform = new StateModifier();
        var status = Surface({
            size: [150, true]
        });
        transforms.push(statusTransform);
        transformNode.add(statusTransform).add(status);

        var viewOnMALTransform = new StateModifier();
        var viewOnMALButton = Surface({
            size: [150, 40],
            content: 'View On MyAnimeList',
            properties: {
                borderRadius: '5px',
                color: 'white',
                backgroundColor: 'black',
                textAlign: 'center',
                verticalAlign: 'middle'
            }
        });
        viewOnMALButton.on('click', function ()
        {
            window.open('http://myanimelist.net/anime/' + series.listData.series_animedb_id);
        });
        transforms.push(viewOnMALTransform);
        transformNode.add(viewOnMALTransform).add(viewOnMALButton)

        var episodeLabelTransform = new StateModifier();
        var episodeLabel = Surface({
            size: [true, true],
            content: 'Episode:'
        });
        transforms.push(episodeLabelTransform);
        transformNode.add(episodeLabelTransform).add(episodeLabel);

        var episodeDropdown = document.createElement('SELECT');
        var episodeDropdownTransform = new StateModifier();
        var episodeDropdownSurface = Surface({
            size: [true, true],
            content: episodeDropdown
        });
        transforms.push(episodeDropdownTransform);
        transformNode.add(episodeDropdownTransform).add(episodeDropdownSurface);

        //play button alerts
        var alertZTransform = new StateModifier({
            transform: Transform.translate(0, 0, 10)
        });
        var alertZTransformNode = view.add(alertZTransform);

        var skipBackAlert = AlertView({
            size: [400, 200],
            buttonSize: [185, 50],
            buttonBuffer: 10,
            content: '<br>You have selected an earlier episode than your last watched episode, would you like to set your progress back to the selected episode?',
            button1Content: 'Yes',
            button2Content: 'No',
            showTransitionable: {
                curve: Easing.outCubic,
                duration: 1000
            },
            hideTransitionable: {
                curve: Easing.inCubic,
                duration: 1000
            },
            properties: {
                textAlign: 'center',
                backgroundColor: 'white',
                border: '3px solid black',
                borderRadius: 25 + 'px'
            },
            buttonProperties: {
                textAlign: 'center',
                backgroundColor: window.colorScheme.second,
                verticalAlign: 'middle',
                //border: '3px solid gray',
                borderRadius: 10 + 'px'
            }
        });
        alertZTransformNode.add(skipBackAlert);

        var changeStatusAlert = AlertView({
            size: [400, 200],
            buttonSize: [185, 50],
            buttonBuffer: 10,
            content: '<br>You have completed this anime, would you like to move it back to Watching?',
            button1Content: 'Yes',
            button2Content: 'No',
            showTransitionable: {
                curve: Easing.outCubic,
                duration: 1000
            },
            hideTransitionable: {
                curve: Easing.inCubic,
                duration: 1000
            },
            properties: {
                textAlign: 'center',
                backgroundColor: 'white',
                border: '3px solid black',
                borderRadius: 25 + 'px'
            },
            buttonProperties: {
                textAlign: 'center',
                color: 'white',
                backgroundColor: window.colorScheme.main,
                lineHeight: 50 + 'px',
                verticalAlign: 'middle',
                //border: '3px solid gray',
                borderRadius: 10 + 'px'
            }
        });
        alertZTransformNode.add(changeStatusAlert);

        var playButtonTransform = new StateModifier();
        var playButton = Surface({
            content: 'Play',
            properties: {
                //fontSize: fontSize + 'px',
                textAlign: 'center',
                verticalAlign: 'middle',
                color: 'white',
                backgroundColor: window.colorScheme.main,
                borderRadius: 25 + 'px'
            }
        });
        function asyncAlertChecker()
        {
            var isManga = contentType == 'manga';
            var alertsFinished = (changeStatusAlert.button1Clicked || changeStatusAlert.button2Clicked) && (skipBackAlert.button1Clicked || skipBackAlert.button2Clicked);

            if(alertsFinished)
            {
                //Work bassed on alerts
                if(changeStatusAlert.button1Clicked)
                {
                    series.listData.my_status = 1;
                    var selectedEpisode = parseInt(episodeDropdown.options[episodeDropdown.options.selectedIndex].text);
                    var chapOrEp = isManga ? 'my_read_chapters' : 'my_watched_episodes';
                    series.listData[chapOrEp] = selectedEpisode - 1;
                }
                else
                {
                    if(skipBackAlert.button1Clicked)
                    {
                        var selectedEpisode = parseInt(episodeDropdown.options[episodeDropdown.options.selectedIndex].text);
                        series.listData.my_watched_episodes = selectedEpisode - 1;
                    }
                }
                changeStatusAlert.button1Clicked = false;
                changeStatusAlert.button2Clicked = true;
                skipBackAlert.button1Clicked = false;
                skipBackAlert.button2Clicked = true;

                if(isManga)
                {
                    updateManga(series.listData);
                }
                else
                {
                    updateAnime(series.listData);
                }

                //Play
                if(isManga)
                {
                    view._eventOutput.emit('mangaSelected', {
                        manga: series.listData,
                        chapter: parseInt(episodeDropdown.options[episodeDropdown.options.selectedIndex].text
                                )
                    });
                }
                else
                {
                    view._eventOutput.emit('showSelected', {
                        show: series.listData,
                        episode: parseInt(episodeDropdown.options[episodeDropdown.options.selectedIndex].text
                                )
                    });
                }
                view.hide();
            }
            else
            {
                Timer.after(asyncAlertChecker, 3);
            }
        }
        playButton.on('click', function ()
        {
            //Run checks and update show data
            if(episodeDropdown.options[episodeDropdown.options.selectedIndex] && episodeDropdown.options[episodeDropdown.options.selectedIndex].text != '0')
            {
                if(series.listData.my_status == 2)
                {
                    //Ask if they want to move it to watching
                    changeStatusAlert.show();
                }
                else
                {
                    if(series.listData.my_status == 6)
                    {
                        var today = new Date();
                        var dd = today.getDate();
                        var mm = today.getMonth() + 1; //January is 0!
                        var yyyy = today.getFullYear();

                        if(dd < 10) {
                            dd = '0' + dd
                        }

                        if(mm < 10) {
                            mm = '0' + mm
                        }
                        series.listData.my_start_date = yyyy + '-' + mm + '-' + dd;
                    }
                    series.listData.my_status = 1;

                    var selectedEpisode = parseInt(episodeDropdown.options[episodeDropdown.options.selectedIndex].text);
                    if(contentType == 'anime')
                    {
                        if(selectedEpisode <= series.listData.my_watched_episodes)
                        {
                            //Ask if the user wants to jump back
                            skipBackAlert.show();
                        }
                        else
                        {
                            series.listData.my_watched_episodes = selectedEpisode - 1;
                        }
                    }
                }

                Timer.after(asyncAlertChecker, 3);
            }
            else
            {
                if(contentType == 'manga')
                {
                    alert('There are no chapters available for this manga.');
                }
                else
                {
                    alert('This show has no episodes to play.');
                }
            }
        });
        transforms.push(playButtonTransform);
        transformNode.add(playButtonTransform).add(playButton);

        var updateButtonTransform = new StateModifier();
        var updateButton = Surface({
            content: 'Update',
            properties: {
                //fontSize: fontSize + 'px',
                textAlign: 'center',
                verticalAlign: 'middle',
                color: 'white',
                backgroundColor: window.colorScheme.main,
                borderRadius: 25 + 'px'
            }
        });
        updateButton.on('click', function ()
        {
            var isAnime = contentType == 'anime';
            series.listData.my_status = myStatus.options[myStatus.selectedIndex].value;
            if(episodeDropdown.options[episodeDropdown.options.selectedIndex] != undefined)
            {
                if(!isAnime)
                {
                    series.listData.my_read_chapters = parseInt(episodeDropdown.options[episodeDropdown.options.selectedIndex].text) - 1;
                }
                else
                {
                    series.listData.my_watched_episodes = parseInt(episodeDropdown.options[episodeDropdown.options.selectedIndex].text) - 1;
                }
                if(series.listData.my_status == 2)
                {
                    series.listData.my_watched_episodes++;
                    series.listData.my_read_chapters++;
                    if(series.listData.my_finish_date == '0000-00-00')
                    {
                        var today = new Date();
                        var dd = today.getDate();
                        var mm = today.getMonth() + 1; //January is 0!
                        var yyyy = today.getFullYear();

                        if(dd < 10)
                        {
                            dd = '0' + dd
                        }

                        if(mm < 10)
                        {
                            mm = '0' + mm
                        }
                        series.listData.my_finish_date = yyyy + '-' + mm + '-' + dd;
                    }
                }
            }
            else
            {
                series.listData.my_watched_episodes = 0;
            }
            if(score.options.selectedIndex > -1)
            {
                series.listData.my_score = 10 - score.options.selectedIndex;
            }
            else
            {
                series.listData.my_score = 0;
            }

            if(isAnime)
            {
                updateAnime(series.listData, function ()
                {
                    view._eventOutput.emit('refreshList');
                });
            }
            else
            {
                updateManga(series.listData, function ()
                {
                    view._eventOutput.emit('refreshList');
                });
            }

        });
        transforms.push(updateButtonTransform);
        transformNode.add(updateButtonTransform).add(updateButton);

        var deleteButtonTransform = new StateModifier();
        var deleteButton = Surface({
            content: 'Delete',
            properties: {
                //fontSize: fontSize + 'px',
                textAlign: 'center',
                verticalAlign: 'middle',
                color: 'white',
                backgroundColor: window.colorScheme.main,
                borderRadius: 25 + 'px'
            }
        });
        deleteButton.on('click', function ()
        {
            deleteAnime(series.listData.series_animedb_id, function ()
            {
                view._eventOutput.emit('refreshList');
                view.hide();
            });
        });
        transforms.push(deleteButtonTransform);
        transformNode.add(deleteButtonTransform).add(deleteButton);

        var closeButtonTransform = new StateModifier({
            origin: [1, 0],
            align: [1, 0]
        });
        var closeButton = Surface({
            size: [30, 30],
            content: 'X',
            properties: {
                //fontSize: fontSize + 'px',
                textAlign: 'center',
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
        transformNode.add(closeButtonTransform).add(closeButton);

        view.setSeries = function (ser)
        {
            series = ser;
            contentType = series.listData.series_mangadb_id ? 'manga' : 'anime';
            var playText = contentType == 'manga' ? 'Read' : 'Play';
            playButton.setContent(playText);
            var episodeText = contentType == 'manga' ? 'Chapters:' : 'Episodes:';
            episodeLabel.setContent(episodeText);
            image.setContent(ser.listData.series_image);
            title.setContent(ser.listData.series_title);
            type.setContent(ser.searchData.type);
            aired.setContent(ser.searchData.start_date + " to " + ser.searchData.end_date);

            while(myStatus.options.length > 0)
            {
                myStatus.options.remove(0);
            }
            var watchingText = contentType == 'anime' ? 'Watching' : 'Reading';
            var watchingOption = new Option(watchingText, 1);
            myStatus.options.add(watchingOption);
            var completedOption = new Option('Completed', 2);
            myStatus.options.add(completedOption);
            var onHoldOption = new Option('On-Hold', 3);
            myStatus.options.add(onHoldOption);
            var droppedOption = new Option('Dropped', 4);
            myStatus.options.add(droppedOption);
            var planToWatchText = contentType == 'anime' ? 'Plan to Watch' : 'Plan to Read';
            var planToWatchOption = new Option(planToWatchText, 6);
            myStatus.options.add(planToWatchOption);

            var myStatusIndex = ser.listData.my_status;
            if(myStatusIndex > 5 || myStatusIndex < 1)
            {
                myStatusIndex = 5;
            }
            myStatus.options.selectedIndex = myStatusIndex - 1;
            score.options.selectedIndex = 10 - ser.listData.my_score;
            status.setContent('Status: ' + ser.searchData.status);
            description.setContent(ser.searchData.synopsis);
            /*
             Engine.nextTick(function ()
             {
             
             description.setOptions({
             size: [undefined, description._currentTarget.childNodes[0].clientHeight]
             });
             
             });
             */

            var isAnime = contentType == 'anime';
            //this will now happen all the time so that the episode and chapter counts match what I
            //have access t orather than what MAL thinks there is
            //if(ser.listData.series_status == 1)
            {
                if(isAnime)
                {
                    var ledgerItem = window.ledger.getLedgerItem(ser.listData);
                    getEpisodeCountAsync(ledgerItem, function (episodeCounts)
                    {
                        while(episodeDropdown.options.length > 0)
                        {
                            episodeDropdown.options.remove(0);
                        }
                        ser.listData.series_episodes = episodeCounts[0] ? episodeCounts[0] : episodeCounts[1];
                        if(ser.listData.series_episodes == 0)
                        {
                            episodeDropdown.options.add(new Option('0'));
                        }
                        else
                        {
                            for(var i = 1; i <= ser.listData.series_episodes; i++)
                            {
                                episodeDropdown.options.add(new Option(i.toString()));
                            }
                            var indexToSelect = ser.listData.my_watched_episodes;
                            if(indexToSelect == episodeDropdown.options.length)
                            {
                                indexToSelect--;
                            }
                            episodeDropdown.options.selectedIndex = indexToSelect;
                        }
                    });
                }
                else
                {
                    var ledgerItem = window.ledger.getMangaLedgerItem(ser.listData);
                    getChapterCountAsync(ledgerItem, function (chapterCount)
                    {
                        while(episodeDropdown.options.length > 0)
                        {
                            episodeDropdown.options.remove(0);
                        }
                        ser.listData.series_chapters = chapterCount;
                        if(ser.listData.series_chapters == 0)
                        {
                            episodeDropdown.options.add(new Option('0'));
                        }
                        else
                        {
                            for(var i = 1; i <= ser.listData.series_chapters; i++)
                            {
                                episodeDropdown.options.add(new Option(i.toString()));
                            }
                            var indexToSelect = ser.listData.my_read_chapters;
                            if(indexToSelect == episodeDropdown.options.length)
                            {
                                indexToSelect--;
                            }
                            episodeDropdown.options.selectedIndex = indexToSelect;
                        }
                    });
                }

            }
            while(episodeDropdown.options.length > 0)
            {
                episodeDropdown.options.remove(0);
            }
            if(ser.listData.series_episodes === '0' || ser.listData.series_chapters === '0')
            {
                episodeDropdown.options.add(new Option('0'));
            }
            else
            {
                var loopTimes = isAnime ? ser.listData.series_episodes : ser.listData.series_chapters;
                for(var i = 1; i <= loopTimes; i++)
                {
                    episodeDropdown.options.add(new Option(i.toString()));
                }
                var indexToSelect = isAnime ? ser.listData.my_watched_episodes : ser.listData.my_read_chapters;
                if(indexToSelect == episodeDropdown.options.length)
                {
                    indexToSelect--;
                }
                episodeDropdown.options.selectedIndex = indexToSelect;
            }
        }

        view.resize = function ()
        {
            var windowSize = window.mainContext.getSize();
            playButton.setSize([window.formatting.scale * 100, window.formatting.scale * 50]);
            updateButton.setSize([window.formatting.scale * 100, window.formatting.scale * 50]);
            deleteButton.setSize([window.formatting.scale * 100, window.formatting.scale * 50]);
            descriptionContainer.setSize([windowSize[0] - 250, window.formatting.scale * 250]);
            image.setSize([window.formatting.scale * 150, window.formatting.scale * 233]);
            if(opened)
            {
                view.show();
            }
        }

        view.show = function ()
        {
            for(var i = 0; i < transforms.length; i++)
            {
                transforms[i].halt();
            }
            var inTransition = {
                duration: 1000,
                curve: Easing.outCubic
            };
            backgroundTransform.setOpacity(1, inTransition);
            backgroundTransform.setTransform(Transform.translate(0, 0, 0));
            imageTransform.setTransform(Transform.translate(10, 10, 1), inTransition);
            titleTransform.setTransform(Transform.translate(210, 10, 1), inTransition);
            typeTransform.setTransform(Transform.translate(210, 35, 1), inTransition);
            airedTransform.setTransform(Transform.translate(300, 35, 1), inTransition);
            myStatusLabelTransform.setTransform(Transform.translate(10, window.formatting.scale * 260, 1), inTransition);
            myStatusTransform.setTransform(Transform.translate(90, +window.formatting.scale * 260, 1), inTransition);
            scoreLabelTransform.setTransform(Transform.translate(10, window.formatting.scale * 260 + 30, 1), inTransition);
            scoreTransform.setTransform(Transform.translate(70, window.formatting.scale * 260 + 30, 1), inTransition);
            statusTransform.setTransform(Transform.translate(10, window.formatting.scale * 260 + 60, 1), inTransition);
            viewOnMALTransform.setTransform(Transform.translate(10, window.formatting.scale * 260 + 110, 1), inTransition);
            descriptionTransform.setTransform(Transform.translate(210, 75, 1), inTransition);
            episodeLabelTransform.setTransform(Transform.translate(210, window.formatting.scale * 275 + 75, 1), inTransition);
            episodeDropdownTransform.setTransform(Transform.translate(280, window.formatting.scale * 275 + 75, 1), inTransition);
            playButtonTransform.setTransform(Transform.translate(210, window.formatting.scale * 315 + 75, 1), inTransition);
            updateButtonTransform.setTransform(Transform.translate(210 + window.formatting.scale * 160, window.formatting.scale * 315 + 75, 1), inTransition);
            deleteButtonTransform.setTransform(Transform.translate(210 + window.formatting.scale * 320, window.formatting.scale * 315 + 75, 1), inTransition);
            opened = true;
        }

        function getRandomPos() {
            var windowSize = window.mainContext.getSize();

            var leftRightUpDown = Math.floor(Math.random() * 3);
            var randomX = Math.random() * windowSize[0];
            var randomY = Math.random() * windowSize[1];
            var pos = [0, 0];
            switch(leftRightUpDown) {
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
            //initialPositions(1000);
            var backgroundPos = window.mainContext.getSize();
            var inTransition = {
                duration: 1000,
                curve: Easing.outCubic
            };
            backgroundTransform.setOpacity(0, inTransition, function ()
            {
                backgroundTransform.setTransform(Transform.translate(backgroundPos[0], backgroundPos[1], 0));
            });
            opened = false;
        }
        function initialPositions(duration)
        {
            view.hide();
        }

        view.updatePosition = function ()
        {
            if(opened)
            {
                view.show();
            }
            else
            {
                initialPositions(0);
            }
        };

        initialPositions(0);

        return view;
    }
    module.exports = createSeriesDisplay;
});
