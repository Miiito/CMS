<?php

namespace app\tests\frontend\assets;

class MochaSinonAsset extends \yii\web\AssetBundle
{
    public $jsOptions = [
        'position' => \yii\web\View::POS_END,
    ];

    public $sourcePath = '@app/tests/frontend/assets/vendor';
    public $js = [ 'mocha-sinon.js' ];
    public $depends = [
        'app\tests\frontend\assets\MochaAsset',
        'app\tests\frontend\assets\SinonAsset',
    ];
}
