let products = [];

// Carrega os produtos do arquivo JSON
fetch('products.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao carregar produtos: ' + response.statusText);
        }
        return response.json();
    })

    //data = dados
    .then(data => {
        products = data;

        if(window.location.pathname.includes('index.html')){
            displayProducts(products);
        }
        
        else if (window.location.pathname.includes('product.html')) {
            loadProductDetails();
        }
    });

function displayProducts(productsToDisplay) {
    const productsContainer = document.getElementById('products');
    productsContainer.innerHTML = '';
    productsToDisplay.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product';

        productDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h2>${product.name}</h2>
            <p>${product.description}</p>
            <p>Preço: R$ ${product.price.toFixed(2).replace('.',',')}</p>
            <div class= "buttons">
                <button onclick="window.location.href='product.html?id=${product.id}'">Ver Detalhes</button>
                <button onclick="addToCart(${product.id})">Adicionar ao Carrinho</button>
            </div>
        `;
        productsContainer.appendChild(productDiv);
    });
}

function filterProducts() {
    const searchValue = document.getElementById('search').value.toLowerCase();
    const categoryValue = document.getElementById('category-filter').value;
    const brandValue = document.getElementById('brand-filter').value;

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchValue);
        const matchesCategory = categoryValue ? product.category === categoryValue : true;
        const matchesBrand = brandValue ? product.brand === brandValue : true;

        return matchesSearch && matchesCategory && matchesBrand;
    });

    displayProducts(filteredProducts);
}

function addToCart(productId) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = products.find(p => p.id === productId);
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Produto adicionado ao carrinho!');
}

function displayCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.getElementById('cart');
    cartContainer.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;
        const itemDiv = document.createElement('div');
        itemDiv.innerHTML = `
            <h2>${item.name}</h2>
            <p>Preço: R$ ${item.price}</p>
            <button onclick="removeFromCart(${index})">Remover</button>
        `;
        cartContainer.appendChild(itemDiv);
    });

    cartContainer.innerHTML += `<h3 class="total">Total da Compra: R$ ${total}</h3>`;
}

function removeFromCart(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

// Função para carregar detalhes do produto
function loadProductDetails() {
    const productId = new URLSearchParams(window.location.search).get('id');
    const product = products.find(p => p.id.toString() === productId);
    const productDetailsContainer = document.getElementById('product-details');
    
    if (product) {
       
        productDetailsContainer.innerHTML = `
            <p><b>Nome do Produto:</b> ${product.name}</p>
            <p><b>Descrição:</b> ${product.description}</p>
            <p><b>Preço: </b>R$ ${product.price.toFixed(2).replace('.',',')}</p>
            <img src="${product.image}" alt="${product.name}">
            <div class="detalhes">
                <button onclick="window.history.back()">Voltar</button>
                <button onclick="addToCart(${product.id})" style="margin: 10px">Adicionar ao Carrinho</button>
            </div>
        `;
    } 
    
    else {
        productDetailsContainer.innerHTML = '<p>Produto não encontrado.</p>';
    }
}

// Chame a função ao carregar a página
if (window.location.pathname.includes('product.html')) {
    loadProductDetails();
}

// Chame a função ao carregar a página do carrinho
if (window.location.pathname.includes('cart.html')) {
    displayCart();
}

function checkout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
    } else {
        window.location.href = 'checkout.html';
    }
}

// Chame a função ao carregar a página de checkout
if (window.location.pathname.includes('checkout.html')) {
    displayOrderSummary();
}

function displayOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const orderSummary = document.getElementById('order-summary');
    let total = 0;

    if (cart.length === 0) {
        orderSummary.innerHTML = '<p>Seu carrinho está vazio.</p>';
        return;
    }

    orderSummary.innerHTML = '<h2>Resumo do Pedido</h2>';
    cart.forEach(item => {
        total += item.price;
        orderSummary.innerHTML += `
            <p>${item.name} - R$ ${item.price}</p>
        `;
    });
    orderSummary.innerHTML += `<h3>Total: R$ ${total}</h3>`;
}

// Processa o formulário de checkout
document.getElementById('checkout-form').addEventListener('submit', function(event) {
    event.preventDefault();
    alert('Compra finalizada com sucesso!');

    // Limpa o carrinho após a finalização da compra
    localStorage.removeItem('cart');
    window.location.href = 'index.html'; // Redireciona para a página inicial
});

function toggleSearch() {
    const searchInput = document.getElementById('search');
    if (searchInput.style.display === 'block' || searchInput.style.display === '') {
        searchInput.style.display = 'none'; // Oculta o input
    } else {
        searchInput.style.display = 'block'; // Mostra o input
        searchInput.focus(); // Foca no input para digitar
    }
}