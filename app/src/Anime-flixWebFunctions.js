function getMALList(manga)
{
    var listType = manga ? 'manga' : 'anime';
    var url = 'http://www.anime-flix.com/requester.php?m=list&t=' + listType;
    var request = new XMLHttpRequest();
    request.open("POST", url, false);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.send('u=' + sessionStorage.username + '&p=' + sessionStorage.password);
    var body = request.responseText;

    malList = XML2jsobj(request.responseXML.documentElement);
    if(malList[listType] == undefined)
    {
        malList[listType] = [];
    }
    if(malList[listType].length == undefined)
    {
        malList[listType] = [malList[listType]];
    }
    return malList;
}

function updateAnime(listData, callBack)
{
    var request = new XMLHttpRequest();
    if(listData.localConstruction == undefined)
    {
        request.open('post', 'http://anime-flix.com/requester.php?m=update&i=' + listData.series_animedb_id);
        request.onreadystatechange = function ()
        {
            if(request.readyState == 4)
            {
                if(request.status == 200)
                {
                    if(callBack)
                    {
                        callBack(request.response);
                    }
                }
            }
        };
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.send('u=' + sessionStorage.username + '&p=' + sessionStorage.password + '&data=' + encodeURIComponent(createUpdateBody(listData)));
    }
    else
    {
        request.open('post', 'http://anime-flix.com/requester.php?m=add&i=' + listData.series_animedb_id);
        request.onreadystatechange = function ()
        {
            if(request.readyState == 4)
            {
                if(request.status == 200)
                {
                    if(callBack)
                    {
                        callBack(request.response);
                    }
                }
            }
        };
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.send('u=' + sessionStorage.username + '&p=' + sessionStorage.password + '&data=' + encodeURIComponent(createAddBody(listData)));
    }
}
function deleteAnime(id, callBack)
{
    var request = new XMLHttpRequest();
    request.open('post', 'http://anime-flix.com/requester.php?m=delete&i=' + id);
    request.onreadystatechange = function ()
    {
        if(request.readyState == 4)
        {
            if(request.status == 200)
            {
                if(callBack)
                {
                    callBack(request.response);
                }
            }
        }
    };
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.send('u=' + sessionStorage.username + '&p=' + sessionStorage.password);
}

function getDiscussionURL(episode, showId)
{
    var request = new XMLHttpRequest();
    request.open('post', 'http://anime-flix.com/requester.php?m=discuss&i=' + showId + '&e=' + episode, false);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.send('u=' + sessionStorage.username + '&p=' + sessionStorage.password);
    return request.response;
}


function createUpdateBody(listData)
{
    var ret = 'series_id=' + listData.series_animedb_id +
            '&anime_db_series_id=' + listData.series_animedb_id +
            '&series_title=' + listData.series_animedb_id +
            '&aeps=' + listData.series_episodes +
            '&astatus=' + listData.series_status +
            '&close_on_update=&status=' + listData.my_status +
            '&last_status=0' + //listData.last_status needs to be added by series display. Using destructive hack right now
            '&completed_eps=' + listData.my_watched_episodes +
            '&last_completed_eps=0' + //listData.last_completed_eps needs to be added by series display. Using destructive hack right now
            '&score=' + listData.my_score +
            '&submitIt=2';
    //these are unimportant and are not used my me (other and start and end date), these need to be set up to just pass original list data values through
    //'&tags=&fansub_group=0&priority=0&storage=0&storageVal=0.00&list_downloaded_eps=0&list_times_watched=0&list_rewatch_value=0&list_comments=&discuss=1';
    if(listData.my_start_date != '0000-00-00')
    {
        var dateParts = listData.my_start_date.split('-');
        ret += '&startMonth=' + dateParts[1] + '&startDay=' + dateParts[2] + '&startYear=' + dateParts[0];
    }
    else {
        ret += '&unknownStart=1';
    }
    if(listData.my_finish_date != '0000-00-00')
    {
        var dateParts = listData.my_finish_date.split('-');
        ret += '&endMonth=' + dateParts[1] + '&endDay=' + dateParts[2] + '&endYear=' + dateParts[0];
    }
    else
    {
        ret += '&unknownEnd=1';
    }
    return ret;
}

function createAddBody(listData)
{
    return 'series_id=0' + // listData.series_animedb_id +
            '&anime_db_series_id=' + // listData.series_animedb_id +
            '&series_title=' + listData.series_animedb_id +
            '&aeps=' + listData.series_episodes +
            '&astatus=' + listData.series_status +
            '&close_on_update=&status=' + listData.my_status +
            '&last_status=0' + //listData.last_status needs to be added by series display. Using destructive hack right now
            '&completed_eps=' + listData.my_watched_episodes +
            '&last_completed_eps=0' + //listData.last_completed_eps needs to be added by series display. Using destructive hack right now
            '&score=' + listData.my_score +
            '&startMonth=00&startDay=00&startYear=0000&submitIt=1';
    //these are unimportant and are not used my me (other and start and end date), these need to be set up to just pass original list data values through
    //'&tags=&unknownEnd=1&fansub_group=&priority=0&storage=0&storageVal=&list_downloaded_eps=&list_times_watched=&list_rewatch_value=0&list_comments=&discuss=1';
}

function createSeriesXML(listData)
{
    return '<?xml version="1.0" encoding="UTF-8"?>' +
            '<entry>' +
            '<episode>' + listData.my_watched_episodes + '</episode>' +
            '<status>' + listData.my_status + '</status>' +
            '<score>' + listData.my_score + '</score>' +
            '<downloaded_episodes></downloaded_episodes>' +
            '<storage_type></storage_type>' +
            '<storage_value></storage_value>' +
            '<times_rewatched></times_rewatched>' +
            '<rewatch_value</rewatch_value>' +
            '<date_start>' + listData.my_start_date + '</date_start>' +
            '<date_finish>' + listData.my_finish_date + '</date_finish>' +
            '<priority></priority>' +
            '<enable_discussion></enable_discussion>' +
            '<enable_rewatching></enable_rewatching>' +
            '<comments></comments>' +
            '<fansub_group></fansub_group>' +
            '<tags></tags>' +
            '</entry>';
}
/*
 function searchMAL(search)
 {
 var request = new XMLHttpRequest();
 request.open('POST', 'http://www.anime-flix.com/requester.php?m=search&s=' + search, false);
 request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
 request.send('u=' + sessionStorage.username + '&p=' + sessionStorage.password);
 var parser = new DOMParser();
 var decodedRes = request.response.replace(/&mdash;/g, '-').replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"').replace(/&rsquo;/g, '\'');
 var domObj = parser.parseFromString(decodedRes, "text/xml");
 return XML2jsobj(domObj).anime;
 }
 */
function searchMALAsync(search,type, callback)
{
    var request = new XMLHttpRequest();
    request.onreadystatechange = function ()
    {
        if(request.readyState == 4)
        {
            if(request.status == 200)
            {
                parser = new DOMParser();
                var domObj = parser.parseFromString(request.response.replace(/&mdash;/g, '-').replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"').replace(/&rsquo;/g, '\''), "text/xml");
                obj = XML2jsobj(domObj)[type];
                //obj = XML2jsobj(request.responseXML.documentElement);
                callback(obj);
            }
        }
    };
    request.open("POST", 'http://www.anime-flix.com/requester.php?m=search&s=' + search+'&t='+type, true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.send('u=' + sessionStorage.username + '&p=' + sessionStorage.password);
}
function getEpisodeCountAsync(ledgerItem, callback)
{
    var url = 'http://www.anime-flix.com/requester.php?m=epCount&t=' + ledgerItem.name;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function ()
    {
        if(request.readyState == 4)
        {
            if(request.status == 200)
            {
                var strings = request.responseText.split(':');
                var arr = [parseInt(strings[0]), parseInt(strings[1])];
                callback(arr);
            }
        }
    }
    request.open('POST', url);
    request.send(ledgerItem.link);
}

function getChapterCountAsync(ledgerItem, callback)
{
    var url = 'http://www.anime-flix.com/requester.php?m=chapCount';
    var request = new XMLHttpRequest();
    request.onreadystatechange = function ()
    {
        if(request.readyState == 4)
        {
            if(request.status == 200)
            {
                callback(parseInt(request.responseText));
            }
        }
    }
    request.open('POST', url);
    request.send(ledgerItem.link);
}

function getPages(ledgerItem, chapter, callback)
{
    var url = 'http://www.anime-flix.com/requester.php?m=pages&ch=' + chapter;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function ()
    {
        if(request.readyState == 4)
        {
            if(request.status == 200)
            {
                var strings = request.responseText.split(',');
                strings.pop();
                callback(strings);
            }
        }
    }
    request.open('POST', url);
    request.send(ledgerItem.link);
}