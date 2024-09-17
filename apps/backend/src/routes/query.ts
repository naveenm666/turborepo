import express from 'express';
import { processQuery } from '../controllers/queryProcessor';
import { dataSource } from '../index'; // Ensure this is properly set up

const router = express.Router();

router.post('/query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    // Call processQuery and receive only the answer
    const answer = await processQuery(query, dataSource);
    res.status(200).json({ answer });
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
