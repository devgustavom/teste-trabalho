-- ============================================
-- CENTRAL DE COMPRAS - SCHEMA DO BANCO DE DADOS
-- ============================================

-- Tabela de usuários (login, perfil)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL, -- 'admin', 'supplier', 'store', 'telemarketing'
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de lojas
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    cnpj VARCHAR(20) UNIQUE,
    state VARCHAR(2) NOT NULL,
    city VARCHAR(100),
    address VARCHAR(150),
    responsible VARCHAR(100),
    phone VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de fornecedores
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    legal_name VARCHAR(150) NOT NULL,
    trade_name VARCHAR(100),
    cnpj VARCHAR(20) UNIQUE,
    state VARCHAR(2) NOT NULL,
    city VARCHAR(100),
    address VARCHAR(150),
    contact_name VARCHAR(100),
    contact_phone VARCHAR(30),
    email VARCHAR(100),
    commercial_policy TEXT,
    whatsapp_link VARCHAR(200),
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categorias de produtos
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Produtos
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campanhas promocionais
CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    banner_url VARCHAR(255),
    target_amount DECIMAL(12,2), -- Meta geral
    min_order_value DECIMAL(12,2) NOT NULL,
    start_date DATE,
    end_date DATE,
    target_type VARCHAR(20) NOT NULL, -- 'general' ou 'individual'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Produtos em campanhas
CREATE TABLE campaign_products (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(campaign_id, product_id)
);

-- Condições regionais por fornecedor/estado
CREATE TABLE state_conditions (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
    state VARCHAR(2) NOT NULL,
    cashback_percent DECIMAL(5,2) DEFAULT 0, -- em %
    payment_term INTEGER, -- em dias
    unit_adjustment DECIMAL(10,2), -- acréscimo/desconto por unidade
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(supplier_id, state)
);

-- Pedidos
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'separated', 'sent', 'delivered', 'cancelled'
    payment_type VARCHAR(30),
    is_budget BOOLEAN DEFAULT FALSE,
    notes TEXT,
    subtotal DECIMAL(12,2) NOT NULL,
    tax DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Itens do pedido
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL
);

-- Cashback recebido
CREATE TABLE cashback_entries (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    value DECIMAL(12,2) NOT NULL,
    confirmed BOOLEAN DEFAULT FALSE,
    withdrawal_request_id INTEGER,
    proof_file_url VARCHAR(255), -- URL do arquivo DANFE ou foto do orçamento
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Solicitações de saque
CREATE TABLE withdrawals (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    pix_key VARCHAR(100) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'rejected'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Arquivos enviados por fornecedores
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
    file_type VARCHAR(20), -- 'pdf', 'xls', 'image', etc.
    file_url VARCHAR(255),
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_stores_user_id ON stores(user_id);
CREATE INDEX idx_stores_state ON stores(state);
CREATE INDEX idx_suppliers_user_id ON suppliers(user_id);
CREATE INDEX idx_products_supplier_id ON products(supplier_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_campaigns_supplier_id ON campaigns(supplier_id);
CREATE INDEX idx_campaigns_target_type ON campaigns(target_type);
CREATE INDEX idx_campaign_products_campaign_id ON campaign_products(campaign_id);
CREATE INDEX idx_campaign_products_product_id ON campaign_products(product_id);
CREATE INDEX idx_state_conditions_supplier_state ON state_conditions(supplier_id, state);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_supplier_id ON orders(supplier_id);
CREATE INDEX idx_orders_campaign_id ON orders(campaign_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_cashback_entries_store_id ON cashback_entries(store_id);
CREATE INDEX idx_cashback_entries_order_id ON cashback_entries(order_id);
CREATE INDEX idx_withdrawals_store_id ON withdrawals(store_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_files_supplier_id ON files(supplier_id);

