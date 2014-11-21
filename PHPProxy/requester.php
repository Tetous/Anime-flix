<?php
header("Access-Control-Allow-Origin: *");

// create curl resource 
$ch;

//pick Method
switch ($_GET["m"])
{
	case 'login':
        $out=checkLogin(htmlspecialchars($_POST["u"]),htmlspecialchars($_POST["p"]));
        header('Content-Length: '.strlen($out));
		echo $out;
		break;
	case 'list':
        $out=getMALList(htmlspecialchars($_POST["u"]));
        header('Content-Length: '.strlen($out));
        header('Content-type: text/xml');
        echo $out;
		break;
	case 'ledger':
        $out=getAnimePlusList($_GET['d']);
        header('Content-Length: '.strlen($out));
        echo $out;
		break;
   case 'movieLedger':
        $out=getAnimePlusMovieList($_GET['d']);
        header('Content-Length: '.strlen($out));
        echo $out;
		break;
    case 'alts':
        $out=getAlternateTitles(file_get_contents('php://input'));
        header('Content-Length: '.strlen($out));
        echo $out;
        break;
    case 'stream':
        $out=getStreamUrl(file_get_contents('php://input'),$_GET['t'],$_GET['e']);
        header('Content-Length: '.strlen($out));
        echo $out;
        break;
    case 'search':
        $out=getSearch($_GET['s'],htmlspecialchars($_POST["u"]),htmlspecialchars($_POST["p"]));
        header('Content-Length: '.strlen($out));
        header('Content-type: text/xml');
        echo str_replace('utf-8','UTF-8',$out);
        break;
	case 'update':
        $out=changeListItem(htmlspecialchars($_POST["data"]),$_GET['i'],htmlspecialchars($_POST["u"]),htmlspecialchars($_POST["p"]));
        header('Content-Length: '.strlen($out));
        echo $out;
        break;
    case 'add':
        $out=addListItem(htmlspecialchars($_POST["data"]),$_GET['i'],htmlspecialchars($_POST["u"]),htmlspecialchars($_POST["p"]));
        header('Content-Length: '.strlen($out));
        echo $out;
        break;
    case 'delete':
        $out=deleteListItem($_GET['i'],htmlspecialchars($_POST["u"]),htmlspecialchars($_POST["p"]));
        header('Content-Length: '.strlen($out));
        echo $out;
        break;
    case 'discuss':
        $out=getDiscussionURL($_GET['e'],$_GET['i'],htmlspecialchars($_POST["u"]),htmlspecialchars($_POST["p"]));
        header('Content-Length: '.strlen($out));
        echo $out;
        break;
	default:
		# code...
		break;
}

function MALLogin($ch,$username,$password)
{
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_URL, 'http://myanimelist.net/login.php');
        curl_setopt($ch, CURLOPT_HTTPHEADER, array( 'Accept-Encoding: ','User-Agent: api-indiv-D0DBACC0751B8D31B1580E361A75EF50'));
        curl_setopt($ch, CURLOPT_POSTFIELDS, 'username='.$username.'&password='.$password.'&sublogin=+Login+'); 
        curl_setopt ($ch, CURLOPT_HEADERFUNCTION, 'setCookies');
        
        curl_exec($ch);
}
function getDiscussionURL($id,$episode,$username,$password)
{
    global $ch;
    
        $ch=curl_init();
        
        MALLogin($ch,$username,$password);
        
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLINFO_HEADER_OUT,1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_URL, 'http://myanimelist.net/includes/ajax.inc.php?t=50');
        curl_setopt($ch, CURLOPT_HTTPHEADER, array( 'Accept-Encoding: ','User-Agent: api-indiv-D0DBACC0751B8D31B1580E361A75EF50'));
        curl_setopt($ch, CURLOPT_POSTFIELDS, 'epNum='.$episode.'&aid='.$id.'&id='.$id); 
        $output=curl_exec($ch);
        
        curl_close($ch);
        return output;
        $urlStart=strpos($output,'/forum/?topicid=');
        if($urlStart===false)
        {
            return 'false';
        }
        $urlEnd=strpos($output,'\';"',$urlStart);
        $urlPart=substr($output,$urlStart,$urlEnd-$urlStart);
    return 'http://myanimelist.net'.$urlPart;
}

function deleteListItem($id,$username,$password)
{
    global $ch;
    
        $ch=curl_init();
        
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLINFO_HEADER_OUT,1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_USERPWD, $username.':'.$password);
        curl_setopt($ch, CURLOPT_URL, 'http://myanimelist.net/api/animelist/delete/'.$id.'.xml');
        curl_setopt($ch, CURLOPT_HTTPHEADER, array( 'Accept-Encoding: ','User-Agent: api-indiv-D0DBACC0751B8D31B1580E361A75EF50'));
        $output=curl_exec($ch);
        
        curl_close($ch);
    return $output;
}

function addListItem($body,$id,$username,$password)
{
    global $ch;
    
        $ch=curl_init();
        
        MALLogin($ch,$username,$password);
        
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLINFO_HEADER_OUT,1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_URL, 'http://myanimelist.net/panel.php?go=add&selected_series_id='.$id);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array( 'Accept-Encoding: ','User-Agent: api-indiv-D0DBACC0751B8D31B1580E361A75EF50'));
        curl_setopt($ch,CURLOPT_REFERER,'http://myanimelist.net/panel.php?go=add&selected_series_id='.$id);
        $body=str_replace("&amp;", "&", $body);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body); 
        $output=curl_exec($ch);
        
        //echo(curl_getinfo($ch,CURLINFO_HEADER_OUT));
        
        // close curl resource to free up system resources 
        curl_close($ch);
    return $output;
}

function changeListItem($body,$id,$username,$password)
{
    global $ch;
    
        $ch=curl_init();
        
        MALLogin($ch,$username,$password);
        
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLINFO_HEADER_OUT,1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_URL, 'http://myanimelist.net/editlist.php?type=anime&id='.$id);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array( 'Accept-Encoding: ','User-Agent: api-indiv-D0DBACC0751B8D31B1580E361A75EF50'));
        $body=str_replace("&amp;", "&", $body);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body); 
        $output=curl_exec($ch);
        
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

function getSearch($searchItem,$username,$password)
{
    global $ch;
    
    $replacedItem=str_replace(' ','+',$searchItem);
        $ch=curl_init();
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_USERPWD, $username.':'.$password);
        curl_setopt($ch, CURLOPT_URL, 'http://myanimelist.net/api/anime/search.xml?q='.$replacedItem);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array( 'Accept-Encoding: ','User-Agent: api-indiv-D0DBACC0751B8D31B1580E361A75EF50'));
        $output=curl_exec($ch);
        // close curl resource to free up system resources 
        curl_close($ch);
    return $output;
}

function processTitle($title)
{
    switch($title)
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
        default:
            return $title;
            break;
    }
}
function getStreamUrl($paramShowUrl,$title,$episode)
{
$title=processTitle($title);
  $baseShowUrl=$paramShowUrl.'?page=';
    global $ch;
      $ch=curl_init();
        // set url 
        curl_setopt($ch, CURLOPT_URL, $paramShowUrl); 
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type: text/plain,text/xml'));
        curl_setopt ($ch, CURLOPT_HEADERFUNCTION, 'setCookies');

        curl_exec($ch); 

        $pageIndex=0;
        $showUrl='';
        
        $episodeLinks=array();
        $showEpisodeLinks=array();
        $loopCount=0;
          $showLinksCount=0;
        do
        {
          $pageIndex++;
          $showUrl=$baseShowUrl.$pageIndex;

          curl_setopt($ch, CURLOPT_URL, $showUrl); 
          $output = curl_exec($ch);

          $vidDivIndex=strpos($output, '<div id="videos">');
          $searchIndex=strpos($output,'<a href="',$vidDivIndex)+9;
          $endVidIndex=strpos($output, '</div>',$vidDivIndex);

          
          while ($searchIndex<$endVidIndex) {
            $endLinkIndex=strpos($output, '"',$searchIndex);
            $link=substr($output, $searchIndex,$endLinkIndex-$searchIndex);

            $episodeLinks[$loopCount]=$link;
            if(strpos($link,'.',22)===false)
            {
                $baseShowCheck=$link.'">'.$title;
                //echo($baseShowCheck);
                $showChecks=array(
                    0=>$baseShowCheck.' Episode',
                    1=>$baseShowCheck.' 1',
                    2=>$baseShowCheck.' 2',
                    3=>$baseShowCheck.' 3',
                    4=>$baseShowCheck.' 4',
                    5=>$baseShowCheck.' 5',
                    6=>$baseShowCheck.' 6',
                    7=>$baseShowCheck.' 7',
                    8=>$baseShowCheck.' 8',
                    9=>$baseShowCheck.' 9',
                    //10=>$baseShowCheck.' 0',
                    11=>$baseShowCheck.' episode',
                    12=>$baseShowCheck.' </a>',
                    13=>$baseShowCheck.' OVA',
                    14=>$baseShowCheck.' Movie',
                    15=>$baseShowCheck.' movie',
                    10=>$baseShowCheck.' ova'
                );
            
                $showChecksCount=count($showChecks);
                $done=false;
                for ($i = 0; $i <= $showChecksCount&&!$done; $i++) {
                    if(strpos($output,$showChecks[$i])!==false)
                    {
                        $done=true;
                        $showEpisodeLinks[$showLinksCount]=$link;
                        $showLinksCount++;
                        //echo('got show\n');
                    }
                }
            }

            $searchIndex=strpos($output,'<a href="',$searchIndex)+9;
            $loopCount++;
          }
        }while (strpos($output, 'Next</a>'));

        $result="";
        $episodeLinksCount=count($episodeLinks);
        
        if($showLinksCount==0)
        {
            if(count($episodeLinks)<$episode)
            {
                return 'Link not found';
            }
            curl_setopt($ch, CURLOPT_URL, $episodeLinks[$episodeLinksCount-$episode]);
        }
        else
        {
            if(count($showEpisodeLinks)<$episode)
            {
                if(count($episodeLinks)<$episode)
                {
                    return 'Link not found';
                }
                curl_setopt($ch, CURLOPT_URL, $episodeLinks[$episodeLinksCount-$episode]);
            }
            curl_setopt($ch, CURLOPT_URL, $showEpisodeLinks[$showLinksCount-$episode]);
        }
          $pageBody=curl_exec($ch);
          
          $streamLinks='';
          $elinksIndex=strpos($pageBody, 'elinks');
          $iframeSrcIndex=strpos($pageBody, '<iframe src="',strpos($pageBody, '<div id="streams">'))+13;
          while($iframeSrcIndex>14)//$elinksIndex>$iframeSrcIndex)
          {
              $iframeSrc=substr($pageBody, $iframeSrcIndex, strpos($pageBody, '"',$iframeSrcIndex)-$iframeSrcIndex);

              curl_setopt($ch, CURLOPT_URL, $iframeSrc);
              $playerBody=curl_exec($ch);

              $playlistIndex=strpos($playerBody, 'playlist');
              $skipImage=strpos($playerBody, '.jpg',$playlistIndex);
              $skipImage2=strpos($playerBody, '.png',$playlistIndex);
              if($skipImage>0)
              {
                $playlistIndex=$skipImage;
              }
              else
              {
                if($skipImage2>0)
                {
                  $playlistIndex=$skipImage2;
                }
              }
              $quote='\'';
              $streamIndex=strpos($playerBody, 'url: \'http://',$playlistIndex)+6;
              if($streamIndex==6)
              {
                $quote='"';
                $streamIndex=strpos($playerBody, 'url: "http://',$playlistIndex)+6;
              }
              if($streamIndex!=6)
              {
                  $streamLink=substr($playerBody, $streamIndex,strpos($playerBody, $quote,$streamIndex)-$streamIndex);
                  //echo $streamLink;
                  $streamLinks=$streamLinks.$streamLink.';';
              }
              $iframeSrcIndex=strpos($pageBody, '<iframe src="',$iframeSrcIndex)+13;
          }

        // close curl resource to free up system resources 
        curl_close($ch);

        return urldecode($streamLinks);
}

function checkLogin($username,$password)
{
	$ch=curl_init();
	curl_setopt($ch, CURLOPT_URL, 'http://myanimelist.net/api/account/verify_credentials.xml');
	curl_setopt($ch, CURLOPT_USERPWD, $username.':'.$password);
  curl_setopt($ch, CURLOPT_HTTPHEADER, array( 'Accept-Encoding: ','User-Agent: api-indiv-D0DBACC0751B8D31B1580E361A75EF50'));
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	$output=curl_exec($ch);
	curl_close($ch);
	return $output;
}

function getMALList($user)
{
	global $ch;
  $ch=curl_init();
	curl_setopt($ch, CURLOPT_URL, 'http://myanimelist.net/malappinfo.php?u='.$user.'&status=all&type=anime');//+$user);
  curl_setopt($ch, CURLOPT_HTTPHEADER, array( 'Accept-Encoding: ','User-Agent: api-indiv-D0DBACC0751B8D31B1580E361A75EF50'));
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 

	$output = curl_exec($ch);

	curl_close($ch);

	return $output;
}

function getAnimePlusList($dub)
{ 
      global $ch;
      $ch=curl_init();
        // set url 
        if($dub=='true')
        {
            curl_setopt($ch, CURLOPT_URL, 'http://www.animetoon.tv/dubbed-anime'); 
        }
        else
        {
            curl_setopt($ch, CURLOPT_URL, 'http://www.animeplus.tv/anime-show-list'); 
        }

        //return the transfer as a string 
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 

        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type: text/plain', 'Accept-Encoding: '));

        curl_setopt ($ch, CURLOPT_HEADERFUNCTION, 'setCookies');

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
      $ch=curl_init();
        // set url 
        if($dub=='true')
        {
            curl_setopt($ch, CURLOPT_URL, 'http://www.animetoon.tv/movies');
        }
        else
        {
            curl_setopt($ch, CURLOPT_URL, 'http://www.animeplus.tv/anime-movies'); 
        }

        //return the transfer as a string 
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 

        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type: text/plain', 'Accept-Encoding: '));

        curl_setopt ($ch, CURLOPT_HEADERFUNCTION, 'setCookies');

        // $output contains the output string 
        $output = curl_exec($ch); 

        $output = curl_exec($ch);
        // close curl resource to free up system resources 
        curl_close($ch);

        return $output;
}

function getAlternateTitles($url)
{
    global $ch;
    $ch=curl_init();
        // set url 
        curl_setopt($ch, CURLOPT_URL, $url); 
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type: text/plain,text/xml'));
        curl_setopt ($ch, CURLOPT_HEADERFUNCTION, 'setCookies');

        curl_exec($ch);
        $output=curl_exec($ch);
        
        $titlesStartMarker='<span>Titles:</span>';
        $titlesStartIndex=strpos($output,$titlesStartMarker)+strlen($titlesStartMarker);
        $titlesStartIndex=strpos($output,'            ',$titlesStartIndex)+12;
        $titlesEndIndex=strpos($output,'          </div>',$titlesStartIndex);
        
        $titles=substr($output,$titlesStartIndex,$titlesEndIndex-$titlesStartIndex);
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
    //echo $string;
    $length = strlen($string);
    if(!strncmp($string, "Location:", 9))
    {
      $location = trim(substr($string, 9, -1));
    }
    if(!strncmp($string, "Set-Cookie:", 11))
    {
      $cookiestr = trim(substr($string, 11, -1));
      $cookie = explode(';', $cookiestr);
      $cookie = explode('=', $cookie[0]);
      $cookiename = trim(array_shift($cookie)); 
      $cookiearr[$cookiename] = trim(implode('=', $cookie));
    }
    $cookie = "";
    if(trim($string) == "") 
    {
      foreach ($cookiearr as $key=>$value)
      {
        $cookie .= "$key=$value; ";
      }
      curl_setopt($ch, CURLOPT_COOKIE, $cookie);
    }
	//print_r($cookiearr);
	//echo "<br/>";
    return $length;
}



	//echo getMALList('RichKop');

?>