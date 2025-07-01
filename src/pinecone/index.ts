import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({
	apiKey: process.env.PINECONE_KEY!,
});

//stringValue
//embeddings

//metadata - moreInfo

// Targeting an index, with user-defined Metadata types
// If you are storing metadata alongside your vector values inside your Pinecone records, you can pass a type parameter to index() in order to get proper TypeScript typechecking when upserting and querying data.

// type MovieMetadata = {
//   title: string,
//   runtime: numbers,
//   genre: 'comedy' | 'horror' | 'drama' | 'action'
// }

// Specify a custom metadata type while targeting the index
// const index = pc.index<MovieMetadata>('test-index');

type TLearning = {
	courseName: string;
	courseType: 'video' | 'e-book';
};

// In pinecone the namespaces creates partition or groupes of data in single index that allow us to make operations in that smaller groups or chunks.

async function createNamespace() {
	const index = getIndex();
	const namespace = index.namespace('learning-namespace');
}

function getIndex() {
	const index = pc.index<TLearning>('ai-learning');
	return index;
}

async function listIndexes() {
	const result = await pc.listIndexes();
	console.log(result);
}

function generateNumberArray(length: number) {
	return Array.from({ length }, () => Math.random());
}

async function upsertVectors() {
	const embedding = generateNumberArray(1536);
	const index = getIndex();

	await index.upsert([
		{
			id: 'id-1',
			values: embedding,
			metadata: {
				courseName: 'LLM-Course',
				courseType: 'video',
			},
		},
	]);

	console.log('Data inserted successfully');
}

async function queryVectors() {
	const index = getIndex();

	const result = await index.query({
		id: 'id-1',
		topK: 1,
		includeMetadata: true,
		includeValues: true,
	});

	console.log(result);
}

async function createIndex() {
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

async function main() {
	await queryVectors();
}

main();
