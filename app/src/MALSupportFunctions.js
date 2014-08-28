function updateAnime(listData)
{
    var request = new XMLHttpRequest();
    request.open('post', 'http://learnfamo.us/chard/requester.php?m=update&i=' + listData.series_animedb_id + '&u=' + window.MALCreds.username + '&p=' + window.MALCreds.password, false);
    request.send(createSeriesXML(listData));
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