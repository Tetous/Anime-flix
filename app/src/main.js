/* globals define */
define(function(require, exports, module) {
    'use strict';
    // import dependencies
    var Engine = require('famous/core/Engine');
    var RenderNode = require('famous/core/RenderNode');
    var Modifier = require('famous/core/Modifier');
    var StateModifier= require('famous/modifiers/StateModifier');
    var Transform = require('famous/core/Transform');
    var Surface = require('famous/core/Surface');
    var Easing = require('famous/transitions/Easing');
    var Transitionable=require('famous/transitions/Transitionable');
    var LoginScreen=require('LoginScreen');
    var ShowSelector=require('ShowSelector');
    var VideoPlayer=require('VideoPlayer');

    window.loginZ=100;
    window.showSelectorZ=50;
    window.videoPlayerZ=0;

    //CSS
    var vidCSS=document.createElement("link");
    vidCSS.rel="stylesheet";
    vidCSS.href="src/VideoJsSurface/video-js/video-js.min.css";
    vidCSS.type="text/css";
    document.head.appendChild(vidCSS);

    //Read Hash
    var hash= window.location.hash;

    //Important Vars
    var username;
    var password;

    //get CORS access
    var url = 'http://www.learnfamo.us/chard/requester.php';
    var request = new XMLHttpRequest();
    request.open("GET", url, false);
    request.send();

    // create the main context
    var mainContext = Engine.createContext();
    window.mainContext=mainContext

    Engine.nextTick(function(){

    var videoPlayerTransform=new StateModifier({
        transform:Transform.translate(0,0,window.videoPlayerZ)
    });
    var videoPlayer=VideoPlayer();
    videoPlayer.on('backToBrowsing',function(){
        showSelectorTransform.setAlign([0,0],{duration:2000,curve:Easing.outCubic});
    });

    var showSelectorTransform=new StateModifier({
        transform:Transform.translate(0,0,window.showSelectorZ)
    });
    var showSelector=ShowSelector();
    showSelector.on('showSelected',function(data){
        showSelectorTransform.setAlign([0,-1],{duration:2000,curve:Easing.outCubic},function(){
            videoPlayer.play(data.show,data.episode);
        });
    });

    var loginScreenTransform=new Modifier({transform: Transform.translate(0,0,window.loginZ)});
    var loginScreen=LoginScreen(mainContext.getSize());
    mainContext.add(loginScreenTransform).add(loginScreen);
    mainContext.add(showSelectorTransform).add(showSelector);
    mainContext.add(videoPlayerTransform).add(videoPlayer);

    loginScreen.on('loggedIn',function(){
        window.MALCreds={username:loginScreen.username,password:loginScreen.password};
        showSelector.refreshList();
        //videoPlayer.play({series_title: 'Sword Art Online'},1);
    });
});
});
