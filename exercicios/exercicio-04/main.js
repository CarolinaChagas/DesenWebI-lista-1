document.addEventListener('DOMContentLoaded', () => {
    const takePhotoBtn = document.getElementById('takePhotoBtn');
    const uploadPhotoInput = document.getElementById('uploadPhotoInput');
    const uploadPhotoContainer = document.getElementById('uploadPhotoContainer');
    const markLocationBtn = document.getElementById('markLocationBtn');
    const manualLocationContainer = document.getElementById('manualLocationContainer');
    const latitudeInput = document.getElementById('latitudeInput');
    const longitudeInput = document.getElementById('longitudeInput');
    const saveBtn = document.getElementById('saveBtn');
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const photoContainer = document.getElementById('photoContainer');
    const photoTableBody = document.querySelector('#photoTable tbody');
    const detailsModal = document.getElementById('detailsModal');
    const detailsImage = document.getElementById('detailsImage');
    const detailsTitle = document.getElementById('detailsTitle');
    const detailsDescription = document.getElementById('detailsDescription');
    const detailsLocation = document.getElementById('detailsLocation');
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn'); // Adicionei esta linha
    const closeDetails = document.getElementById('closeDetails');
    let currentPhoto = null;
    let currentLocation = null;
    let editingPhotoId = null;
    let map;

    // Ocultar o botão de upload por padrão
    uploadPhotoInput.style.display = 'none';

    // Tentar acessar a câmera do dispositivo
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                const video = document.createElement('video');
                video.srcObject = stream;
                video.play();
                photoContainer.appendChild(video);

                takePhotoBtn.addEventListener('click', () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas.getContext('2d').drawImage(video, 0, 0);
                    currentPhoto = canvas.toDataURL('image/png');
                    photoContainer.innerHTML = `<img src="${currentPhoto}" alt="Foto">`;
                    stream.getTracks().forEach(track => track.stop());
                    video.remove();
                });
            })
            .catch(() => {
                alert("Câmera não disponível. O upload de fotos será ativado.");
                uploadPhotoInput.style.display = 'flex';
            });
    } 
    
    else {
        alert("Nenhuma câmera disponível. O upload de fotos será ativado.");
        uploadPhotoInput.style.display = 'flex';
    }

    // Upload de foto
    uploadPhotoInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            currentPhoto = e.target.result;
            photoContainer.innerHTML = `<img src="${currentPhoto}" alt="Foto">`;
        };
        reader.readAsDataURL(file);
    });

    // Marcar localização
    markLocationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                currentLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                displayMap(currentLocation);
            }, () => {
                alert("Não foi possível obter a localização automaticamente.");
                manualLocationContainer.style.display = 'block';
            });
        } else {
            alert("Geolocalização não suportada.");
            manualLocationContainer.style.display = 'block';
        }
    });

    // Função para exibir o mapa
    function displayMap(location) {
        if (map) {
            map.remove();
        }

        map = L.map('mapContainer').setView([location.latitude, location.longitude], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map);

        L.marker([location.latitude, location.longitude]).addTo(map)
            .bindPopup('Localização marcada!')
            .openPopup();
    }

    // Salvar foto
    saveBtn.addEventListener('click', () => {
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();

        if (!currentLocation && manualLocationContainer.style.display === 'block') {
            const latitude = parseFloat(latitudeInput.value);
            const longitude = parseFloat(longitudeInput.value);

            if (!isNaN(latitude) && !isNaN(longitude)) {
                currentLocation = { latitude, longitude };
            } else {
                alert('Por favor, insira uma latitude e longitude válidas.');
                return;
            }
        }

        if (!title || !currentPhoto || !currentLocation) {
            alert('Por favor, preencha todos os campos obrigatórios e marque a localização.');
            return;
        }

        const photos = JSON.parse(localStorage.getItem('photos')) || [];
        const photoId = editingPhotoId ? editingPhotoId : Date.now();

        // Adicionando ou editando a foto
        const photoData = {
            id: photoId,
            title,
            description,
            location: currentLocation,
            photo: currentPhoto
        };

        if (editingPhotoId) {
            const index = photos.findIndex(photo => photo.id === editingPhotoId);
            if (index !== -1) {
                photos[index] = photoData; // Atualiza a foto
            }
            editingPhotoId = null; // Reseta o ID de edição após salvar
        } 
        
        else {
            photos.push(photoData); // Cria um novo registro de foto
        }

        localStorage.setItem('photos', JSON.stringify(photos));
        photoTableBody.innerHTML = ''; // Limpa a tabela
        loadPhotos(); // Carrega as fotos do localStorage
        clearForm(); // Limpa o formulário
    });

    // Carregar fotos salvas
    function loadPhotos() {
        const photos = JSON.parse(localStorage.getItem('photos')) || [];
        photos.forEach(photoData => addPhotoToTable(photoData));
    }

    // Adicionar foto à tabela
    function addPhotoToTable(photoData) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${photoData.id}</td>
            <td>${photoData.title}</td>
            <td>${photoData.description}</td>
            <td>${photoData.location.latitude}, ${photoData.location.longitude}</td>
            <td><img src="${photoData.photo}" alt="Foto" width="100"></td>
            <td>
                <button class="viewMapBtn" onclick="viewMap(${photoData.location.latitude}, ${photoData.location.longitude})">Ver Mapa</button>
            </td>
            <td>
                <button class="visualizar" onclick="viewPhoto(${photoData.id})">Ver</button>
                <button class="editar" onclick="editPhoto(${photoData.id})">Editar</button>
                <button class="excluir" onclick="confirmDelete(${photoData.id})">Excluir</button>
            </td>
        `;
        photoTableBody.appendChild(row);
    }

    // Limpar formulário
    function clearForm() {
        titleInput.value = '';
        descriptionInput.value = '';
        latitudeInput.value = '';
        longitudeInput.value = '';
        photoContainer.innerHTML = '';
        photoContainer.style.display = 'none';
        manualLocationContainer.style.display = 'none';
        currentPhoto = null;
        currentLocation = null;
    }

    // Ver foto
    window.viewPhoto = function (id) {
        const photos = JSON.parse(localStorage.getItem('photos')) || [];
        const photoData = photos.find(photo => photo.id === id);
        if (photoData) {
            detailsImage.src = photoData.photo;
            detailsTitle.innerText = `Título: ${photoData.title}`;
            detailsDescription.innerText = `Descrição: ${photoData.description}`;
            detailsLocation.innerText = `Localização: ${photoData.location.latitude}, ${photoData.location.longitude}`;
            detailsModal.style.display = 'block';
        }
    };

    // Fechar modal de detalhes
    closeDetails.addEventListener('click', () => {
        detailsModal.style.display = 'none';
    });

    // Confirmar exclusão
    window.confirmDelete = function (id) {
        confirmDeleteModal.style.display = 'block';
        confirmDeleteBtn.onclick = function () {
            deletePhoto(id);
            confirmDeleteModal.style.display = 'none';
        };
        cancelDeleteBtn.onclick = function () { // Adicionando funcionalidade para cancelar exclusão
            confirmDeleteModal.style.display = 'none';
        };
    };

    // Excluir foto
    function deletePhoto(id) {
        let photos = JSON.parse(localStorage.getItem('photos')) || [];
        photos = photos.filter(photo => photo.id !== id);
        localStorage.setItem('photos', JSON.stringify(photos));
        photoTableBody.innerHTML = '';
        loadPhotos();
    }

    // Editar foto
    window.editPhoto = function (id) {
        const photos = JSON.parse(localStorage.getItem('photos')) || [];
        const photoData = photos.find(photo => photo.id === id);
        if (photoData) {
            titleInput.value = photoData.title;
            descriptionInput.value = photoData.description;
            currentPhoto = photoData.photo;
            photoContainer.innerHTML = `<img src="${currentPhoto}" alt="Foto">`;
            photoContainer.style.display = 'flex';
            currentLocation = photoData.location;
            editingPhotoId = id;
        }
    };

    // Ver mapa
    window.viewMap = function (latitude, longitude) {
        displayMap({ latitude, longitude });
    };

    // Carregar fotos salvas ao iniciar a página
    loadPhotos();
});