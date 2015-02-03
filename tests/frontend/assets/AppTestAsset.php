<?php

namespace app\tests\frontend\assets;

class AppTestAsset extends \yii\web\AssetBundle
{
    public $sourcePath = '@app/tests/frontend/assets/tests';
    public $js = [
        'site.js',
    ];
    public $depends = [
        'app\tests\frontend\assets\AppAsset',
    ];
}
