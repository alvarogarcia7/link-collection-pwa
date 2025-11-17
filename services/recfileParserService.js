/**
 * Recfile Parser Service
 * Parses recfile format into structured records
 */

/**
 * Parse recfile format into structured records
 * @param {string} text - Recfile content
 * @returns {Object[]} Array of parsed records
 */
export function parseRecfile(text) {
    const records = [];
    const lines = text.split('\n');

    let currentRecord = {};
    let currentField = null;
    let currentValue = '';
    let recordStartLine = -1;

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
