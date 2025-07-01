import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({
	apiKey: process.env.PINECONE_KEY!,
});

async function main() {
	await pc.createIndex({
		name: 'ai-learning',
		dimension: 1536,
		metric: 'cosine',
		spec: {
			serverless: {
				cloud: 'aws',
				region: 'us-east-1',
			},
		},
	});
}

main();
