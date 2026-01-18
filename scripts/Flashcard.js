class Flashcard {
	constructor(question, answer, category) {
		this.id = Math.random().toString(16).slice(2);
		this.question = question;
		this.answer = answer;
		this.category = category;
		this.mastery = 0;
	}
}

export default Flashcard;
