import Storage from './Storage.js';

class FlashcardTracker {
	constructor() {
		this._totalCards = Storage.getTotalCards();
		this._totalMastered = Storage.getTotalMasteredCards();
		this._totalInProgress = Storage.getTotalInProgressCards();
		this._totalNotStarted = Storage.getTotalNotStartedCards();
		this._currentCard = Storage.getCurrentCardId();
		this._flashcards = Storage.getFlashcards();
		this._categories = Storage.getCategories();
		this._categoryFilter = [];

		this._displayTotalCards();
		this._displayTotalMastered();
		this._displayTotalInProgress();
		this._displayTotalNotStarted();
		this._loadCategoryDropdown();
	}

	/* Public Methods */

	addCard(card) {
		this._flashcards.push(card);
		this._totalCards++;
		this._totalNotStarted++;
		Storage.updateTotalCards(this._totalCards);
		Storage.updateTotalNotStartedCards(this._totalNotStarted);
		Storage.saveFlashcard(card);

		this._populateCategoryDropdown(card);
		if (!this._categories.includes(card.category)) {
			this._categories.push(card.category);
			Storage.saveCategory(card.category);
		}

		this._showToastNotification('create');
		this._render();
	}

	removeCard(id) {
		const index = this._flashcards.findIndex((card) => card.id === id);

		if (index !== -1) {
			const card = this._flashcards[index];
			this._totalCards--;
			Storage.updateTotalCards(this._totalCards);
			if (card.mastery > 0 && card.mastery < 5) {
				this._totalInProgress--;
				Storage.updateTotalInProgressCards(this._totalInProgress);
			} else if (card.mastery === 0) {
				this._totalNotStarted--;
				Storage.updateTotalNotStartedCards(this._totalNotStarted);
			} else if (card.mastery === 5) {
				this._totalMastered--;
				Storage.updateTotalMasteredCards(this._totalMastered);
			}
			this._flashcards.splice(index, 1);

			const cardCategory = this.formatCategoryName(card.category);
			let catNum = this._getNumberOfCategoryType(card.category);

			const dropdownEl = document.querySelectorAll(`.${cardCategory}`);

			dropdownEl.forEach((el) => {
				if (catNum === 0) {
					// Remove from categories array using the original category name, not formatted
					this._categories = this._categories.filter(
						(cat) => cat !== card.category,
					);
					// Remove the parent menuitemcheckbox div
					const menuItem = el.closest('div[role="menuitemcheckbox"]');
					// Remove the following hr if it exists
					const nextHr = menuItem?.nextElementSibling;
					if (nextHr?.tagName === 'hr') {
						nextHr.remove();
					}
					menuItem.remove();
				} else {
					el.textContent = `${card.category} (${catNum})`;
				}
			});

			if (index > this._flashcards.length - 1) {
				this._currentCard = 0;
				Storage.updateCurrentCardId(this._currentCard);
			} else {
				this._currentCard = index;
				Storage.updateCurrentCardId(this._currentCard);
			}

			Storage.updateFlashcards(this._flashcards);
			Storage.updateCategories(this._categories);

			this._showToastNotification('delete');
			this._render();
		}
	}

	editCard(id, editedCard) {
		const index = this._flashcards.findIndex((card) => card.id === id);

		if (index !== -1) {
			// Store the old category VALUE, not the object reference
			const oldCategory = this._flashcards[index].category;

			// Check old category count BEFORE updating the card
			const oldCatNum = this._getNumberOfCategoryType(oldCategory);

			// Update the card
			this._flashcards[index] = editedCard;

			// Handle old category count decrease
			if (oldCategory !== editedCard.category) {
				const oldCategoryFormatted = this.formatCategoryName(oldCategory);

				const oldDropdownEl = document.querySelectorAll(
					`.${oldCategoryFormatted}`,
				);

				oldDropdownEl.forEach((el) => {
					if (oldCatNum === 1) {
						this._categories = this._categories.filter(
							(cat) => cat !== oldCategory,
						);

						el.closest('div[role="menuitemcheckbox"]').remove();
						const nextHr = el.closest(
							'div[role="menuitemcheckbox"]',
						)?.nextElementSibling;
						if (nextHr?.tagName === 'HR') {
							nextHr.remove();
						}
					} else {
						el.textContent = `${oldCategory} (${oldCatNum - 1})`;
					}
				});
			}

			// Handle new category
			this._populateCategoryDropdown(editedCard);

			if (!this._categories.includes(editedCard.category)) {
				this._categories.push(editedCard.category);
			}
			Storage.updateCategories(this._categories);

			Storage.updateFlashcards(this._flashcards);

			this._showToastNotification('update');
			this._render();
		}
	}

	getCurrentCard() {
		return this._flashcards[this._currentCard];
	}

	getAllFlashcards() {
		return this._flashcards;
	}

	getNextCard() {
		const checkbox = document.getElementById('hide-mastered');
		let cards = this._flashcards;

		if (this._categoryFilter.length > 0) {
			cards = cards.filter((card) =>
				this._categoryFilter.includes(card.category),
			);
		}

		if (checkbox?.checked) {
			cards = cards.filter((card) => card.mastery !== 5);
		}

		if (cards.length === 0) return null;

		// Find current card index in filtered array
		const currentCardInFiltered = cards.findIndex(
			(c) => c.id === this._flashcards[this._currentCard]?.id,
		);

		if (
			currentCardInFiltered === -1 ||
			currentCardInFiltered + 1 >= cards.length
		) {
			// Loop back to first filtered card
			const firstCardIndex = this._flashcards.findIndex(
				(c) => c.id === cards[0].id,
			);
			this._currentCard = firstCardIndex;
		} else {
			// Move to next filtered card
			const nextCardIndex = this._flashcards.findIndex(
				(c) => c.id === cards[currentCardInFiltered + 1].id,
			);
			this._currentCard = nextCardIndex;
		}

		Storage.updateCurrentCardId(this._currentCard);
		return this._flashcards[this._currentCard];
	}

	getPreviousCard() {
		const checkbox = document.getElementById('hide-mastered');
		let cards = this._flashcards;

		// Apply category filter first
		if (this._categoryFilter.length > 0) {
			cards = cards.filter((card) =>
				this._categoryFilter.includes(card.category),
			);
		}

		// Then apply mastered filter if needed
		if (checkbox?.checked) {
			cards = cards.filter((card) => card.mastery !== 5);
		}

		if (cards.length === 0) return null;

		// Find current card index in filtered array
		const currentCardInFiltered = cards.findIndex(
			(c) => c.id === this._flashcards[this._currentCard]?.id,
		);

		if (currentCardInFiltered === -1 || currentCardInFiltered - 1 < 0) {
			// Loop to last filtered card
			const lastCardIndex = this._flashcards.findIndex(
				(c) => c.id === cards[cards.length - 1].id,
			);
			this._currentCard = lastCardIndex;
		} else {
			// Move to previous filtered card
			const prevCardIndex = this._flashcards.findIndex(
				(c) => c.id === cards[currentCardInFiltered - 1].id,
			);
			this._currentCard = prevCardIndex;
		}

		Storage.updateCurrentCardId(this._currentCard);
		return this._flashcards[this._currentCard];
	}

	incrementMastery(card) {
		if (card.mastery === 0) {
			this._totalNotStarted--;
			this._totalInProgress++;
			Storage.updateTotalNotStartedCards(this._totalNotStarted);
			Storage.updateTotalInProgressCards(this._totalInProgress);
		} else if (card.mastery === 4) {
			this._totalInProgress--;
			this._totalMastered++;
			Storage.updateTotalInProgressCards(this._totalInProgress);
			Storage.updateTotalMasteredCards(this._totalMastered);

			// Find all cards with this ID and hide/show mastery elements
			document.querySelectorAll(`[data-id="${card.id}"]`).forEach((cardEl) => {
				const bar = cardEl.querySelector('.bar');
				const mastered = cardEl.querySelector('.card-mastered');

				if (bar) bar.classList.add('hidden');
				if (mastered) mastered.classList.remove('hidden');
			});

			if (this._totalMastered === this._totalCards) {
				const checkbox = document.getElementById('hide-mastered');

				document
					.querySelector('.flashcard-container--main')
					.classList.add('hidden');
				document.querySelector('.all-mastered').classList.remove('hidden');

				checkbox.click();
			}
		}

		card.mastery++;

		Storage.updateFlashcards(this._flashcards);

		const allCardElements = document.querySelectorAll(
			`[data-id="${card.id}"] .progress-bar`,
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
			Storage.updateTotalMasteredCards(this._totalMastered);
		} else {
			this._totalInProgress--;
			Storage.updateTotalInProgressCards(this._totalInProgress);
		}
		card.mastery = 0;
		this._totalNotStarted++;
		Storage.updateTotalNotStartedCards(this._totalNotStarted);

		// Find all cards with this ID and hide/show mastery elements
		document.querySelectorAll(`[data-id="${card.id}"]`).forEach((cardEl) => {
			const bar = cardEl.querySelector('.bar');
			const mastered = cardEl.querySelector('.card-mastered');

			if (bar) bar.classList.remove('hidden');
			if (mastered) mastered.classList.add('hidden');
		});

		const allCardElements = document.querySelectorAll(
			`[data-id="${card.id}"] .progress-bar`,
		);
		allCardElements.forEach((bar) => {
			bar.setAttribute('aria-valuenow', card.mastery);
			bar.setAttribute('data-progress', card.mastery);
		});

		Storage.updateFlashcards(this._flashcards);

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

	hideMastered() {
		let cards = this._flashcards;

		if (this._categoryFilter.length > 0)
			cards = cards.filter((card) =>
				this._categoryFilter.includes(card.category),
			);

		return cards.filter((card) => card.mastery !== 5);
	}

	toggleCategoryFilter(category) {
		if (this._categoryFilter.includes(category)) {
			this._categoryFilter = this._categoryFilter.filter(
				(cat) => cat !== category,
			);
		} else this._categoryFilter.push(category);
	}

	getCategoryFilters() {
		return this._categoryFilter;
	}

	getFilteredCards() {
		let cards = this._flashcards;

		if (this._categoryFilter.length > 0)
			cards = cards.filter((card) =>
				this._categoryFilter.includes(card.category),
			);

		return cards;
	}

	formatCategoryName(category) {
		return category.split(' ').join('-').toLowerCase();
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

	_populateCategoryDropdown(card) {
		const categoriesEl = document.querySelectorAll(
			'.categories-dropdown--content',
		);

		categoriesEl.forEach((el) => {
			const cardCategory = this.formatCategoryName(card.category);

			const divider = document.createElement('hr');
			const categoryEl = document.createElement('div');
			categoryEl.setAttribute('role', 'menuitemcheckbox');
			categoryEl.setAttribute('aria-checked', false);
			categoryEl.setAttribute('tabindex', 0);

			if (this._categories.includes(card.category)) {
				const categoryLabel = document.querySelectorAll(`.${cardCategory}`);

				categoryLabel.forEach((label) => {
					label.innerHTML = `${card.category} (${this._getNumberOfCategoryType(
						card.category,
					)})`;
				});
			} else {
				categoryEl.innerHTML = `<input type="checkbox" id="cat-${cardCategory}" class="dropdown-element" />
				<label for="cat-${this.formatCategoryName(
					card.category,
				)}" class="text--preset-5-medium ${cardCategory}">
				${card.category} (${this._getNumberOfCategoryType(card.category)})
				</label>`;

				el.append(categoryEl, divider);
			}
		});
	}

	_loadCategoryDropdown() {
		const uniqueCategories = [
			...new Set(this._flashcards.map((card) => card.category)),
		];

		uniqueCategories.forEach((category) => {
			const card = this._flashcards.find((c) => c.category === category);

			const categoryIndex = this._categories.indexOf(category);
			if (categoryIndex > -1) {
				this._categories.splice(categoryIndex, 1);
			}

			this._populateCategoryDropdown(card);

			if (!this._categories.includes(category)) {
				this._categories.push(category);
			}

			Storage.updateCategories(this._categories);
		});
	}

	_getNumberOfCategoryType(category) {
		return this._flashcards.filter((card) => card.category === category).length;
	}

	_checkIfCategoryExists(category) {
		const arr = this._getNumberOfCategoryType(category);

		if (arr.length !== 0) {
		}
	}

	_showToastNotification(type) {
		const toastCreated = document.querySelector('.card--created');
		const toastUpdated = document.querySelector('.card--updated');
		const toastDeleted = document.querySelector('.card--deleted');

		switch (type) {
			case 'create':
				this._hideToast(toastCreated);
				break;

			case 'update':
				this._hideToast(toastUpdated);
				break;

			case 'delete':
				this._hideToast(toastDeleted);
				break;
		}
	}

	_hideToast(toast) {
		toast.classList.remove('hidden');

		setTimeout(() => {
			if (!toast.classList.contains('hidden')) {
				toast.classList.add('hidden');
			}
		}, 3000);
	}

	_render() {
		this._displayTotalCards();
		this._displayTotalMastered();
		this._displayTotalInProgress();
		this._displayTotalNotStarted();
	}
}

export default FlashcardTracker;
