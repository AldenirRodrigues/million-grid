 

CREATE TABLE IF NOT EXISTS pixels (
    id UUID PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    w INTEGER NOT NULL,
    h INTEGER NOT NULL,
    src TEXT, -- For images
    content TEXT, -- For text items
    font_size INTEGER,
    font_family VARCHAR(50),
    font_weight VARCHAR(50),
    color VARCHAR(20),
    bg_color VARCHAR(20),
    rotation INTEGER DEFAULT 0,
    brightness INTEGER DEFAULT 100,
    contrast INTEGER DEFAULT 100,
    zoom DECIMAL DEFAULT 1,
    offset_x DECIMAL DEFAULT 0,
    offset_y DECIMAL DEFAULT 0,
    title TEXT,
    link TEXT,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'expired'
    payment_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
