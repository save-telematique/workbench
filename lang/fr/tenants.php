<?php

return [
    // Liste des tenants
    'list' => [
        'title' => 'Clients',
        'breadcrumb' => 'Clients',
        'heading' => 'Liste des clients',
        'description' => 'Voir et gérer vos clients',
        'add_tenant' => 'Ajouter un client',
        'no_tenants' => 'Aucun client',
        'get_started' => 'Commencez par créer un nouveau client.',
        'create_tenant' => 'Créer un client',
    ],

    // Champs de tenants
    'fields' => [
        'name' => 'Nom',
        'name_placeholder' => 'Nom de l\'entreprise',
        'email' => 'Email',
        'email_placeholder' => 'contact@exemple.com',
        'phone' => 'Téléphone',
        'phone_placeholder' => '+33 6 00 00 00 00',
        'address' => 'Adresse',
        'address_placeholder' => '123 Rue Principale, Ville, Pays',
        'status_label' => 'Statut',
        'logo' => 'Logo',
        'domains' => 'Domaines',
    ],

    // Page création
    'create' => [
        'title' => 'Créer un client',
        'breadcrumb' => 'Créer',
        'heading' => 'Créer un client',
        'description' => 'Ajouter un nouveau client à votre organisation',
        'form_title' => 'Créer un nouveau client',
        'form_description' => 'Complétez le formulaire ci-dessous pour créer un nouveau client',
    ],

    // Page édition
    'edit' => [
        'title' => 'Modifier le client',
        'breadcrumb' => 'Modifier : :name',
        'heading' => 'Modifier le client',
        'description' => 'Modifier les informations du client',
        'form_title' => 'Modifier les informations du client',
        'form_description' => 'Mettre à jour les détails pour :name',
    ],

    // Page détail
    'show' => [
        'title' => 'Détails du client',
        'breadcrumb' => 'Détails : :name',
        'heading' => 'Informations du client',
        'description' => 'Voir et gérer les détails du client',
        'info_section_title' => 'Informations',
    ],

    // Onglets (pour la sidebar de la page show)
    'tabs' => [
        'information' => 'Informations',
        'domains' => 'Domaines',
    ],

    // Gestion des domaines
    'domains' => [
        'breadcrumb' => 'Domaines',
        'title' => 'Domaines du client : :name',
        'heading' => 'Domaines du client',
        'description' => 'Gérer les domaines pour ce client',
        'add_domain_title' => 'Ajouter un nouveau domaine',
        'domain_name_label' => 'Nom de domaine',
        'domain_name_placeholder' => 'exemple.com ou sousdomaine',
        'domain_format_tooltip_trigger' => 'Format du domaine',
        'domain_format_tooltip_content' => 'Utilisez un domaine complet avec un point (exemple.com) ou juste un nom de sous-domaine (demo).<br /><br />Les domaines complets sont enregistrés tels quels, tandis que les sous-domaines seront utilisés comme <code>[sousdomaine].:hostname</code> dans votre application.',
        'subdomain_preview' => 'Votre sous-domaine sera utilisé comme : <span class="font-semibold">:preview</span>',
        'add_domain_button' => 'Ajouter le domaine',
        'existing_domains_title' => 'Domaines existants',
        'no_domains' => 'Aucun domaine',
        'get_started' => 'Commencez par ajouter un domaine ci-dessus.',
        'table_header_domain' => 'Domaine',
        'table_header_type' => 'Type',
        'subdomain_usage_note' => 'Sera utilisé comme : <span class="font-medium">:domain</span>',
        'type_full' => 'Domaine complet',
        'type_subdomain' => 'Sous-domaine',
        'actions' => [
            'open' => 'Ouvrir',
            'open_tooltip' => 'Ouvrir dans un nouvel onglet',
            'delete_confirm' => 'Êtes-vous sûr de vouloir supprimer ce domaine ?',
            'delete_tooltip' => 'Supprimer le domaine',
        ],
        'messages' => [
            'added' => 'Domaine ajouté avec succès.',
            'deleted' => 'Domaine supprimé avec succès.',
        ],
    ],

    // Actions
    'actions' => [
        'create' => 'Créer un client',
        'back_to_list' => 'Retour à la liste',
        'back_to_tenant' => 'Retour au client',
    ],

    // Messages
    'messages' => [
        'created' => 'Client créé avec succès',
        'updated' => 'Client mis à jour avec succès',
        'deleted' => 'Client supprimé avec succès',
    ],
]; 