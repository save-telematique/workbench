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
        'type' => 'Type',
        'vin' => 'NIV',
        'imei' => 'IMEI',
        'tenant' => 'Client',
        'device' => 'Appareil',
        'group' => 'Groupe',
        'tenant_name' => 'Nom du client',
        'device_serial' => 'Numéro de série',
        'device_type' => 'Type d\'appareil',
        'vehicle_type' => 'Type de véhicule',
    ],
    'types' => [
        'title' => 'Types',
        'car' => 'Voiture',
        'truck' => 'Camion',
        'trailer' => 'Remorque',
    ],
    'actions' => [
        'create' => 'Ajouter un véhicule',
        'edit' => 'Modifier',
        'view' => 'Voir',
        'delete' => 'Supprimer',
        'restore' => 'Restaurer',
        'import' => 'Importer',
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
        'group' => 'Sélectionner un groupe (optionnel)',
        'has_device' => 'Filtrer par statut de dispositif',
        'vehicle_type' => 'Sélectionner le type de véhicule',
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
                'description' => 'Informations de base sur ce véhicule',
            ],
            'tracking' => [
                'title' => 'Suivi de position',
                'description' => 'Position en temps réel et historique des trajets',
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
        'activities' => 'Activités',
        'driver' => 'Chauffeur',
        'current_driver' => 'Chauffeur actuel',
        'navigation' => 'Navigation',
        'unknown_location' => 'Emplacement inconnu',
        'moving' => 'En mouvement',
        'stationary' => 'À l\'arrêt',
        'unknown_activity' => 'Activité inconnue',
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
    'scan' => [
        'upload_title' => 'Téléverser un fichier',
        'upload_description' => 'Prenez une photo du document d\'immatriculation ou téléversez un PDF pour extraire automatiquement les numéros d\'immatriculation et VIN',
        'select_image' => 'Sélectionner un fichier',
        'change_image' => 'Changer de fichier',
        'scanning' => 'Analyse en cours...',
        'scanning_hint' => 'Cela peut prendre un moment. Nous analysons le document pour les numéros d\'immatriculation et VIN.',
        'success' => 'Informations détectées avec succès. Les champs d\'immatriculation et VIN ont été pré-remplis.',
        'error' => 'Impossible de détecter les informations. Veuillez réessayer ou saisir les informations manuellement.',
        'error_invalid_format' => 'Format de fichier non valide. Formats acceptés : JPG, PNG, WebP et PDF.',
        'error_file_too_large' => 'Fichier trop volumineux. La taille maximale est de 10 Mo.',
        'error_reading_file' => 'Erreur lors de la lecture du fichier. Veuillez réessayer avec un autre fichier.',
        'error_cancelled' => 'Analyse annulée. Veuillez réessayer.',
        'error_no_image' => 'Aucun fichier n\'a été fourni. Veuillez sélectionner une image ou un PDF à analyser.',
        'error_empty_image' => 'Le fichier fourni est vide ou corrompu. Veuillez réessayer avec un autre fichier.',
        'error_no_data_extracted' => 'Aucune information n\'a pu être extraite du fichier. Veuillez vous assurer que le document d\'immatriculation est clairement visible ou saisir les informations manuellement.',
        'error_converting_pdf' => 'Échec de la conversion du PDF en image pour l\'analyse. Veuillez réessayer avec un fichier différent.',
        'continue_to_form' => 'Continuer vers le formulaire',
        'continue_tooltip' => 'Passer au formulaire pour compléter les informations manquantes',
        'vehicle_registration_document' => 'Document d\'immatriculation du véhicule',
    ],
    'input_methods' => [
        'manual' => 'Saisie manuelle',
        'scan' => 'Scanner le document',
    ],
    'import' => [
        'title' => 'Importer des véhicules',
        'description' => 'Importez des véhicules à partir d\'un fichier CSV ou Excel.',
        'upload_tab' => 'Télécharger',
        'review_tab' => 'Vérifier et importer',
        'upload_title' => 'Télécharger un fichier',
        'upload_description' => 'Sélectionnez un fichier CSV ou Excel contenant les données des véhicules à importer.',
        'file_type_description' => 'Formats acceptés: CSV, Excel (.xlsx, .xls)',
        'select_file' => 'Sélectionner un fichier',
        'analyzing' => 'Analyse du fichier...',
        'analyzing_hint' => 'Nous utilisons l\'IA pour détecter automatiquement les colonnes de votre fichier.',
        'analysis_success' => '{count} véhicules ont été détectés dans votre fichier.',
        'tenant_hint' => 'Si aucun client n\'est sélectionné, les véhicules seront importés sans client assigné.',
        'success_message' => '{count} véhicules ont été importés avec succès.',
        'error' => 'Une erreur est survenue lors de l\'importation.',
        'tenant_required' => 'Vous devez sélectionner un client pour importer des véhicules.',
        'select_tenant_title' => 'Sélectionner un client',
        'select_tenant_desc' => 'Sélectionnez le client pour lequel vous souhaitez importer des véhicules.',
        'confirm_title' => 'Confirmer l\'importation des véhicules',
        'confirm_description' => 'Vous êtes sur le point d\'importer :count véhicules. Cette action ne peut pas être annulée. Voulez-vous continuer ?',
    ],
    'messages' => [
        'created_successfully' => 'Véhicule créé avec succès.',
        'updated_successfully' => 'Véhicule mis à jour avec succès.',
        'deleted_successfully' => 'Véhicule supprimé avec succès.',
        'restored_successfully' => 'Véhicule restauré avec succès.',
        'no_vehicles_with_location' => 'Aucun véhicule avec données de position',
        'no_vehicle_locations_available' => 'Aucun véhicule ne dispose de données de position pour le moment',
        'no_route_data' => 'Aucune donnée de trajet disponible',
        'no_locations_for_date' => 'Aucune donnée de position disponible pour la date sélectionnée',
        'no_current_location' => 'Aucune donnée de position actuelle disponible pour ce véhicule',
        'ignition_on' => 'Contact ON',
        'ignition_off' => 'Contact OFF',
        'moving_state' => 'En mouvement',
        'stationary' => 'À l\'arrêt',
        'active' => 'Actif',
    ],
    'fleet_map' => [
        'title' => 'Carte de Flotte',
        'vehicles' => 'véhicules',
        'vehicles_on_map' => 'véhicules sur la carte',
        'last_updated' => 'Dernière mise à jour',
        'auto_refresh' => 'Actualisation auto',
    ],
    'status' => [
        'title' => 'Statut',
        'moving' => 'En mouvement',
        'idling' => 'Moteur allumé',
        'parked' => 'Stationné',
        'active_session' => 'Session active',
    ],
    'map' => [
        'vehicles' => 'véhicules',
        'vehicles_on_map' => 'véhicules sur la carte',
        'last_updated' => 'Dernière mise à jour',
        'auto_refresh' => 'Rafraîchissement auto',
        'refresh' => 'Rafraîchir',
        'reset_view' => 'Réinitialiser la vue',
        'fullscreen' => 'Plein écran',
        'exit_fullscreen' => 'Quitter le plein écran',
        'change_style' => 'Changer de style',
        'legend_title' => 'Légende',
        'activity_legend' => 'Activités',
        'km_per_hour' => 'km/h',
        'hide_legend' => 'Masquer la légende',
        'show_legend' => 'Afficher la légende',
        'style_streets' => 'Rues',
        'style_light' => 'Clair',
        'style_dark' => 'Sombre',
        'style_satellite' => 'Satellite',
        'hide_points' => 'Masquer les points',
        'show_all_points' => 'Afficher tous les points',
        'speed' => 'Vitesse',
        'total_points' => 'Points totaux',
        'start_time' => 'Heure de début',
        'end_time' => 'Heure de fin',
        'history_mode' => 'Mode historique',
        'current_position' => 'Position actuelle',
        'route_points' => 'Points de trajet',
        'enable_camera_follow' => 'Activer le suivi',
        'disable_camera_follow' => 'Désactiver le suivi',
        'current' => 'Actuel',
        'history' => 'Historique',
        'jump_to_start' => 'Aller au début',
        'jump_to_end' => 'Aller à la fin',
        'play' => 'Lecture',
        'pause' => 'Pause',
        'playback_speed' => 'Vitesse de lecture',
        'heading' => 'Cap',
    ],
    'activity' => [
        'driving' => 'Conduite',
        'rest' => 'Repos',
        'work' => 'Travail',
        'available' => 'Disponible',
        'break' => 'Pause',
        'unknown' => 'Inconnu',
        'removed_card' => 'Carte retirée',
    ],
    'activities' => [
        'title' => 'Activités',
        'title_with_vehicle' => 'Activités - {registration}',
        'breadcrumb' => 'Activités',
        'daily_timeline' => 'Chronologie journalière',
        'duration' => 'Durée',
        'driving_time' => 'Temps de conduite',
        'day_change' => 'Changement de jour',
        'gap' => 'Période d\'inactivité',
        'show_gaps' => 'Afficher les pauses',
        'filters' => [
            'filter' => 'Filtrer',
            'date_range' => 'Période',
            'driver' => 'Chauffeur',
            'activity' => 'Activité',
            'all_drivers' => 'Tous les chauffeurs',
            'all_activities' => 'Toutes les activités',
            'minimum_duration' => 'Durée min.',
            'minutes' => 'minutes',
        ],
        'tabs' => [
            'working_sessions' => 'Sessions de travail',
            'activity_changes' => 'Changements d\'activité',
        ],
        'stats' => [
            'total_driving_time' => 'Temps total de conduite',
            'total_working_time' => 'Temps de travail total',
            'time_summary' => 'Résumé du temps',
            'current_driver' => 'Chauffeur actuel',
            'active_driver' => 'Chauffeur actif pour ce véhicule',
            'current_activity' => 'Activité actuelle',
            'in_hours' => 'En heures',
            'working' => 'Travail',
            'rest' => 'Repos',
            'activity_summary' => 'Résumé des activités',
            'total' => 'Total',
        ],
        'charts' => [
            'time_distribution' => 'Répartition du temps',
            'activity_distribution' => 'Répartition des activités',
        ],
    ],
    'fleet_stats' => [
        'title' => 'Statistiques de la flotte',
        'total_vehicles' => 'Total véhicules',
        'moving' => 'En mouvement',
        'idling' => 'En marche',
        'parked' => 'Stationnés',
        'active_percentage' => 'Véhicules actifs',
    ],
]; 