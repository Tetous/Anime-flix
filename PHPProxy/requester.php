<?php

header("Access-Control-Allow-Origin: *");

// create curl resource 
$ch;

//pick Method
switch ($_GET["m"])
{
    case 'login':
        $out = checkLogin(htmlspecialchars($_POST['u']), htmlspecialchars($_POST['p']));
        header('Content-Length: ' . strlen($out));
        echo $out;
        break;
    case 'list':
        $out = getMALList(htmlspecialchars($_POST['u']), $_GET['t']);
        header('Content-Length: ' . strlen($out));
        header('Content-type: text/xml');
        echo $out;
        break;
    case 'ledger':
        $out = getAnimePlusList($_GET['d']);
        header('Content-Length: ' . strlen($out));
        echo $out;
        break;
    case 'movieLedger':
        $out = getAnimePlusMovieList($_GET['d']);
        header('Content-Length: ' . strlen($out));
        echo $out;
        break;
    case 'mangaLedger':
        $out = getMangaList();
        header('Content-Length: ' . strlen($out));
        echo $out;
        break;
    case 'alts':
        $out = getAlternateTitles(file_get_contents('php://input'));
        header('Content-Length: ' . strlen($out));
        echo $out;
        break;
    case 'stream':
        $out = getStreamUrl(file_get_contents('php://input'), $_GET['t'], $_GET['e']);
        header('Content-Length: ' . strlen($out));
        echo $out;
        break;
    case 'pages':
        $out = getMangaPages(file_get_contents('php://input'), $_GET['ch']);
        header('Content-Length: ' . strlen($out));
        echo $out;
        break;
    case 'epCount':
        $out = getEpisodeCount(file_get_contents('php://input'), $_GET['t']);
        header('Content-Length: ' . strlen($out));
        echo $out;
        break;
    case 'chapCount':
        $out = getChapterCount(file_get_contents('php://input'));
        header('Content-Length: ' . strlen($out));
        echo $out;
        break;
    case 'search':
        $out = getSearch($_GET['s'], $_GET['t'], htmlspecialchars($_POST["u"]), htmlspecialchars($_POST["p"]));
        header('Content-Length: ' . strlen($out));
        header('Content-type: text/xml');
        echo str_replace('utf-8', 'UTF-8', $out);
        break;
    case 'update':
        $out = changeListItem($_POST["data"],'anime', $_GET['i'], htmlspecialchars($_POST["u"]), htmlspecialchars($_POST["p"]));
        header('Content-Length: ' . strlen($out));
        echo $out;
        break;
    case 'add':
        $out = addListItem($_POST["data"],'anime', $_GET['i'], htmlspecialchars($_POST["u"]), htmlspecialchars($_POST["p"]));
        header('Content-Length: ' . strlen($out));
        echo $out;
        break;
    case 'updatem':
        $out = changeListItem($_POST["data"],'manga', $_GET['i'], htmlspecialchars($_POST["u"]), htmlspecialchars($_POST["p"]));
        header('Content-Length: ' . strlen($out));
        echo $out;
        break;
    case 'addm':
        $out = addListItem($_POST["data"],'manga', $_GET['i'], htmlspecialchars($_POST["u"]), htmlspecialchars($_POST["p"]));
        header('Content-Length: ' . strlen($out));
        echo $out;
        break;
    case 'delete':
        $out = deleteListItem($_GET['i'],$_GET['t'], htmlspecialchars($_POST["u"]), htmlspecialchars($_POST["p"]));
        header('Content-Length: ' . strlen($out));
        echo $out;
        break;
    case 'discuss':
        $out = getDiscussionURL($_GET['e'], $_GET['i'], htmlspecialchars($_POST["u"]), htmlspecialchars($_POST["p"]));
        header('Content-Length: ' . strlen($out));
        echo $out;
        break;
    default:
        # code...
        break;
}

function MALLogin($ch, $username, $password)
{
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_URL, 'http://myanimelist.net/');
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept-Encoding: ', 'User-Agent: api-indiv-D0DBACC0751B8D31B1580E361A75EF50'));
    curl_setopt($ch, CURLOPT_HEADERFUNCTION, 'setCookies');
    curl_exec($ch);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_URL, 'http://myanimelist.net/');
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept-Encoding: ', 'User-Agent: api-indiv-D0DBACC0751B8D31B1580E361A75EF50'));
    curl_setopt($ch, CURLOPT_HEADERFUNCTION, 'setCookies');
    curl_exec($ch);
    
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_URL, 'http://myanimelist.net/login.php');
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept-Encoding: ', 'User-Agent: api-indiv-D0DBACC0751B8D31B1580E361A75EF50'));
    curl_setopt($ch, CURLOPT_POSTFIELDS, 'username=' . $username . '&password=' . $password . '&sublogin=Login&cookie=1&submit=1');
    curl_setopt($ch, CURLOPT_HEADERFUNCTION, 'setCookies');

    curl_exec($ch);
}

function getDiscussionURL($id, $episode, $username, $password)
{
    global $ch;

    $ch = curl_init();

    MALLogin($ch, $username, $password);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLINFO_HEADER_OUT, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_URL, 'http://myanimelist.net/includes/ajax.inc.php?t=50');
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept-Encoding: ', 'User-Agent: api-indiv-D0DBACC0751B8D31B1580E361A75EF50'));
    curl_setopt($ch, CURLOPT_POSTFIELDS, 'epNum=' . $episode . '&aid=' . $id . '&id=' . $id);
    $output = curl_exec($ch);

    curl_close($ch);
    return output;
    $urlStart = strpos($output, '/forum/?topicid=');
    if ($urlStart === false)
    {
        return 'false';
    }
    $urlEnd = strpos($output, '\';"', $urlStart);
    $urlPart = substr($output, $urlStart, $urlEnd - $urlStart);
    return 'http://myanimelist.net' . $urlPart;
}

function deleteListItem($id,$type, $username, $password)
{
    global $ch;

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLINFO_HEADER_OUT, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_USERPWD, $username . ':' . $password);
    curl_setopt($ch, CURLOPT_URL, 'https://myanimelist.net/api/'.$type.'list/delete/' . $id . '.xml');
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept-Encoding: ', 'User-Agent: api-indiv-D0DBACC0751B8D31B1580E361A75EF50'));
    $output = curl_exec($ch);

    curl_close($ch);
    return $output;
}
function addListItem($body,$type, $id, $username, $password)
{
    global $ch;

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLINFO_HEADER_OUT, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_USERPWD, $username . ':' . $password);
    curl_setopt($ch, CURLOPT_URL, 'https://myanimelist.net/api/'.$type.'list/add/' . $id . '.xml');
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept-Encoding: ', 'User-Agent: api-indiv-D0DBACC0751B8D31B1580E361A75EF50','Content-Type: application/x-www-form-urlencoded'));
    $body=  str_replace('\\"', '"', $body);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    $output = curl_exec($ch);

    curl_close($ch);
    return $output;
}
function changeListItem($body,$type, $id, $username, $password)
{
    global $ch;

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLINFO_HEADER_OUT, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_USERPWD, $username . ':' . $password);
    curl_setopt($ch, CURLOPT_URL, 'https://myanimelist.net/api/'.$type.'list/update/' . $id . '.xml');
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept-Encoding: ', 'User-Agent: api-indiv-D0DBACC0751B8D31B1580E361A75EF50','Content-Type: application/x-www-form-urlencoded'));
    $body=  str_replace('\\"', '"', $body);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    $output = curl_exec($ch);

    curl_close($ch);
    return $output;
}
/*
function addListItem($body, $id, $username, $password)
{
    global $ch;

    $ch = curl_init();

    MALLogin($ch, $username, $password);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLINFO_HEADER_OUT, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_URL, 'http://myanimelist.net/panel.php?go=add&selected_series_id=' . $id);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept-Encoding: ', 'User-Agent: api-indiv-D0DBACC0751B8D31B1580E361A75EF50'));
    curl_setopt($ch, CURLOPT_REFERER, 'http://myanimelist.net/panel.php?go=add&selected_series_id=' . $id);
    $body = str_replace("&amp;", "&", $body);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    $output = curl_exec($ch);

    //echo(curl_getinfo($ch,CURLINFO_HEADER_OUT));
    // close curl resource to free up system resources 
    curl_close($ch);
    return $output;
}

function changeListItem($body, $id, $username, $password)
{
    global $ch;

    $ch = curl_init();

    MALLogin($ch, $username, $password);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLINFO_HEADER_OUT, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_URL, 'http://myanimelist.net/editlist.php?type=anime&id=' . $id);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept-Encoding: ', 'User-Agent: api-indiv-D0DBACC0751B8D31B1580E361A75EF50','Content-Type: application/x-www-form-urlencoded'));
    $body = str_replace("&amp;", "&", $body);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    $output = curl_exec($ch);

    //echo(curl_getinfo($ch,CURLINFO_HEADER_OUT));
    // close curl resource to free up system resources 
    curl_close($ch);
    return $output;
}
*/

function addMangaListItem($body, $id, $username, $password)
{
    global $ch;

    $ch = curl_init();

    MALLogin($ch, $username, $password);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLINFO_HEADER_OUT, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_URL, 'http://myanimelist.net/panel.php?go=addmanga&selected_manga_id=' . $id);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept-Encoding: ', 'User-Agent: api-indiv-D0DBACC0751B8D31B1580E361A75EF50'));
    curl_setopt($ch, CURLOPT_REFERER, 'http://myanimelist.net/panel.php?go=addmanga&selected_manga_id=' . $id);
    $body = str_replace("&amp;", "&", $body);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    $output = curl_exec($ch);

    //echo(curl_getinfo($ch,CURLINFO_HEADER_OUT));
    // close curl resource to free up system resources 
    curl_close($ch);
    return $output;
}

function changeMangaListItem($body, $id, $username, $password)
{
    global $ch;

    $ch = curl_init();

    MALLogin($ch, $username, $password);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLINFO_HEADER_OUT, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_URL, 'http://myanimelist.net//panel.php?go=editmanga&id=' . $id);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept-Encoding: ', 'User-Agent: api-indiv-D0DBACC0751B8D31B1580E361A75EF50'));
    $body = str_replace("&amp;", "&", $body);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    $output = curl_exec($ch);

    //echo(curl_getinfo($ch,CURLINFO_HEADER_OUT));
    // close curl resource to free up system resources 
    curl_close($ch);
    return $output;
}

/*
  function changeListItemOfficial($method,$xml,$id,$username,$password)
  {

  global $ch;

  $ch=curl_init();

  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLINFO_HEADER_OUT,1);
  curl_setopt($ch, CURLOPT_POST, 1);
  curl_setopt($ch, CURLOPT_USERPWD, $username.':'.$password);
  curl_setopt($ch, CURLOPT_URL, 'http://myanimelist.net/api/animelist/'.$method.'/'.$id.'.xml');//?data="'.$xml.'"');
  curl_setopt($ch, CURLOPT_HTTPHEADER, array( 'Accept-Encoding: ','User-Agent: api-indiv-D0DBACC0751B8D31B1580E361A75EF50','Content-Type: text/plain'));
  curl_setopt($ch, CURLOPT_POSTFIELDS, 'data="'.urlencode($xml).'"');
  $output=curl_exec($ch);

  //echo('data='.urlencode($xml));
  //echo('\n');

  echo(curl_getinfo($ch,CURLINFO_HEADER_OUT));

  // close curl resource to free up system resources
  curl_close($ch);
  return $output;
  }
 */

function getSearch($searchItem, $type, $username, $password)
{
    global $ch;

    $replacedItem = str_replace(' ', '+', $searchItem);
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_USERPWD, $username . ':' . $password);
    curl_setopt($ch, CURLOPT_URL, 'https://myanimelist.net/api/' . $type . '/search.xml?q=' . $replacedItem);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept-Encoding: ', 'User-Agent: api-indiv-D0DBACC0751B8D31B1580E361A75EF50'));
    $output = curl_exec($ch);
    // close curl resource to free up system resources 
    curl_close($ch);
    return $output;
}

function processTitle($title)
{
    switch ($title)
    {
        case 'High School DxD New':
            return 'Highschool DxD New';
            break;
        case 'Highschool of the Dead: Drifters of the Dead':
            return 'Highschool of the Dead OVA';
            break;
        case 'Fullmetal Alchemist: Brotherhood':
            return 'Forcing Default Case';
            break;
        case 'Fullmetal Alchemist':
            return 'Forcing Default Case';
            break;
        case 'Fairy Tail (2014)':
            return 'Fairy Tail 2014';
            break;
        case 'Rakuen Tsuihou: Expelled From Paradise Movie':
            return'Rakuen Tsuihou: Expelled From Paradise Movie (2014)';
            break;
        default:
            return $title;
            break;
    }
}

function processDubTitle($title)
{
    switch ($title)
    {
        case 'Highschool of the Dead: Drifters of the Dead':
            return 'Highschool of the Dead - Drifters of the Dead';
            break;
        default:
            return $title;
            break;
    }
}

function getChapterCount($mangaUrl)
{
    $slashIndex = strrpos($mangaUrl, '/');
    $firstPart = substr($mangaUrl, 0, $slashIndex) . '-';
    $secondPart = substr($mangaUrl, $slashIndex);

    global $ch;
    $ch = curl_init();

    //echo $output;
    $pageCounter = 1;

    $chapters = array();
    $chapterCounter = 0;

    do
    {
        $url = $firstPart . $pageCounter . $secondPart;
        if ($pageCounter == 1)
        {
            $url = $mangaUrl;
        }
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type: text/plain,text/xml'));
        //curl_setopt($ch, CURLOPT_HEADERFUNCTION, 'setCookies');
        $foutput = curl_exec($ch);

        $startIndex = strpos($foutput, '<ul class="mangadata">');
        $termIndex = strpos($foutput, 'class="next-page"', $startIndex);
        if ($termIndex == -1)
        {
            $termIndex = strpos($foutput, '</ul>', $startIndex);
        }
        $startIndex = strpos($foutput, 'href="', $startIndex) + 6;
        while ($startIndex < $termIndex)
        {

            $endIndex = strpos($foutput, '"', $startIndex);
            $link = substr($foutput, $startIndex, $endIndex - $startIndex);
            $chapters[$chapterCounter] = $link;

            $startIndex = strpos($foutput, 'href="', $startIndex) + 6;
            $chapterCounter++;
        }

        $pageCounter++;
    } while (strpos($foutput, 'Next</a>'));

    return count($chapters);
}

function getMangaPages($mangaUrl, $chapter)
{
    $slashIndex = strrpos($mangaUrl, '/');
    $firstPart = substr($mangaUrl, 0, $slashIndex) . '-';
    $secondPart = substr($mangaUrl, $slashIndex);

    global $ch;
    $ch = curl_init();

    //echo $output;
    $pageCounter = 1;

    $chapters = array();
    $chapterCounter = 0;

    do
    {
        $url = $firstPart . $pageCounter . $secondPart;
        if ($pageCounter == 1)
        {
            $url = $mangaUrl;
        }
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type: text/plain,text/xml'));
        //curl_setopt($ch, CURLOPT_HEADERFUNCTION, 'setCookies');
        $foutput = curl_exec($ch);

        $startIndex = strpos($foutput, '<ul class="mangadata">');
        $termIndex = strpos($foutput, 'class="next-page"', $startIndex);
        if ($termIndex == -1)
        {
            $termIndex = strpos($foutput, '</ul>', $startIndex);
        }
        $startIndex = strpos($foutput, 'href="', $startIndex) + 6;
        while ($startIndex < $termIndex)
        {

            $endIndex = strpos($foutput, '"', $startIndex);
            $link = substr($foutput, $startIndex, $endIndex - $startIndex);
            $chapters[$chapterCounter] = $link;

            $startIndex = strpos($foutput, 'href="', $startIndex) + 6;
            $chapterCounter++;
        }

        $pageCounter++;
    } while (strpos($foutput, 'Next</a>'));

    $chapterCount = count($chapters);
    $chapterLink = $chapters[$chapterCount - $chapter];

    curl_setopt($ch, CURLOPT_URL, $chapterLink);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type: text/plain,text/xml'));
    //curl_setopt($ch, CURLOPT_HEADERFUNCTION, 'setCookies');

    $output = curl_exec($ch);

    $pageLinks = '';
    $startIndex = strpos($output, 'page-select');
    //$startIndex=strpos($output, '<ul>',$searchIndex);
    $termIndex = strpos($output, '</select>', $startIndex);
    $startIndex = strpos($output, 'value="', $startIndex) + 7;
    while ($startIndex < $termIndex)
    {
        $endIndex = strpos($output, '"', $startIndex);
        $link = substr($output, $startIndex, $endIndex - $startIndex);
        curl_setopt($ch, CURLOPT_URL, 'http://www.mangachapter.me' . $link);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type: text/plain,text/xml'));
        //curl_setopt($ch, CURLOPT_HEADERFUNCTION, 'setCookies');

        $pagePage = curl_exec($ch);
        //echo $pagePage;

        $imageStartIndex = strpos($pagePage, '<img', $startIndex);
        $imageStartIndex = strpos($pagePage, 'src="', $imageStartIndex) + 5;
        $imageEndIndex = strpos($pagePage, '" ', $imageStartIndex);
        $pageLinks = $pageLinks . substr($pagePage, $imageStartIndex, $imageEndIndex - $imageStartIndex) . ',';

        $startIndex = strpos($output, 'value="', $startIndex) + 7;
    }
    return $pageLinks;
}

function getStreamUrl($paramShowUrl, $title, $episode)
{
    if (strpos($paramShowUrl, 'plus'))
    {
        $title = processTitle($title);
    } else
    {
        $title = processDubTitle($title);
    }
    $baseShowUrl = $paramShowUrl . '?page=';
    global $ch;
    $ch = curl_init();
    // set url 
    curl_setopt($ch, CURLOPT_URL, $paramShowUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type: text/plain,text/xml'));
    curl_setopt($ch, CURLOPT_HEADERFUNCTION, 'setCookies');

    curl_exec($ch);

    $pageIndex = 0;
    $showUrl = '';

    $episodeLinks = array();
    $showEpisodeLinks = array();
    $loopCount = 0;
    $showLinksCount = 0;
    do
    {
        $pageIndex++;
        $showUrl = $baseShowUrl . $pageIndex;

        curl_setopt($ch, CURLOPT_URL, $showUrl);
        $output = curl_exec($ch);

        $vidDivIndex = strpos($output, '<div id="videos">');
        $searchIndex = strpos($output, '<a href="', $vidDivIndex) + 9;
        $endVidIndex = strpos($output, '</div>', $vidDivIndex);


        while ($searchIndex < $endVidIndex)
        {
            $endLinkIndex = strpos($output, '"', $searchIndex);
            $link = substr($output, $searchIndex, $endLinkIndex - $searchIndex);

            $episodeLinks[$loopCount] = $link;
            if (strpos($link, '.', 22) === false)
            {
                $baseShowCheck = $link . '">' . $title;
                //echo($baseShowCheck);
                $showChecks = array(
                    0 => $baseShowCheck . ' Episode',
                    1 => $baseShowCheck . ' 1</a>',
                    2 => $baseShowCheck . ' 2</a>',
                    3 => $baseShowCheck . ' 3</a>',
                    4 => $baseShowCheck . ' 4</a>',
                    5 => $baseShowCheck . ' 5</a>',
                    6 => $baseShowCheck . ' 6</a>',
                    7 => $baseShowCheck . ' 7</a>',
                    8 => $baseShowCheck . ' 8</a>',
                    9 => $baseShowCheck . ' 9</a>',
                    //10=>$baseShowCheck.' 0',
                    11 => $baseShowCheck . ' episode',
                    12 => $baseShowCheck . '</a>',
                    16 => $baseShowCheck . ' </a>',
                    13 => $baseShowCheck . ' OVA',
                    14 => $baseShowCheck . ' Movie',
                    15 => $baseShowCheck . ' movie',
                    10 => $baseShowCheck . ' ova'
                );

                $showChecksCount = count($showChecks);
                $done = false;
                for ($i = 0; $i <= $showChecksCount && !$done; $i++)
                {
                    if (strpos($output, $showChecks[$i]) !== false)
                    {
                        $done = true;
                        $showEpisodeLinks[$showLinksCount] = $link;
                        $showLinksCount++;
                    }
                }
            }

            $searchIndex = strpos($output, '<a href="', $searchIndex) + 9;
            $loopCount++;
        }
    } while (strpos($output, 'Next</a>'));

    $result = "";
    $episodeLinksCount = count($episodeLinks);

    if ($showLinksCount == 0)
    {
        if (strpos($paramShowUrl, 'toon')/* &&!strpos($paramShowUrl,'movie') */)
        {
            return 'Link not found';
        }
        if (count($episodeLinks) < $episode)
        {
            return 'Link not found';
        }

        curl_setopt($ch, CURLOPT_URL, $episodeLinks[$episodeLinksCount - $episode]);
    } else
    {
        if (count($showEpisodeLinks) < $episode)
        {
            if (count($episodeLinks) < $episode)
            {
                return 'Link not found';
            }
            if (strpos($paramShowUrl, 'toon')/* &&!strpos($paramShowUrl,'movie') */)
            {
                return 'Link not found';
            }
            curl_setopt($ch, CURLOPT_URL, $episodeLinks[$episodeLinksCount - $episode]);
        }
        curl_setopt($ch, CURLOPT_URL, $showEpisodeLinks[$showLinksCount - $episode]);
    }
    $pageBody = curl_exec($ch);

    $streamLinks = '';
    $elinksIndex = strpos($pageBody, 'elinks');
    $iframeSrcIndex = strpos($pageBody, '<iframe src="', strpos($pageBody, '<div id="streams">')) + 13;
    while ($iframeSrcIndex > 14)
    {
        $iframeSrc = substr($pageBody, $iframeSrcIndex, strpos($pageBody, '"', $iframeSrcIndex) - $iframeSrcIndex);

        curl_setopt($ch, CURLOPT_URL, $iframeSrc);
        $playerBody = curl_exec($ch);

        $playlistIndex = strpos($playerBody, 'playlist');
        $skipImage = strpos($playerBody, '.jpg', $playlistIndex);
        $skipImage2 = strpos($playerBody, '.png', $playlistIndex);
        if ($skipImage > 0)
        {
            $playlistIndex = $skipImage;
        } else
        {
            if ($skipImage2 > 0)
            {
                $playlistIndex = $skipImage2;
            }
        }
        $quote = '\'';
        $streamIndex = strpos($playerBody, 'url: \'http://', $playlistIndex) + 6;
        if ($streamIndex == 6)
        {
            $quote = '"';
            $streamIndex = strpos($playerBody, 'url: "http://', $playlistIndex) + 6;
        }
        if ($streamIndex != 6)
        {
            $streamLink = substr($playerBody, $streamIndex, strpos($playerBody, $quote, $streamIndex) - $streamIndex);
            $streamLinks = $streamLinks . $streamLink . ';';
        }
        $iframeSrcIndex = strpos($pageBody, '<iframe src="', $iframeSrcIndex) + 13;
    }

    // close curl resource to free up system resources 
    curl_close($ch);

    return urldecode($streamLinks);
}

function checkLogin($username, $password)
{
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://myanimelist.net/api/account/verify_credentials.xml');
    curl_setopt($ch, CURLOPT_USERPWD, $username . ':' . $password);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept-Encoding: ', 'User-Agent: api-indiv-D0DBACC0751B8D31B1580E361A75EF50'));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $output = curl_exec($ch);
    curl_close($ch);
    return $output;
}

function getMALList($user, $type)
{
    global $ch;
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_HEADERFUNCTION, 'setCookies');
    //curl_setopt($ch, CURLOPT_URL, 'http://myanimelist.net/malappinfo.php?u=' . $user . '&status=all&type=' . $type);
    //curl_exec($ch);
    
    curl_setopt($ch, CURLOPT_URL, 'https://myanimelist.net/malappinfo.php?u=' . $user . '&status=all&type=' . $type);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept: xml', 'User-Agent: api-indiv-D0DBACC0751B8D31B1580E361A75EF50'));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

    $output = curl_exec($ch);

    curl_close($ch);

    return $output;
}

function getAnimePlusList($dub)
{
    global $ch;
    $ch = curl_init();
    // set url 
    if ($dub == 'true')
    {
        curl_setopt($ch, CURLOPT_URL, 'http://www.animetoon.eu/dubbed-anime');
    } else
    {
        curl_setopt($ch, CURLOPT_URL, 'http://www.animeplus.tv/anime-show-list');
    }

    //return the transfer as a string 
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type: text/plain', 'Accept-Encoding: '));

    curl_setopt($ch, CURLOPT_HEADERFUNCTION, 'setCookies');

    // $output contains the output string 
    $output = curl_exec($ch);

    $output = curl_exec($ch);
    // close curl resource to free up system resources 
    curl_close($ch);

    return $output;
}

function getAnimePlusMovieList($dub)
{
    global $ch;
    $ch = curl_init();
    // set url 
    if ($dub == 'true')
    {
        curl_setopt($ch, CURLOPT_URL, 'http://www.animetoon.eu/movies');
    } else
    {
        curl_setopt($ch, CURLOPT_URL, 'http://www.animeplus.tv/anime-movies');
    }

    //return the transfer as a string 
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type: text/plain', 'Accept-Encoding: '));

    curl_setopt($ch, CURLOPT_HEADERFUNCTION, 'setCookies');

    // $output contains the output string 
    $output = curl_exec($ch);

    $output = curl_exec($ch);
    // close curl resource to free up system resources 
    curl_close($ch);

    return $output;
}

function getMangaList()
{
    global $ch;
    $ch = curl_init();
    // set url 
    //curl_setopt($ch, CURLOPT_URL, 'http://www.mangahere.co/mangalist/'); 
    curl_setopt($ch, CURLOPT_URL, 'http://www.mangachapter.me/mangalist.html');

    //return the transfer as a string 
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type: text/plain', 'Accept-Encoding: '));

    //curl_setopt($ch, CURLOPT_HEADERFUNCTION, 'setCookies');

    // $output contains the output string 
    //$output = curl_exec($ch); 

    $output = curl_exec($ch);
    // close curl resource to free up system resources 
    curl_close($ch);

    return $output;
}

function getAlternateTitles($url)
{
    global $ch;
    $ch = curl_init();
    // set url 
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type: text/plain,text/xml'));
    curl_setopt($ch, CURLOPT_HEADERFUNCTION, 'setCookies');

    curl_exec($ch);
    $output = curl_exec($ch);

    $titlesStartMarker = '<span>Titles:</span>';
    $titlesStartIndex = strpos($output, $titlesStartMarker) + strlen($titlesStartMarker);
    $titlesStartIndex = strpos($output, '            ', $titlesStartIndex) + 12;
    $titlesEndIndex = strpos($output, '          </div>', $titlesStartIndex);

    $titles = substr($output, $titlesStartIndex, $titlesEndIndex - $titlesStartIndex);
    return $titles;
}

function setCookies($ch, $string)
{
    global $location;
    global $cookiearr;
    global $ch;
    # ^overrides the function param $ch
    # this is okay because we need to 
    # update the global $ch with 
    # new cookies
    $length = strlen($string);
    if (!strncmp($string, "Location:", 9))
    {
        $location = trim(substr($string, 9, -1));
    }
    if (!strncmp($string, "Set-Cookie:", 11))
    {
        $cookiestr = trim(substr($string, 11, -1));
        $cookie = explode(';', $cookiestr);
        $cookie = explode('=', $cookie[0]);
        $cookiename = trim(array_shift($cookie));
        $cookiearr[$cookiename] = trim(implode('=', $cookie));
    }
    $cookie = "";
    if (trim($string) == "")
    {
        foreach ($cookiearr as $key => $value)
        {
            $cookie .= "$key=$value; ";
        }
        curl_setopt($ch, CURLOPT_COOKIE, $cookie);
    }
    return $length;
}

function getEpisodeCount($paramShowUrl, $title)
{
    if (strpos($paramShowUrl, 'plus'))
    {
        $title = processTitle($title);
    } else
    {
        $title = processDubTitle($title);
    }
    $baseShowUrl = $paramShowUrl . '?page=';
    global $ch;
    $ch = curl_init();
    // set url 
    curl_setopt($ch, CURLOPT_URL, $paramShowUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type: text/plain,text/xml'));
    curl_setopt($ch, CURLOPT_HEADERFUNCTION, 'setCookies');

    curl_exec($ch);

    $pageIndex = 0;
    $showUrl = '';

    $episodeLinks = array();
    $showEpisodeLinks = array();
    $loopCount = 0;
    $showLinksCount = 0;
    do
    {
        $pageIndex++;
        $showUrl = $baseShowUrl . $pageIndex;

        curl_setopt($ch, CURLOPT_URL, $showUrl);
        $output = curl_exec($ch);

        $vidDivIndex = strpos($output, '<div id="videos">');
        $searchIndex = strpos($output, '<a href="', $vidDivIndex) + 9;
        $endVidIndex = strpos($output, '</div>', $vidDivIndex);


        while ($searchIndex < $endVidIndex)
        {
            $endLinkIndex = strpos($output, '"', $searchIndex);
            $link = substr($output, $searchIndex, $endLinkIndex - $searchIndex);

            $episodeLinks[$loopCount] = $link;
            if (strpos($link, '.', 22) === false)
            {
                $baseShowCheck = $link . '">' . $title;
                //echo($baseShowCheck);
                $showChecks = array(
                    0 => $baseShowCheck . ' Episode',
                    1 => $baseShowCheck . ' 1</a>',
                    2 => $baseShowCheck . ' 2</a>',
                    3 => $baseShowCheck . ' 3</a>',
                    4 => $baseShowCheck . ' 4</a>',
                    5 => $baseShowCheck . ' 5</a>',
                    6 => $baseShowCheck . ' 6</a>',
                    7 => $baseShowCheck . ' 7</a>',
                    8 => $baseShowCheck . ' 8</a>',
                    9 => $baseShowCheck . ' 9</a>',
                    //10=>$baseShowCheck.' 0',
                    11 => $baseShowCheck . ' episode',
                    12 => $baseShowCheck . '</a>',
                    16 => $baseShowCheck . ' </a>',
                    13 => $baseShowCheck . ' OVA',
                    14 => $baseShowCheck . ' Movie',
                    15 => $baseShowCheck . ' movie',
                    10 => $baseShowCheck . ' ova'
                );

                $showChecksCount = count($showChecks);
                $done = false;
                for ($i = 0; $i <= $showChecksCount && !$done; $i++)
                {
                    if (strpos($output, $showChecks[$i]) !== false)
                    {
                        $done = true;
                        $showEpisodeLinks[$showLinksCount] = $link;
                        $showLinksCount++;
                    }
                }
            }
            $searchIndex = strpos($output, '<a href="', $searchIndex) + 9;
            $loopCount++;
        }
    } while (strpos($output, 'Next</a>'));

    $result = "";
    $episodeLinksCount = count($episodeLinks);
    $showEpisodeLinksCount = count($showEpisodeLinks);

    $episodeCheck = $showEpisodeLinksCount;
    if ($showEpisodeLinksCount == 0)
    {
        $episodeCheck = $episodeLinksCount;
    }
    curl_setopt($ch, CURLOPT_URL, str_replace(' ', '%20', 'http://anime-flix.com/requester.php?m=stream&t=' . $title . '&e=' . $episodeCheck));

    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $paramShowUrl);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: text/plain'));
    $output = curl_exec($ch);

    if ($output == '')
    {
        $showEpisodeLinksCount-=1;
        $episodeLinksCount-=1;
    }

    // close curl resource to free up system resources 
    curl_close($ch);

    return $showEpisodeLinksCount . ':' . $episodeLinksCount;
}

?>