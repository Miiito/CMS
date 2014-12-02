<?php

require( __DIR__ . '/loader.php' );

$env_specific = load_config('common.php');
$env_specific_local = load_config('common.local.php');

$common = [
    'name' => 'Mito Yii2 base app',
    'basePath' => dirname(__DIR__),
    'extensions' => require(__DIR__ . '/../vendor/yiisoft/extensions.php'),
    'id' => 'basic',
    'bootstrap' => ['log'],
    'sourceLanguage' => '00',
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
                    'maxLogFiles' => 10,
                    'except' => [
                        'yii\web\HttpException:404',
                    ],
                ],
                [
                    'class' => 'yii\log\FileTarget',
                    'logFile' => '@runtime/logs/404.log',
                    'levels' => ['error', 'warning'],
                    'maxLogFiles' => 10,
                    'categories' => [
                        'yii\web\HttpException:404',
                    ],
                ],
            ],
        ],
    ],
    'params' => [
        'adminEmail' => 'admin@example.com',
    ],
];

return yii\helpers\ArrayHelper::merge($common, $env_specific, $env_specific_local);
