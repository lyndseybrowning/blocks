<?php
class Database {

  private static $instance = null;
  private $db;

  private function __construct() {
      require('../config.php');
      try {
          $this->db = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
      } catch(PDOException $e) {
          die($e->getMessage());
      }
  }

  public static function getInstance() {
      if(!isset(self::$instance)) {
          self::$instance = new Database();
      }
      return self::$instance;
  }

  public function prepareSQL($sql) {
      $this->stmt = $this->db->prepare($sql);
      return $this;
  }

  public function bind($pos, $value, $type = null) {
      if(is_null($type) ) {
          switch( true ) {
              case is_int($value):
                  $type = PDO::PARAM_INT;
                  break;
              case is_bool($value):
                  $type = PDO::PARAM_BOOL;
                  break;
              case is_null($value):
                  $type = PDO::PARAM_NULL;
                  break;
              default:
                  $type = PDO::PARAM_STR;
          }
      }

      $this->stmt->bindValue($pos, $value, $type);
      return $this;
    }

    public function executeSQL() {
        return $this->stmt->execute();
    }

    public function resultSet() {
        $this->executeSQL();
        return $this->stmt->fetchAll();
    }

    public function single() {
        $this->executeSQL();
        return $this->stmt->fetch();
    }

    public function getId(){
      	return $this->db->lastInsertId();
  	}

  	public function createGuid() {
  		$guid = trim(com_create_guid(), '{}');
  		$guid = str_replace("-", "", $guid);
  		return $guid;
  	}
}
?>
