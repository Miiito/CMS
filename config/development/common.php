<?php

return [
    'components' => [
        'assetManager' => [
            'linkAssets' => true,
        ],
    ],
    'bootstrap' => [
        'debug',
    ],
    'modules' => [
        'debug' => [
            'class' => 'yii\debug\Module',
            'allowedIPs' => [ '*' ],
        ],
        'gii' => [
            'class' => 'yii\gii\Module',
            'allowedIPs' => [ '*' ],
        ],
    ],
];
