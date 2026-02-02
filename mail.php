<?php
header('Content-Type: application/json');

// Set recipients and subject
$to = "d.polegaev@ubc-co.ru, alexey.ztl@gmail.com";
$from = "info@vita-mia.ru";
$subject = "Новая заявка " . ($_SERVER['HTTP_REFERER'] ?? '');

// Sanitize inputs
$name = htmlspecialchars(trim($_POST['name'] ?? ''));
$email = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$phone = htmlspecialchars(trim($_POST['phone'] ?? ''));

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'error', 'message' => 'Некорректный email.']);
    exit;
}

// Compose message
$message = "Клиент:\n\n";
if ($name) $message .= "Имя: $name\n";
if ($email) $message .= "Email: $email\n";
if ($phone) $message .= "Телефон: $phone\n";

// Headers
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "From: $from\r\n";
$headers .= "Reply-To: $from\r\n";

// Send mail
if (mail($to, $subject, $message, $headers)) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Ошибка при отправке письма.']);
}
?>
