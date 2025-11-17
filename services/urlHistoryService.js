/**
 * URL History Service
 * Manages URL history in localStorage
 */

/**
 * Get URL history from storage
 * @param {Storage} storage - Storage object (localStorage or mock)
 * @returns {string[]} Array of URLs
 */
export function getUrlHistory(storage) {
    const history = storage.getItem('recfileUrlHistory');
    return history ? JSON.parse(history) : [];
}

/**
 * Add URL to history (max 10 unique URLs)
 * @param {Storage} storage - Storage object (localStorage or mock)
 * @param {string} url - URL to add
 * @returns {string[]} Updated history
 */
export function addToUrlHistory(storage, url) {
    let history = getUrlHistory(storage);

    // Remove duplicates (case-sensitive)
    history = history.filter(item => item !== url);

    // Add new URL to the beginning
    history.unshift(url);

    // Keep only last 10
    history = history.slice(0, 10);

    // Save back to storage
    storage.setItem('recfileUrlHistory', JSON.stringify(history));

    return history;
}

/**
 * Clear URL history
 * @param {Storage} storage - Storage object (localStorage or mock)
 */
export function clearUrlHistory(storage) {
    storage.removeItem('recfileUrlHistory');
}
