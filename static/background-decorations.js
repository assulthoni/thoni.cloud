// Add minimalist background decorations
document.addEventListener('DOMContentLoaded', () => {
    // Create container for all decorations
    const decorationContainer = document.createElement('div');
    decorationContainer.className = 'decoration-container';
    document.body.appendChild(decorationContainer);
    
    // Create decorative elements
    const decorations = [
        { type: 'circle', class: 'decoration-1' },
        { type: 'square', class: 'decoration-2' },
        { type: 'line', class: 'decoration-3' },
        { type: 'circle', class: 'decoration-4' },
        { type: 'line', class: 'decoration-5' }
    ];
    
    // Add each decoration to the container
    decorations.forEach(dec => {
        const element = document.createElement('div');
        element.className = `decoration decoration-${dec.type} ${dec.class}`;
        decorationContainer.appendChild(element);
    });
    
    // Also handle the bg-element classes that are already in the HTML
    const bgElements = document.querySelectorAll('.bg-element');
    bgElements.forEach(el => {
        // Make sure they have proper styling
        el.style.position = 'absolute';
        el.style.zIndex = '-1';
        el.style.pointerEvents = 'none';
    });
    
    // Add CSS file if not already present
    if (!document.querySelector('link[href*="background-decorations.css"]')) {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = '/static/background-decorations.css';
        document.head.appendChild(cssLink);
    }
});