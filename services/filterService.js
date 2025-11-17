/**
 * Filter Service
 * Provides filtering functionality for records
 */

/**
 * Apply filters to records
 * @param {Object[]} records - Array of records to filter
 * @param {Object} filters - Filter criteria
 * @param {string} filters.all - Search all fields
 * @param {string} filters.category - Filter by category
 * @param {string} filters.title - Filter by title
 * @param {string} filters.tags - Filter by tags
 * @param {string} filters.body - Filter by body content
 * @param {string} filters.date - Filter by date
 * @returns {Object[]} Filtered records
 */
export function applyFilters(records, filters) {
    return records.filter(record => {
        // Filter by "all fields"
        if (filters.all) {
            const allText = Object.values(record).join(' ').toLowerCase();
            if (!allText.includes(filters.all.toLowerCase())) {
                return false;
            }
        }

        // Filter by category
        if (filters.category) {
            const category = (record.Category || '').toLowerCase();
            if (!category.includes(filters.category.toLowerCase())) {
                return false;
            }
        }

        // Filter by title
        if (filters.title) {
            const title = (record.Title || '').toLowerCase();
            if (!title.includes(filters.title.toLowerCase())) {
                return false;
            }
        }

        // Filter by tags
        if (filters.tags) {
            const tags = (record.Tags || '').toLowerCase();
            if (!tags.includes(filters.tags.toLowerCase())) {
                return false;
            }
        }

        // Filter by body
        if (filters.body) {
            const body = (record.Body || '').toLowerCase();
            if (!body.includes(filters.body.toLowerCase())) {
                return false;
            }
        }

        // Filter by date
        if (filters.date) {
            const date = record.Date || '';
            if (!date.includes(filters.date)) {
                return false;
            }
        }

        return true;
    });
}

/**
 * Extract unique categories from records
 * @param {Object[]} records - Array of records
 * @returns {string[]} Sorted array of unique categories
 */
export function extractCategories(records) {
    const categories = new Set();
    records.forEach(record => {
        if (record.Category) {
            categories.add(record.Category.trim());
        }
    });
    return Array.from(categories).sort();
}

/**
 * Extract unique tags from records
 * @param {Object[]} records - Array of records
 * @returns {string[]} Sorted array of unique tags
 */
export function extractTags(records) {
    const tags = new Set();
    records.forEach(record => {
        if (record.Tags) {
            const tagList = record.Tags.split(',').map(t => t.trim()).filter(t => t);
            tagList.forEach(tag => tags.add(tag));
        }
    });
    return Array.from(tags).sort();
}
