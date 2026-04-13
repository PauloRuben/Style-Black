// ============================================
// STYLE BLACK - E-COMMERCE COM SUPABASE
// ============================================

// Configuração do Supabase
// Substitua estas variáveis pelas suas credenciais do Supabase
const SUPABASE_URL = 'https://snzyiuswrhuyybdmdvki.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuenlpdXN3cmh1eXliZG1kdmtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NzUxMDQsImV4cCI6MjA5MDE1MTEwNH0.i0xL9mYKOVbMnGNRB89M3_d8ohHrjbFWDBaHpFrpyAk';

// Inicialização do cliente Supabase
// Usamos 'sbClient' ao invés de 'sbClient' para evitar conflito com a global
let sbClient = null;

// Verificar conexão com Supabase
function checkSupabaseConnection() {
    if (!sbClient) {
        showToast('Erro: Não foi possível conectar ao servidor. Recarregue a página.', 'error');
        return false;
    }
    return true;
}

try {
    if (typeof window !== 'undefined' && window.supabase) {
        sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Supabase conectado com sucesso!');
    } else {
        console.error('❌ Biblioteca Supabase não carregada.');
        sbClient = null;
    }
} catch (error) {
    console.error('❌ Erro ao conectar Supabase:', error);
    sbClient = null;
}

// ============================================
// ESTADO DA APLICAÇÃO
// ============================================
const state = {
    products: [],
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    admin: JSON.parse(localStorage.getItem('admin')) || null,
    orders: [],
    currentFilter: 'todos',
    searchQuery: ''
};

// Credenciais do Admin (em produção, use um backend seguro)
const ADMIN_CREDENTIALS = {
    email: 'admin@styleblack.com',
    password: 'admin123'
};

// ============================================
// FUNÇÕES DO SUPABASE
// ============================================

// Buscar produtos do Supabase
async function fetchProducts() {
    if (!checkSupabaseConnection()) {
        state.products = [];
        return;
    }

    try {
        const { data, error } = await sbClient
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        state.products = data || [];
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        state.products = [];
        showToast('Erro ao carregar produtos do servidor', 'error');
    }
}

// Adicionar produto ao Supabase
async function addProduct(product) {
    if (!checkSupabaseConnection()) {
        throw new Error('Sem conexão com o servidor');
    }

    try {
        const { data, error } = await sbClient
            .from('products')
            .insert([product])
            .select()
            .single();

        if (error) throw error;

        state.products.unshift(data);
        showToast('Produto adicionado com sucesso!');
        return data;
    } catch (error) {
        console.error('Erro ao adicionar produto:', error);
        showToast('Erro ao adicionar produto', 'error');
        throw error;
    }
}

// Atualizar produto no Supabase
async function updateProduct(id, updates) {
    if (!checkSupabaseConnection()) {
        throw new Error('Sem conexão com o servidor');
    }

    try {
        const { error } = await sbClient
            .from('products')
            .update(updates)
            .eq('id', id);

        if (error) throw error;

        await fetchProducts();
        showToast('Produto atualizado com sucesso!');
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        showToast('Erro ao atualizar produto', 'error');
        throw error;
    }
}

// Excluir produto do Supabase
async function deleteProduct(id) {
    if (!checkSupabaseConnection()) {
        throw new Error('Sem conexão com o servidor');
    }

    try {
        const { error } = await sbClient
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await fetchProducts();
        showToast('Produto excluído com sucesso!');
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        showToast('Erro ao excluir produto', 'error');
        throw error;
    }
}

// Criar pedido no Supabase
async function createOrder(orderData) {
    if (!checkSupabaseConnection()) {
        throw new Error('Sem conexão com o servidor');
    }

    try {
        const { data, error } = await sbClient
            .from('orders')
            .insert([orderData])
            .select()
            .single();

        if (error) throw error;

        // Inserir itens do pedido
        const orderItems = state.cart.map(item => ({
            order_id: data.id,
            product_id: item.id,
            product_name: item.name,
            quantity: item.quantity,
            price: item.price
        }));

        await sbClient.from('order_items').insert(orderItems);

        showToast('Pedido realizado com sucesso!');
        return data;
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        showToast('Erro ao realizar pedido', 'error');
        throw error;
    }
}

// Buscar pedidos do Supabase
async function fetchOrders() {
    if (!checkSupabaseConnection()) {
        state.orders = [];
        return;
    }

    try {
        const { data, error } = await sbClient
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        state.orders = data || [];
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        state.orders = [];
    }
}

// Atualizar status do pedido
async function updateOrderStatus(orderId, status) {
    if (!checkSupabaseConnection()) {
        throw new Error('Sem conexão com o servidor');
    }

    try {
        const { error } = await sbClient
            .from('orders')
            .update({ status })
            .eq('id', orderId);

        if (error) throw error;

        await fetchOrders();
        showToast('Status do pedido atualizado!');
    } catch (error) {
        console.error('Erro ao atualizar pedido:', error);
        showToast('Erro ao atualizar status', 'error');
    }
}

// Autenticação Admin
function loginAdmin(email, password) {
    return new Promise((resolve, reject) => {
        // Verificar credenciais (em produção, use um backend seguro)
        if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
            state.admin = {
                email: email,
                name: 'Administrador',
                role: 'admin',
                loggedAt: new Date().toISOString()
            };
            localStorage.setItem('admin', JSON.stringify(state.admin));
            showToast('Login administrativo realizado com sucesso!');
            resolve(state.admin);
        } else {
            showToast('Credenciais inválidas!', 'error');
            reject(new Error('Credenciais inválidas'));
        }
    });
}

function logoutAdmin() {
    state.admin = null;
    localStorage.removeItem('admin');
    showToast('Logout administrativo realizado!');
    updateAdminUI();
}

function isAdminLoggedIn() {
    return state.admin !== null;
}

// ============================================
// FUNÇÕES DA INTERFACE
// ============================================

// Renderizar produtos
function renderProducts() {
    const grid = document.getElementById('productsGrid');

    // Verificar se há conexão
    if (!sbClient) {
        grid.innerHTML = `
            <div class="loading" style="grid-column: 1/-1;">
                <i class="fas fa-exclamation-triangle" style="color: #dc3545;"></i>
                <p>Erro de conexão com o servidor</p>
                <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 15px;">Recarregar Página</button>
            </div>
        `;
        return;
    }

    let filteredProducts = state.products;

    // Filtrar por categoria
    if (state.currentFilter !== 'todos') {
        filteredProducts = filteredProducts.filter(p => p.category === state.currentFilter);
    }

    // Filtrar por busca
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
        );
    }

    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div class="loading" style="grid-column: 1/-1;">
                <i class="fas fa-search"></i>
                <p>Nenhum produto encontrado</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                ${product.image ?
                    `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
                <div class="product-placeholder" style="display: ${product.image ? 'none' : 'flex'}; width: 100%; height: 100%; align-items: center; justify-content: center; background: var(--color-black-light);">
                    <i class="fas fa-image" style="font-size: 40px; color: var(--color-gray);"></i>
                </div>
                ${product.stock <= 5 ? '<span class="product-badge">Últimas unidades</span>' : ''}
                <div class="product-actions">
                    <button class="product-action-btn" onclick="addToCart(${product.id})" title="Adicionar ao Carrinho">
                        <i class="fas fa-shopping-bag"></i>
                    </button>
                    <button class="product-action-btn" onclick="showProductDetails(${product.id})" title="Ver Detalhes">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <div class="product-category">${getCategoryName(product.category)}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">
                    R$ ${product.price.toFixed(2).replace('.', ',')}
                </div>
            </div>
        </div>
    `).join('');
}

// Nome da categoria
function getCategoryName(category) {
    const names = {
        'roupas': 'Roupas',
        'acessorios': 'Acessórios',
        'calcados': 'Calçados',
        'bolsas': 'Bolsas',
        'joias': 'Joias'
    };
    return names[category] || category;
}

// Adicionar ao carrinho
function addToCart(productId) {
    const product = state.products.find(p => p.id == productId);
    if (!product) return;

    const existingItem = state.cart.find(item => item.id == productId);

    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            showToast('Quantidade máxima em estoque atingida', 'error');
            return;
        }
    } else {
        state.cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    showToast('Produto adicionado ao carrinho!');
}

// Remover do carrinho
function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.id != productId);
    saveCart();
    updateCartUI();
}

// Atualizar quantidade
function updateQuantity(productId, change) {
    const item = state.cart.find(item => item.id == productId);
    const product = state.products.find(p => p.id == productId);

    if (!item) return;

    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
        removeFromCart(productId);
    } else if (newQuantity <= product.stock) {
        item.quantity = newQuantity;
        saveCart();
        updateCartUI();
    } else {
        showToast('Quantidade máxima em estoque atingida', 'error');
    }
}

// Salvar carrinho
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(state.cart));
}

// Atualizar UI do carrinho
function updateCartUI() {
    const count = document.getElementById('cartCount');
    const items = document.getElementById('cartItems');
    const empty = document.getElementById('cartEmpty');
    const footer = document.getElementById('cartFooter');
    const total = document.getElementById('totalPrice');

    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    count.textContent = totalItems;

    if (state.cart.length === 0) {
        items.innerHTML = '';
        empty.style.display = 'block';
        footer.style.display = 'none';
    } else {
        empty.style.display = 'none';
        footer.style.display = 'block';

        items.innerHTML = state.cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<i class="fas fa-image"></i>'}
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    total.textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
}

// Mostrar toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const icon = toast.querySelector('i');

    toastMessage.textContent = message;

    if (type === 'error') {
        icon.className = 'fas fa-times-circle';
        icon.style.color = '#dc3545';
    } else {
        icon.className = 'fas fa-check-circle';
        icon.style.color = '#28a745';
    }

    toast.classList.add('active');

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// Abrir/fechar modais
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = '';
}

// Renderizar tabela de produtos (Admin)
function renderAdminProducts() {
    const tbody = document.querySelector('#productsTable tbody');

    if (state.products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">Nenhum produto cadastrado</td></tr>';
        return;
    }

    tbody.innerHTML = state.products.map(product => `
        <tr>
            <td>
                ${product.image ?
                    `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-image\\' style=\\'font-size: 24px; color: var(--color-gray);\\'></i>';">` :
                    '<i class="fas fa-image" style="font-size: 24px; color: var(--color-gray);"></i>'
                }
            </td>
            <td>${product.name}</td>
            <td>${getCategoryName(product.category)}</td>
            <td>R$ ${product.price.toFixed(2).replace('.', ',')}</td>
            <td>${product.stock}</td>
            <td class="actions">
                <button class="admin-btn" style="background: #ffc107; color: #000;" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="admin-btn" style="background: #dc3545; color: #fff;" onclick="confirmDeleteProduct(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Renderizar tabela de pedidos (Admin)
function renderAdminOrders() {
    const tbody = document.querySelector('#ordersTable tbody');

    if (state.orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">Nenhum pedido encontrado</td></tr>';
        return;
    }

    tbody.innerHTML = state.orders.map(order => `
        <tr>
            <td>#${order.id.toString().slice(-6)}</td>
            <td>${order.customer_name || order.customer_email}</td>
            <td>${new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
            <td>R$ ${parseFloat(order.total).toFixed(2).replace('.', ',')}</td>
            <td><span class="status-badge status-${order.status}">${getStatusName(order.status)}</span></td>
            <td class="actions">
                <select onchange="updateOrderStatus('${order.id}', this.value)" style="padding: 5px 10px; border-radius: 5px; border: 1px solid var(--color-black-lighter); background: var(--color-black); color: var(--color-silver);">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pendente</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processando</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Enviado</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Entregue</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
                </select>
            </td>
        </tr>
    `).join('');
}

function getStatusName(status) {
    const names = {
        'pending': 'Pendente',
        'processing': 'Processando',
        'shipped': 'Enviado',
        'delivered': 'Entregue',
        'cancelled': 'Cancelado'
    };
    return names[status] || status;
}

// Editar produto
let editingProductId = null;

function editProduct(productId) {
    const product = state.products.find(p => p.id == productId);
    if (!product) return;

    editingProductId = productId;

    document.getElementById('productModalTitle').textContent = 'Editar Produto';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productImage').value = product.image || '';

    openModal('productModal');
}

// Confirmar exclusão
function confirmDeleteProduct(productId) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        deleteProduct(productId).then(() => {
            renderAdminProducts();
            renderProducts();
        });
    }
}

// Mostrar detalhes do produto
function showProductDetails(productId) {
    const product = state.products.find(p => p.id == productId);
    if (!product) return;

    alert(`Detalhes do Produto:\n\nNome: ${product.name}\nCategoria: ${getCategoryName(product.category)}\nPreço: R$ ${product.price.toFixed(2).replace('.', ',')}\nEstoque: ${product.stock}\n\n${product.description || 'Sem descrição'}`);
}

// Atualizar UI geral
function updateUI() {
    updateCartUI();
    updateAdminUI();
    renderProducts();
    renderAdminProducts();
}

// Atualizar ícone do admin
function updateAdminUI() {
    const adminBtn = document.getElementById('adminBtn');
    if (!adminBtn) return;

    if (state.admin) {
        adminBtn.style.color = '#c9a962';
        adminBtn.title = `Painel Admin - ${state.admin.name}`;
    } else {
        adminBtn.style.color = '';
        adminBtn.title = 'Painel Admin';
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar dados
    await fetchProducts();
    await fetchOrders();
    updateUI();

    // Filtros de produtos
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentFilter = btn.dataset.filter;
            renderProducts();
        });
    });

    // Categorias
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active');
                if (b.dataset.filter === category) {
                    b.classList.add('active');
                }
            });
            state.currentFilter = category;
            renderProducts();
            document.getElementById('produtos').scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Busca
    document.getElementById('searchInput').addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderProducts();
    });

    // Carrinho
    document.getElementById('cartBtn').addEventListener('click', () => openModal('cartModal'));
    document.getElementById('closeCart').addEventListener('click', () => closeModal('cartModal'));

    // Login Admin
    document.getElementById('closeAdminLogin').addEventListener('click', () => closeModal('adminLoginModal'));

    // Formulário de login admin
    document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('adminLoginEmail').value;
        const password = document.getElementById('adminLoginPassword').value;

        try {
            await loginAdmin(email, password);
            closeModal('adminLoginModal');
            updateAdminUI();
            openModal('adminModal');
            renderAdminProducts();
            renderAdminOrders();
        } catch (error) {
            // Erro já tratado na função
        }
    });

    // Checkout
    document.getElementById('checkoutBtn').addEventListener('click', () => {
        if (state.cart.length === 0) {
            showToast('Adicione itens ao carrinho primeiro', 'error');
            return;
        }
        if (!checkSupabaseConnection()) {
            return;
        }
        closeModal('cartModal');

        // Atualizar resumo do pedido
        const summaryItems = document.getElementById('summaryItems');
        const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        summaryItems.innerHTML = state.cart.map(item => `
            <div class="summary-item">
                <span>${item.name} x${item.quantity}</span>
                <span>R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
            </div>
        `).join('');

        document.getElementById('checkoutTotal').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

        openModal('checkoutModal');
    });
    document.getElementById('closeCheckout').addEventListener('click', () => closeModal('checkoutModal'));

    // Formulário de checkout
    document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        if (state.cart.length === 0) {
            showToast('Carrinho vazio', 'error');
            return;
        }

        const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

        const orderData = {
            customer_name: document.getElementById('checkoutName').value,
            customer_email: document.getElementById('checkoutEmail').value,
            customer_phone: document.getElementById('checkoutPhone').value,
            shipping_address: document.getElementById('checkoutAddress').value,
            shipping_city: document.getElementById('checkoutCity').value,
            shipping_state: document.getElementById('checkoutState').value,
            shipping_zip: document.getElementById('checkoutZip').value,
            payment_method: paymentMethod,
            total: total,
            items: state.cart
        };

        try {
            await createOrder(orderData);
            state.cart = [];
            saveCart();
            updateCartUI();
            closeModal('checkoutModal');
            document.getElementById('checkoutForm').reset();
        } catch (error) {
            // Erro já tratado
        }
    });

    // Painel Admin
    document.getElementById('adminBtn').addEventListener('click', () => {
        if (isAdminLoggedIn()) {
            // Se já estiver logado como admin, mostra o painel
            openModal('adminModal');
            renderAdminProducts();
            renderAdminOrders();
        } else {
            // Se não estiver logado, mostra o modal de login
            openModal('adminLoginModal');
        }
    });
    document.getElementById('closeAdmin').addEventListener('click', () => closeModal('adminModal'));

    // Logout Admin
    document.getElementById('adminLogoutBtn').addEventListener('click', () => {
        if (confirm('Deseja sair do painel administrativo?')) {
            logoutAdmin();
            closeModal('adminModal');
        }
    });

    // Tabs do admin
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-content').forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(`admin${tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1)}`).classList.add('active');
        });
    });

    // Modal de produto (admin)
    document.getElementById('addProductBtn').addEventListener('click', () => {
        editingProductId = null;
        document.getElementById('productModalTitle').textContent = 'Novo Produto';
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        openModal('productModal');
    });
    document.getElementById('closeProductModal').addEventListener('click', () => closeModal('productModal'));

    // Formulário de produto
    document.getElementById('productForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const productData = {
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            description: document.getElementById('productDescription').value,
            image: document.getElementById('productImage').value
        };

        try {
            if (editingProductId) {
                await updateProduct(editingProductId, productData);
            } else {
                await addProduct(productData);
            }

            closeModal('productModal');
            document.getElementById('productForm').reset();
            editingProductId = null;
            renderAdminProducts();
            renderProducts();
        } catch (error) {
            // Erro já tratado
        }
    });

    // Newsletter
    document.getElementById('newsletterForm').addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Inscrição realizada com sucesso!');
        e.target.reset();
    });

    // Fechar modal ao clicar fora
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Menu mobile
    document.querySelector('.mobile-menu-btn').addEventListener('click', () => {
        document.querySelector('.nav').classList.toggle('active');
    });

    // Scroll suave para links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Header scroll effect
    const header = document.querySelector('.header');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    });
});

// Expor funções globais
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.editProduct = editProduct;
window.confirmDeleteProduct = confirmDeleteProduct;
window.updateOrderStatus = async (orderId, status) => {
    await updateOrderStatus(orderId, status);
    renderAdminOrders();
};
window.showProductDetails = showProductDetails;
window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;
window.isAdminLoggedIn = isAdminLoggedIn;
