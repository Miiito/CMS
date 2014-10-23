<?php

$config = [
    'components' => [
        'assetManager' => [
            'linkAssets' => true,
        ],
        // livereload snippet
        /*
        'view' => [
            'on beforeRender' => function($event) {
                $event->sender->registerJsFile('http://localhost:35729/livereload.js?snipver=1', [
                    'position' => \yii\web\View::POS_HEAD,
                ]);
            }
        ],
        */
    ],
    'bootstrap' => [],
    'modules' => [
        'gii' => [
            'class' => 'yii\gii\Module',
            'allowedIPs' => [ '*' ],
        ],
    ],
];

if (YII_ENV !== 'test') {
    $config['bootstrap'][] = 'debug';
    $config['modules']['debug'] = [
        'class' => 'yii\debug\Module',
        'allowedIPs' => [ '*' ],
    ];
}

return $config;
