<?php

Yii::setAlias('@tests', dirname(__DIR__) . '/tests');

require( __DIR__ . '/loader.php' );

$common_cfg = require( __DIR__ . '/common.php');

$env_specific = load_config('console.php');
$env_specific_local = load_config('console.local.php');

$config = [
    'id' => $common_cfg['id'] . '-console',
    'controllerNamespace' => 'app\commands',
    'controllerMap' => [
        'packages' => 'mito\assets\PackagesController',
        'assetscleanup' => 'mito\assets\CleanupController',
    ],
    'components' => [
        'cache' => [
            'class' => 'yii\caching\FileCache',
        ],
    ],
];

return yii\helpers\ArrayHelper::merge($common_cfg, $config, $env_specific, $env_specific_local);
