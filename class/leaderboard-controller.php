<?php
require_once('leaderboard.php');

$deviceTypeFilter = htmlentities($_GET['deviceType']);
$leaderboard = new Leaderboard($deviceTypeFilter);
$scores = $leaderboard->getLeaderboard();

$i = 0;
$rank = 0;
$curScore = 0;
$scoresArr = Array();

foreach($scores as $entry) {
    $score = (int)$entry['Score'];
    $scoreDate = $entry['ScoreAddedOn'];
    $playerName = $entry['PlayerName'];
    $deviceType = $entry['DeviceType'];

    if($score != $curScore) {
        $rank++;
        $curScore = $score;
    }

    $scoresArr[$i]['rank'] = $rank;
    $scoresArr[$i]['name'] = $playerName;
    $scoresArr[$i]['device'] = $deviceType;
    $scoresArr[$i]['date'] = date("d/m/Y", strtotime($scoreDate));
    $scoresArr[$i]['score'] = $score;

    $i++;
}
unset($i);
?>
