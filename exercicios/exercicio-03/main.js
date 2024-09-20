const BASE_URL = 'https://picsum.photos';
const form = document.querySelector('form');
form.addEventListener('submit', handleSubmit);

async function handleSubmit(event){
    event.preventDefault(); /*para não regarregar a página estaticamente*/
    // alert('Formulário enviado');
    if(!validateForm()) return;

    const formData = new FormData(event.target);
    const largura = formData.get('largura');
    const altura = formData.get('altura');
    const quantidade = formData.get('quantidade');

    // console.log(largura,altura, quantidade);

    const url = `${BASE_URL}/${largura}/${altura}.webp`;

    try {
        const resultado = document.querySelector('section#resultado');
        resultado.innerHTML = 'Carregando....';

        const imagens = []
        for (let i = 0; i < quantidade; i++) {
            const response = await fetch(url);
            const data = await response.url
            const imageId = data.split('/')[4]
            console.log(data.split('/'));

            imagens.push({
                src: data,
                alt: `Imagem ${imageId}`,
                id: imageId
            });
            
            renderImages(imagens, resultado);

        }
    } catch (error) {
        console.log('Erro ao buscar imagens', error);
        showMessage('Erro ao buscar imagens', true);
    }
}

function validateForm() {
    const inputs = ['largura', 'altura']
    const errors = []

    showMessage('');
    
    inputs.forEach(input => {
        const element = document.querySelector(`input[name=${input}]`);
        const value = element.value;

        if (!value){
            errors.push(`O campo ${input} é obrigatório`);
        }
    });

    if (errors.length) {
        // alert(errors.join('\n'));
        showMessage(errors.join('<br>'), true);
        return false;
    }

    return true;
}

function renderImages(images, container){
    container.innerHTML = '';
    images.forEach(({src, alt, id}) => {
        const card = createImageCard(src,alt,id);
        container.appendChild(card);
    });
}

function createImageCard(src, alt, id){
    const card = document.createElement('div')
    card.classList.add('card')

    const img = document.createElement('img')
    img.src = src
    img.alt = alt

    const actions = document.createElement('div')
    actions.classList.add('actions')

    const copyLink = createActionLink('Copiar link', src)
    copyLink.addEventListener('click', (e) => {
        e.preventDefault()
        navigator.clipboard.writeText(src)
        copyLink.textContent = 'Copiado!';
    })

    const dowloadLink = createActionLink(
        'Full HD', 
        `${BASE_URL}/id/${id}/1920/1080.webp`
    )

    actions.appendChild(copyLink)
    actions.appendChild(dowloadLink)
    card.appendChild(img)
    card.appendChild(actions)

    return card
}

function createActionLink(text, href){
    const link = document.createElement('a')
    link.textContent = text
    link.href = href
    link.target = '_blank'

    return link
}

function showMessage(mensagem, isError = false){
    const messageElement = document.querySelector('div#mensagem');
    messageElement.innerHTML = mensagem;
    messageElement.className = isError ? 'error' : '';
}