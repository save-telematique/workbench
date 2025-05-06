<?php

return [
    'title' => 'Conducteurs',
    'description' => 'Gérez vos conducteurs ici',
    
    'breadcrumbs' => [
        'index' => 'Conducteurs',
        'create' => 'Créer un conducteur',
        'edit' => 'Modifier le conducteur',
    ],
    
    'tabs' => [
        'list' => 'Liste des conducteurs',
    ],
    
    'sidebar' => [
        'information' => 'Informations',
    ],
    
    'list' => [
        'heading' => 'Conducteurs',
        'description' => 'Gérez et consultez tous les conducteurs de votre flotte.',
        'no_drivers' => 'Aucun conducteur trouvé',
        'get_started' => 'Créez votre premier conducteur pour commencer',
    ],
    
    'fields' => [
        'surname' => 'Nom',
        'firstname' => 'Prénom',
        'phone' => 'Téléphone',
        'license_number' => 'Numéro de permis',
        'card_issuing_country' => 'Pays d\'émission du permis',
        'card_number' => 'Numéro de carte',
        'birthdate' => 'Date de naissance',
        'card_issuing_date' => 'Date d\'émission de la carte',
        'card_expiration_date' => 'Date d\'expiration de la carte',
        'tenant' => 'Tenant',
        'user' => 'Compte utilisateur',
    ],
    
    'placeholders' => [
        'tenant' => 'Sélectionner un tenant',
        'user' => 'Sélectionner un utilisateur',
    ],
    
    'filters' => [
        'tenant' => 'Tenant',
    ],
    
    'sections' => [
        'driver_info' => 'Informations',
        'license_info' => 'Informations du permis',
        'tenant_info' => 'Informations du tenant',
        'user_info' => 'Informations du compte utilisateur',
    ],
    
    'actions' => [
        'create' => 'Nouveau conducteur',
    ],
    
    'create' => [
        'title' => 'Créer un conducteur',
    ],
    
    'edit' => [
        'title' => 'Modifier le conducteur',
    ],
    
    'delete' => [
        'title' => 'Supprimer le conducteur',
        'description' => 'Êtes-vous sûr de vouloir supprimer le conducteur :name ? Cette action est irréversible.',
    ],
    
    'restore' => [
        'title' => 'Restaurer le conducteur',
        'description' => 'Êtes-vous sûr de vouloir restaurer le conducteur :name ?',
    ],
]; 