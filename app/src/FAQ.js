/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */


define(function (require, exports, module)
{
    var View = require('famous/core/View');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var ScrollView = require('famous/views/ScrollView');
    var HeaderFooterLayout = require("famous/views/HeaderFooterLayout");
    var StateModifier = require('famous/modifiers/StateModifier');
    var Transform = require('famous/core/Transform');
    var Surface = require('RichFamous/Surface');

    function createFAQ()
    {
        var faqs;

        var view = new View();
        var layout = new HeaderFooterLayout();
        view.add(layout);

        var header = Surface({
            content: 'FAQ',
            properties: {
                backgroundColor:window.colorScheme.second
            }
        });
        layout.header.add(header);
        var closeButtonTransform = new StateModifier({
            transform:Transform.translate(0,0,2),
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
            view._eventOutput.emit('hideFAQ');
        });
        layout.header.add(closeButtonTransform).add(closeButton);
        var container = new ContainerSurface({
            properties: {
                backgroundColor: window.colorScheme.second
            }
        });
        layout.content.add(container);
        
        var speedLimit = window.isMobile ? 0 : 2;
        var scroll = new ScrollView({
            direction: 1,
            friction: 1,
            drag: 1,
            speedLimit: speedLimit
        });
        var scrollSurfaces = [];
        scroll.sequenceFrom(scrollSurfaces);
        container.add(scroll);
        container.pipe(scroll);

        var request = new XMLHttpRequest();
        request.onreadystatechange = function ()
        {
            if (request.readyState == 4)
            {
                if (request.status = 200)
                {
                    var colors = [window.colorScheme.second, 'gray'];
                    faqs = JSON.parse(request.responseText);
                    for (var i = 0; i < faqs.length; i++)
                    {
                        var surf = Surface({
                            size:[undefined,true],
                            content: '<b>Q: ' + faqs[i].q + '</b><br>' + 'A: ' + faqs[i].a,
                            properties: {
                                backgroundColor: colors[i % 2]
                            }
                        });
                        scrollSurfaces.push(surf);
                    }
                }
            }
        };
        request.open('GET', '/content/data/faq.txt');
        request.send();

        view.resize = function ()
        {
            layout.setOptions({
                headerSize: window.formatting.scale * 100
            });
            header.setProperties({ fontSize: window.formatting.scale * 75 + 'px' });
        }
        return view;
    }
    return createFAQ;
});