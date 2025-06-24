import { DataWithEmbeddings, generateEmbeddings, loadJSONData } from './main';

export function dotProduct(a: number[], b: number[]) {
	return a.map((value, index) => value * b[index]).reduce((a, b) => a + b, 0);
}

function cosineSimilarity(a: number[], b: number[]) {
	const dotProductValue = dotProduct(a, b);
	const magnitudeA = Math.sqrt(a.map((value) => value * value).reduce((a, b) => a + b, 0));
	const magnitudeB = Math.sqrt(b.map((value) => value * value).reduce((a, b) => a + b, 0));
	return dotProductValue / (magnitudeA * magnitudeB);
}

async function main() {
	const dataWithEmbeddings = loadJSONData<DataWithEmbeddings[]>('dataWithEmbeddings2.json');

	const input = 'How old is Narayan?';

	const inputEmbeddings = await generateEmbeddings(input);

	const similarities: {
		input: string;
		similarity: number;
	}[] = [];

	for (const entry of dataWithEmbeddings) {
		const similarity = dotProduct(entry.embeddings, inputEmbeddings.data[0].embedding);
		similarities.push({ input: entry.input, similarity });
	}

	console.log(`Similarity of ${input} with:`);
	const sortedSimilarities = similarities.sort((a, b) => b.similarity - a.similarity);

	sortedSimilarities.forEach((entry) => {
		console.log(`${entry.input}: ${entry.similarity}`);
	});
}

// main();
