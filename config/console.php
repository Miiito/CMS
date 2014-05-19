<?php

Yii::setAlias('@tests', dirname(__DIR__) . '/tests');

require( dirname(__FILE__) . '/loader.php' );

$common_cfg = require( dirname(__FILE__) . '/common.php');

$env_specific = load_config('console.php');
$env_specific_local = load_config('console.local.php');

$config = [
    'id' => 'basic-console',
    'basePath' => dirname(__DIR__),
    'bootstrap' => ['log'],
    'controllerNamespace' => 'app\commands',
    'controllerMap' => [
        'packages' => 'mito\assets\PackagesController',
    ],
    'extensions' => require(__DIR__ . '/../vendor/yiisoft/extensions.php'),
    'components' => [
        'cache' => [
            'class' => 'yii\caching\FileCache',
        ],
        'log' => [
            'targets' => [
                [
                    'class' => 'yii\log\FileTarget',
                    'levels' => ['error', 'warning'],
                ],
            ],
        ],
    ],
];

return yii\helpers\ArrayHelper::merge($common_cfg, $config, $env_specific, $env_specific_local);
