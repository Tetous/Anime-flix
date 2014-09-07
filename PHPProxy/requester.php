<?php
header("Access-Control-Allow-Origin: *");

// create curl resource 
$ch;

//pick Method
switch ($_GET["m"])
{
	case 'login':
        $out=checkLogin($_GET["u"],$_GET["p"]);
        header('Content-Length: '.strlen($out));
		echo $out;
		break;
	case 'list':
        $out=getMALList($_GET['u']);
        header('Content-Length: '.strlen($out));
        header('Content-type: text/xml');
        echo $out;
		break;
	case 'ledger':
        $out=getAnimePlusList();
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
        $out=getSearch($_GET['s'],$_GET['u'],$_GET['p']);
        header('Content-Length: '.strlen($out));
        header('Content-type: text/xml');
        echo str_replace('utf-8','UTF-8',$out);
        break;
	case 'update':
        $out=changeListItem('update',file_get_contents('php://input'),$_GET['i'],$_GET['u'],$_GET['p']);
        header('Content-Length: '.strlen($out));
        echo $out;
        break;
    case 'add':
        $out=changeListItem('add',file_get_contents('php://input'),$_GET['i'],$_GET['u'],$_GET['p']);
        header('Content-Length: '.strlen($out));
        echo $out;
        break;
    case 'tt':
        echo (file_get_contents('php://input'));
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

function changeListItem($method,$body,$id,$username,$password)
{
    global $ch;
    
        $ch=curl_init();
        
        MALLogin($ch,$username,$password);
        
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_URL, 'http://myanimelist.net/editlist.php?type=anime&id='.$id);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array( 'Accept-Encoding: ','User-Agent: api-indiv-D0DBACC0751B8D31B1580E361A75EF50'));
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body); 
        $output=curl_exec($ch);
        
        // close curl resource to free up system resources 
        curl_close($ch);
    return $output;
}

function changeListItemOfficial($method,$xml,$id,$username,$password)
{
    //echo($xml);

    global $ch;
    
        $ch=curl_init();
        
        
        /*
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLINFO_HEADER_OUT,1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_URL, 'http://learnfamo.us/chard/requester.php?m=tt');
        //curl_setopt($ch, CURLOPT_HTTPHEADER, array( 'Accept-Encoding: ','User-Agent: api-indiv-D0DBACC0751B8D31B1580E361A75EF50'));
        curl_setopt($ch, CURLOPT_POSTFIELDS, 'data='.urlencode($xml));//'data='.urlencode($xml));
        //curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: text/plain')); 
        $output=curl_exec($ch);
*/        
        
        //curl_reset($ch);
        //curl_setopt($ch, CURLOPT_VERBOSE, 1);
        
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
        do
        {
          $pageIndex++;
          $showUrl=$baseShowUrl.$pageIndex;

          curl_setopt($ch, CURLOPT_URL, $showUrl); 
          $output = curl_exec($ch);

          $vidDivIndex=strpos($output, '<div id="videos">');
          $searchIndex=strpos($output,'<a href="',$vidDivIndex)+9;
          $endVidIndex=strpos($output, '</div>',$vidDivIndex);

          $loopCount=0;
          $showLinksCount=0;
          while ($searchIndex<$endVidIndex) {
            $endLinkIndex=strpos($output, '"',$searchIndex);
            $link=substr($output, $searchIndex,$endLinkIndex-$searchIndex);

            $episodeLinks[$loopCount]=$link;
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
                10=>$baseShowCheck.' 0',
                11=>$baseShowCheck.' episode',
                12=>$baseShowCheck.' </a>',
                13=>$baseShowCheck.' OVA',
                14=>$baseShowCheck.' ova'
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

            $searchIndex=strpos($output,'<a href="',$searchIndex)+9;
            $loopCount++;
          }
        }while (strpos($output, 'Next</a>'));

        $result="";
        $episodeLinksCount=count($episodeLinks);

        if($showLinksCount==0)
        {
            curl_setopt($ch, CURLOPT_URL, $episodeLinks[$episodeLinksCount-$episode]);
        }
        else
        {
            curl_setopt($ch, CURLOPT_URL, $showEpisodeLinks[$showLinksCount-$episode]);
        }
          $pageBody=curl_exec($ch);
          $iframeSrcIndex=strpos($pageBody, '<iframe src="',strpos($pageBody, '<div id="streams">'))+13;
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
          $streamLink=substr($playerBody, $streamIndex,strpos($playerBody, $quote,$streamIndex)-$streamIndex);

        // close curl resource to free up system resources 
        curl_close($ch);

        return urldecode($streamLink);
}

function checkLogin($username,$password)
{
	//Going to use the API but dummy for now

	$ch=curl_init();
	curl_setopt($ch, CURLOPT_URL, 'http://myanimelist.net/api/account/verify_credentials.xml');
	curl_setopt($ch, CURLOPT_USERPWD, $username.':'.$password);
  curl_setopt($ch, CURLOPT_HTTPHEADER, array( 'Accept-Encoding: ','User-Agent: api-indiv-D0DBACC0751B8D31B1580E361A75EF50'));
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	$output=curl_exec($ch);
	curl_close($ch);
	return $output;

	
	//"Invalid credentials";
	/*return "<?xml version=\"1.0\" encoding=\"utf-8\"?><user><id>1</id><username>RichKop</username></user>";
  */
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

function getAnimePlusList()
{ 
      global $ch;
      $ch=curl_init();
        // set url 
        curl_setopt($ch, CURLOPT_URL, 'http://www.animeplus.tv/anime-show-list'); 

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