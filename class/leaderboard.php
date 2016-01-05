<?php
require_once('database.php');

class Leaderboard {

    private $rowLimit = 10,
            $db,
            $filter = 'Phone'; // default view of leaderboard

    public function __construct($deviceTypeFilter, $limit = null) {

      if($limit !== $this->rowLimit && gettype($limit) === 'integer') {
          $this->rowLimit = $limit;
      }

      if( isset($deviceTypeFilter) ) {
          $this->filter = $deviceTypeFilter;
      }

      $this->db = Database::getInstance();
    }

    public function getLeaderboard() {
      $sql = "SELECT ScoreId, PlayerName, Score, DeviceType, ScoreAddedOn FROM blocks.tblscores WHERE Active=1 AND DeviceType = '$this->filter' ORDER BY Score DESC LIMIT $this->rowLimit";
      $query = $this->db->prepareSQL($sql);

      return $query->resultSet();
    }
}
?>
