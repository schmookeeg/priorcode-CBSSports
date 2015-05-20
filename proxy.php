<?php
// Proxy

// proxy.php requires Troy's class_http. http://www.troywolf.com/articles
// Alter the path according to your environment.
require_once("class_http.php");

header ("Content-Type:text/xml");

$login = isset($_GET['login']) ? $_GET['login'] : false;

$url = $_GET['url'];

if(!$login) $url = urldecode($url);

$cookie = $_COOKIE['pid'];

$host = 'www.cbssports.com';

$pattern = '/^http:\/\/(.+.com)/';
preg_match($pattern, $url, $matches, PREG_OFFSET_CAPTURE);

if(count($matches[1][0]) > 0) $host = $matches[1][0];

$opts = array(
  'http'=>array(
    'method'=>"GET",
    'header'=>"Accept-language: en\r\n" .
			  "Host: " . $host . "\r\n" .
              "Cookie: pid=".$cookie."\r\n"
  )
);

$context = stream_context_create($opts);

//if login wasn't in the url use the standard proxy call previously using in all circumstances
if(!$login){
	$response = file_get_contents($url, false, $context);
	echo $response."\n";
} else {
//else use new proxy method for loggin in
	

//          FILE: proxy.php
//
// LAST MODIFIED: 2006-03-23
//
//        AUTHOR: Troy Wolf <troy@troywolf.com>
//
//   DESCRIPTION: Allow scripts to request content they otherwise may not be
//                able to. For example, AJAX (XmlHttpRequest) requests from a
//                client script are only allowed to make requests to the same
//                host that the script is served from. This is to prevent
//                "cross-domain" scripting. With proxy.php, the javascript
//                client can pass the requested URL in and get back the
//                response from the external server.
//
//         USAGE: "proxy_url" required parameter. For example:
//                http://www.mydomain.com/proxy.php?proxy_url=http://www.yahoo.com
//
	$proxy_url = isset($_GET['url'])?$_GET['url']:false;
	if (!$proxy_url) {
		header("HTTP/1.0 400 Bad Request");
		echo "proxy.php failed because proxy_url parameter is missing";
		exit();
	}
	
	// Instantiate the http object used to make the web requests.
	// More info about this object at www.troywolf.com/articles
	if (!$h = new http()) {
		header("HTTP/1.0 501 Script Error");
		echo "proxy.php failed trying to initialize the http object";
		exit();
	}
	
	$h->url = $proxy_url;
	if (!$h->fetch($h->url)) {
		header("HTTP/1.0 501 Script Error");
		echo "proxy.php had an error attempting to query the url";
		exit();
	}
	
	// Forward the headers to the client.
	$ary_headers = split("\n", $h->header);
	foreach($ary_headers as $hdr) { header($hdr); }
	
	// Send the response body to the client.
	echo $h->body;
}

?>
