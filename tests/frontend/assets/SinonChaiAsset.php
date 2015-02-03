<?php

namespace app\tests\frontend\assets;

class SinonChaiAsset extends \yii\web\AssetBundle
{
    public $jsOptions = [
        'position' => \yii\web\View::POS_BEGIN,
    ];

    public $sourcePath = '@bower/sinon-chai/lib';
    public $js = [ 'sinon-chai.js' ];
    public $depends = [
        'app\tests\frontend\assets\ChaiAsset'
    ];
}
