class Storage {
	static getTotalCards(defaultCards = 0) {
		let totalCards;

		if (localStorage.getItem('totalCards') === null) totalCards = defaultCards;
		else totalCards = +localStorage.getItem('totalCards');

		return totalCards;
	}

	static updateTotalCards(total) {
		localStorage.setItem('totalCards', total);
	}

	static getTotalMasteredCards(defaultCards = 0) {
		let totalMasteredCards;

		if (localStorage.getItem('totalMasteredCards') === null)
			totalMasteredCards = defaultCards;
		else totalMasteredCards = +localStorage.getItem('totalMasteredCards');

		return totalMasteredCards;
	}

	static updateTotalMasteredCards(total) {
		localStorage.setItem('totalMasteredCards', total);
	}

	static getTotalInProgressCards(defaultCards = 0) {
		let totalInProgressCards;

		if (localStorage.getItem('totalInProgressCards') === null)
			totalInProgressCards = defaultCards;
		else totalInProgressCards = +localStorage.getItem('totalInProgressCards');

		return totalInProgressCards;
	}

	static updateTotalInProgressCards(total) {
		localStorage.setItem('totalInProgressCards', total);
	}

	static getTotalNotStartedCards(defaultCards = 0) {
		let totalNotStartedCards;

		if (localStorage.getItem('totalNotStartedCards') === null)
			totalNotStartedCards = defaultCards;
		else totalNotStartedCards = +localStorage.getItem('totalNotStartedCards');

		return totalNotStartedCards;
	}

	static updateTotalNotStartedCards(total) {
		localStorage.setItem('totalNotStartedCards', total);
	}

	static getCurrentCardId(defaultCard = 0) {
		let currentCardId;

		if (localStorage.getItem('currentCard') === null)
			currentCardId = defaultCard;
		else currentCardId = +localStorage.getItem('currentCard');

		return currentCardId;
	}

	static updateCurrentCardId(current) {
		localStorage.setItem('currentCard', current);
	}

	static getFlashcards() {
		let flashcards;

		if (localStorage.getItem('flashcards') === null) flashcards = [];
		else flashcards = JSON.parse(localStorage.getItem('flashcards'));

		return flashcards;
	}

	static saveFlashcard(card) {
		const flashcards = Storage.getFlashcards();
		flashcards.push(card);
		localStorage.setItem('flashcards', JSON.stringify(flashcards));
	}

	static updateFlashcards(flashcards) {
		localStorage.setItem('flashcards', JSON.stringify(flashcards));
	}

	static getCategories() {
		let categories;

		if (localStorage.getItem('categories') === null) categories = [];
		else categories = JSON.parse(localStorage.getItem('categories'));

		return categories;
	}

	static saveCategory(category) {
		const categories = Storage.getCategories();
		categories.push(category);
		localStorage.setItem('categories', JSON.stringify(categories));
	}

	static updateCategories(categories) {
		localStorage.setItem('categories', JSON.stringify(categories));
	}

	static getCurrentCard() {
		const flashcards = Storage.getFlashcards();

		return flashcards[Storage.getCurrentCardId()];
	}
}

export default Storage;
