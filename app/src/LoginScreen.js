/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */

define(function (require, exports, module)
{
    var Engine = require('famous/core/Engine');
    var View = require('famous/core/View');
    var Transform = require('famous/core/Transform');
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

        
        //loginTransitionable.set([0.5, 0.5], { duration: 2000, curve: Easing.outBounce }, credentialInfoBounce);

        var loginBackground = new ImageSurface({
            content: "/content/images/AnimeflixLogin2.png"
        });
        loginBackground.on("deploy", function ()
        {
            //#region Session Relogin

            if (sessionStorage.username != undefined)
            {
                view.username = sessionStorage.username;
                view.password = sessionStorage.password;

                var url = 'http://www.anime-flix.com/requester.php?m=login';
                var request = new XMLHttpRequest();
                request.open("POST", url, false);
                request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                request.send('u=' + view.username + '&p=' + view.password);

                var bodyText = request.responseText;
                if (bodyText == 'Invalid credentials' || request.status != 200)
                {
                    loginTransitionable.set([0.5, 0.5], { duration: 2000, curve: Easing.outBounce }, credentialInfoBounce);
                }
                else
                {
                    view._eventOutput.emit('loggedIn');
                }
            }
            else
            {
                loginTransitionable.set([0.5, 0.5], { duration: 2000, curve: Easing.outBounce }, credentialInfoBounce);
            }
            //#endregion
        });

        var fontSize = 25;
        var boxWidth = 400;
        var boxHeight = 40;

        var logoHeight = 100;
        var logoTransform = new StateModifier({
            origin: [0.5, 0.5]
        });
        var logo = new ImageSurface({
            content: '/content/images/AnimeflixLogo.png'
        });

        var betaHeight = 60;
        var betaTransform = new StateModifier({
            origin: [0.5, 0.5]
        });
        var betaRotate = new StateModifier({
            transform:Transform.rotate(0,0,3.14/6)
        });
        var beta = new ImageSurface({
            content:'content/images/Beta.png'
        });

        var textboxProperties = {
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
            origin: [0.5, 0.5]
        });
        var usernameBox = new InputSurface({
            type: 'text',
            placeholder: 'Username',
            properties: textboxProperties
        }
        );
        usernameBox.on('keypress', textBoxEnter);

        var passwordBoxTransform = new Modifier({
            origin: [0.5, 0.5]
        });
        var passwordBox = new InputSurface({
            type: 'password',
            placeholder: 'Password',
            properties: textboxProperties
        }
        );
        passwordBox.on('keypress', textBoxEnter);

        var buttonWidth = 200;
        var buttonHeight = 80;
        var buttonTransform = new Modifier({
            origin: [0.5, 0.5]
        });
        var button = Surface({
            content: 'Login',
            properties: {
                textAlign: 'center',
                verticalAlign: 'middle',
                backgroundColor: window.colorScheme.main,//'#4494FD',//'#00fff8',
                borderRadius: boxHeight / 2 + 'px'
            }
        });

        button.on('click', login)

        view.resize = function ()
        {
            buttonTransform.setTransform(Transform.translate(0, window.formatting.scale*(buttonHeight + boxHeight), 1));
            button.setSize([window.formatting.scale * buttonWidth, window.formatting.scale * buttonHeight]);
            usernameBoxTransform.setTransform(Transform.translate(0, window.formatting.scale * -boxHeight, 1));
            usernameBoxTransform.setSize([window.formatting.scale * boxWidth, window.formatting.scale * boxHeight]);
            passwordBoxTransform.setTransform(Transform.translate(0, window.formatting.scale * boxHeight, 1));
            passwordBoxTransform.setSize([window.formatting.scale * boxWidth, window.formatting.scale * boxHeight]);
            logoTransform.setTransform(Transform.translate(0, window.formatting.scale * (-boxHeight - logoHeight)));
            logo.setSize([true, window.formatting.scale * logoHeight]);
            betaTransform.setTransform(Transform.translate(window.formatting.scale * 330, window.formatting.scale * (-boxHeight - logoHeight - 20)));
            beta.setSize([true, window.formatting.scale * betaHeight]);
            credentialInfoTransform2.setTransform(Transform.translate(window.formatting.scale * -20, 0, 0));
            credentialInfoBackground.setSize([window.formatting.scale * 250 * 1.15, window.formatting.scale * 150 * 1.15]);
            credentialInfo.setSize([window.formatting.scale * 200, true]);
            credentialInfoTransform.setTransform(Transform.translate(window.formatting.scale * -350, 0, 5));
            credentialInfo.setProperties({ fontSize: window.formatting.scale * 12 + 'px' });
            button.setProperties({ fontSize: window.formatting.scale * fontSize + 'px' });
            usernameBox.setProperties({ fontSize: window.formatting.scale * fontSize + 'px' });
            passwordBox.setProperties({ fontSize: window.formatting.scale * fontSize + 'px' });
        }

        var credentialInfoTransform = new StateModifier({
            origin: [0.5,0.5]
        });
        function credentialInfoBounce()
        {
            credentialInfoTransform.setTransform(Transform.translate(window.formatting.scale * -400, 0, 5), { duration: 1000, curve: Easing.outCubic });
            credentialInfoTransform.setTransform(Transform.translate(window.formatting.scale * -350, 0, 5), { duration: 1000, curve: Easing.outBounce });
            //credentialInfoTransform.setTransform(Transform.translate(-350, 0, 5), { duration: 500, curve: Easing.outBounce },credentialInfoBounce);
        }

        var credentialInfoBackground = new ImageSurface({
            content:'content/images/InfoBubble2.png'
        });
        var credentialInfoTransform2 = new StateModifier({

        });
        var credentialInfo = Surface({
            content: 'Login with your MyAnimeList credentials. Anime-flix uses MyAnimeList to track your viewing progress as you watch.',
            properties: {
                textAlign: 'center',
                vericalAlign: 'middle',
                color:'white'
            }
        });

        function login()
        {
            view.username = usernameBox.getValue();
            view.password = passwordBox.getValue();
            var url = 'http://www.anime-flix.com/requester.php?m=login';
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
        bouncerNode.add(betaTransform).add(betaRotate).add(beta);
        bouncerNode.add(usernameBoxTransform).add(usernameBox);
        bouncerNode.add(passwordBoxTransform).add(passwordBox);
        bouncerNode.add(buttonTransform).add(button);
        var credentialInfoNode = bouncerNode.add(credentialInfoTransform);
        credentialInfoNode.add(credentialInfoBackground);
        credentialInfoNode.add(credentialInfoTransform2).add(credentialInfo);
        return view;
    }
    module.exports = createLoginScreen;
});