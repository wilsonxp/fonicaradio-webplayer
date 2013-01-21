<?php
$tema = urlencode(utf8_encode($_GET["tema"]));
$friendfeed_remotekey = "";
$friendfeed_usuario = "";
HTTPpost("friendfeed-api.com","/v2/entry","body=".$tema,$friendfeed_usuario,$friendfeed_remotekey,"Mozilla/4.0 
(compatible; MSIE 5.5; Windows NT 5.0)");

function HTTPpost($host, $path, $data_to_send,$user,$pass,$agent) {
	$fp = fsockopen($host,80, &$err_num, &$err_msg, 10);
	if (!$fp) {
		echo "$err_msg ($err_num)<br>\n";
	} else {
		$auth = $user.":".$pass ; 
		$string=base64_encode($auth);
		fputs($fp, "POST $path HTTP/1.1\r\n");
		fputs($fp, "Authorization: Basic ".$string."\r\n");
		fputs($fp, "User-Agent: ".$agent."\n");
		fputs($fp, "Host: $host\n");
		fputs($fp, "Content-type: application/x-www-form-urlencoded\n");
		fputs($fp, "Content-length: ".strlen($data_to_send)."\n");
		fputs($fp, "Connection: close\n\n");
		fputs($fp,  $data_to_send);
		// while (!feof($fp)) {
		        // $buf .= fgets($fp,128);
		    // }    
		    // echo $buf; 
		for ($i = 1; $i < 10; $i++){
			$reply = fgets($fp, 256);
		}
		echo fread($fp, 1000);
		fclose($fp);
	}
}
?>