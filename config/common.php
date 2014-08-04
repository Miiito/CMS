<?php

require( dirname(__FILE__) . '/loader.php' );

$env_specific = load_config('common.php');
$env_specific_local = load_config('common.local.php');

$common = [
    'name' => 'Mito Yii2 base app',
    'bootstrap' => ['log'],
    'components' => [
        'db' => [
            'class' => 'yii\db\Connection',
            'dsn' => 'mysql:host=localhost;dbname=yii2basic',
            'username' => 'root',
            'password' => '',
            'charset' => 'utf8',
        ],
        'log' => [
            'traceLevel' => YII_DEBUG ? 3 : 0,
            'targets' => [
                [
                    'class' => 'yii\log\FileTarget',
                    'levels' => ['error', 'warning'],
                ],
            ],
        ],
        'mail' => [
            'class' => 'yii\swiftmailer\Mailer',
        ],
    ],
    'params' => [
        'adminEmail' => 'admin@example.com',
    ],
];

return yii\helpers\ArrayHelper::merge($common, $env_specific, $env_specific_local);
