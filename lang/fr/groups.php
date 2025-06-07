<?php

return [
    'title' => 'Groupes',
    'singular' => 'Groupe',
    'plural' => 'Groupes',

    'fields' => [
        'name' => 'Nom',
        'description' => 'Description',
        'color' => 'Couleur',
        'parent' => 'Groupe Parent',
        'parent_id' => 'Groupe Parent',
        'is_active' => 'Actif',
        'tenant' => 'Client',
        'created_at' => 'Créé le',
        'updated_at' => 'Modifié le',
        'full_path' => 'Chemin Complet',
        'children_count' => 'Sous-groupes',
        'vehicles_count' => 'Véhicules',
        'drivers_count' => 'Conducteurs',
        'users_count' => 'Utilisateurs',
    ],

    'actions' => [
        'create' => 'Créer un Groupe',
        'edit' => 'Modifier le Groupe',
        'delete' => 'Supprimer le Groupe',
        'view' => 'Voir le Groupe',
        'show' => 'Afficher le Groupe',
        'assign_users' => 'Assigner des Utilisateurs',
        'manage_hierarchy' => 'Gérer la Hiérarchie',
    ],

    'messages' => [
        'created' => 'Groupe créé avec succès.',
        'updated' => 'Groupe modifié avec succès.',
        'deleted' => 'Groupe supprimé avec succès.',
        'assigned_users' => 'Utilisateurs assignés au groupe avec succès.',
        'no_groups' => 'Aucun groupe trouvé.',
        'no_parent' => 'Groupe Racine',
    ],

    'validation' => [
        'name_required' => 'Le nom du groupe est requis.',
        'name_max' => 'Le nom du groupe ne peut pas dépasser 255 caractères.',
        'description_max' => 'La description ne peut pas dépasser 1000 caractères.',
        'color_format' => 'La couleur doit être un code couleur hexadécimal valide (ex: #FF0000).',
        'parent_exists' => 'Le groupe parent sélectionné n\'existe pas.',
        'tenant_required' => 'Le Client est requis pour tous les groupes.',
        'tenant_exists' => 'Le Client sélectionné n\'existe pas.',
    ],

    'errors' => [
        'has_children' => 'Impossible de supprimer un groupe qui a des sous-groupes. Veuillez d\'abord supprimer ou réassigner les sous-groupes.',
        'has_vehicles' => 'Impossible de supprimer un groupe qui a des véhicules assignés. Veuillez d\'abord réassigner les véhicules.',
        'has_drivers' => 'Impossible de supprimer un groupe qui a des conducteurs assignés. Veuillez d\'abord réassigner les conducteurs.',
        'circular_reference' => 'Impossible de définir le groupe parent car cela créerait une référence circulaire.',
        'parent_different_tenant' => 'Le groupe parent doit appartenir au même Client.',
        'cannot_change_tenant_with_relations' => 'Impossible de changer le Client d\'un groupe qui a des sous-groupes, véhicules ou conducteurs assignés.',
        'not_found' => 'Groupe non trouvé.',
        'access_denied' => 'Vous n\'avez pas accès à ce groupe.',
    ],

    'descriptions' => [
        'hierarchy' => 'Les groupes peuvent être organisés dans une structure hiérarchique. Les utilisateurs assignés à un groupe parent ont automatiquement accès à tous les sous-groupes et leurs ressources.',
        'access_control' => 'Les utilisateurs peuvent être assignés à un ou plusieurs groupes pour contrôler leur accès aux véhicules et conducteurs.',
        'color_coding' => 'Assignez des couleurs aux groupes pour une identification visuelle facile dans l\'interface.',
    ],

    'placeholders' => [
        'name' => 'Saisir le nom du groupe...',
        'description' => 'Saisir la description du groupe...',
        'search' => 'Rechercher des groupes...',
        'tenant' => 'Sélectionner un Client...',
        'parent_group' => 'Sélectionner le groupe parent...',
    ],

    'options' => [
        'no_parent' => 'Aucun parent (groupe racine)',
    ],

    'status' => [
        'active' => 'Actif',
        'inactive' => 'Inactif',
    ],
]; 