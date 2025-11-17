/**
 * Link Collection Reader PWA
 * Main application logic with recfile parser and filtering
 */

// State management
const state = {
    records: [],
    filteredRecords: [],
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

/**
 * Get URL history from localStorage
 */
function getUrlHistory() {
    const history = localStorage.getItem('recfileUrlHistory');
    return history ? JSON.parse(history) : [];
}

/**
 * Add URL to history (max 10 unique URLs)
 */
function addToUrlHistory(url) {
    let history = getUrlHistory();

    // Remove duplicates (case-sensitive)
    history = history.filter(item => item !== url);

    // Add new URL to the beginning
    history.unshift(url);

    // Keep only last 10
    history = history.slice(0, 10);

    // Save back to localStorage
    localStorage.setItem('recfileUrlHistory', JSON.stringify(history));

    // Update the datalist
    populateUrlDatalist();
}

/**
 * Populate the datalist with URL history
 */
function populateUrlDatalist() {
    const datalist = document.getElementById('url-history');
    if (!datalist) return;

    const history = getUrlHistory();

    datalist.innerHTML = history.map(url =>
        `<option value="${escapeHtml(url)}">`
    ).join('');
}

/**
 * Initialize the application
 */
function initializeApp() {
    const savedUrl = localStorage.getItem('recfileUrl');
    if (savedUrl) {
        document.getElementById('recfile-url').value = savedUrl;
    }

    // Populate the datalist with URL history
    populateUrlDatalist();

    // Set up event listeners
    document.getElementById('load-btn').addEventListener('click', loadRecords);
    document.getElementById('clear-filters-btn').addEventListener('click', clearFilters);
    document.getElementById('toggle-config-btn').addEventListener('click', toggleConfigSection);

    // Sort dropdown listener
    document.getElementById('sort-by').addEventListener('change', () => {
        displayRecords(state.filteredRecords);
    });

    // Set up filter input listeners with debouncing
    const filterInputs = [
        'filter-all',
        'filter-category',
        'filter-title',
        'filter-tags',
        'filter-body',
        'filter-date'
    ];

    filterInputs.forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('input', debounce(applyFilters, 300));
    });

    // Allow Enter key to load records
    document.getElementById('recfile-url').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadRecords();
        }
    });

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(registration => console.log('Service Worker registered:', registration))
            .catch(error => console.log('Service Worker registration failed:', error));
    }

    // Handle PWA installation
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        document.getElementById('install-prompt').style.display = 'block';
    });

    document.getElementById('install-btn').addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to install prompt: ${outcome}`);
            deferredPrompt = null;
            document.getElementById('install-prompt').style.display = 'none';
        }
    });
}

/**
 * Toggle configuration section visibility
 */
function toggleConfigSection() {
    const configSection = document.getElementById('config-section');
    if (configSection.style.display === 'none') {
        configSection.style.display = 'block';
    } else {
        configSection.style.display = 'none';
    }
}

/**
 * Load records from the specified URL
 */
async function loadRecords() {
    const urlInput = document.getElementById('recfile-url');
    const url = urlInput.value.trim();

    if (!url) {
        showStatus('Please enter a valid URL', 'error');
        return;
    }

    showStatus('Loading records...', 'loading');

    try {
        // Convert GitHub blob URLs to raw URLs
        const fetchUrl = convertToRawUrl(url);

        const response = await fetch(fetchUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();

        // Parse the recfile
        state.rawRecfileText = text;
        state.records = parseRecfile(text);
        state.filteredRecords = [...state.records];
        state.currentUrl = url;

        localStorage.setItem('recfileUrl', url);


        // Show results
        showStatus(`Successfully loaded ${state.records.length} records`, 'success');
        displayRecords(state.filteredRecords);

        // Show filter and records sections
        document.getElementById('filter-section').style.display = 'block';
        document.getElementById('records-section').style.display = 'block';

        updateResultCount();

    } catch (error) {
        showStatus(`Error loading records: ${error.message}`, 'error');
        console.error('Error:', error);
    }
}

/**
 * Convert GitHub blob URLs to raw content URLs
 */
function convertToRawUrl(url) {
    if (url.includes('github.com') && url.includes('/blob/')) {
        return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }
    return url;
}

/**
 * Parse recfile format into structured records
 */
function parseRecfile(text) {
    const records = [];
    const lines = text.split('\n');

    let currentRecord = {};
    let currentField = null;
    let currentValue = '';
    let recordStartLine = -1;
    let inMetadata = true;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip metadata lines (starting with %)
        if (line.startsWith('%')) {
            continue;
        }

        // Empty line indicates end of record
        if (line.trim() === '') {
            if (currentField) {
                currentRecord[currentField] = currentValue.trim();
                currentField = null;
                currentValue = '';
            }

            if (Object.keys(currentRecord).length > 0) {
                currentRecord._lineNumber = recordStartLine;
                records.push(currentRecord);
                currentRecord = {};
                recordStartLine = -1;
            }
            inMetadata = false;
            continue;
        }

        // Check if line is a continuation (starts with +)
        if (line.startsWith('+')) {
            if (currentField) {
                currentValue += '\n' + line.substring(1).trim();
            }
            continue;
        }

        // Check if line starts a new field (contains :)
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0 && !line.startsWith(' ') && !line.startsWith('\t')) {
            // Save previous field if exists
            if (currentField) {
                currentRecord[currentField] = currentValue.trim();
            }

            // Start new field
            currentField = line.substring(0, colonIndex).trim();
            currentValue = line.substring(colonIndex + 1).trim();

            // Track the start line of this record
            if (recordStartLine === -1) {
                recordStartLine = i + 1; // Line numbers are 1-indexed
            }
        } else if (currentField) {
            // Continuation of previous field value
            currentValue += ' ' + line.trim();
        }
    }

    // Don't forget the last record
    if (currentField) {
        currentRecord[currentField] = currentValue.trim();
    }
    if (Object.keys(currentRecord).length > 0) {
        currentRecord._lineNumber = recordStartLine;
        records.push(currentRecord);
    }

    return records;
}

/**
 * Check if a filter matches (supports negative filtering with "-" prefix)
 */
function matchesFilter(value, filter) {
    if (!filter) return true;

    const filterLower = filter.toLowerCase();
    const valueLower = (value || '').toLowerCase();

    // Check for negative filter (starts with -)
    if (filterLower.startsWith('-')) {
        const negativeFilter = filterLower.substring(1).trim();
        if (!negativeFilter) return true;
        // For negative filter, return true if the value does NOT contain the filter
        return !valueLower.includes(negativeFilter);
    } else {
        // For positive filter, return true if the value contains the filter
        return valueLower.includes(filterLower);
    }
}

/**
 * Apply filters to records
 */
function applyFilters() {
    const filters = {
        all: document.getElementById('filter-all').value.trim(),
        category: document.getElementById('filter-category').value.trim(),
        title: document.getElementById('filter-title').value.trim(),
        tags: document.getElementById('filter-tags').value.trim(),
        body: document.getElementById('filter-body').value.trim(),
        date: document.getElementById('filter-date').value.trim()
    };

    state.filteredRecords = state.records.filter(record => {
        // Filter by "all fields"
        if (filters.all) {
            const allText = Object.values(record).join(' ');
            if (!matchesFilter(allText, filters.all)) {
                return false;
            }
        }

        // Filter by category
        if (filters.category) {
            if (!matchesFilter(record.Category, filters.category)) {
                return false;
            }
        }

        // Filter by title
        if (filters.title) {
            if (!matchesFilter(record.Title, filters.title)) {
                return false;
            }
        }

        // Filter by tags
        if (filters.tags) {
            if (!matchesFilter(record.Tags, filters.tags)) {
                return false;
            }
        }

        // Filter by body
        if (filters.body) {
            if (!matchesFilter(record.Body, filters.body)) {
                return false;
            }
        }

        // Filter by date
        if (filters.date) {
            if (!matchesFilter(record.Date, filters.date)) {
                return false;
            }
        }

        return true;
    });

    displayRecords(state.filteredRecords);
    updateResultCount();
}

/**
 * Sort records based on selected criteria
 */
function sortRecords(records, sortBy) {
    if (sortBy === 'none') {
        return records;
    }

    const sorted = [...records];

    switch (sortBy) {
        case 'date-desc':
            sorted.sort((a, b) => {
                const dateA = a.Date || '';
                const dateB = b.Date || '';
                return dateB.localeCompare(dateA);
            });
            break;
        case 'date-asc':
            sorted.sort((a, b) => {
                const dateA = a.Date || '';
                const dateB = b.Date || '';
                return dateA.localeCompare(dateB);
            });
            break;
        case 'title-asc':
            sorted.sort((a, b) => {
                const titleA = (a.Title || '').toLowerCase();
                const titleB = (b.Title || '').toLowerCase();
                return titleA.localeCompare(titleB);
            });
            break;
        case 'title-desc':
            sorted.sort((a, b) => {
                const titleA = (a.Title || '').toLowerCase();
                const titleB = (b.Title || '').toLowerCase();
                return titleB.localeCompare(titleA);
            });
            break;
        case 'tags-asc':
            sorted.sort((a, b) => {
                const tagsA = (a.Tags || '').toLowerCase();
                const tagsB = (b.Tags || '').toLowerCase();
                return tagsA.localeCompare(tagsB);
            });
            break;
        case 'tags-desc':
            sorted.sort((a, b) => {
                const tagsA = (a.Tags || '').toLowerCase();
                const tagsB = (b.Tags || '').toLowerCase();
                return tagsB.localeCompare(tagsA);
            });
            break;
    }

    return sorted;
}

/**
 * Clear all filters
 */
function clearFilters() {
    document.getElementById('filter-all').value = '';
    document.getElementById('filter-category').value = '';
    document.getElementById('filter-title').value = '';
    document.getElementById('filter-tags').value = '';
    document.getElementById('filter-body').value = '';
    document.getElementById('filter-date').value = '';

    applyFilters();
}

/**
 * Display records in the UI
 */
function displayRecords(records) {
    const container = document.getElementById('records-container');

    if (records.length === 0) {
        container.innerHTML = '<div class="no-results">No records found matching your filters.</div>';
        return;
    }

    // Apply sorting
    const sortBy = document.getElementById('sort-by')?.value || 'none';
    const sortedRecords = sortRecords(records, sortBy);

    container.innerHTML = sortedRecords.map(record => createRecordCard(record)).join('');
}

/**
 * Create HTML for a single record card
 */
function createRecordCard(record) {
    const title = escapeHtml(record.Title || 'Untitled');
    const category = escapeHtml(record.Category || 'Uncategorized');
    const date = formatDate(record.Date || '');
    const body = escapeHtml(record.Body || '').replace(/\n/g, '<br>');
    const tags = (record.Tags || '').split(',').map(t => t.trim()).filter(t => t);
    const link = record.Link || '';
    const origin = record.Origin || '';
    const id = escapeHtml(record.Id || '');
    const lineNumber = record._lineNumber;

    // Create source link
    let sourceLink = '';
    if (lineNumber && state.currentUrl) {
        // Convert to GitHub blob URL with line number if it's a raw GitHub URL
        let sourceUrl = state.currentUrl;
        if (sourceUrl.includes('raw.githubusercontent.com')) {
            sourceUrl = sourceUrl
                .replace('raw.githubusercontent.com', 'github.com')
                .replace(/\/([^\/]+)$/, '/blob/$1');
        }
        sourceUrl += `#L${lineNumber}`;
        sourceLink = `<div class="record-source"><small>📄 <a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">View source (line ${lineNumber})</a></small></div>`;
    }

    return `
        <article class="record-card">
            <div class="record-header">
                <h3 class="record-title">
                    ${link ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">${title}</a>` : title}
                </h3>
                <span class="record-category">${category}</span>
            </div>

            ${date ? `<div class="record-date">📅 ${date}</div>` : ''}

            ${body ? `<div class="record-body">${body}</div>` : ''}

            ${tags.length > 0 ? `
                <div class="record-tags">
                    ${tags.map(tag => `<span class="tag" onclick="filterByTag('${escapeHtml(tag).replace(/'/g, '&#39;')}')">${escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}

            ${origin ? `
                <div class="record-origin">
                    <small>Origin: <a href="${escapeHtml(origin)}" target="_blank" rel="noopener noreferrer">${escapeHtml(origin)}</a></small>
                </div>
            ` : ''}

            ${id ? `<div class="record-id"><small>ID: ${id}</small></div>` : ''}

            ${sourceLink}
        </article>
    `;
}

/**
 * Format date string
 */
function formatDate(dateString) {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}

/**
 * Populate autocomplete suggestions for category and tags
 */
function populateAutocompleteSuggestions() {
    // Extract unique categories
    const categories = new Set();
    state.records.forEach(record => {
        if (record.Category) {
            categories.add(record.Category.trim());
        }
    });

    // Extract unique tags
    const tags = new Set();
    state.records.forEach(record => {
        if (record.Tags) {
            const tagList = record.Tags.split(',').map(t => t.trim()).filter(t => t);
            tagList.forEach(tag => tags.add(tag));
        }
    });

    // Populate category datalist
    const categoryDatalist = document.getElementById('category-suggestions');
    categoryDatalist.innerHTML = Array.from(categories).sort()
        .map(cat => `<option value="${escapeHtml(cat)}">`)
        .join('');

    // Populate tags datalist
    const tagsDatalist = document.getElementById('tag-suggestions');
    tagsDatalist.innerHTML = Array.from(tags).sort()
        .map(tag => `<option value="${escapeHtml(tag)}">`)
        .join('');
}

/**
 * Update result count display
 */
function updateResultCount() {
    const count = document.getElementById('result-count');
    const total = state.records.length;
    const filtered = state.filteredRecords.length;

    if (filtered === total) {
        count.textContent = `Showing all ${total} records`;
    } else {
        count.textContent = `Showing ${filtered} of ${total} records`;
    }
}

/**
 * Show status message
 */
function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status status-${type}`;

    if (type === 'success') {
        setTimeout(() => {
            statusEl.textContent = '';
            statusEl.className = 'status';
        }, 3000);
    }
}

/**
 * Debounce function for input handlers
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Filter by tag when a tag is clicked
 */
function filterByTag(tag) {
    const filterInput = document.getElementById('filter-tags');
    filterInput.value = tag;
    applyFilters();

    // Scroll to filter section
    document.getElementById('filter-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
