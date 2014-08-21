/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */

define(function(require, exports, module) {
	'use strict';
	var Surface = require('famous/core/Surface');
	var VideoPlayer=require('VideoJsSurface/video-js/video.dev');
	function createVideoJsSurface(surfaceOptions,playerOptions,skinName)
	{
		var vidTag=document.createElement("video");
		skinName=skinName||"vjs-default-skin";
		skinName="video-js "+skinName;
    	vidTag.setAttribute("class",skinName)

		surfaceOptions.content=vidTag;
		playerOptions.width="100%";
		playerOptions.height="100%";

    	var surf=new Surface(surfaceOptions);

    	var dunzo=false;
	    surf.on("deploy",function()
	    {
	        if (!dunzo)
	            {
	                surf.player=vjs(vidTag, playerOptions);
	                surf.emit("playerLoaded");
	                dunzo=true;
	            }
	    });
	    return surf;
	}
	module.exports=createVideoJsSurface;
});