<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Search Engine
    |--------------------------------------------------------------------------
    |
    | This option controls the default search connection that gets used while
    | using Laravel Scout. This connection is used when syncing all models
    | to the search service. You should adjust this based on your needs.
    |
    | Supported: "algolia", "meilisearch", "typesense",
    |            "database", "collection", "null"
    |
    */

    'driver' => env('SCOUT_DRIVER', 'typesense'),

    /*
    |--------------------------------------------------------------------------
    | Index Prefix
    |--------------------------------------------------------------------------
    |
    | Here you may specify a prefix that will be applied to all search index
    | names used by Scout. This prefix may be useful if you have multiple
    | "tenants" or applications sharing the same search infrastructure.
    |
    */

    'prefix' => env('SCOUT_PREFIX', ''),

    /*
    |--------------------------------------------------------------------------
    | Queue Data Syncing
    |--------------------------------------------------------------------------
    |
    | This option allows you to control if the operations that sync your data
    | with your search engines are queued. When this is set to "true" then
    | all automatic data syncing will get queued for better performance.
    |
    */

    'queue' => env('SCOUT_QUEUE', false),

    /*
    |--------------------------------------------------------------------------
    | Database Transactions
    |--------------------------------------------------------------------------
    |
    | This configuration option determines if your data will only be synced
    | with your search indexes after every open database transaction has
    | been committed, thus preventing any discarded data from syncing.
    |
    */

    'after_commit' => false,

    /*
    |--------------------------------------------------------------------------
    | Chunk Sizes
    |--------------------------------------------------------------------------
    |
    | These options allow you to control the maximum chunk size when you are
    | mass importing data into the search engine. This allows you to fine
    | tune each of these chunk sizes based on the power of the servers.
    |
    */

    'chunk' => [
        'searchable' => 500,
        'unsearchable' => 500,
    ],

    /*
    |--------------------------------------------------------------------------
    | Soft Deletes
    |--------------------------------------------------------------------------
    |
    | This option allows to control whether to keep soft deleted records in
    | the search indexes. Maintaining soft deleted records can be useful
    | if your application still needs to search for the records later.
    |
    */

    'soft_delete' => false,

    /*
    |--------------------------------------------------------------------------
    | Identify User
    |--------------------------------------------------------------------------
    |
    | This option allows you to control whether to notify the search engine
    | of the user performing the search. This is sometimes useful if the
    | engine supports any analytics based on this application's users.
    |
    | Supported engines: "algolia"
    |
    */

    'identify' => env('SCOUT_IDENTIFY', false),

    /*
    |--------------------------------------------------------------------------
    | Algolia Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your Algolia settings. Algolia is a cloud hosted
    | search engine which works great with Scout out of the box. Just plug
    | in your application ID and admin API key to get started searching.
    |
    */

    'algolia' => [
        'id' => env('ALGOLIA_APP_ID', ''),
        'secret' => env('ALGOLIA_SECRET', ''),
        'index-settings' => [
            // 'users' => [
            //     'searchableAttributes' => ['id', 'name', 'email'],
            //     'attributesForFaceting'=> ['filterOnly(email)'],
            // ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Meilisearch Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your Meilisearch settings. Meilisearch is an open
    | source search engine with minimal configuration. Below, you can state
    | the host and key information for your own Meilisearch installation.
    |
    | See: https://www.meilisearch.com/docs/learn/configuration/instance_options#all-instance-options
    |
    */

    'meilisearch' => [
        'host' => env('MEILISEARCH_HOST', 'http://localhost:7700'),
        'key' => env('MEILISEARCH_KEY'),
        'index-settings' => [
            // 'users' => [
            //     'filterableAttributes'=> ['id', 'name', 'email'],
            // ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Typesense Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your Typesense settings. Typesense is an open
    | source search engine using minimal configuration. Below, you will
    | state the host, key, and schema configuration for the instance.
    |
    */

    'typesense' => [
        'client-settings' => [
            'api_key' => env('TYPESENSE_API_KEY', 'xyz'),
            'nodes' => [
                [
                    'host' => env('TYPESENSE_HOST', 'localhost'),
                    'port' => env('TYPESENSE_PORT', '8108'),
                    'path' => env('TYPESENSE_PATH', ''),
                    'protocol' => env('TYPESENSE_PROTOCOL', 'http'),
                ],
            ],
            'nearest_node' => [
                'host' => env('TYPESENSE_HOST', 'localhost'),
                'port' => env('TYPESENSE_PORT', '8108'),
                'path' => env('TYPESENSE_PATH', ''),
                'protocol' => env('TYPESENSE_PROTOCOL', 'http'),
            ],
            'connection_timeout_seconds' => env('TYPESENSE_CONNECTION_TIMEOUT_SECONDS', 2),
            'healthcheck_interval_seconds' => env('TYPESENSE_HEALTHCHECK_INTERVAL_SECONDS', 30),
            'num_retries' => env('TYPESENSE_NUM_RETRIES', 3),
            'retry_interval_seconds' => env('TYPESENSE_RETRY_INTERVAL_SECONDS', 1),
        ],
        'model-settings' => [
            \App\Models\Geofence::class => [
                'collection-schema' => [
                    'fields' => [
                        [
                            'name' => 'id',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'tenant_id',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'name',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'group_name',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'tenant_name',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'is_active',
                            'type' => 'bool',
                        ],
                        [
                            'name' => 'created_at',
                            'type' => 'int64',
                        ],
                        [
                            'name' => '__soft_deleted',
                            'type' => 'bool',
                        ],
                    ],
                    'default_sorting_field' => 'created_at',
                ],
                'search-parameters' => [
                    'query_by' => 'name,group_name,tenant_name',
                ],
            ],
            \App\Models\Vehicle::class => [
                'collection-schema' => [
                    'fields' => [
                        [
                            'name' => 'id',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'tenant_id',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'registration',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'vin',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'model_name',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'brand_name',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'type_name',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'tenant_name',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'created_at',
                            'type' => 'int64',
                        ],
                        [
                            'name' => '__soft_deleted',
                            'type' => 'bool',
                        ],
                    ],
                    'default_sorting_field' => 'created_at',
                ],
                'search-parameters' => [
                    'query_by' => 'registration,vin,model_name,brand_name,type_name,tenant_name',
                ],
            ],
            \App\Models\Device::class => [
                'collection-schema' => [
                    'fields' => [
                        [
                            'name' => 'id',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'tenant_id',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'imei',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'sim_number',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'serial_number',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'type_name',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'type_manufacturer',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'tenant_name',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'vehicle_id',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'vehicle_registration',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'vehicle_model',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'vehicle_brand',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'created_at',
                            'type' => 'int64',
                        ],
                        [
                            'name' => '__soft_deleted',
                            'type' => 'bool',
                        ],
                    ],
                    'default_sorting_field' => 'created_at',
                ],
                'search-parameters' => [
                    'query_by' => 'imei,sim_number,serial_number,type_name,type_manufacturer,tenant_name,vehicle_registration,vehicle_model,vehicle_brand',
                ],
            ],
            \App\Models\Workflow::class => [
                'collection-schema' => [
                    'fields' => [
                        [
                            'name' => 'id',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'tenant_id',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'name',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'description',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'is_active',
                            'type' => 'bool',
                        ],
                        [
                            'name' => 'tenant_name',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'created_at',
                            'type' => 'int64',
                        ],
                        [
                            'name' => '__soft_deleted',
                            'type' => 'bool',
                        ],
                    ],
                    'default_sorting_field' => 'created_at',
                ],
                'search-parameters' => [
                    'query_by' => 'name,description,tenant_name',
                ],
            ],
            \App\Models\User::class => [
                'collection-schema' => [
                    'fields' => [
                        [
                            'name' => 'id',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'name',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'email',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'tenant_name',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'tenant_id',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'tenant_id_null',
                            'type' => 'bool',
                        ],
                        [
                            'name' => 'created_at',
                            'type' => 'int64',
                        ],
                    ],
                    'default_sorting_field' => 'created_at',
                ],
                'search-parameters' => [
                    'query_by' => 'name,email,tenant_name,tenant_id',
                ],
            ],
            \App\Models\Tenant::class => [
                'collection-schema' => [
                    'fields' => [
                        [
                            'name' => 'id',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'name',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'email',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'address',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'phone',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'is_active',
                            'type' => 'bool',
                        ],
                        [
                            'name' => 'created_at',
                            'type' => 'int64',
                        ],
                        [
                            'name' => '__soft_deleted',
                            'type' => 'bool',
                        ],
                    ],
                    'default_sorting_field' => 'created_at',
                ],
                'search-parameters' => [
                    'query_by' => 'name,email,address,phone',
                ],
            ],
            \App\Models\Driver::class => [
                'collection-schema' => [
                    'fields' => [
                        [
                            'name' => 'id',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'tenant_id',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'firstname',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'surname',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'full_name',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'phone',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'license_number',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'card_number',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'tenant_name',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'created_at',
                            'type' => 'int64',
                        ],
                        [
                            'name' => '__soft_deleted',
                            'type' => 'bool',
                        ],
                    ],
                    'default_sorting_field' => 'created_at',
                ],
                'search-parameters' => [
                    'query_by' => 'firstname,surname,full_name,card_number,license_number,phone,tenant_name',
                ],
            ],
            \App\Models\Group::class => [
                'collection-schema' => [
                    'fields' => [
                        [
                            'name' => 'id',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'name',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'description',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'tenant_id',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'parent_id',
                            'type' => 'string',
                            'optional' => true,
                        ],
                        [
                            'name' => 'full_path',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'is_active',
                            'type' => 'bool',
                        ],
                        [
                            'name' => 'tenant_name',
                            'type' => 'string',
                        ],
                        [
                            'name' => 'parent_name',
                            'type' => 'string',
                            'optional' => true,
                        ],
                        [
                            'name' => 'created_at',
                            'type' => 'int64',
                        ],
                    ],
                    'default_sorting_field' => 'created_at',
                ],
                'search-parameters' => [
                    'query_by' => 'name,description,full_path,tenant_name,parent_name',
                ],
            ],
        ],
    ],

];
