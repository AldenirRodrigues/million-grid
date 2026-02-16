require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();
const port = process.env.PORT || 3001;

// Mercado Pago configuration
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN
});
const payment = new Payment(client);

app.use(cors());
app.use(express.json());

// GET /api/pixels - Fetch all pixels
app.get('/api/pixels', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM million_grid.pixels WHERE status = 'approved' ORDER BY created_at ASC");
        // Map snake_case from DB to camelCase for frontend
        const pixels = result.rows.map(row => ({
            id: row.id,
            type: row.type,
            x: row.x,
            y: row.y,
            w: row.w,
            h: row.h,
            src: row.src,
            content: row.content,
            fontSize: row.font_size,
            fontFamily: row.font_family,
            fontWeight: row.font_weight,
            color: row.color,
            bgColor: row.bg_color,
            rotation: row.rotation,
            brightness: row.brightness,
            contrast: row.contrast,
            zoom: row.zoom,
            offsetX: parseFloat(row.offset_x),
            offsetY: parseFloat(row.offset_y),
            title: row.title,
            link: row.link,
            message: row.message,
            createdAt: row.created_at
        }));
        res.json(pixels);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/pixels - Create a new pixel
app.post('/api/pixels', async (req, res) => {
    const item = req.body;
    const query = `
    INSERT INTO million_grid.pixels (
      id, type, x, y, w, h, src, content, font_size, font_family, font_weight, 
      color, bg_color, rotation, brightness, contrast, zoom, offset_x, offset_y, 
      title, link, message, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
    RETURNING *;
  `;
    const values = [
        item.id, item.type, item.x, item.y, item.w, item.h,
        item.src || null,
        item.content || null,
        item.fontSize || null,
        item.fontFamily || null,
        item.fontWeight || null,
        item.color || null,
        item.bgColor || null,
        item.rotation || 0,
        item.brightness || 100,
        item.contrast || 100,
        item.zoom || 1,
        item.offsetX || 0,
        item.offsetY || 0,
        item.title || null,
        item.link || null,
        item.message || null,
        'pending' // Status initial
    ];

    try {
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/payments/pix - Create PIX payment
app.post('/api/payments/pix', async (req, res) => {
    const { transaction_amount, description, payer } = req.body;

    try {
        const body = {
            transaction_amount,
            description,
            payment_method_id: 'pix',
            payer: {
                email: payer.email,
                first_name: payer.first_name,
                last_name: payer.last_name,
                identification: {
                    type: payer.identification.type,
                    number: payer.identification.number
                }
            },
            notification_url: (process.env.BACKEND_URL && !process.env.BACKEND_URL.includes('localhost'))
                ? `${process.env.BACKEND_URL}/api/payments/webhook`
                : undefined,
            external_reference: req.body.pixel_id || null // Link to pixel ID
        };

        const response = await payment.create({ body });

        // Store payment_id if pixel_id is provided
        if (req.body.pixel_id) {
            await db.query(
                'UPDATE million_grid.pixels SET payment_id = $1 WHERE id = $2',
                [response.id.toString(), req.body.pixel_id]
            );
        }

        res.json({
            id: response.id,
            status: response.status,
            qr_code: response.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: response.point_of_interaction.transaction_data.qr_code_base64
        });
    } catch (error) {
        console.error('Mercado Pago Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to create PIX payment', details: error.message });
        }
    }
});

// POST /api/payments/webhook - Handle notifications
app.post('/api/payments/webhook', async (req, res) => {
    const { action, data } = req.body;

    if (action === 'payment.updated' && data && data.id) {
        try {
            const paymentInfo = await payment.get({ id: data.id });
            console.log(`Payment ${data.id} status: ${paymentInfo.status}`);

            if (paymentInfo.status === 'approved') {
                const pixelId = paymentInfo.external_reference;
                if (pixelId) {
                    await db.query(
                        "UPDATE million_grid.pixels SET status = 'approved' WHERE id = $1",
                        [pixelId]
                    );
                    console.log(`Pixel ${pixelId} approved!`);
                } else {
                    // Fallback to update by payment_id
                    await db.query(
                        "UPDATE million_grid.pixels SET status = 'approved' WHERE payment_id = $1",
                        [data.id.toString()]
                    );
                    console.log(`Pixel updated by payment_id ${data.id}`);
                }
            }
        } catch (error) {
            console.error('Webhook processing error:', error);
        }
    }

    res.sendStatus(200);
});

// GET /api/pixels/:id/status - Check pixel status
app.get('/api/pixels/:id/status', async (req, res) => {
    try {
        const result = await db.query('SELECT payment_id, status FROM million_grid.pixels WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pixel not found' });
        }

        const pixel = result.rows[0];

        if (pixel.status === 'approved') {
            return res.json({ status: 'approved' });
        }

        if (!pixel.payment_id) {
            return res.json({ status: 'pending' }); // No payment generated yet
        }

        // Check Mercado Pago Status
        const paymentInfo = await payment.get({ id: pixel.payment_id });

        if (paymentInfo.status === 'approved') {
            // Update DB
            await db.query("UPDATE million_grid.pixels SET status = 'approved' WHERE id = $1", [req.params.id]);
            return res.json({ status: 'approved' });
        }

        res.json({ status: paymentInfo.status });

    } catch (error) {
        console.error("Status Check Error:", error);
        res.status(500).json({ error: 'Failed to check status' });
    }
});

// DELETE /api/pixels/:id - Discard pending pixel
app.delete('/api/pixels/:id', async (req, res) => {
    try {
        // Only allow deleting pending pixels
        const result = await db.query(
            "DELETE FROM million_grid.pixels WHERE id = $1 AND status = 'pending' RETURNING *",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Pixel not found or already approved' });
        }
        res.json({ message: 'Pixel discarded' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

