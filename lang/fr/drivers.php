<?php

return [
    'title' => 'Conducteurs',
    'singular' => 'Conducteur',
    'placeholder' => 'Sélectionner un conducteur',
    
    'breadcrumbs' => [
        'drivers' => 'Conducteurs',
        'create' => 'Nouveau conducteur',
        'edit' => 'Modifier le conducteur',
        'show' => 'Détails du conducteur',
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
        'id' => 'ID',
        'surname' => 'Nom',
        'firstname' => 'Prénom',
        'license_number' => 'Numéro de permis',
        'card_number' => 'Numéro de carte conducteur',
        'card_issuing_country' => 'Pays d\'émission de la carte',
        'card_issuing_date' => 'Date d\'émission de la carte',
        'card_expiration_date' => 'Date d\'expiration de la carte',
        'birthdate' => 'Date de naissance',
        'phone' => 'Numéro de téléphone',
        'user' => 'Utilisateur associé',
        'tenant' => 'Client',
        'created_at' => 'Créé le',
        'updated_at' => 'Mis à jour le',
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
        'create' => 'Créer un conducteur',
        'edit' => 'Modifier le conducteur',
        'delete' => 'Supprimer le conducteur',
        'restore' => 'Restaurer le conducteur',
        'scan_document' => 'Scanner un document',
        'import' => 'Importer des conducteurs',
    ],
    
    'messages' => [
        'created_successfully' => 'Conducteur créé avec succès.',
        'updated_successfully' => 'Conducteur mis à jour avec succès.',
        'deleted_successfully' => 'Conducteur supprimé avec succès.',
        'restored_successfully' => 'Conducteur restauré avec succès.',
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
        'title' => 'Scanner un document conducteur',
        'instruction' => 'Téléversez une photo du permis ou de la carte conducteur pour extraire les informations',
        'error' => 'Une erreur est survenue lors du scan du document.',
        'error_no_image' => 'Veuillez téléverser un fichier image.',
        'error_invalid_format' => 'Le fichier doit être une image ou un PDF (JPEG, PNG, JPG, WEBP, PDF).',
        'error_file_too_large' => 'La taille du fichier ne doit pas dépasser 10 Mo.',
        'error_no_type' => 'Veuillez spécifier le type de document.',
        'error_invalid_type' => 'Type de document invalide. Types autorisés : permis, carte.',
        'scanning' => 'Scan du document en cours...',
        'scan_success' => 'Document scanné avec succès.',
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
        'description' => 'Téléversez un fichier CSV contenant des données de conducteurs',
        'template_link' => 'Télécharger le modèle',
        'drop_file' => 'Déposez votre fichier CSV ici ou cliquez pour parcourir',
        'parsing' => 'Analyse du fichier...',
        'parsed' => 'Fichier analysé. Prêt à importer.',
        'importing' => 'Importation en cours...',
        'imported' => 'Conducteurs importés avec succès.',
        'error' => 'Erreur lors de l\'importation.',
        'confirm_title' => 'Confirmer l\'importation',
        'confirm_description' => 'Vous êtes sur le point d\'importer :count conducteurs. Cette action ne peut pas être annulée. Voulez-vous continuer ?',
    ],
]; 