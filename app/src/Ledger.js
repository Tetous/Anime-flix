/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */


define(function (require, exports, module)
{
    var _ = require('underscore');
    require('xml2jsobj/xml2jsobj');

    var dirtyLedger = false;
    var dirtyDubLedger = false;
    var ledgerSwaps = [];
    var showLedger = [];
    var dubLedger = [];
    var mangaLedger = [];

    if (localStorage.ledger)
    {
        showLedger = JSON.parse(localStorage.ledger);
    }
    if (localStorage.dubLedger)
    {
        dubLedger = JSON.parse(localStorage.dubLedger);
    }
    if(localStorage.mangaLedger)
    {
        mangaLedger = JSON.parse(localStorage.mangaLedger);
    }
    if (localStorage.swaps)
    {
        ledgerSwaps = JSON.parse(localStorage.swaps);
    }

    var swapsRequest = new XMLHttpRequest();
    swapsRequest.open('GET', '/content/data/LocalLedgerSwaps.xml');
    swapsRequest.setRequestHeader('Content-Type', "text/xml");
    swapsRequest.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2005 00:00:00 GMT");
    swapsRequest.onreadystatechange = function ()
    {
        if (swapsRequest.readyState == 4)
        {
            if (swapsRequest.status == 200)
            {
                var parser = new DOMParser();
                var domObj = parser.parseFromString(swapsRequest.response, "text/xml");
                ledgerSwaps = XML2jsobj(domObj).Root.swap;
                localStorage.swaps = JSON.stringify(ledgerSwaps);
            }
        }
    };
    swapsRequest.send();

    function processLedger(body, terminator, type)
    {
        var resultLedger = [];
        if (!body.indexOf('unavailable')>-1)
        {
            var index = body.indexOf('class="series_index"');
            var showName = "";
            while (showName !== terminator)
            {
                index = body.indexOf("href=\"", index) + 6;
                var showLink = body.substring(index, body.indexOf("\"", index));
                var index2 = body.indexOf(">", index) + 1;
                showName = body.substring(index2, body.indexOf("<", index2));
                resultLedger.push({ name: showName, link: showLink, contentType: type });
            }
            resultLedger.pop();
        }
        return resultLedger;
    }

    function getAnimeLedger()
    {
        var url = "http://www.anime-flix.com/requester.php?m=ledger";
        var request = new XMLHttpRequest();
        request.onreadystatechange = function ()
        {
            if (request.readyState == 4)
            {
                if (request.status == 200)
                {
                    if (dirtyLedger)
                    {
                        showLedger = [];
                        dirtyLedger = false;
                    }
                    var processedLedger = processLedger(request.responseText, 'Dubbed Anime', 'anime');
                    showLedger = showLedger.concat(processedLedger);
                    localStorage.ledger = JSON.stringify(showLedger);
                }
            }
        };
        request.open("GET", url, true);
        request.send();
    }
    function getMovieLedger()
    {
        var url = "http://www.anime-flix.com/requester.php?m=movieLedger";
        var request = new XMLHttpRequest();
        request.onreadystatechange = function ()
        {
            if (request.readyState == 4)
            {
                if (request.status == 200)
                {
                    if (dirtyLedger)
                    {
                        showLedger = [];
                        dirtyLedger = false;
                    }
                    showLedger = showLedger.concat(processLedger(request.responseText, 'Dubbed Anime', 'movie'));
                    localStorage.ledger = JSON.stringify(showLedger);
                }
            }
        };
        request.open("GET", url, true);
        request.send();
    }
    function getDubAnimeLedger()
    {
        var url = "http://www.anime-flix.com/requester.php?m=ledger&d=true";
        var request = new XMLHttpRequest();
        request.onreadystatechange = function ()
        {
            if (request.readyState == 4)
            {
                if (request.status == 200)
                {
                    if (dirtyDubLedger)
                    {
                        dubLedger = [];
                        dirtyDubLedger = false;
                    }
                    var processedLedger = processLedger(request.responseText, 'Watch Anime', 'anime');
                    dubLedger = dubLedger.concat(processedLedger);
                    localStorage.dubLedger = JSON.stringify(dubLedger);
                }
            }
        };
        request.open("GET", url, true);
        request.send();
    }
    function getDubMovieLedger()
    {
        var url = "http://www.anime-flix.com/requester.php?m=movieLedger&d=true";
        var request = new XMLHttpRequest();
        request.onreadystatechange = function ()
        {
            if (request.readyState == 4)
            {
                if (request.status == 200)
                {
                    if (dirtyDubLedger)
                    {
                        dubLedger = [];
                        dirtyDubLedger = false;
                    }
                    var moddedBody = request.responseText.replace(/ \(Movie\)/g, '');
                    dubLedger = dubLedger.concat(processLedger(moddedBody, 'Watch Anime', 'movie'));
                    localStorage.dubLedger = JSON.stringify(dubLedger);
                }
            }
        };
        request.open("GET", url, true);
        request.send();
    }
    function getMangaLedger()
    {
        var url = "http://www.anime-flix.com/requester.php?m=mangaLedger";
        var request = new XMLHttpRequest();
        request.onreadystatechange = function ()
        {
            if (request.readyState == 4)
            {
                if (request.status == 200)
                {
                    var body = _.unescape(request.responseText.replace(/<span><\/span>/g, ''));
                    mangaLedger = [];
                    //process mangaLedger
                    if (!body.indexOf('unavailable') > -1)
                    {
                        var index = body.indexOf('<div id="A" name="A">');
                        var showName = "";
                        var footerIndex = body.indexOf('class="footer"', index);
                        while (footerIndex>index)
                        {
                            index = body.indexOf("href=\"", index) + 6;
                            var showLink = body.substring(index, body.indexOf("\"", index));
                            var index2 = body.indexOf(">", index) + 1;
                            showName = body.substring(index2, body.indexOf("<", index2));
                            mangaLedger.push({ name: showName, link: showLink });
                        }
                        mangaLedger.pop();
                    }

                    localStorage.mangaLedger = JSON.stringify(dubLedger);
                }
            }
        };
        request.open("GET", url, true);
        request.send();
    }

    function getLedger()
    {
        //showLedger = [];
        dirtyLedger = true;
        dirtyDubLedger = true;
        getAnimeLedger();
        getMovieLedger();
        getDubAnimeLedger();
        getDubMovieLedger();
        getMangaLedger();
    }
    function getLedgerItem(show, dub)
    {
        var ledgerToCheck = showLedger;
        if (dub)
        {
            ledgerToCheck = dubLedger;
        }

        var value = false;
        var done = false;
        /*
        for (var i = 0; i < ledgerSwaps.length && !done; i++)
        {
            if (ledgerSwaps[i].malName.toLowerCase() == show.series_title.toLowerCase())
            {
                for (var j = 0; j < ledgerToCheck.length && !done; j++)
                {
                    if (ledgerSwaps[i].ledgerName.toLowerCase() == ledgerToCheck[j].name.toLowerCase())
                    {
                        value = { name: ledgerToCheck[j].name, link: ledgerToCheck[j].link, contentType: ledgerToCheck[j].contentType };
                        done = true;
                    }
                }
            }
        }
        */
        //if (!value)
        //{
            var titles;
            if ((typeof show.series_synonyms) == 'string')
            {
                titles = show.series_synonyms.split('; ');
            }
            else
            {
                titles = new Array();
            }
            var swapped = false;
            for (var i = 0; i < ledgerSwaps.length && !swapped; i++)
            {
                if (ledgerSwaps[i].malName.toLowerCase() == show.series_title.toLowerCase())
                {
                    titles.unshift(ledgerSwaps[i].ledgerName);
                    swapped = true;
                }
            }
            if (!swapped)
            {
                titles.unshift(show.series_title);
            }

            for (var j = 0; j < titles.length && !done; j++)
            {
                var workingTitle = titles[j];
                while (workingTitle && !done)
                {
                    for (var i = 0; i < ledgerToCheck.length && !done; i++)
                    {
                        if (ledgerToCheck[i].name.toLowerCase() == workingTitle.toLowerCase())
                        {
                            value = { name: titles[j], link: ledgerToCheck[i].link, contentType: ledgerToCheck[i].contentType };
                            //if (j>0&&!dub) {
                            //    ledgerToCheck.push(value);
                            //}
                            done = true;
                        };
                    };
                    workingTitle = trimTitle(workingTitle);
                };
            };
        //}
        return value;
    }
    function getMangaLedgerItem(manga)
    {
        var titles;
        if ((typeof manga.series_synonyms) == 'string')
        {
            titles = manga.series_synonyms.split('; ');
        }
        else
        {
            titles = new Array();
        }
        /*
        var swapped = false;
        for (var i = 0; i < ledgerSwaps.length && !swapped; i++)
        {
            if (ledgerSwaps[i].malName.toLowerCase() == manga.series_title.toLowerCase())
            {
                titles.unshift(ledgerSwaps[i].ledgerName);
                swapped = true;
            }
        }
        if (!swapped)
        {
        */
            titles.unshift(manga.series_title);
        //}

        for (var j = 0; j < titles.length && !done; j++)
        {
            var workingTitle = titles[j];
            while (workingTitle && !done)
            {
                for (var i = 0; i < mangaLedger.length && !done; i++)
                {
                    if (mangaLedger[i].name.toLowerCase() == workingTitle.toLowerCase())
                    {
                        value = { name: titles[j], link: mangaLedger[i].link };
                        done = true;
                    };
                };
                workingTitle = trimTitle(workingTitle);
            };
        };
        return value;
    }

    function trimTitle(s)
    {
        var trimmedString = false;
        if (s.charAt(s.length - 1) == '!')
        {
            trimmedString = s.substring(0, s.length - 1);
        }
        else
        {
            var index = s.lastIndexOf(' ');
            if (index > -1)
            {
                trimmedString = s.substring(0, index);
                if (trimmedString.charAt(trimmedString.length - 1) == ':')
                {
                    trimmedString = trimmedString.substring(0, trimmedString.length - 1);
                }
            }
        }
        return trimmedString;
    }
    module.exports = {getLedger:getLedger,getLedgerItem:getLedgerItem}
});