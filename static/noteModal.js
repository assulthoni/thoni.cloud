// Note card modal functionality
document.addEventListener('DOMContentLoaded', () => {
    const noteCards = document.querySelectorAll('.note-card');
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.display = 'none';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    noteCards.forEach(noteCard => {
        noteCard.addEventListener('click', (event) => {
            // Don't trigger modal if clicking on action buttons
            if (event.target.closest('.note-actions') || 
                event.target.closest('.button')) {
                return;
            }
            
            // Get the title and content from the note card
            const title = noteCard.querySelector('h2').innerHTML;
            const content = noteCard.querySelector('.note-content').innerHTML;
            
            // Create formatted content for the modal
            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close-btn">×</button>
                </div>
                <div class="modal-note-content">${content}</div>
            `;
            modalOverlay.style.display = 'flex';
            
            // Add event listener to the close button
            const closeBtn = modalContent.querySelector('.modal-close-btn');
            closeBtn.addEventListener('click', () => {
                modalOverlay.style.display = 'none';
            });
        });
    });
    
    // Add styling to the modal content and close button
    const style = document.createElement('style');
    style.textContent = `
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }
        .modal-content h2 {
            margin: 0;
        }
        .modal-close-btn {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            padding: 0 8px;
            line-height: 1;
            color: #333;
            transition: color 0.2s;
        }
        .modal-close-btn:hover {
            color: #000;
        }
        .modal-note-content {
            line-height: 1.5;
        }
    `;
    document.head.appendChild(style);


    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.style.display = 'none';
        }
    });
});