<?php

return [
    // General
    'title' => 'Boitiers',
    'single' => 'Boitier',
    'description' => 'Gérer tous les boitiers télématiques du système',
    
    // Fields
    'fields' => [
        'id' => 'ID',
        'tenant' => 'Client',
        'device_type' => 'Type de boitier',
        'vehicle' => 'Véhicule',
        'firmware_version' => 'Version du micrologiciel',
        'serial_number' => 'Numéro de série',
        'sim_number' => 'Numéro SIM',
        'imei' => 'IMEI',
        'created_at' => 'Créé le',
        'updated_at' => 'Mis à jour le',
        'deleted_at' => 'Supprimé le',
    ],
    
    // Actions
    'actions' => [
        'create' => 'Ajouter un boitier',
        'edit' => 'Modifier le boitier',
        'delete' => 'Supprimer le boitier',
        'restore' => 'Restaurer le boitier',
        'force_delete' => 'Supprimer définitivement',
        'view' => 'Voir le boitier',
        'assign_vehicle' => 'Assigner à un véhicule',
        'unassign_vehicle' => 'Dissocier du véhicule',
        'unassign_vehicle_short' => 'Dissocier',
        'back_to_list' => 'Retour à la liste',
    ],
    
    // Messages
    'created' => 'Boitier créé avec succès.',
    'updated' => 'Boitier mis à jour avec succès.',
    'deleted' => 'Boitier supprimé avec succès.',
    'restored' => 'Boitier restauré avec succès.',
    'force_deleted' => 'Boitier définitivement supprimé.',
    'vehicle_assigned' => 'Boitier assigné au véhicule avec succès.',
    'vehicle_unassigned' => 'Boitier dissocié du véhicule avec succès.',
    'confirm_delete' => 'Êtes-vous sûr de vouloir supprimer ce boitier ?',
    'confirm_restore' => 'Êtes-vous sûr de vouloir restaurer ce boitier ?',
    'confirm_force_delete' => 'Êtes-vous sûr de vouloir supprimer définitivement ce boitier ? Cette action ne peut pas être annulée.',
    'messages' => [
        'updated' => 'Boitier mis à jour avec succès.',
    ],
    
    // Breadcrumbs
    'breadcrumbs' => [
        'index' => 'Boitiers',
        'create' => 'Ajouter un boitier',
        'edit' => 'Modifier un boitier',
        'show' => 'Détails du boitier',
    ],
    
    // Tabs
    'tabs' => [
        'information' => 'Informations',
        'history' => 'Historique',
        'maintenance' => 'Maintenance',
    ],
    
    // Filters
    'filters' => [
        'tenant' => 'Client',
        'device_type' => 'Type de boitier',
        'deleted' => 'Statut de suppression',
    ],
    
    // Placeholders
    'placeholders' => [
        'serial_number' => 'Entrez le numéro de série du boitier',
        'sim_number' => 'Entrez le numéro de la carte SIM',
        'imei' => 'Entrez le numéro IMEI',
        'firmware_version' => 'Entrez la version du micrologiciel',
        'device_type' => 'Sélectionnez le type de boitier',
        'vehicle' => 'Sélectionnez un véhicule',
        'tenant' => 'Sélectionnez un client',
    ],
    
    // List related translations
    'list' => [
        'heading' => 'Boitiers',
        'description' => 'Gérer tous les boitiers télématiques du système',
        'no_devices' => 'Aucun boitier trouvé',
        'get_started' => 'Commencez par ajouter votre premier boitier',
    ],
    
    // Create related translations
    'create' => [
        'heading' => 'Ajouter un boitier',
        'description' => 'Créer un nouveau boitier télématique dans le système',
        'card' => [
            'title' => 'Informations du boitier',
            'description' => 'Veuillez remplir les informations pour créer un nouveau boitier',
        ],
        'success_message' => 'Boitier créé avec succès',
        'submit_button' => 'Créer le boitier',
    ],
    
    // Edit related translations
    'edit' => [
        'heading' => 'Modifier le boitier :serial',
        'description' => 'Modifier les informations du boitier',
        'form_title' => 'Modifier les détails du boitier',
        'form_description' => 'Mettez à jour les informations pour le boitier :serial',
    ],
    
    // Show related translations
    'show' => [
        'heading' => 'Détails du boitier',
        'description' => 'Consulter et gérer les informations du boitier',
        'info_section_title' => 'Informations du boitier',
        'connections_title' => 'Connexions',
    ],
]; 