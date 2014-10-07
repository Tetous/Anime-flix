/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */

define(function (require, exports, module)
{
    var Transform = require('famous/core/Transform');
    var View = require('famous/core/View');
    var Modifier = require('famous/core/Modifier');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Transitionable = require('famous/transitions/Transitionable');
    var Easing = require('famous/transitions/Easing');
    var Surface = require('RichFamous/Surface');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var InputSurface = require('famous/surfaces/InputSurface');

    function createLoginScreen(size)
    {
        var view = new View();

        var loginTransitionable = new Transitionable([0.5, -1.5]);
        var loginTransform = new Modifier({
            origin: [0.5, 0.5],
            align: function () { return loginTransitionable.get(); }
        });

        loginTransitionable.set([0.5, 0.5], { duration: 2000, curve: Easing.outBounce });

        var loginBackground = new ImageSurface({
            content: "/content/images/AnimeflixLogin2.png"
        });

        var fontSize = 25;
        var boxWidth = 400;
        var boxHeight = 40;

        var logoHeight = 100;
        var logoTransform = new StateModifier({
            transform: Transform.translate(0, -boxHeight - logoHeight),
            origin: [0.5, 0.5]
        });
        var logo = new ImageSurface({
            size: [true, logoHeight],
            content: '/content/images/AnimeflixLogo.png'
        });

        var textboxProperties = {
            fontSize: fontSize + 'px',
            border: '1px solid gray',
            borderRadius: boxHeight / 2 + 'px',
            textAlign: 'center',
            resize: 'none',
            outline: 'none',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
        };

        function textBoxEnter(k)
        {
            if (k.keyCode == 13)
            {
                login();
            };
        }

        var usernameBoxTransform = new Modifier({
            transform: Transform.translate(0, -boxHeight, 1),
            origin: [0.5, 0.5]
        });
        var usernameBox = new InputSurface({
            size: [boxWidth, boxHeight],
            type: 'text',
            placeholder: 'Username',
            properties: textboxProperties
        }
        );
        usernameBox.on('keypress', textBoxEnter);

        var passwordBoxTransform = new Modifier({
            transform: Transform.translate(0, boxHeight, 1),
            origin: [0.5, 0.5]
        });
        var passwordBox = new InputSurface({
            size: [boxWidth, boxHeight],
            type: 'password',
            placeholder: 'Password',
            properties: textboxProperties
        }
        );
        passwordBox.on('keypress', textBoxEnter);

        var buttonWidth = 200;
        var buttonHeight = 80;
        var buttonTransform = new Modifier({
            transform: Transform.translate(0, buttonHeight + boxHeight, 1),
            origin: [0.5, 0.5]
        });
        var button = Surface({
            size: [buttonWidth, buttonHeight],
            content: 'Login',
            properties: {
                fontSize: fontSize + 'px',
                textAlign: 'center',
                verticalAlign: 'middle',
                backgroundColor: '#4494FD',//'#00fff8',
                border: '1px solid gray',
                borderRadius: boxHeight / 2 + 'px'
            }
        });

        button.on('click', login)


        function login()
        {
            view.username = usernameBox.getValue();
            view.password = passwordBox.getValue();
            var url = 'http://www.learnfamo.us/chard/requester.php?m=login';
            var request = new XMLHttpRequest();
            request.open("POST", url, false);
            request.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
            request.send('u=' + view.username + '&p=' + view.password);

            var bodyText = request.responseText;
            if (bodyText == 'Invalid credentials' || request.status != 200)
            {
                loginTransitionable.set([0.5, 0.4], { duration: 500, curve: Easing.outCubic });
                loginTransitionable.set([0.5, 0.5], { duration: 500, curve: Easing.outBounce });
            }
            else
            {
                view._eventOutput.emit('loggedIn');
                loginTransitionable.set([0.5, -1.5], { duration: 3000, curve: Easing.outQuint });
            }
        }

        var bouncerNode = view.add(loginTransform);
        bouncerNode.add(loginBackground);
        bouncerNode.add(logoTransform).add(logo);
        bouncerNode.add(usernameBoxTransform).add(usernameBox);
        bouncerNode.add(passwordBoxTransform).add(passwordBox);
        bouncerNode.add(buttonTransform).add(button);
        return view;
    }
    module.exports = createLoginScreen;
});