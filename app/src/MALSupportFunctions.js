function updateAnime(listData)
{
    var request = new XMLHttpRequest();
    if (listData.localConstruction==undefined)
    {
        request.open('post', 'http://learnfamo.us/chard/requester.php?m=update&i=' + listData.series_animedb_id, false);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.send('u=' + window.MALCreds.username + '&p=' + window.MALCreds.password + '&data=' + encodeURIComponent(createUpdateBody(listData)));
    }
    else
    {
        request.open('post', 'http://learnfamo.us/chard/requester.php?m=add&i=' + listData.series_animedb_id, false);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.send('u=' + window.MALCreds.username + '&p=' + window.MALCreds.password + '&data=' + encodeURIComponent(createAddBody(listData)));
    }
}

function createUpdateBody(listData)
{
    return 'series_id=' + listData.series_animedb_id +
        '&anime_db_series_id=' + listData.series_animedb_id +
        '&series_title=' + listData.series_animedb_id +
        '&aeps=' + listData.series_episodes +
        '&astatus=' + listData.series_status +
        '&close_on_update=&status=' + listData.my_status +
        '&last_status=0' +//listData.last_status needs to be added by series display. Using destructive hack right now
        '&completed_eps=' + listData.my_watched_episodes +
        '&last_completed_eps=0' +//listData.last_completed_eps needs to be added by series display. Using destructive hack right now
        '&score=' + listData.my_score +
        //these are unimportant and are not used my me (other and start and end date), these need to be set up to just pass original list data values through
        '&tags=&unknownStart=1&unknownEnd=1&fansub_group=0&priority=0&storage=0&storageVal=0.00&list_downloaded_eps=0&list_times_watched=0&list_rewatch_value=0&list_comments=&discuss=1&submitIt=2';
}

function createAddBody(listData)
{
    return 'series_id=0' +// listData.series_animedb_id +
        '&anime_db_series_id=' +// listData.series_animedb_id +
        '&series_title=' + listData.series_animedb_id +
        '&aeps=' + listData.series_episodes +
        '&astatus=' + listData.series_status +
        '&close_on_update=&status=' + listData.my_status +
        '&last_status=0' +//listData.last_status needs to be added by series display. Using destructive hack right now
        '&completed_eps=' + listData.my_watched_episodes +
        '&last_completed_eps=0' +//listData.last_completed_eps needs to be added by series display. Using destructive hack right now
        '&score=' + listData.my_score +
        //these are unimportant and are not used my me (other and start and end date), these need to be set up to just pass original list data values through
        '&tags=&startMonth=00&startDay=00&startYear=0000&unknownEnd=1&fansub_group=&priority=0&storage=0&storageVal=&list_downloaded_eps=&list_times_watched=&list_rewatch_value=0&list_comments=&discuss=1&submitIt=1';
}

function createSeriesXML(listData)
{
    return '<?xml version="1.0" encoding="UTF-8"?>'+
           '<entry>'+
           '<episode>'+listData.my_watched_episodes+'</episode>'+
	           '<status>'+listData.my_status+'</status>'+
	           '<score>'+listData.my_score+'</score>'+
	           '<downloaded_episodes></downloaded_episodes>'+
	           '<storage_type></storage_type>'+
	           '<storage_value></storage_value>'+
	           '<times_rewatched></times_rewatched>'+
	           '<rewatch_value</rewatch_value>'+
	           '<date_start>'+listData.my_start_date+'</date_start>'+
	           '<date_finish>'+listData.my_finish_date+'</date_finish>'+
	           '<priority></priority>'+
	           '<enable_discussion></enable_discussion>'+
	           '<enable_rewatching></enable_rewatching>'+
	           '<comments></comments>'+
	           '<fansub_group></fansub_group>'+
	           '<tags></tags>'+
           '</entry>';
}