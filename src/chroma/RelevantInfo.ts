import { ChromaClient } from 'chromadb';
import { OpenAIEmbeddingFunction } from '@chroma-core/openai';
import OpenAI from 'openai';

const client = new ChromaClient({
	host: 'localhost',
	port: 5000,
});

const studentInfo = `Sutent (sunitinib) is a prescription medication used to treat certain cancers, including kidney cancer and gastrointestinal stromal tumors. It works by blocking specific proteins that promote cancer cell growth. Patients may experience side effects like fatigue, nausea, or high blood pressure. Regular monitoring is essential during treatment with Sutent.`;

const clubInfo = `A club is an organized group of people with shared interests or goals, often formed within schools, universities, or communities. Club activities can range from academic and cultural to sports and hobbies. Clubs promote teamwork, leadership, and social interaction, offering members opportunities to grow personally and develop new skills.
`;

const universityInfo = `A university is a higher education institution that offers undergraduate and postgraduate degrees across various disciplines. It provides academic, research, and professional development opportunities for students. Universities foster critical thinking, innovation, and personal growth. They also contribute to societal advancement through research, community engagement, and the development of skilled professionals.`;

const embedder = new OpenAIEmbeddingFunction({
	apiKey: process.env.OPENAI_API_KEY!,
	modelName: 'text-embedding-3-small',
});

const collectionName = 'paragraph-info';

async function createCollection() {
	await client.createCollection({ name: collectionName, embeddingFunction: embedder });
	console.log('Collection created successfully');
}

async function getCollection() {
	const collection = await client.getCollection({ name: collectionName, embeddingFunction: embedder });
	return collection;
}

async function populateCollection() {
	const collection = await getCollection();
	await collection.add({
		documents: [studentInfo, clubInfo, universityInfo],
		ids: ['id1', 'id2', 'id3'],
	});
}

async function askQuestion() {
	const question = ['Why is critical thinking important in university education?'];
	const collection = await getCollection();
	const result = await collection.query({
		queryTexts: question,
		nResults: 1,
	});

	console.log({ distanceOrRelevancyInEmbeddingScore: result.distances[0][0] });

	const relevantInfo = result.documents[0][0];
	if (relevantInfo) {
		const openai = new OpenAI();
		const response = await openai.chat.completions.create({
			model: 'gpt-4o-2024-11-20',
			temperature: 0,
			messages: [
				{
					role: 'assistant',
					content: `Answer the next question using this information: ${relevantInfo}`,
				},
				{
					role: 'user',
					content: question[0],
				},
			],
		});

		const responseMessage = response.choices[0].message;
		console.log(responseMessage.content);
	}
}

async function main() {
	// await createCollection();
	// await populateCollection();
	await askQuestion();
}

main().catch(console.error);
