import { ChromaClient } from 'chromadb';
import { OpenAIEmbeddingFunction } from '@chroma-core/openai';

const client = new ChromaClient({
	host: 'localhost',
	port: 5000,
});

const embedder = new OpenAIEmbeddingFunction({
	apiKey: process.env.OPENAI_API_KEY!,
	modelName: 'text-embedding-3-small',
});

async function main() {
	await client.createCollection({
		name: 'data-test',
	});

	console.log('Collection created successfully');
}

async function addData() {
	const collection = await client.getCollection({ name: 'data-test' });

	const texts = ['Here is my entry v2'];
	const embeddings = await embedder.generate(texts);

	await collection.add({
		ids: ['id1'],
		documents: texts,
		embeddings,
	});

	console.log('Data inserted successfully: ');
}

// main().catch(console.error);
addData().catch(console.error);
