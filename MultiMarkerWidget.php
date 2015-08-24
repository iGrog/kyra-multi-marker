<?php

namespace kyra\map;

class MultiMarkerWidget extends \yii\base\Widget
{
    public $addressField = 'Address';
    public $updateAddressAfterDrag = true;
    public $attribute = 'Locations';
    public $locationsList = 'LocationsList';
    public $language = 'en';
    public $model = null;
    public $options = [];

    public function run()
    {
        MapAsset::register(\Yii::$app->view);
        if(!isset($this->options['id'])) $this->options['id'] = uniqid();
        return $this->render('map');
    }
}
