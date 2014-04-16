<?php

namespace app\components;

class AssetBundle extends \yii\web\AssetBundle
{
    /**
     * {@inheritdoc}
     */
    public function init()
    {
        if (YII_ENV_DEV) {
            $this->js = $this->devJs;
        }
        parent::init();
    }
}