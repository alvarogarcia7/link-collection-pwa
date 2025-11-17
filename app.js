/**
 * Link Collection Reader PWA
 * Main application logic with recfile parser and filtering
 */

// Import services
import { getUrlHistory, addToUrlHistory } from './services/urlHistoryService.js';
import { parseRecfile } from './services/recfileParserService.js';
import { applyFilters as applyFiltersService, extractCategories, extractTags } from './services/filterService.js';
import { convertToRawUrl, convertToGitHubBlobUrl } from './services/urlService.js';
import { escapeHtml, formatDate, debounce } from './services/utilsService.js';

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
 * Populate the datalist with URL history
 */
function populateUrlDatalist() {
    const datalist = document.getElementById('url-history');
    if (!datalist) return;

    const history = getUrlHistory(localStorage);

    datalist.innerHTML = history.map(url =>
        `<option value="${escapeHtml(url)}">`
    ).join('');
}

/**
 * Initialize the application
 */
function initializeApp() {
    if (savedUrl) {
        document.getElementById('recfile-url').value = savedUrl;
    }

    // Populate the datalist with URL history
    populateUrlDatalist();

    // Set up event listeners
    document.getElementById('load-btn').addEventListener('click', loadRecords);
    document.getElementById('clear-filters-btn').addEventListener('click', clearFilters);
    document.getElementById('toggle-config-btn').addEventListener('click', toggleConfigSection);

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
        addToUrlHistory(localStorage, url);
        populateUrlDatalist();

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

    state.filteredRecords = applyFiltersService(state.records, filters);
    displayRecords(state.filteredRecords);
    updateResultCount();
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

    container.innerHTML = records.map(record => createRecordCard(record)).join('');
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
        const sourceUrl = convertToGitHubBlobUrl(state.currentUrl, lineNumber);
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
 * Populate autocomplete suggestions for category and tags
 */
function populateAutocompleteSuggestions() {
    // Extract unique categories and tags using services
    const categories = extractCategories(state.records);
    const tags = extractTags(state.records);

    // Populate category datalist
    const categoryDatalist = document.getElementById('category-suggestions');
    categoryDatalist.innerHTML = categories
        .map(cat => `<option value="${escapeHtml(cat)}">`)
        .join('');

    // Populate tags datalist
    const tagsDatalist = document.getElementById('tag-suggestions');
    tagsDatalist.innerHTML = tags
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
 * Filter by tag when a tag is clicked
 */
function filterByTag(tag) {
    const filterInput = document.getElementById('filter-tags');
    filterInput.value = tag;
    applyFilters();

    // Scroll to filter section
    document.getElementById('filter-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
