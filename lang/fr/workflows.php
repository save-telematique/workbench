<?php

return [
    'title' => 'Workflows',
    'description' => 'Automatisez vos processus métier avec des workflows configurables',
    
    'breadcrumbs' => [
        'index' => 'Workflows',
        'create' => 'Créer un Workflow',
        'edit' => 'Modifier le Workflow',
        'executions' => 'Exécutions',
        'analytics' => 'Analyses',
    ],

    'list' => [
        'heading' => 'Workflows',
        'description' => 'Gérez et configurez les processus métier automatisés',
        'no_workflows' => 'Aucun workflow trouvé',
    ],

    'create' => [
        'heading' => 'Créer un Workflow',
        'description' => 'Créez un nouveau workflow automatisé pour vos processus métier',
    ],

    'edit' => [
        'heading' => 'Modifier le Workflow :name',
        'description' => 'Modifiez la configuration et les paramètres du workflow',
    ],

    'executions' => [
        'heading' => 'Exécutions du Workflow :name',
        'description' => 'Historique des exécutions et performance du workflow',
        'no_executions' => 'Aucune exécution trouvée pour ce workflow',
        'fields' => [
            'id' => 'ID',
            'status' => 'Statut',
            'started_at' => 'Démarré le',
            'completed_at' => 'Terminé le',
            'duration' => 'Durée',
            'triggered_by' => 'Déclenché par',
            'error_message' => 'Message d\'erreur',
        ],
    ],



    'details' => [
        'title' => 'Détails du Workflow',
    ],
    
    'fields' => [
        'name' => 'Nom',
        'description' => 'Description',
        'status' => 'Statut',
        'is_active' => 'Actif',
        'components' => 'Composants',
        'last_execution' => 'Dernière exécution',
        'created_at' => 'Créé le',
        'updated_at' => 'Modifié le',
    ],

    'actions' => [
        'create' => 'Créer un workflow',
        'edit' => 'Modifier',
        'delete' => 'Supprimer',
        'activate' => 'Activer',
        'deactivate' => 'Désactiver',
        'test' => 'Tester',
        'duplicate' => 'Dupliquer',
        'view_executions' => 'Voir les exécutions',
        'log_alert' => 'Journaliser une alerte',
        'create_alert' => 'Créer une Alerte',
    ],

    'events' => [
        'vehicle_location_updated' => 'Position du véhicule mise à jour',
        'vehicle_entered_geofence' => 'Véhicule entré dans une zone géographique',
        'vehicle_exited_geofence' => 'Véhicule sorti d\'une zone géographique',
        'vehicle_speed_exceeded' => 'Vitesse limite dépassée',
        'vehicle_ignition_on' => 'Contact véhicule activé',
        'vehicle_ignition_off' => 'Contact véhicule désactivé',
        'vehicle_movement_started' => 'Démarrage du mouvement véhicule',
        'vehicle_movement_stopped' => 'Arrêt du mouvement véhicule',
        'vehicle_fuel_low' => 'Niveau de carburant faible',
        'vehicle_odometer_updated' => 'Odomètre du véhicule mis à jour',
        'driver_card_inserted' => 'Carte conducteur insérée',
        'driver_card_removed' => 'Carte conducteur retirée',
        'driver_activity_changed' => 'Activité du conducteur changée',
        'driver_driving_time_exceeded' => 'Temps de conduite dépassé',
        'driver_rest_time_insufficient' => 'Temps de repos insuffisant',
        'driver_working_session_started' => 'Session de travail commencée',
        'driver_working_session_ended' => 'Session de travail terminée',
        'device_online' => 'Appareil en ligne',
        'device_offline' => 'Appareil hors ligne',
        'device_message_received' => 'Message d\'appareil reçu',
        'device_error' => 'Erreur d\'appareil',
        'geofence_created' => 'Géofence créée',
        'geofence_updated' => 'Géofence modifiée',
        'geofence_deleted' => 'Géofence supprimée',
        'scheduled_time' => 'Heure programmée',
        'daily_report' => 'Rapport quotidien',
        'weekly_report' => 'Rapport hebdomadaire',
        'monthly_report' => 'Rapport mensuel',
    ],

    'operators' => [
        'equals' => 'Égal à',
        'not_equals' => 'Différent de',
        'greater_than' => 'Supérieur à',
        'greater_than_or_equal' => 'Supérieur ou égal à',
        'less_than' => 'Inférieur à',
        'less_than_or_equal' => 'Inférieur ou égal à',
        'contains' => 'Contient',
        'not_contains' => 'Ne contient pas',
        'starts_with' => 'Commence par',
        'ends_with' => 'Se termine par',
        'regex_match' => 'Correspond à l\'expression régulière',
        'in' => 'Dans la liste',
        'not_in' => 'Pas dans la liste',
        'is_empty' => 'Est vide',
        'is_not_empty' => 'N\'est pas vide',
        'is_null' => 'Est vide',
        'is_not_null' => 'N\'est pas vide',
        'is_true' => 'Est vrai',
        'is_false' => 'Est faux',
        'in_geofence' => 'Dans la géofence',
        'not_in_geofence' => 'Pas dans la géofence',
        'within_distance' => 'À distance de',
        'outside_distance' => 'Hors distance de',
        'between_times' => 'Entre les heures',
        'not_between_times' => 'Pas entre les heures',
        'older_than' => 'Plus ancien que',
        'newer_than' => 'Plus récent que',
        'changed' => 'A changé',
        'changed_from' => 'A changé de',
        'changed_to' => 'A changé vers',
    ],

    'actions_types' => [
        'create_alert' => 'Créer une alerte',
        'update_alert' => 'Mettre à jour une alerte',
        'resolve_alert' => 'Résoudre une alerte',
        'send_email' => 'Envoyer un email',
        'send_sms' => 'Envoyer un SMS',
        'send_push_notification' => 'Envoyer une notification push',
        'send_webhook' => 'Envoyer un webhook',
        'update_field' => 'Mettre à jour un champ',
        'update_status' => 'Mettre à jour le statut',
        'add_tag' => 'Ajouter un tag',
        'remove_tag' => 'Supprimer un tag',
        'lock_vehicle' => 'Verrouiller le véhicule',
        'unlock_vehicle' => 'Déverrouiller le véhicule',
        'disable_vehicle' => 'Désactiver le véhicule',
        'enable_vehicle' => 'Activer le véhicule',
        'set_speed_limit' => 'Définir la limite de vitesse',
        'assign_driver' => 'Assigner un conducteur',
        'unassign_driver' => 'Désassigner le conducteur',
        'send_driver_message' => 'Envoyer un message au conducteur',
        'log_event' => 'Enregistrer un événement',
        'create_report' => 'Créer un rapport',
        'export_data' => 'Exporter des données',
        'call_api' => 'Appeler une API',
        'send_to_queue' => 'Envoyer en file d\'attente',
        'trigger_workflow' => 'Déclencher un workflow',
        'schedule_action' => 'Programmer une action',
        'delay_action' => 'Retarder une action',
        'repeat_action' => 'Répéter une action',
    ],

    'status' => [
        'active' => 'Actif',
        'inactive' => 'Inactif',
        'pending' => 'En attente',
        'running' => 'En cours',
        'completed' => 'Terminé',
        'failed' => 'Échoué',
    ],

    'execution' => [
        'title' => 'Exécutions',
        'triggered_by' => 'Déclenché par',
        'started_at' => 'Commencé à',
        'completed_at' => 'Terminé à',
        'duration' => 'Durée',
        'status' => [
            'title' => 'Statut',
            'completed' => 'Terminé',
            'failed' => 'Échoué',
            'running' => 'En cours',
            'pending' => 'En attente',
        ],
        'error_message' => 'Message d\'erreur',
        'execution_log' => 'Journal d\'exécution',
        'recent' => 'Exécutions Récentes',
        'recent_description' => 'Voir les dernières exécutions de workflow et leur statut',
        'never' => 'Jamais exécuté',
        'last_execution' => 'Dernière exécution',
    ],

    'sidebar' => [
        'navigation' => 'Navigation',
        'information' => 'Informations',
        'executions' => 'Exécutions',
        'settings' => 'Paramètres',
    ],

    'statistics' => [
        'total_executions' => 'Exécutions totales',
        'successful_executions' => 'Exécutions réussies',
        'failed_executions' => 'Exécutions échouées',
        'success_rate' => 'Taux de réussite',
        'average_execution_time' => 'Temps d\'exécution moyen',
        'last_execution' => 'Dernière exécution',
    ],

    'messages' => [
        'created' => 'Workflow créé avec succès',
        'updated' => 'Workflow mis à jour avec succès',
        'deleted' => 'Workflow supprimé avec succès',
        'activated' => 'Workflow activé avec succès',
        'deactivated' => 'Workflow désactivé avec succès',
        'test_started' => 'Test du workflow démarré',
        'test_completed' => 'Test du workflow terminé',
        'test_failed' => 'Échec du test du workflow',
        'creation_failed' => 'Échec de la création du workflow',
        'update_failed' => 'Échec de la mise à jour du workflow',
        'deletion_failed' => 'Échec de la suppression du workflow',
        'toggle_failed' => 'Échec de la modification du statut',
        'no_workflows' => 'Aucun workflow configuré',
        'no_executions' => 'Aucune exécution trouvée',
    ],

    'validation' => [
        'name_required' => 'Le nom du workflow est requis',
        'name_unique' => 'Ce nom de workflow existe déjà',
        'trigger_required' => 'Au moins un déclencheur est requis',
        'action_required' => 'Au moins une action est requise',
        'no_triggers' => 'Ce workflow n\'a aucun déclencheur configuré',
        'no_actions' => 'Ce workflow n\'a aucune action configurée',
        'invalid_condition' => 'Condition invalide',
        'invalid_action_parameters' => 'Paramètres d\'action invalides',
        'trigger_event_required' => 'Veuillez sélectionner un type d\'événement pour tous les déclencheurs.',
    ],

    'sidebar' => [
        'information' => 'Informations',
        'executions' => 'Exécutions',
        'settings' => 'Paramètres',
        'navigation' => 'Navigation',
    ],

    'components' => [
        'triggers' => 'Déclencheurs',
        'conditions' => 'Conditions',
        'actions' => 'Actions',
    ],

    'builder' => [
        'create_title' => 'Créer un Workflow',
        'edit_title' => 'Modifier le Workflow',
        'description' => 'Créez des workflows d\'automatisation puissants avec des déclencheurs, conditions et actions',
        'basic_info' => 'Informations de base',
        'name_placeholder' => 'Saisissez le nom du workflow',
        'description_placeholder' => 'Décrivez ce que fait ce workflow',
        'triggers_title' => 'Déclencheurs du Workflow',
        'conditions_title' => 'Conditions du Workflow',
        'actions_title' => 'Actions du Workflow',
        'add_trigger' => 'Ajouter un Déclencheur',
        'add_condition' => 'Ajouter une Condition',
        'add_action' => 'Ajouter une Action',
        'no_triggers' => 'Aucun déclencheur configuré. Ajoutez un déclencheur pour commencer.',
        'no_conditions' => 'Aucune condition configurée. Les conditions sont optionnelles.',
        'no_actions' => 'Aucune action configurée. Ajoutez une action pour compléter le workflow.',
        'triggers_help' => 'Les déclencheurs déterminent quand votre workflow sera exécuté.',
        'conditions_help' => 'Les conditions filtrent les événements avant d\'exécuter les actions.',
        'actions_help' => 'Les actions définissent ce qui se passe quand le workflow est déclenché.',
        'workflow_flow' => 'Flux du Workflow',
        'flow_description' => 'Construisez votre workflow en définissant des déclencheurs, des conditions et des actions.',
        'last_modified' => 'Dernière modification',
        'variables' => 'Variables',
        'available_variables' => 'Variables Disponibles',
        'variables_description' => 'Cliquez sur une variable pour l\'insérer dans vos conditions ou actions.',
        'trigger' => 'Déclencheur',
        'condition' => 'Condition',
        'action' => 'Action',
        'event_type' => 'Type d\'Événement',
        'select_event' => 'Sélectionnez un événement',
        'field' => 'Champ',
        'field_placeholder' => 'ex: vehicle.speed',
        'operator' => 'Opérateur',
        'value' => 'Valeur',
        'value_placeholder' => 'Saisissez la valeur',
        'logical_operator' => 'Logique',
        'action_type' => 'Type d\'Action',
        'select_action' => 'Sélectionnez une action',
        'action_parameters' => 'Paramètres d\'Action',
        'select_option' => 'Sélectionnez une option',
    ],

    'parameters' => [
        'message' => 'Message',
        'level' => 'Niveau de Log',
        'title' => 'Titre de l\'Alerte',
        'content' => 'Contenu de l\'Alerte',

        'severity' => 'Niveau de Gravité',
    ],

    'placeholders' => [
        'name' => 'Saisissez le nom du workflow',
        'description' => 'Décrivez ce que fait ce workflow',
        'log_message' => 'Saisissez le contenu du message de log',
        'alert_title' => 'Saisissez le titre de l\'alerte',
        'alert_content' => 'Saisissez le contenu ou la description de l\'alerte',
    ],

    'log_levels' => [
        'debug' => 'Débogage',
        'info' => 'Information',
        'warning' => 'Avertissement',
        'error' => 'Erreur',
        'critical' => 'Critique',
    ],



    'severity_levels' => [
        'low' => 'Faible',
        'medium' => 'Moyen',
        'high' => 'Élevé',
        'critical' => 'Critique',
    ],

    // Common terms
    'workflow' => 'Workflow',
    'workflows' => 'Workflows',
    'event' => 'Événement',
    'events' => 'Événements',
    'action' => 'Action',
    'actions' => 'Actions',
    'condition' => 'Condition',
    'conditions' => 'Conditions',
    'trigger' => 'Déclencheur',
    'triggers' => 'Déclencheurs',

    // Categories
    'categories' => [
        'vehicle_location' => 'Position du véhicule',
        'geofences' => 'Zones géographiques',
        'logging' => 'Journalisation',
        'comparison' => 'Comparaison',
        'string' => 'Texte',
        'null' => 'Valeurs vides',
        'boolean' => 'Vrai/Faux',
        'change' => 'Détection de changement',
    ],

    // Variable categories
    'variable_categories' => [
        'device' => 'Appareil',
        'vehicle' => 'Véhicule',
        'location' => 'Localisation',
        'time' => 'Temps',
    ],

    'visual' => [
        'title' => 'Représentation visuelle',
        'description' => 'Diagramme de flux du workflow avec ses déclencheurs, conditions et actions',
        'no_triggers' => 'Aucun déclencheur configuré',
        'no_actions' => 'Aucune action configurée',
        'parameters' => 'paramètres',
    ],

    // Event categories
    'event_categories' => [
        'vehicle_location' => 'Localisation des véhicules',
        'geofences' => 'Géoféences',
    ],

    // Operator categories
    'operator_categories' => [
        'comparison' => 'Comparaison',
        'string' => 'Texte',
        'null' => 'Valeurs nulles',
        'boolean' => 'Booléen',
        'change' => 'Détection de changement',
    ],

    // Action categories
    'action_categories' => [
        'logging' => 'Journalisation',
    ],
]; 