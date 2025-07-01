import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const pc = new Pinecone({
	apiKey: process.env.PINECONE_KEY!,
});

const openai = new OpenAI();

const studentInfo = `Sutent (sunitinib) is a prescription medication used to treat certain cancers, including kidney cancer and gastrointestinal stromal tumors. It works by blocking specific proteins that promote cancer cell growth. Patients may experience side effects like fatigue, nausea, or high blood pressure. Regular monitoring is essential during treatment with Sutent.`;

const clubInfo = `A club is an organized group of people with shared interests or goals, often formed within schools, universities, or communities. Club activities can range from academic and cultural to sports and hobbies. Clubs promote teamwork, leadership, and social interaction, offering members opportunities to grow personally and develop new skills.
`;

const universityInfo = `A university is a higher education institution that offers undergraduate and postgraduate degrees across various disciplines. It provides academic, research, and professional development opportunities for students. Universities foster critical thinking, innovation, and personal growth. They also contribute to societal advancement through research, community engagement, and the development of skilled professionals.`;

type Info = {
	info: string;
	reference: string;
	relevance: number;
};

const dataToEmbed: Info[] = [
	{
		info: studentInfo,
		reference: 'some student 123',
		relevance: 0.9,
	},
	{
		info: clubInfo,
		reference: 'some club 456',
		relevance: 0.8,
	},
	{
		info: universityInfo,
		reference: 'some university 789',
		relevance: 0.7,
	},
];

const pcIndex = pc.index<Info>('ai-learning');

async function storeEmbeddings() {
	await Promise.all(
		dataToEmbed.map(async (item, index) => {
			const embeddingResult = await openai.embeddings.create({
				model: 'text-embedding-3-small',
				input: item.info,
			});

			const embedding = embeddingResult.data[0].embedding;

			await pcIndex.upsert([
				{
					id: `id-${index}`,
					values: embedding,
					metadata: item,
				},
			]);
		})
	);

	console.log('Data inserted successfully');
}

async function queryEmbeddings(question: string) {
	const questionEmbeddingResult = await openai.embeddings.create({
		model: 'text-embedding-3-small',
		input: question,
	});

	const questionEmbedding = questionEmbeddingResult.data[0].embedding;

	const queryResult = await pcIndex.query({
		vector: questionEmbedding,
		topK: 1,
		includeMetadata: true,
		includeValues: true,
	});

	return queryResult;
}

async function askOpenAI(question: string, relevantInfo: string) {
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
				content: question,
			},
		],
	});

	const responseMessage = response.choices[0].message;
	console.log(responseMessage.content);
}

//This is how the result looks like
// {
//   matches: [
//     {
//       id: 'id-2',
//       score: 0.450442761,
//       values: [Array],
//       sparseValues: undefined,
//       metadata: [Object]
//     }
//   ],
//   namespace: '__default__',
//   usage: { readUnits: 6 }
// }

async function main() {
	const question = 'Why is critical thinking important in university education?';
	const result = await queryEmbeddings(question);
	const relevantInfo = result.matches[0].metadata;

	if (relevantInfo) {
		await askOpenAI(question, relevantInfo.info);
	}
}

main();
