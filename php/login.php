<?php
session_start();
require_once $_SERVER['DOCUMENT_ROOT'] . '/vendor/autoload.php';
require_once 'MysqliDb.php';

use Respect\Validation\Validator as v;

if (!v::notEmpty()->alnum()->length(1, 40)->validate($_POST['username'])) {
    header("HTTP/1.1 500 Benutzername ungültig. Nur Buchstaben von A bis Z und Zahlen zulässig.");
    exit;
}

if (!v::notEmpty()->validate(($_POST['password']))) {
    header("HTTP/1.1 500 Passwort leer");
    exit;
}
$username = $_POST['username'];
$password = $_POST['password'];

try {
    $db = new MysqliDb();
    $userdata = $db->where('username', $username)->getOne("users");

    $hashAndSalt = $userdata['hashed_password'];
    if (password_verify($password, $hashAndSalt)) {
        // Verified
        $_SESSION['username'] = $userdata['username'];
        echo "Anmeldung erfolgreich, " . $_SESSION['username'] . "!";
    } else {
        die(header("HTTP/1.1 500 Falsches Passwort"));
    }

    echo json_encode($rows);
} catch (Exception $e) {
    header("HTTP/1.1 500 Internal Server Error");
    exit;
}
