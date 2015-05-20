<?php
/*
* Filename.......: class_http.php
* Author.........: Troy Wolf [troy@troywolf.com]
* Last Modified..: Date: 2006/03/06 10:15:00
* Description....: Screen-scraping class with caching. Includes image_cache.php
                   companion script. Includes static methods to extract data
                   out of HTML tables into arrays or XML. Now supports sending
                   XML requests and custom verbs with support for making
                   WebDAV requests to Microsoft Exchange Server.
*/

class http {
    var $url;
    var $port;
    var $verb;
    var $header;
    var $body;
    var $headers;
    var $connect_timeout;
    
    /*
    The class constructor. Configure defaults.
    */ 
    function http() {
        /*
        Seconds to attempt socket connection before giving up.
        */
        $this->connect_timeout = 30; 
        
        /*
        Seconds to wait for stream to do its thing and return.
        In my experience, if you do nothing, this defaults to 60 seconds.
        Now here is the kicker--if you set this to 10 seconds and the request
        actually takes 83 seconds, your script will sit and wait the entire 83
        seconds before returning the failure! So I'm not sure what the real
        point is. For example, if it takes 83 seconds and does in fact succeed,
        but you had the timeout set at 60, you will return a failure even though
        the communication worked. Point is, set this higher than anything you
        think you'll need. Either way you have to wait!
        */
        $this->stream_timeout = 60;

        $this->clean();               

        return true;
    }
    
    /*
    fetch() method to get the content.
    */
    function fetch($url="", $verb="GET") {
        $this->status = "";
        $this->header = "";
        $this->body = "";
        if (!$url) {
            return false;
        }
        $this->url = $url;
		 if (!$fh = $this->getFromUrl($url, $verb)) {
                return false;
          }
        
        /*
        Get response header.
        */
        $this->header = fgets($fh, 1024);
        $this->status = substr($this->header,9,3);
        while ((trim($line = fgets($fh, 1024)) != "") && (!feof($fh))) {
            $this->header .= $line;
            if ($this->status=="401" and strpos($line,"WWW-Authenticate: Basic realm=\"")===0) {
                fclose($fh);
                return FALSE;
            }
        }
        
        /*
        Get response body.
        */
        while (!feof($fh)) {
            $this->body .= fgets($fh, 1024);
        }
        fclose($fh);
        return $this->status;
    }
    
    /*
    PRIVATE getFromUrl() method to scrape content from url.
    */
    function getFromUrl($url, $verb="GET") {
        preg_match("~([a-z]*://)?([^:^/]*)(:([0-9]{1,5}))?(/.*)?~i", $url, $parts);
        $protocol = $parts[1];
        $server = $parts[2];
        $port = $parts[4];
        $path = $parts[5];
        if ($port == "") {
            if (strtolower($protocol) == "https://") {
                $port = "443";
            } else {
                $port = "80";
            }
        }

        if ($path == "") { $path = "/"; }
        
        if (!$sock = @fsockopen(((strtolower($protocol) == "https://")?"ssl://":"").$server, $port, $errno, $errstr, $this->connect_timeout)) {
            return false;
        }
        
        stream_set_timeout($sock, $this->stream_timeout);
        
        $this->headers["Host"] = $server.":".$port;
        
        $request = $verb." ".$path." HTTP/1.0\r\n";

        if (fwrite($sock, $request) === FALSE) {
            fclose($sock);
            return false;
        }
        
        foreach ($this->headers as $key=>$value) {
            if (fwrite($sock, $key.": ".$value."\r\n") === FALSE) {
                fclose($sock);
                return false;
            }
        }
        
        if (fwrite($sock, "\r\n") === FALSE) {
            fclose($sock);
            return false;
        }
        
        return $sock;
    }
    
    /*
    PRIVATE clean() method to reset the instance back to mostly new state.
    */
    function clean()
    {
        $this->status = "";
        $this->header = "";
        $this->body = "";
        $this->headers = array();
        /*
        Try to use user agent of the user making this request. If not available,
        default to IE6.0 on WinXP, SP1.
        */
        if (isset($_SERVER['HTTP_USER_AGENT'])) {
            $this->headers["User-Agent"] = $_SERVER['HTTP_USER_AGENT'];
        } else {
            $this->headers["User-Agent"] = "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)";
        }
        
        /*
        Set referrer to the current script since in essence, it is the referring
        page.
        */
        if (substr($_SERVER['SERVER_PROTOCOL'],0,5) == "HTTPS") {
            $this->headers["Referer"] = "https://".$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
        } else {
            $this->headers["Referer"] = "http://".$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
        }
    }
}

?>