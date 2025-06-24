import { join } from 'path';
import { generateEmbeddings } from '../emb/main';
import { dotProduct } from '../emb/similar';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { CreateEmbeddingResponse } from 'openai/resources/embeddings';

type TMovie = {
	title: string;
	description: string;
};

type TMovieWithEmbeddings = TMovie & { embeddings: number[] };

const data = loadJSONData<TMovie[]>('movieData.json');

console.log('What movies do you like?');
console.log('..........................');
process.stdin.addListener('data', async function (input) {
	let userInput = input.toString().trim();
	await recommendMovies(userInput);

	async function recommendMovies(input: string) {
		const embeddings = await generateEmbeddings(input);

		const descriptionEmbeddings = await getMovieEmbeddings();

		const moviesWithEmbeddings: TMovieWithEmbeddings[] = [];

		for (let i = 0; i < data.length; i++) {
			moviesWithEmbeddings.push({
				title: data[i].title,
				description: data[i].description,
				embeddings: descriptionEmbeddings.data[i].embedding,
			});
		}

		const similarities: { input: string; similarity: number }[] = [];

		for (const movie of moviesWithEmbeddings) {
			const similarity = dotProduct(movie.embeddings, embeddings.data[0].embedding);
			similarities.push({ input: movie.title, similarity });
		}

		console.log(`If you like ${input}, we recommend:}`);
		console.log('..........................');

		const sortedSimilarities = similarities.sort((a, b) => b.similarity - a.similarity);

		sortedSimilarities.forEach((entry) => {
			console.log(`${entry.input}: ${entry.similarity}`);
		});
	}
});

async function getMovieEmbeddings() {
	const fileName = 'movieDataEmbeddings.json';
	const filePath = join(__dirname, fileName);

	if (existsSync(filePath)) {
		const descriptionEmbeddings = loadJSONData<CreateEmbeddingResponse>(fileName);
		return descriptionEmbeddings;
	} else {
		const descriptionEmbeddings = await generateEmbeddings(data.map((movie) => movie.description));
		saveDataToJSONFile(descriptionEmbeddings, fileName);
		return descriptionEmbeddings;
	}
}

export function loadJSONData<T>(fileName: string): T {
	const path = join(__dirname, fileName);
	const rawData = readFileSync(path);
	return JSON.parse(rawData.toString());
}

export function saveDataToJSONFile(data: any, fileName: string) {
	const dataString = JSON.stringify(data);
	const dataBuffer = Buffer.from(dataString);
	const path = join(__dirname, fileName);
	writeFileSync(path, dataBuffer);
}
