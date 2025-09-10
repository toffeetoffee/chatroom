const socket = io();
const textArea = document.getElementById('textArea');
const copyCodeBtn = document.getElementById('copyCodeBtn');
const statusMessage = document.getElementById('statusMessage');

let isUpdating = false; // Flag to prevent infinite loops

function showStatus(message, type = 'success') {
    statusMessage.textContent = message;
    statusMessage.className = `status ${type}`;
    statusMessage.classList.remove('hidden');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        statusMessage.classList.add('hidden');
    }, 3000);
}

// Join the room when page loads
socket.emit('join', { room: roomCode });

// Handle text changes
textArea.addEventListener('input', () => {
    if (!isUpdating) {
        socket.emit('text_change', {
            room: roomCode,
            content: textArea.value
        });
    }
});

// Copy room code functionality
copyCodeBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(roomCode);
        showStatus('Room code copied to clipboard!');
        copyCodeBtn.textContent = 'Copied!';
        
        setTimeout(() => {
            copyCodeBtn.textContent = 'Copy Code';
        }, 2000);
    } catch (err) {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = roomCode;
        document.body.appendChild(textArea);
        textArea.select();
        textArea.setSelectionRange(0, 99999); // For mobile devices
        
        try {
            document.execCommand('copy');
            showStatus('Room code copied to clipboard!');
            copyCodeBtn.textContent = 'Copied!';
            
            setTimeout(() => {
                copyCodeBtn.textContent = 'Copy Code';
            }, 2000);
        } catch (err) {
            showStatus('Failed to copy room code', 'error');
        }
        
        document.body.removeChild(textArea);
    }
});

// Socket event handlers
socket.on('content_update', (data) => {
    if (data.content !== textArea.value) {
        isUpdating = true;
        
        // Save cursor position
        const cursorPosition = textArea.selectionStart;
        
        // Update content
        textArea.value = data.content;
        
        // Restore cursor position (approximately)
        textArea.setSelectionRange(cursorPosition, cursorPosition);
        
        isUpdating = false;
    }
});

socket.on('user_joined', (data) => {
    showStatus('Someone joined the room');
});

socket.on('user_left', (data) => {
    showStatus('Someone left the room');
});

socket.on('connect', () => {
    // Rejoin room on reconnect
    socket.emit('join', { room: roomCode });
});

socket.on('disconnect', () => {
    showStatus('Connection lost. Trying to reconnect...', 'error');
});

socket.on('connect_error', () => {
    showStatus('Connection error. Please refresh the page.', 'error');
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    socket.emit('leave', { room: roomCode });
});

// Focus on text area when page loads
textArea.focus();