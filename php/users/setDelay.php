<?php
session_start();
require_once '../MysqliDb.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/vendor/autoload.php';
use Respect\Validation\Validator as v;

$vEmpty = v::not(v::notEmpty());
if ($vEmpty->validate($_SESSION['username'])) {
    header("HTTP/1.1 403 Verboten");
    echo '403 Verboten. Sie sind nicht eingeloggt';
    exit;
}

if ($vEmpty->validate($_POST['delay']) or v::numeric()->validate($_POST['delay'])) {
    die(header("HTTP/1.1 500 Bitte geben Sie eine Zahl ein."));
}
$delay = $_POST['delay'];

$db = new MysqliDb();
$db->update("settings", array("delay" => $delay));

/*
require_once '../WetboatDB.php';
$db = new WetboatDB();
$db->quote($delay);
$db->query("UPDATE settings SET delay=$delay;");
echo $delay;

*/