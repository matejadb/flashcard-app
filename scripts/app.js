class FlashcardTracker {
	constructor() {
		this._totalCards = 0;
		this._totalMastered = 0;
		this._totalInProgress = 0;
		this._totalNotStarted = 0;
		this._currentCard = 0;
		this._flashcards = [];
		this._categories = [];

		this._displayTotalCards();
		this._displayTotalMastered();
		this._displayTotalInProgress();
		this._displayTotalNotStarted();
	}

	/* Public Methods */

	addCard(card) {
		this._flashcards.push(card);
		this._totalCards++;
		this._totalNotStarted++;

		this._displayNewCardAll(card);
		this._populateCategoryDropdown(card);
		if (!this._categories.includes(card.category.toLowerCase())) {
			this._categories.push(card.category);
		}

		this._render();
	}

	removeCard(id) {}

	getCurrentCard() {
		return this._flashcards[this._currentCard];
	}

	getCurrentCardId() {
		return this._currentCard;
	}

	getTotalCards() {
		return this._totalCards;
	}

	getNextCard() {
		if (this._currentCard + 1 > this._flashcards.length - 1) {
			this._currentCard = 0;
			return this._flashcards[0];
		}

		this._currentCard += 1;

		return this._flashcards[this._currentCard];
	}

	getPreviousCard() {
		if (this._currentCard - 1 < 0) {
			this._currentCard = this._flashcards.length - 1;
			return this._flashcards[this._flashcards.length - 1];
		}

		this._currentCard -= 1;

		return this._flashcards[this._currentCard];
	}

	incrementMastery(card) {
		if (card.mastery === 0) {
			this._totalNotStarted--;
			this._totalInProgress++;
		} else if (card.mastery === 4) {
			this._totalInProgress--;
			this._totalMastered++;
			// Find all cards with this ID and hide/show mastery elements
			document.querySelectorAll(`[data-id="${card.id}"]`).forEach((cardEl) => {
				const bar = cardEl.querySelector('.bar');
				const mastered = cardEl.querySelector('.card-mastered');

				if (bar) bar.classList.add('hidden');
				if (mastered) mastered.classList.remove('hidden');
			});
		}

		card.mastery++;

		const allCardElements = document.querySelectorAll(
			`[data-id="${card.id}"] .progress-bar`
		);
		allCardElements.forEach((bar) => {
			bar.setAttribute('aria-valuenow', card.mastery);
			bar.setAttribute('data-progress', card.mastery);
		});

		document
			.querySelectorAll(`[data-id="${card.id}"] .progress-level`)
			.forEach((text) => {
				if (text.textContent.includes('/')) {
					text.textContent = `${card.mastery}/5`;
				}
			});

		this._render();
	}

	resetMastery(card) {
		if (card.mastery === 5) {
			this._totalMastered--;
		} else {
			this._totalInProgress--;
		}
		card.mastery = 0;
		this._totalNotStarted++;

		// Find all cards with this ID and hide/show mastery elements
		document.querySelectorAll(`[data-id="${card.id}"]`).forEach((cardEl) => {
			const bar = cardEl.querySelector('.bar');
			const mastered = cardEl.querySelector('.card-mastered');

			if (bar) bar.classList.remove('hidden');
			if (mastered) mastered.classList.add('hidden');
		});

		const allCardElements = document.querySelectorAll(
			`[data-id="${card.id}"] .progress-bar`
		);
		allCardElements.forEach((bar) => {
			bar.setAttribute('aria-valuenow', card.mastery);
			bar.setAttribute('data-progress', card.mastery);
		});

		document
			.querySelectorAll(`[data-id="${card.id}"] .progress-level`)
			.forEach((text) => {
				if (text.textContent.includes('/')) {
					text.textContent = `${card.mastery}/5`;
				}
			});

		this._render();
	}

	shuffleCards() {
		for (let i = this._flashcards.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this._flashcards[i], this._flashcards[j]] = [
				this._flashcards[j],
				this._flashcards[i],
			];
		}

		return this._flashcards;
	}

	/* Private Methods */

	_displayTotalCards() {
		const totalCardsEl = document.querySelector('.cards--total');
		totalCardsEl.textContent = this._totalCards;
	}

	_displayTotalMastered() {
		const totalMasteredEl = document.querySelector('.cards--mastered');
		totalMasteredEl.textContent = this._totalMastered;
	}

	_displayTotalInProgress() {
		const totalInProgressEl = document.querySelector('.cards--in-progress');
		totalInProgressEl.textContent = this._totalInProgress;
	}

	_displayTotalNotStarted() {
		const totalNotStartedEl = document.querySelector('.cards--not-started');
		totalNotStartedEl.textContent = this._totalNotStarted;
	}

	_displayNewCardAll(card) {
		const cardsEl = document.querySelector('.flashcard-container--all-cards');
		const cardEl = document.createElement('div');
		cardEl.classList.add('flashcard');
		cardEl.setAttribute('data-id', card.id);

		cardEl.innerHTML = `<div class="question-container--all-cards">
								<h4 class="text--preset-3">${card.question}</h4>
							</div>
							<div class="answer-container--all-cards">
								<span class="text--preset-5-medium">Answer:</span>
								<p class="text--preset-5-medium">${card.answer}</p>
							</div>
							<div class="flashcard--footer">
								<div class="tag-container">
									<span class="flashcard-tag count-cat text--preset-6"
										>${card.category}</span
									>
								</div>
								<div class="progress-bar-container">
									<div class="bar ">
										<div
											role="progressbar"
											aria-valuenow="${card.mastery}"
											aria-valuemin="0"
											aria-valuemax="5"
											aria-label="Question progress"
											class="progress-bar progress-bar--in-progress"
											data-progress="${card.mastery}"
										></div>
										<span class="progress-level text--preset-6">${card.mastery}/5</span>
									</div>
									<div class="card-mastered hidden">
										<img
											src="./assets/images/icon-mastered.svg"
											role="presentation"
											alt=""
										/>
										<span class="progress-level text--preset-6">Mastered</span>
										<span class="progress-level text--preset-6">5/5</span>
									</div>
								</div>

								<div class="menu-container">
									<div class="card-menu--dropdown">
										<div
											id="card-menu"
											role="menu"
											aria-labelledby="menu-button"
											class="menu-dropdown--content hidden"
										>
											<div role="menuitem" aria-checked="false" tabindex="0">
												<img
													src="./assets/images/icon-edit.svg"
													role="presentation"
													alt=""
												/>
												<span class="text--preset-5-medium">Edit</span>
											</div>
											<hr />
											<div role="menuitem" aria-checked="false" tabindex="0">
												<img
													src="./assets/images/icon-delete.svg"
													role="presentation"
													alt=""
												/>
												<span class="text--preset-5-medium">Delete</span>
											</div>
											<hr />
										</div>
									</div>
									<button
										class="menu-icon menu-btn"
										aria-expanded="false"
										aria-haspopup="menu"
										type="button"
									>
										<img
											class="card-menu"
											src="./assets/images/icon-menu.svg"
											alt="Card menu button"
										/>
									</button>
								</div>
							</div>`;

		cardsEl.appendChild(cardEl);
	}

	_populateCategoryDropdown(card) {
		const categoriesEl = document.querySelectorAll(
			'.categories-dropdown--content'
		);

		categoriesEl.forEach((el) => {
			const cardCategory = this._formatCategoryName(card.category);

			const divider = document.createElement('hr');
			const categoryEl = document.createElement('div');
			categoryEl.setAttribute('role', 'menuitemcheckbox');
			categoryEl.setAttribute('aria-checked', false);
			categoryEl.setAttribute('tabindex', 0);

			if (this._categories.includes(card.category)) {
				const categoryLabel = document.querySelectorAll(`.${cardCategory}`);

				categoryLabel.forEach((label) => {
					label.innerHTML = `${card.category} (${this._getNumberOfCategoryType(
						card.category
					)})`;
				});
			} else {
				categoryEl.innerHTML = `<input type="checkbox" id="cat-${cardCategory}" class="dropdown-element" />
				<label for="cat-${this._formatCategoryName(
					card.category
				)}" class="text--preset-5-medium ${cardCategory}">
				${card.category} (${this._getNumberOfCategoryType(card.category)})
				</label>`;
				el.append(categoryEl, divider);
			}
		});
	}

	_formatCategoryName(category) {
		return category.split(' ').join('-').toLowerCase();
	}

	_getNumberOfCategoryType(category) {
		const allCategoriesEl = document.querySelectorAll('.count-cat');
		const typeCategoriesEl = Array.from(allCategoriesEl).filter(
			(element) => element.textContent === category
		);

		return typeCategoriesEl.length;
	}

	_checkIfCategoryExists(category) {
		const arr = this._getNumberOfCategoryType(category);

		if (arr.length !== 0) {
		}
	}

	_render() {
		this._displayTotalCards();
		this._displayTotalMastered();
		this._displayTotalInProgress();
		this._displayTotalNotStarted();
	}
}

class Flashcard {
	constructor(question, answer, category) {
		this.id = Math.random().toString(16).slice(2);
		this.question = question;
		this.answer = answer;
		this.category = category;
		this.mastery = 0;
	}
}

class App {
	constructor() {
		this._tracker = new FlashcardTracker();

		this._loadEventListeners();
	}

	_getNextCard() {
		this._displayCardStudyMode(this._tracker.getNextCard());
		this._displayCardNumber();
	}

	_getPreviousCard() {
		this._displayCardStudyMode(this._tracker.getPreviousCard());
		this._displayCardNumber();
	}

	_displayCardStudyMode(card) {
		const flashcardContainer = document.querySelector('.flashcard-content');
		const flashcardQuestionContainer = document.querySelector(
			'.flashcard-content-question'
		);
		const flashcardAnswerContainer = document.querySelector(
			'.flashcard-content-answer'
		);

		flashcardQuestionContainer.setAttribute('data-id', card.id);
		flashcardAnswerContainer.setAttribute('data-id', card.id);

		const isMastered = card.mastery >= 5;
		const barClass = isMastered ? 'bar hidden' : 'bar';
		const masteredClass = isMastered ? 'card-mastered' : 'card-mastered hidden';

		flashcardQuestionContainer.innerHTML = `<span class="flashcard-tag text--preset-6"
										>${card.category}</span
									>
									<img
										src="./assets/images/pattern-star-blue.svg"
										role="presentation"
										class="flashcard-icon flashcard-icon--top-right"
										alt=""
									/>
									<img
										src="./assets/images/pattern-star-yellow.svg"
										role="presentation"
										class="flashcard-icon flashcard-icon--bottom-left"
										alt=""
									/>
									<div class="question-container">
										<h2 class="question-text text--preset-1">
											${card.question}
										</h2>
										<p class="reveal-answer text--preset-4-medium">
											Click to reveal answer
										</p>
									</div>

									<div class="progress-container">
										<div class="${barClass}">
											<div
												role="progressbar"
												aria-valuenow="${card.mastery}"
												aria-valuemin="0"
												aria-valuemax="5"
												aria-label="Question progress"
												class="progress-bar progress-bar--in-progress"
												data-progress="${card.mastery}"
											></div>
											<span class="progress-level text--preset-6">${card.mastery}/5</span>
										</div>
										<div class="${masteredClass}">
											<img
												src="./assets/images/icon-mastered.svg"
												role="presentation"
												alt=""
											/>
											<span class="progress-level text--preset-6"
												>Mastered</span
											>
											<span class="progress-level text--preset-6">5/5</span>
										</div>
									</div>`;

		flashcardAnswerContainer.innerHTML = `<span class="flashcard-tag text--preset-6"
										>${card.category}</span
									>
									<img
										src="./assets/images/pattern-star-pink.svg"
										role="presentation"
										class="flashcard-icon flashcard-icon--top-right"
										alt=""
									/>
									<img
										src="./assets/images/pattern-star-yellow.svg"
										role="presentation"
										class="flashcard-icon flashcard-icon--bottom-left-answer"
										alt=""
									/>
									<div class="question-container">
										<p class="question-answer text--preset-4-medium">Answer</p>
										<h2 class="question-text text--preset-2">
											${card.answer}
										</h2>
									</div>

									<div class="progress-container">
										<div class="${barClass}">
											<div
												role="progressbar"
												aria-valuenow="${card.mastery}"
												aria-valuemin="0"
												aria-valuemax="5"
												aria-label="Question progress"
												class="progress-bar progress-bar--in-progress"
												data-progress="${card.mastery}"
											></div>
											<span class="progress-level text--preset-6">${card.mastery}/5</span>
										</div>
										<div class="${masteredClass}">
											<img
												src="./assets/images/icon-mastered.svg"
												role="presentation"
												alt=""
											/>
											<span class="progress-level text--preset-6"
												>Mastered</span
											>
											<span class="progress-level text--preset-6">5/5</span>
										</div>
									</div>`;

		flashcardContainer.append(
			flashcardQuestionContainer,
			flashcardAnswerContainer
		);
	}

	_displayCardNumber() {
		const cardNum = document.querySelector('.card-number');

		cardNum.innerHTML = `Card ${
			this._tracker.getCurrentCardId() + 1
		} of ${this._tracker.getTotalCards()}`;
	}

	_hideNoCardHint() {
		document.querySelector('.no-flashcards').classList.add('hidden');
		document
			.querySelector('.flashcard-container--main')
			.classList.remove('hidden');

		document
			.querySelector('.all-cards-section-controls')
			.classList.remove('hidden');
		document.querySelector('.no-cards--all-cards').classList.add('hidden');
		document
			.querySelector('.flashcard-container--all-cards')
			.classList.remove('hidden');
	}

	_newCard(e) {
		e.preventDefault();

		const question = document.getElementById('new-question');
		const answer = document.getElementById('new-answer');
		const category = document.getElementById('new-category');

		if (!question.value || !answer.value || !category.value) {
			return;
		}
		const card = new Flashcard(question.value, answer.value, category.value);

		this._tracker.addCard(card);
		this._displayCardStudyMode(this._tracker.getCurrentCard());
		this._displayCardNumber();
		this._hideNoCardHint();
		question.value = '';
		answer.value = '';
		category.value = '';
	}

	_revealAnswer() {
		document
			.querySelector('.flashcard-content-question')
			.classList.toggle('hidden');

		document
			.querySelector('.flashcard-content-answer')
			.classList.toggle('hidden');
	}

	_selectStudyMode() {
		const studyModeContent = document.querySelector('.study-mode-content');
		const allCardsContent = document.querySelector('.all-cards-content');

		document
			.querySelector('.tablist')
			.querySelectorAll('button')
			.forEach((btn) => {
				btn.classList.remove('tab--current');
				btn.setAttribute('aria-selected', false);
			});

		document.querySelector('.tab--study-mode').classList.add('tab--current');
		document
			.querySelector('.tab--study-mode')
			.setAttribute('aria-selected', true);

		studyModeContent.classList.remove('hidden');
		allCardsContent.classList.add('hidden');
	}

	_selectAllCards() {
		const allCardsContent = document.querySelector('.all-cards-content');
		const studyModeContent = document.querySelector('.study-mode-content');

		document
			.querySelector('.tablist')
			.querySelectorAll('button')
			.forEach((btn) => {
				btn.classList.remove('tab--current');
				btn.setAttribute('aria-selected', false);
			});

		document.querySelector('.tab--all-cards').classList.add('tab--current');
		document
			.querySelector('.tab--all-cards')
			.setAttribute('aria-selected', true);

		allCardsContent.classList.remove('hidden');
		studyModeContent.classList.add('hidden');
	}

	_toggleCategoryDropdown(e) {
		e.stopPropagation();
		const btn = e.currentTarget;
		const dropdown = btn.nextElementSibling;

		dropdown.classList.toggle('hidden');
		const isExpanded = !dropdown.classList.contains('hidden');
		btn.setAttribute('aria-expanded', isExpanded);
	}

	_toggleMenuDropdown(btn) {
		const menuContainer = btn.closest('.menu-container');
		const dropdown = menuContainer.querySelector('.menu-dropdown--content');

		dropdown.classList.toggle('hidden');
		const isExpanded = !dropdown.classList.contains('hidden');
		btn.setAttribute('aria-expanded', isExpanded);
	}

	_closeDropdowns(event) {
		const categoriesDropdowns = document.querySelectorAll(
			'.categories-dropdown'
		);
		const menuDropdowns = document.querySelectorAll('.menu-container');

		event.stopPropagation();
		categoriesDropdowns.forEach((dropdown) => {
			const dropdownContent = dropdown.querySelector(
				'.categories-dropdown--content'
			);
			const dropdownBtn = dropdown.querySelector('.category-btn');
			if (!dropdown.contains(event.target)) {
				dropdownContent.classList.add('hidden');
				dropdownBtn.setAttribute('aria-expanded', false);
			}
		});

		menuDropdowns.forEach((dropdown) => {
			const dropdownContent = dropdown.querySelector('.menu-dropdown--content');

			const dropdownBtn = dropdown.querySelector('.menu-btn');
			if (!dropdown.contains(event.target)) {
				dropdownContent.classList.add('hidden');
				dropdownBtn.setAttribute('aria-expanded', false);
			}
		});
	}

	_incrementMastery() {
		const currentCard = this._tracker.getCurrentCard();
		if (currentCard.mastery < 5) {
			this._tracker.incrementMastery(currentCard);
			this._displayCardStudyMode(currentCard);
		}
	}

	_resetMastery() {
		const currentCard = this._tracker.getCurrentCard();
		if (currentCard.mastery > 0) {
			this._tracker.resetMastery(currentCard);
			this._displayCardStudyMode(currentCard);
		}
	}

	_shuffleCards() {
		const flashcards = this._tracker.shuffleCards();

		document.querySelector('.flashcard-container--all-cards').innerHTML = '';

		flashcards.forEach((card) => {
			this._tracker._displayNewCardAll(card);
		});
		this._displayCardStudyMode(flashcards[0]);
	}

	_loadEventListeners() {
		document
			.querySelector('.form--new-card')
			.addEventListener('submit', this._newCard.bind(this));

		document.querySelectorAll('.category-btn').forEach((btn) => {
			btn.addEventListener('click', this._toggleCategoryDropdown.bind(this));
		});

		document.addEventListener('click', (e) => {
			const menuBtn = e.target.closest('.menu-btn');
			if (menuBtn) {
				e.stopPropagation();
				this._toggleMenuDropdown(menuBtn);
			}
		});

		document
			.querySelector('.tab--study-mode')
			.addEventListener('click', this._selectStudyMode.bind(this));

		document
			.querySelector('.btn-hint')
			.addEventListener('click', this._selectAllCards.bind(this));

		document
			.querySelector('.tab--all-cards')
			.addEventListener('click', this._selectAllCards.bind(this));

		document.addEventListener('click', this._closeDropdowns.bind(this));

		document
			.querySelector('.flashcard-content')
			.addEventListener('click', this._revealAnswer);

		document
			.querySelector('.next-card')
			.addEventListener('click', this._getNextCard.bind(this));

		document
			.querySelector('.previous-card')
			.addEventListener('click', this._getPreviousCard.bind(this));

		document
			.querySelector('.btn--increment-mastery')
			.addEventListener('click', this._incrementMastery.bind(this));

		document
			.querySelector('.btn--reset-mastery')
			.addEventListener('click', this._resetMastery.bind(this));

		document.querySelectorAll('.btn--shuffle').forEach((btn) => {
			btn.addEventListener('click', this._shuffleCards.bind(this));
		});
	}
}

const app = new App();
