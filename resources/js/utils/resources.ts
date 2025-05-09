import { ResourceCollection } from "../types/resources";

/**
 * Utility functions for working with Laravel API Resources in the frontend
 */

/**
 * Type guard to check if a value is a ResourceCollection
 */
export function isResourceCollection<T>(value: unknown): value is ResourceCollection<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'links' in value &&
    'meta' in value &&
    Array.isArray((value as ResourceCollection<T>).data)
  );
}

/**
 * Extracts data from a resource or resource collection
 * 
 * @param resource A resource or resource collection
 * @returns The data from the resource
 */
export function getData<T>(resource: T | ResourceCollection<T>): T | T[] {
  if (isResourceCollection<T>(resource)) {
    return resource.data;
  }
  return resource;
}

/**
 * Gets pagination metadata from a resource collection
 * 
 * @param collection A resource collection
 * @returns The pagination metadata or null if not a collection
 */
export function getPaginationMeta<T>(collection: unknown): ResourceCollection<T>['meta'] | null {
  if (isResourceCollection<T>(collection)) {
    return collection.meta;
  }
  return null;
}

/**
 * Gets pagination links from a resource collection
 * 
 * @param collection A resource collection
 * @returns The pagination links or null if not a collection
 */
export function getPaginationLinks<T>(collection: unknown): ResourceCollection<T>['links'] | null {
  if (isResourceCollection<T>(collection)) {
    return collection.links;
  }
  return null;
} 