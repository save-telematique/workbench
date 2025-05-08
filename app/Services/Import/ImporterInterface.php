<?php

namespace App\Services\Import;

interface ImporterInterface
{
    /**
     * Get validation rules for a single row (live validation).
     */
    public function getRowValidationRules(): array;

    /**
     * Get validation rules for the main store request.
     * The key should be the request_array_name.*.field
     */
    public function getStoreRequestValidationRules(): array;
    
    /**
     * Get target fields with descriptions for AI mapping.
     */
    public function getTargetFields(): array;

    /**
     * Get foreign key configurations.
     */
    public function getForeignKeyConfigs(): array;

    /**
     * Get the model class string.
     */
    public function getModelClass(): string;

    /**
     * Get the Inertia page name for the import form.
     */
    public function getInertiaPageName(): string;

    /**
     * Get the permission string required for this import.
     */
    public function getRequiredPermission(): string;

    /**
     * Get the name of the array in the request that holds entities.
     */
    public function getRequestArrayName(): string;

    /**
     * Get the field name that should be unique for this entity type.
     */
    public function getUniqueField(): string;

    /**
     * Get mandatory fields (subset of target_fields).
     */
    public function getMandatoryFields(): array;
    
    /**
     * Preload reference data needed for foreign key mapping.
     */
    public function preloadReferenceData(): array;

    /**
     * Map foreign key text values to IDs for a single row.
     * Returns ['row' => array, 'warnings' => array]
     */
    public function mapForeignKeysForRow(array $row, array $referenceData): array;

    /**
     * Get additional data needed for the import form (passed to Inertia).
     */
    public function getFormData(): array;

    /**
     * Create an entity instance from validated import data.
     */
    public function createEntity(array $data): object;

    /**
     * Get context information for AI column mapping.
     */
    public function getAiMappingContext(): string;
    
    /**
     * Get keywords for fallback column mapping if AI fails.
     * Format: ['target_field_name' => ['keyword1', 'keyword2']]
     */
    public function getFallbackMappingKeywords(): array;

    /**
     * Get a user-friendly name for the import type (e.g., "device", "vehicle").
     */
    public function getFriendlyName(): string;
} 