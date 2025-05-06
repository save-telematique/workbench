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
        'title' => 'Messages du dispositif',
        'description' => 'Consulter les messages bruts reçus de ce dispositif',
        'message_count' => 'messages',
        'no_messages' => 'Aucun message trouvé pour ce dispositif',
        'no_messages_title' => 'Aucun message disponible',
        'no_messages_for_date' => 'Aucun message trouvé pour le :date',
        'processed' => 'Traité',
        'not_processed' => 'Non traité',
        'message_data' => 'Données du message',
        'location' => 'Localisation',
        'processing_info' => 'Informations de traitement',
        'coordinates' => 'Coordonnées',
        'speed' => 'Vitesse',
        'heading' => 'Direction',
        'ignition' => 'Contact',
        'ignition_on' => 'Allumé',
        'ignition_off' => 'Éteint',
        'moving' => 'Mouvement',
        'moving_state' => 'En mouvement',
        'stationary' => 'Stationnaire',
        'address' => 'Adresse',
        'recorded_at' => 'Enregistré le',
        'received_at' => 'Reçu le',
        'processed_at' => 'Traité le',
        'processing_time' => 'Temps de traitement',
        'seconds' => 'secondes',
        'ip' => 'Adresse IP',
        'status' => 'Statut',
        'status_processed' => 'Traité',
        'status_pending' => 'En attente',
        'no_data' => 'Aucune donnée disponible',
        'view_on_map' => 'Voir sur la carte',
        'vehicle_locations' => 'Localisations du véhicule',
        'vehicle_location_map' => 'Carte de localisation du véhicule',
        'locations' => 'localisations',
        'no_location_data' => 'Aucune donnée de localisation',
        'no_locations_available' => 'Aucune information de localisation n\'est disponible pour cette date',
        'path_trace' => 'Trajet du véhicule',
        'currently_moving' => 'Actuellement en mouvement',
        'active' => 'Actif',
    ],
    
    // Map-related translations
    'map' => [
        'show_all_points' => 'Afficher tous les points',
        'hide_all_points' => 'Masquer les points',
        'reset_view' => 'Réinitialiser la vue',
        'fullscreen' => 'Plein écran',
        'exit_fullscreen' => 'Quitter le plein écran',
        'heading' => 'Direction',
        'first_point' => 'Premier point',
        'last_point' => 'Dernier point',
        'km_per_hour' => 'km/h',
        'jump_to_start' => 'Aller au début',
        'jump_to_end' => 'Aller à la fin',
        'play' => 'Lire',
        'pause' => 'Pause',
        'playback_speed' => 'Vitesse de lecture',
    ],
    
    // Confirmations for actions
    'confirmations' => [
        'delete' => 'Êtes-vous sûr de vouloir supprimer ce boitier ?',
        'restore' => 'Êtes-vous sûr de vouloir restaurer ce boitier ?',
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
        'messages' => 'Messages',
    ],
    
    // Filters
    'filters' => [
        'tenant' => 'Client',
        'device_type' => 'Type de boitier',
        'vehicle' => 'Véhicule',
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
    
    'input_methods' => [
        'manual' => 'Saisie manuelle',
        'scan' => 'Scanner un code QR',
    ],
    
    'scan' => [
        'upload_title' => 'Téléverser une photo',
        'upload_description' => 'Prenez une photo du dispositif montrant les codes QR pour extraire automatiquement le numéro de série et l\'IMEI',
        'select_image' => 'Sélectionner une image',
        'change_image' => 'Changer d\'image',
        'scanning' => 'Analyse en cours...',
        'scanning_hint' => 'Cela peut prendre quelques instants. Nous analysons les codes QR et autres informations visibles sur le dispositif.',
        'success' => 'Codes QR détectés avec succès. Les champs IMEI et numéro de série ont été préremplis.',
        'error' => 'Impossible de détecter les codes QR. Veuillez réessayer ou saisir les informations manuellement.',
        'error_invalid_format' => 'Format d\'image non valide. Formats acceptés : JPG, PNG et WebP.',
        'error_file_too_large' => 'Fichier trop volumineux. La taille maximale est de 10 Mo.',
        'error_reading_file' => 'Erreur lors de la lecture du fichier. Veuillez réessayer avec une autre image.',
        'error_cancelled' => 'Analyse annulée. Veuillez réessayer.',
        'error_no_image' => 'Aucune image n\'a été fournie. Veuillez sélectionner une image à analyser.',
        'error_empty_image' => 'L\'image fournie est vide ou corrompue. Veuillez réessayer avec une autre image.',
        'error_no_data_extracted' => 'Aucune information n\'a pu être extraite de l\'image. Veuillez vérifier que les codes QR sont bien visibles ou saisir les informations manuellement.',
        'continue_to_form' => 'Continuer vers le formulaire',
        'continue_tooltip' => 'Passez au formulaire pour compléter les informations manquantes',
    ],
]; 