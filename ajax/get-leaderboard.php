<?php
require_once('../class/leaderboard-controller.php');
?>

<table>
    <thead>
      <th> Rank </th>
      <th> Name </th>
      <!-- <th> Device </th> -->
      <th> Added </th>
      <th> Score </th>
    </thead>
    <?php foreach($scoresArr as $entry) { ?>
    <tr>
        <td><?php echo $entry['rank']; ?></td>
        <td><?php echo $entry['name']; ?></td>
        <!-- <td><?php echo $entry['device']; ?></td> -->
        <td><?php echo $entry['date']; ?></td>
        <td><?php echo $entry['score']; ?></td>
    </tr>
    <?php } ?>
</table>
