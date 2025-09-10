const socket = io();

const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomCodeInput = document.getElementById('roomCodeInput');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    successMessage.classList.add('hidden');
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.classList.remove('hidden');
    errorMessage.classList.add('hidden');
}

function hideMessages() {
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');
}

// Create room functionality
createRoomBtn.addEventListener('click', () => {
    hideMessages();
    createRoomBtn.disabled = true;
    createRoomBtn.textContent = 'Creating...';
    
    socket.emit('create_room');
});

// Join room functionality
joinRoomBtn.addEventListener('click', () => {
    const roomCode = roomCodeInput.value.trim().toUpperCase();
    
    if (!roomCode) {
        showError('Please enter a room code');
        return;
    }
    
    if (roomCode.length !== 6) {
        showError('Room code must be 6 characters');
        return;
    }
    
    hideMessages();
    joinRoomBtn.disabled = true;
    joinRoomBtn.textContent = 'Joining...';
    
    socket.emit('join_room_request', { room_code: roomCode });
});

// Handle room code input
roomCodeInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase();
});

roomCodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinRoomBtn.click();
    }
});

// Socket event handlers
socket.on('room_created', (data) => {
    showSuccess(`Room created! Code: ${data.room_code}`);
    
    // Redirect to room after a short delay
    setTimeout(() => {
        window.location.href = `/room/${data.room_code}`;
    }, 1500);
});

socket.on('join_room_success', (data) => {
    showSuccess('Room found! Joining...');
    
    // Redirect to room
    setTimeout(() => {
        window.location.href = `/room/${data.room_code}`;
    }, 1000);
});

socket.on('join_room_error', (data) => {
    showError(data.message);
    joinRoomBtn.disabled = false;
    joinRoomBtn.textContent = 'Join Room';
});

// Reset button states on any error
socket.on('connect_error', () => {
    createRoomBtn.disabled = false;
    createRoomBtn.textContent = 'Create Room';
    joinRoomBtn.disabled = false;
    joinRoomBtn.textContent = 'Join Room';
    showError('Connection error. Please try again.');
});