<?php


use yii\helpers\Html;

$attributeField = Html::getInputId($this->context->model, $this->context->attribute);
$atributeFieldName = Html::getInputName($this->context->model, $this->context->attribute);

$addressField = substr($this->context->addressField, 0, 1) == '#'
                ? substr($this->context->addressField, 1)
                : Html::getInputId($this->context->model, $this->context->addressField);

$updateAddressAfterDrag = $this->context->updateAddressAfterDrag ? 'true' : 'false';
$locationList = $this->context->locationsList;
$language = $this->context->language;

$value = $this->context->model[$this->context->attribute];
if(is_array($value)) $value = \yii\helpers\Json::encode($value);

echo Html::hiddenInput($atributeFieldName, $value, ['id' => $attributeField]);
echo Html::tag('div', '', $this->context->options);

$js = <<<EEE

$('#{$this->context->options['id']}').mapDrag({
address: '#$addressField',
updateAddressAfterDrag: $updateAddressAfterDrag,
locationList: '#$locationList',
attribute : '#$attributeField',
language : '$language'
});

EEE;

$this->registerJs($js);

