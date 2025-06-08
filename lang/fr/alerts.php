<?php

return [
    'title' => 'Alertes',
    'description' => 'Gérer les alertes et notifications du système',
    'create' => 'Créer une alerte',
    'edit' => 'Modifier l\'alerte',
    'show' => 'Détails de l\'alerte',
    'delete' => 'Supprimer l\'alerte',
    'restore' => 'Restaurer l\'alerte',
    
    'list' => [
        'title' => 'Liste des alertes',
        'no_alerts' => 'Aucune alerte trouvée',
        'showing' => 'Affichage de :from à :to sur :total alertes',
    ],
    
    'fields' => [
        'title' => 'Titre',
        'content' => 'Contenu',
        'severity' => 'Gravité',
        'status' => 'Statut',
        'entity' => 'Entité',
        'related_entity' => 'Entité liée',
        'is_read' => 'Lu',
        'is_active' => 'Actif',
        'created_by' => 'Créé par',
        'expires_at' => 'Expire le',
        'metadata' => 'Métadonnées',
        'type' => 'Type',
    ],
    
    'actions' => [
        'create' => 'Créer une alerte',
        'edit' => 'Modifier',
        'delete' => 'Supprimer',
        'restore' => 'Restaurer',
        'mark_as_read' => 'Marquer comme lu',
        'mark_as_unread' => 'Marquer comme non lu',
        'mark_all_read' => 'Tout marquer comme lu',
        'back_to_list' => 'Retour à la liste',
        'view_all' => 'Voir toutes les alertes',
    ],
    
    'severity' => [
        'info' => 'Information',
        'warning' => 'Avertissement',
        'error' => 'Erreur',
        'success' => 'Succès',
    ],
    
    'status' => [
        'read' => 'Lu',
        'unread' => 'Non lu',
    ],
    
    'show' => [
        'content_title' => 'Contenu de l\'alerte',
        'details_title' => 'Détails de l\'alerte',
    ],
    
    'metadata' => [
        'links' => 'Liens',
        'image' => 'Image',
    ],
    
    'breadcrumbs' => [
        'index' => 'Alertes',
        'create' => 'Nouvelle alerte',
        'edit' => 'Modifier',
        'show' => 'Détails',
    ],
    
    'confirmations' => [
        'delete' => 'Êtes-vous sûr de vouloir supprimer cette alerte ?',
        'restore' => 'Êtes-vous sûr de vouloir restaurer cette alerte ?',
    ],
    
    'messages' => [
        'created' => 'Alerte créée avec succès.',
        'updated' => 'Alerte mise à jour avec succès.',
        'deleted' => 'Alerte supprimée avec succès.',
        'restored' => 'Alerte restaurée avec succès.',
        'marked_as_read' => 'Alerte marquée comme lue.',
        'marked_as_unread' => 'Alerte marquée comme non lue.',
    ],
    
    'validation' => [
        'title' => [
            'required' => 'Le champ titre est obligatoire.',
            'max' => 'Le titre ne peut pas dépasser :max caractères.',
        ],
        'content' => [
            'required' => 'Le champ contenu est obligatoire.',
        ],
        'type' => [
            'required' => 'Le champ type est obligatoire.',
        ],
        'severity' => [
            'required' => 'Le champ gravité est obligatoire.',
            'in' => 'La gravité sélectionnée est invalide.',
        ],
        'alertable_type' => [
            'required' => 'Le champ type d\'entité est obligatoire.',
        ],
        'alertable_id' => [
            'required' => 'Le champ ID d\'entité est obligatoire.',
        ],
        'expires_at' => [
            'after' => 'La date d\'expiration doit être dans le futur.',
        ],
    ],
    
    'entity' => [
        'title' => 'Alertes de l\'entité',
        'no_alerts' => 'Aucune alerte trouvée pour cette entité',
        'no_filtered_alerts' => 'Aucune alerte trouvée pour les filtres sélectionnés',
        'no_alerts_description' => 'Cette :entity n\'a aucune alerte pour le moment.',
        'try_different_filters' => 'Essayez d\'ajuster vos filtres pour voir plus de résultats.',
    ],
    
    'filters' => [
        'all' => 'Tout',
        'read' => 'Lu',
        'unread' => 'Non lu',
        'all_severities' => 'Toutes les gravités',
    ],
    
    'types' => [
        'system' => 'Système',
        'maintenance' => 'Maintenance',
        'security' => 'Sécurité',
        'performance' => 'Performance',
        'user' => 'Utilisateur',
        'device' => 'Dispositif',
        'vehicle' => 'Véhicule',
        'driver' => 'Conducteur',
    ],
    
    'unread_count' => ':count alerte(s) non lue(s)',
    'search_placeholder' => 'Rechercher dans les alertes...',
    'complex_content' => 'Contenu complexe',
    'no_results' => 'Aucune alerte trouvée.',
    'loading' => 'Chargement des alertes...',
    'empty_state' => [
        'title' => 'Aucune alerte',
        'description' => 'Il n\'y a encore aucune alerte à afficher.',
    ],
    
    'sidebar' => [
        'details' => 'Détails',
        'all_alerts' => 'Toutes les alertes',
        'navigation' => 'Navigation',
    ],
]; 