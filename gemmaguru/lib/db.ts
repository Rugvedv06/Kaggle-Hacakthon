import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Supabase
});

export async function searchChunks(
  queryEmbedding: number[],
  topK: number = 5,
  subject?: string
) {
  const vectorStr = `[${queryEmbedding.join(',')}]`;

  const query = subject
    ? `SELECT id, content, subject, chapter,
         1 - (embedding <=> $1::vector) AS similarity
       FROM chunks
       WHERE subject = $2
       ORDER BY embedding <=> $1::vector
       LIMIT $3`
    : `SELECT id, content, subject, chapter,
         1 - (embedding <=> $1::vector) AS similarity
       FROM chunks
       ORDER BY embedding <=> $1::vector
       LIMIT $2`;

  const params = subject
    ? [vectorStr, subject, topK]
    : [vectorStr, topK];

  const result = await pool.query(query, params);
  return result.rows;
}

export async function insertChunk(
  content: string,
  embedding: number[],
  subject: string,
  chapter: string,
  classNum: number,
  language = 'en'
) {
  const vectorStr = `[${embedding.join(',')}]`;
  await pool.query(
    `INSERT INTO chunks (content, embedding, subject, chapter, class_num, language)
     VALUES ($1, $2::vector, $3, $4, $5, $6)`,
    [content, vectorStr, subject, chapter, classNum, language]
  );
}

export default pool;
