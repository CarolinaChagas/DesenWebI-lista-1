document.addEventListener('DOMContentLoaded', () => {
    const takePhotoBtn = document.getElementById('takePhotoBtn');
    const uploadPhotoInput = document.getElementById('uploadPhotoInput');
    const markLocationBtn = document.getElementById('markLocationBtn');
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
    const closeDetails = document.getElementById('closeDetails');
    const closeConfirmDelete = document.getElementById('closeConfirmDelete');

    let currentPhoto = null;
    let currentLocation = null;
    let editingPhotoId = null;

    // Acessar a câmera do dispositivo
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            document.body.appendChild(video);

            takePhotoBtn.addEventListener('click', () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);
                currentPhoto = canvas.toDataURL('image/png');
                photoContainer.innerHTML = `<img src="${currentPhoto}" alt="Foto">`;
                photoContainer.style.display = 'flex'; // Mostrar o contêiner da foto
                stream.getTracks().forEach(track => track.stop());
                video.remove();
            });
        });
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
                alert("Não foi possível obter a localização. Usando localização padrão.");
                currentLocation = { latitude: -23.5505, longitude: -46.6333 }; // São Paulo
                displayMap(currentLocation);
            });
        } else {
            alert("Geolocalização não suportada. Usando localização padrão.");
            currentLocation = { latitude: -23.5505, longitude: -46.6333 }; // São Paulo
            displayMap(currentLocation);
        }
    });

    // Função para exibir o mapa
    function displayMap(location) {
        const map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: location.latitude, lng: location.longitude },
            zoom: 15
        });
        new google.maps.Marker({
            position: { lat: location.latitude, lng: location.longitude },
            map: map
        });
    }

    // Salvar foto e localização
    saveBtn.addEventListener('click', () => {
        const title = titleInput.value;
        const description = descriptionInput.value;

        if (!title || !currentPhoto || !currentLocation) {
            alert('Por favor, preencha todos os campos obrigatórios e marque a localização.');
            return;
        }

        let photos = JSON.parse(localStorage.getItem('photos')) || [];

        if (editingPhotoId) {
            const photoData = photos.find(photo => photo.id === editingPhotoId);
            photoData.title = title;
            photoData.description = description;
            photoData.photo = currentPhoto;
            photoData.location = currentLocation;
            editingPhotoId = null;
        } else {
            const photoData = {
                id: Date.now(),
                title,
                description,
                location: currentLocation,
                photo: currentPhoto
            };
            photos.push(photoData);
        }

        localStorage.setItem('photos', JSON.stringify(photos));
        photoTableBody.innerHTML = '';
        loadPhotos();
        clearForm();
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
        photoContainer.innerHTML = '';
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
        cancelDeleteBtn.onclick = function () {
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
            currentLocation = photoData.location;
            editingPhotoId = id;
        }
    };

    // Carregar fotos salvas ao iniciar a página
    loadPhotos();
});