<?php

    namespace kyra\map;

    use yii\web\AssetBundle;
    use yii\web\View;

    class MultiMarketAsset extends AssetBundle
    {
        public $sourcePath = '@vendor/kyra/yii2-kyra-multimarker/assets';
        public $js = [
            '//maps.googleapis.com/maps/api/js?libraries=places',
            'gmaps.min.js',
            'mapmultidrag.js',
        ];
        public $css = [
        ];
        public $depends = [
            'yii\web\JqueryAsset',
        ];
        public $jsOptions = ['position' => \yii\web\View::POS_END];
    }