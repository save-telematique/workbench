<?php

namespace App\Enum;

enum DataPointDataType: string
{
    case STRING = 'string';
    case INTEGER = 'integer';
    case FLOAT = 'float';
    case BOOLEAN = 'boolean';
    case JSON = 'json';
    case RAW = 'raw'; 
} 