<?php
session_start();

require_once '../config.php';
require_once '../mobile-detect.php';

$detect = new Mobile_Detect;

$playerName = htmlentities($_POST['playerName']);
$score = htmlentities($_POST['score']);
$deviceType = ($detect->isMobile()) ? (($detect->isTablet()) ? 'Tablet' : 'Phone') : 'Desktop';
$userAgent = $_SERVER['HTTP_USER_AGENT'];
$screenWidth = htmlentities($_POST['screenWidth']);
$screenHeight = htmlentities($_POST['screenHeight']);
$honeypot = htmlentities($_POST['honeypot']);
$uid = htmlentities($_POST['uid']);
$success = false;

if($honeypot == 'true') {

	if(!$_SESSION['uid'] === $uid) {
		$message = 'Session information incorrect for current user:';
		$message .= '<p> Date: ' . date("Y-m-d H:i:s") . ' </p>';
		$message .= '<p> User agent: ' . $userAgent . ' </p>';
		$message .= '<p> Device: ' . $deviceType . ' </p>';
		$message .= '<p> Score: ' . $score. ' </p>';

		echo "Error: Could not submit score. Please refresh the game and try again.";
		mail('lbrowning86@gmail.com', 'Blocks: Score Submission Error', $message);

		exit();
	}

	try {
		$DBH = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);

	   $sql = "INSERT INTO tblscores(playerName, score, deviceType, userAgent, screenWidth, screenHeight, scoreAddedOn)
	    VALUES(:playerName, :playerScore, :deviceType, :userAgent, :screenWidth, :screenHeight, :scoreAddedOn)";

	  $stmt = $DBH->prepare($sql);
	  $stmt->execute(array(
	      ":playerName" => $playerName,
	      ":playerScore" => $score,
	      ":deviceType" => $deviceType,
	      ":userAgent" => $userAgent,
	      ":screenWidth" => $screenWidth,
	      ":screenHeight" => $screenHeight,
	      ":scoreAddedOn" => date('Y-m-d H:i:s')
	  ))  or die(print_r($stmt->errorInfo(), true));

	  $success = true;

	} catch (Exception $ex) {
		echo $ex;
	}
}
echo json_encode(array('success' => $success));
?>
