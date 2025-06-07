<?php

return [
    'title' => 'Géo-barrières',
    'single' => 'Géo-barrière',

    'list' => [
        'heading' => 'Géo-barrières',
        'description' => 'Gérer les limites géographiques et les zones de surveillance des véhicules.',
        'no_geofences' => 'Aucune géo-barrière trouvée.',
    ],

    'breadcrumbs' => [
        'index' => 'Géo-barrières',
        'show' => 'Voir la géo-barrière',
        'create' => 'Créer une géo-barrière',
        'edit' => 'Modifier la géo-barrière',
    ],

    'fields' => [
        'name' => 'Nom',
        'group' => 'Groupe',
        'tenant' => 'Tenant',
        'is_active' => 'Statut',
        'geojson_path' => 'Chemin géographique',
        'created_at' => 'Créé le',
        'updated_at' => 'Modifié le',
    ],

    'status' => [
        'active' => 'Actif',
        'inactive' => 'Inactif',
    ],

    'filters' => [
        'all_groups' => 'Tous les groupes',
        'all_tenants' => 'Tous les tenants',
        'all_statuses' => 'Tous les statuts',
        'active' => 'Actifs seulement',
        'inactive' => 'Inactifs seulement',
    ],

    'actions' => [
        'create' => 'Créer une géo-barrière',
        'edit' => 'Modifier',
        'delete' => 'Supprimer',
        'view' => 'Voir',
    ],

    'show' => [
        'title' => 'Détails de la géo-barrière',
        'sections' => [
            'details' => [
                'title' => 'Informations de base',
                'description' => 'Informations générales sur cette géo-barrière.',
            ],
            'map' => [
                'title' => 'Zone géographique',
                'description' => 'Représentation visuelle des limites de la géo-barrière.',
            ],
        ],
    ],

    'create' => [
        'title' => 'Créer une nouvelle géo-barrière',
        'heading' => 'Créer une nouvelle géo-barrière',
        'description' => 'Définir une nouvelle limite géographique pour la surveillance.',
    ],

    'edit' => [
        'title' => 'Modifier la géo-barrière',
        'heading' => 'Modifier la géo-barrière : :name',
        'description' => 'Modifier les paramètres et limites de la géo-barrière.',
    ],

    'form' => [
        'sections' => [
            'basic_information' => [
                'title' => 'Informations de base',
                'description' => 'Définir le nom et le statut de la géo-barrière.',
            ],
            'assignment' => [
                'title' => 'Affectation',
                'description' => 'Assigner cette géo-barrière à un groupe (optionnel).',
            ],
            'geographic_area' => [
                'title' => 'Zone géographique',
                'description' => 'Définir les limites géographiques de cette géo-barrière.',
            ],
        ],
        'placeholders' => [
            'name' => 'Saisir le nom de la géo-barrière (ex: "Zone Dépôt")',
            'group' => 'Sélectionner un groupe (optionnel)',
            'tenant' => 'Sélectionner le tenant',
            'status' => 'Sélectionner le statut',
        ],
        'help' => [
            'name' => 'Choisir un nom descriptif pour une identification facile.',
            'group' => 'Optionnellement assigner à un groupe pour une meilleure organisation.',
            'is_active' => 'Les géo-barrières actives sont surveillées pour les entrées et sorties de véhicules.',
            'map' => 'Utilisez les outils de dessin pour définir la zone géographique de la géo-barrière.',
        ],
        'buttons' => [
            'save' => 'Enregistrer la géo-barrière',
            'cancel' => 'Annuler',
        ],
    ],

    'sidebar' => [
        'information' => 'Informations',
    ],

    'map' => [
        'title' => 'Carte des géo-barrières',
        'placeholder' => 'La carte interactive sera affichée ici',
        'no_data' => 'Aucune donnée géographique disponible',
        'draw_polygon' => 'Dessiner un polygone',
        'edit_polygon' => 'Modifier le polygone',
        'clear_all' => 'Effacer tout',
        'show_existing' => 'Afficher les géo-barrières existantes',
        'hide_existing' => 'Masquer les géo-barrières existantes',
        'reset_view' => 'Réinitialiser la vue',
        'fullscreen' => 'Plein écran',
        'exit_fullscreen' => 'Quitter le plein écran',
        'drawing_mode' => 'Mode dessin',
        'editing_mode' => 'Mode édition',
        'click_polygon_to_start' => 'Cliquez sur l\'outil polygone pour commencer le dessin',
        'geofences' => 'géo-barrières',
    ],

    'unnamed' => 'Géo-barrière sans nom',

    'validation' => [
        'name' => [
            'required' => 'Le nom de la géo-barrière est requis.',
            'string' => 'Le nom de la géo-barrière doit être du texte.',
            'max' => 'Le nom de la géo-barrière ne peut pas dépasser :max caractères.',
        ],
        'geojson_path' => [
            'required' => 'Le chemin géographique est requis.',
            'json' => 'Le chemin géographique doit être du GeoJSON valide.',
        ],
        'is_active' => [
            'boolean' => 'Le statut doit être actif ou inactif.',
        ],
        'group_id' => [
            'exists' => 'Le groupe sélectionné n\'existe pas.',
        ],
        'tenant_id' => [
            'required' => 'Un tenant doit être sélectionné.',
            'exists' => 'Le tenant sélectionné n\'existe pas.',
        ],
    ],

    'confirmations' => [
        'delete_title' => 'Supprimer la géo-barrière',
        'delete_description' => 'Êtes-vous sûr de vouloir supprimer cette géo-barrière ? Cette action peut être annulée.',
    ],

    'messages' => [
        'created' => 'Géo-barrière créée avec succès.',
        'updated' => 'Géo-barrière mise à jour avec succès.',
        'deleted' => 'Géo-barrière supprimée avec succès.',
        'not_found' => 'Géo-barrière non trouvée.',
    ],
]; 