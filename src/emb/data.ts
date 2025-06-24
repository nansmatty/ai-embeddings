import OpenAI from 'openai';

const openai = new OpenAI();

async function generateEmbeddings(input: string | string[]) {
	const response = await openai.embeddings.create({
		input,
		model: 'text-embedding-3-small',
	});

	console.log(response.data[0].embedding);

	return response;
}

generateEmbeddings(['The quick brown fox jumped over the lazy dog', 'Dog is in the car', 'Cat is playing with the ball']);
