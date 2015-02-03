<?php

namespace app\tests\frontend\assets;

class MochaAsset extends \yii\web\AssetBundle
{
    public $jsOptions = [
        'position' => \yii\web\View::POS_BEGIN,
    ];

    public $sourcePath = '@bower/mocha';
    public $css = [ 'mocha.css' ];
    public $js = [ 'mocha.js' ];
    public $depends = [
        'yii\web\JqueryAsset',
    ];
}
