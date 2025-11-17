/**
 * URL Service
 * Handles URL conversions and transformations
 */

/**
 * Convert GitHub blob URLs to raw content URLs
 * @param {string} url - URL to convert
 * @returns {string} Converted URL
 */
export function convertToRawUrl(url) {
    if (url.includes('github.com') && url.includes('/blob/')) {
        return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }
    return url;
}

/**
 * Convert raw GitHub URL to blob URL with line number
 * @param {string} url - Raw GitHub URL
 * @param {number} lineNumber - Line number to link to
 * @returns {string} GitHub blob URL with line number
 */
export function convertToGitHubBlobUrl(url, lineNumber) {
    if (!url) return '';

    let blobUrl = url;
    if (url.includes('raw.githubusercontent.com')) {
        // Convert: https://raw.githubusercontent.com/user/repo/branch/path/to/file
        // To: https://github.com/user/repo/blob/branch/path/to/file
        const parts = url.split('raw.githubusercontent.com');
        if (parts.length === 2) {
            const pathParts = parts[1].split('/').filter(p => p);
            if (pathParts.length >= 3) {
                const user = pathParts[0];
                const repo = pathParts[1];
                const branch = pathParts[2];
                const filePath = pathParts.slice(3).join('/');
                blobUrl = `https://github.com/${user}/${repo}/blob/${branch}/${filePath}`;
            }
        }
    }

    if (lineNumber) {
        blobUrl += `#L${lineNumber}`;
    }

    return blobUrl;
}
