const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function initializeDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS words (
                id SERIAL PRIMARY KEY,
                word VARCHAR(255) NOT NULL,
                meaning TEXT NOT NULL,
                english TEXT,
                is_official BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

app.get('/api/words', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM words ORDER BY word ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching words:', error);
        res.status(500).json({ error: 'Failed to fetch words' });
    }
});

app.post('/api/words', async (req, res) => {
    const { word, meaning, english, is_official } = req.body;
    
    if (!word || !meaning) {
        return res.status(400).json({ error: 'Word and meaning are required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO words (word, meaning, english, is_official) VALUES ($1, $2, $3, $4) RETURNING *',
            [word, meaning, english, is_official || false]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding word:', error);
        res.status(500).json({ error: 'Failed to add word' });
    }
});

app.delete('/api/words/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query('DELETE FROM words WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Word not found' });
        }
        
        res.json({ message: 'Word deleted successfully' });
    } catch (error) {
        console.error('Error deleting word:', error);
        res.status(500).json({ error: 'Failed to delete word' });
    }
});

async function startServer() {
    try {
        await initializeDatabase();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on http://0.0.0.0:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
