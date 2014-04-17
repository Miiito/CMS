<?php

require( dirname(__FILE__) . '/loader.php' );

$env_specific = load_config('common.php');
$env_specific_local = load_config('common.local.php');

$common = [
    'components' => [
        'db' => [
            'class' => 'yii\db\Connection',
            'dsn' => 'mysql:host=localhost;dbname=yii2basic',
            'username' => 'root',
            'password' => '',
            'charset' => 'utf8',
        ],
    ],
    'params' => [
        'adminEmail' => 'admin@example.com',
    ],
];

return yii\helpers\ArrayHelper::merge($common, $env_specific, $env_specific_local);
