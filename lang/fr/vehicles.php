<?php

return [
    'title' => 'Véhicules',
    'single' => 'Véhicule',
    'breadcrumbs' => [
        'index' => 'Véhicules',
        'create' => 'Ajouter un véhicule',
        'edit' => 'Modifier le véhicule',
        'show' => 'Détails du véhicule',
    ],
    'list' => [
        'heading' => 'Liste des véhicules',
        'description' => 'Gérer tous les véhicules du système',
    ],
    'fields' => [
        'registration' => 'Immatriculation',
        'brand' => 'Marque',
        'model' => 'Modèle',
        'color' => 'Couleur',
        'year' => 'Année',
        'vin' => 'NIV',
        'imei' => 'IMEI',
        'tenant' => 'Client',
        'device' => 'Appareil',
        'tenant_name' => 'Nom du client',
        'device_serial' => 'Numéro de série',
        'device_type' => 'Type d\'appareil',
    ],
    'actions' => [
        'create' => 'Ajouter un véhicule',
        'edit' => 'Modifier',
        'view' => 'Voir',
        'delete' => 'Supprimer',
        'restore' => 'Restaurer',
        'back_to_list' => 'Retour à la liste',
        'assign_tenant' => 'Assigner un client',
        'change_tenant' => 'Changer de client',
        'assign_device' => 'Assigner un dispositif',
        'change_device' => 'Changer de dispositif',
    ],
    'placeholders' => [
        'registration' => 'Saisir l\'immatriculation du véhicule',
        'brand' => 'Sélectionner la marque du véhicule',
        'model' => 'Saisir le modèle du véhicule',
        'color' => 'Saisir la couleur du véhicule',
        'year' => 'Saisir l\'année du véhicule',
        'vin' => 'Saisir le numéro d\'identification du véhicule',
        'imei' => 'Saisir le numéro IMEI à 15 chiffres',
        'tenant' => 'Sélectionner le client',
        'device' => 'Sélectionner le dispositif',
        'has_device' => 'Filtrer par statut de dispositif',
    ],
    'loading_models' => 'Chargement des modèles...',
    'create' => [
        'heading' => 'Ajouter un nouveau véhicule',
        'description' => 'Créer un nouveau véhicule dans le système',
        'card' => [
            'title' => 'Informations du véhicule',
            'description' => 'Saisir les détails du véhicule',
        ],
        'success_message' => 'Véhicule ajouté avec succès',
        'submit_button' => 'Créer le véhicule',
    ],
    'edit' => [
        'heading' => 'Modifier le véhicule',
        'description' => 'Mettre à jour les informations du véhicule',
        'card' => [
            'title' => 'Informations du véhicule',
            'description' => 'Mettre à jour les détails du véhicule',
        ],
        'success_message' => 'Véhicule mis à jour avec succès',
        'submit_button' => 'Mettre à jour le véhicule',
        'form_title' => 'Modifier le véhicule',
        'form_description' => 'Modifier les détails du véhicule :registration',
    ],
    'show' => [
        'title' => 'Véhicule : :registration',
        'heading' => 'Détails du véhicule',
        'description' => 'Voir les informations complètes sur ce véhicule',
        'edit_details' => [
            'title' => 'Modifier les détails du véhicule',
            'description' => 'Mettre à jour les informations du véhicule',
        ],
        'sections' => [
            'details' => [
                'title' => 'Détails du véhicule',
                'description' => 'Informations de base sur le véhicule',
            ],
            'associations' => [
                'title' => 'Associations',
                'description' => 'Informations sur le client et le dispositif associés',
            ],
            'metadata' => [
                'title' => 'Métadonnées',
                'description' => 'Informations système concernant cet enregistrement',
            ],
        ],
    ],
    'confirmations' => [
        'delete' => 'Êtes-vous sûr de vouloir supprimer ce véhicule ?',
        'delete_title' => 'Supprimer le véhicule',
        'delete_description' => 'Cette action retirera le véhicule de l\'utilisation active. Vous pourrez le restaurer ultérieurement si nécessaire.',
        'restore' => 'Êtes-vous sûr de vouloir restaurer ce véhicule ?',
    ],
    'filters' => [
        'tenant' => 'Filtrer par client',
        'brand' => 'Filtrer par marque',
        'has_device' => 'Avec dispositif',
    ],
    'sidebar' => [
        'information' => 'Véhicules',
        'settings' => 'Paramètres',
    ],
    'dialogs' => [
        'tenant_assignment' => [
            'title' => 'Assigner un client',
            'description' => 'Sélectionner un client pour ce véhicule',
            'search_placeholder' => 'Rechercher un client...',
        ],
        'device_assignment' => [
            'title' => 'Assigner un dispositif',
            'description' => 'Sélectionner un dispositif pour ce véhicule',
            'search_placeholder' => 'Rechercher un dispositif...',
        ],
    ],
]; 