<?php

namespace app\tests\frontend\assets;

class LecheAsset extends \yii\web\AssetBundle
{
    public $jsOptions = [
        'position' => \yii\web\View::POS_BEGIN,
    ];

    public $sourcePath = '@app/tests/frontend/assets/vendor';
    public $js = [ 'leche-2.0.0.js' ];
}
