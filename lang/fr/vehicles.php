<?php

return [
    'title' => 'Véhicules',
    'breadcrumbs' => [
        'index' => 'Véhicules',
        'create' => 'Ajouter un véhicule',
        'edit' => 'Modifier le véhicule',
        'show' => 'Détails du véhicule',
    ],
    'fields' => [
        'registration' => 'Immatriculation',
        'brand' => 'Marque',
        'model' => 'Modèle',
        'color' => 'Couleur',
        'year' => 'Année',
        'vin' => 'NIV',
        'tenant' => 'Client',
        'device' => 'Dispositif',
    ],
    'actions' => [
        'create' => 'Ajouter un véhicule',
        'edit' => 'Modifier',
        'view' => 'Voir',
        'delete' => 'Supprimer',
        'restore' => 'Restaurer',
    ],
    'placeholders' => [
        'registration' => 'Saisir l\'immatriculation du véhicule',
        'brand' => 'Sélectionner la marque du véhicule',
        'model' => 'Saisir le modèle du véhicule',
        'color' => 'Saisir la couleur du véhicule',
        'year' => 'Saisir l\'année du véhicule',
        'vin' => 'Saisir le numéro d\'identification du véhicule',
        'tenant' => 'Sélectionner le client',
        'device' => 'Sélectionner le dispositif',
        'has_device' => 'Filtrer par statut de dispositif',
    ],
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
    ],
    'show' => [
        'title' => 'Véhicule : :registration',
        'heading' => 'Détails du véhicule',
        'description' => 'Voir les informations complètes sur ce véhicule',
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
]; 