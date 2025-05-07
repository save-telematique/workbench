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
        'list' => 'Tous les conducteurs',
        'information' => 'Informations',
        'license' => 'Détails du permis',
        'settings' => 'Paramètres',
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
        'surname' => 'Saisissez le nom',
        'firstname' => 'Saisissez le prénom',
        'phone' => 'Saisissez le numéro de téléphone',
        'license_number' => 'Saisissez le numéro de permis',
        'card_issuing_country' => 'Saisissez le pays d\'émission',
        'card_number' => 'Saisissez le numéro de carte',
        'tenant' => 'Sélectionner un tenant',
        'user' => 'Sélectionner un utilisateur',
    ],
    
    'filters' => [
        'tenant' => 'Tenant',
    ],
    
    'sections' => [
        'driver_info' => 'Informations',
        'driver_info_description' => 'Informations personnelles du conducteur',
        'license_info' => 'Informations du permis',
        'license_info_description' => 'Détails concernant le permis et la carte du conducteur',
        'tenant_info' => 'Informations du tenant',
        'tenant_info_description' => 'Associer ce conducteur à un tenant',
        'user_info' => 'Informations du compte utilisateur',
    ],
    
    'actions' => [
        'create' => 'Nouveau conducteur',
        'import' => 'Importer des conducteurs',
    ],
    
    'create' => [
        'title' => 'Créer un conducteur',
        'heading' => 'Ajouter un nouveau conducteur',
        'description' => 'Créer un nouveau conducteur dans le système',
        'card' => [
            'title' => 'Détails du conducteur',
            'description' => 'Saisissez les informations du conducteur'
        ],
        'success_message' => 'Conducteur créé avec succès !',
        'submit_button' => 'Créer le conducteur',
    ],
    
    'edit' => [
        'title' => 'Modifier le conducteur',
        'heading' => 'Modifier le conducteur',
        'description' => 'Mettre à jour les détails de ce conducteur',
        'form_title' => 'Modifier les détails du conducteur',
        'form_description' => 'Mettre à jour les informations pour :name',
    ],
    
    'delete' => [
        'title' => 'Supprimer le conducteur',
        'description' => 'Êtes-vous sûr de vouloir supprimer le conducteur :name ? Cette action est irréversible.',
    ],
    
    'restore' => [
        'title' => 'Restaurer le conducteur',
        'description' => 'Êtes-vous sûr de vouloir restaurer le conducteur :name ?',
    ],
    
    'input_methods' => [
        'manual' => 'Saisie manuelle',
        'scan' => 'Scanner le document',
    ],
    
    'scan' => [
        'upload_title' => 'Télécharger le document de permis',
        'upload_description' => 'Téléchargez un permis ou une carte de conducteur pour extraire automatiquement les informations',
        'select_image' => 'Sélectionner une image',
        'change_image' => 'Changer l\'image',
        'scanning' => 'Analyse du document...',
        'scanning_hint' => 'Nous recherchons le nom, le numéro de permis et les dates',
        'success' => 'Document analysé avec succès ! Les informations ont été appliquées au formulaire.',
        'driver_license_document' => 'Document de permis de conduire',
        'error' => 'Échec de l\'analyse du document',
        'error_no_image' => 'Veuillez sélectionner une image à télécharger',
        'error_invalid_format' => 'Format de fichier invalide. Veuillez télécharger un fichier JPG, PNG ou PDF',
        'error_file_too_large' => 'Fichier trop volumineux. La taille maximale est de 10 Mo',
        'error_reading_file' => 'Impossible de lire le fichier téléchargé',
        'error_no_data_extracted' => 'Aucune information de conducteur n\'a pu être extraite de ce document',
    ],
    
    'user_central' => 'Utilisateur central',
    'no_users_for_tenant' => 'Aucun utilisateur n\'est disponible pour ce tenant',
    
    'card' => [
        'title' => 'CARTE DE CONDUCTEUR',
        'surname' => '1. Nom',
        'firstname' => '2. Prénom',
        'birthdate' => '3. Date de naissance',
        'issuing_date' => '4a. Date d\'émission',
        'expiration_date' => '4b. Date d\'expiration',
        'license_number' => '5a. N° de permis',
        'card_number' => '5b. N° de carte',
    ],
    
    // Import
    'import' => [
        'title' => 'Importer des conducteurs',
        'description' => 'Importer des données de conducteurs depuis un fichier CSV',
        'upload_tab' => 'Télécharger le fichier',
        'review_tab' => 'Vérifier les données',
        'select_tenant_title' => 'Sélectionner un client',
        'select_tenant_desc' => 'Choisissez le client auquel ces conducteurs seront importés',
        'tenant_required' => 'Un client doit être sélectionné avant de procéder à l\'importation',
        'success_message' => ':count conducteurs importés avec succès',
        'confirm_title' => 'Confirmer l\'importation des conducteurs',
        'confirm_description' => 'Vous êtes sur le point d\'importer :count conducteurs. Cette action ne peut pas être annulée. Voulez-vous continuer ?',
    ],
]; 