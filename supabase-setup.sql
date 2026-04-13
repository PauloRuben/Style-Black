-- ============================================
-- STYLE BLACK - SUPABASE SETUP
-- E-commerce Database Schema
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: PRODUTOS
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    description TEXT,
    image TEXT,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Índices para produtos
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: CLIENTES (Perfis de usuários)
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Trigger para customers
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: PEDIDOS
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE,
    customer_id UUID REFERENCES customers(id),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    shipping_address TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_state TEXT NOT NULL,
    shipping_zip TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Índices para pedidos
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Trigger para número do pedido automático
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'SB' || TO_CHAR(NOW(), 'YYMM') || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar sequência para números de pedido
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Aplicar trigger
DROP TRIGGER IF EXISTS set_order_number ON orders;
CREATE TRIGGER set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Trigger para updated_at
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: ITENS DO PEDIDO
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    total DECIMAL(10,2) GENERATED ALWAYS AS (quantity * price) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Índices para itens do pedido
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- ============================================
-- TABELA: CARRINHOS (Opcional - para persistir carrinho)
-- ============================================
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(cart_id, product_id)
);

-- ============================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Políticas para PRODUCTS
-- Todos podem visualizar
CREATE POLICY "Produtos visíveis para todos"
    ON products FOR SELECT
    USING (true);

-- Apenas usuários autenticados podem modificar
CREATE POLICY "Produtos editáveis por usuários autenticados"
    ON products FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Políticas para CUSTOMERS
CREATE POLICY "Clientes podem ver próprio perfil"
    ON customers FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Clientes podem editar próprio perfil"
    ON customers FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Permitir inserção durante registro
CREATE POLICY "Permitir inserção de cliente"
    ON customers FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Políticas para ORDERS
CREATE POLICY "Pedidos visíveis para usuários autenticados"
    ON orders FOR SELECT
    TO authenticated
    USING (
        customer_id IN (
            SELECT id FROM customers WHERE user_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin')
    );

CREATE POLICY "Pedidos podem ser criados por usuários autenticados"
    ON orders FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Pedidos editáveis por admins"
    ON orders FOR UPDATE
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin')
    );

-- Políticas para ORDER_ITEMS
CREATE POLICY "Itens de pedido visíveis para dono do pedido"
    ON order_items FOR SELECT
    TO authenticated
    USING (
        order_id IN (
            SELECT id FROM orders WHERE customer_id IN (
                SELECT id FROM customers WHERE user_id = auth.uid()
            )
        ) OR
        EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin')
    );

CREATE POLICY "Itens de pedido inseríveis por usuários autenticados"
    ON order_items FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Políticas para CARTS
CREATE POLICY "Carrinhos visíveis para dono"
    ON carts FOR SELECT
    TO authenticated
    USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

CREATE POLICY "Carrinhos gerenciáveis por dono"
    ON carts FOR ALL
    TO authenticated
    USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()))
    WITH CHECK (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

-- Políticas para CART_ITEMS
CREATE POLICY "Itens do carrinho visíveis para dono"
    ON cart_items FOR SELECT
    TO authenticated
    USING (
        cart_id IN (
            SELECT id FROM carts WHERE customer_id IN (
                SELECT id FROM customers WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Itens do carrinho gerenciáveis por dono"
    ON cart_items FOR ALL
    TO authenticated
    USING (
        cart_id IN (
            SELECT id FROM carts WHERE customer_id IN (
                SELECT id FROM customers WHERE user_id = auth.uid()
            )
        )
    );

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para decrementar estoque
CREATE OR REPLACE FUNCTION decrement_stock(product_id INTEGER, quantity INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE products
    SET stock = stock - quantity
    WHERE id = product_id AND stock >= quantity;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Estoque insuficiente';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para incrementar estoque (em caso de cancelamento)
CREATE OR REPLACE FUNCTION increment_stock(product_id INTEGER, quantity INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE products
    SET stock = stock + quantity
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter estatísticas do dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
    total_orders BIGINT,
    total_revenue DECIMAL,
    total_products BIGINT,
    low_stock BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status != 'cancelled') as total_revenue,
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COUNT(*) FROM products WHERE stock <= 5) as low_stock;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DADOS INICIAIS (Opcional)
-- ============================================

-- Inserir produtos de exemplo (descomente se desejar)
/*
INSERT INTO products (name, category, price, stock, description, image, featured) VALUES
('Vestido de Gala Preto', 'roupas', 899.90, 15, 'Vestido elegante em cetim preto com detalhes em prata.', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop', true),
('Terno Slim Fit Black', 'roupas', 1299.90, 20, 'Terno executivo em lã italiana preta.', 'https://images.unsplash.com/photo-1594938298603-c8148c472f36?w=500&auto=format&fit=crop', true),
('Relógio Silver Edition', 'acessorios', 2499.90, 8, 'Relógio suíço com pulseira em aço inoxidável.', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&auto=format&fit=crop', true),
('Sapato Social Preto', 'calcados', 459.90, 25, 'Sapato de couro legítimo com solado em couro.', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&auto=format&fit=crop', false),
('Bolsa de Couro Preta', 'bolsas', 799.90, 12, 'Bolsa em couro italiano com ferragens prateadas.', 'https://images.unsplash.com/photo-1584917865442-deca364f4de4?w=500&auto=format&fit=crop', true),
('Colar de Prata 925', 'joias', 599.90, 30, 'Colar em prata 925 com pingente em forma de gota.', 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=500&auto=format&fit=crop', false),
('Scarf de Seda', 'acessorios', 199.90, 40, 'Lenço de seda pura com padrões geométricos.', 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500&auto=format&fit=crop', false),
('Anel de Prata Bold', 'joias', 349.90, 18, 'Anel statement em prata com design moderno.', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop', false);
*/

-- ============================================
-- STORAGE (Bucket para imagens)
-- ============================================

-- Criar bucket para imagens (executar no painel Storage do Supabase)
-- Bucket name: product-images
-- Public: true

-- Políticas de Storage (adicionar no painel Storage)
-- INSERT: auth.role() = 'authenticated'
-- SELECT: true (public)
-- DELETE: auth.role() = 'authenticated'

-- ============================================
-- CONFIGURAÇÃO CONCLUÍDA!
-- ============================================
