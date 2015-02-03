<?php

namespace app\tests\frontend\assets;

class ChaiAsset extends \yii\web\AssetBundle
{
    public $jsOptions = [
        'position' => \yii\web\View::POS_BEGIN,
    ];

    public $sourcePath = '@bower/chai';
    public $js = [ 'chai.js' ];
}
