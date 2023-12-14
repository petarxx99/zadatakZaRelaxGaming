


import {useRef, useEffect, useState } from 'react';
import './GameView.css';



function round2decimals(number){
	return Math.round(number * 100.0) / 100.0;
}

const NUMBER_OF_ROWS = 3;
const NUMBER_OF_COLUMNS = 5;
const NUMBER_OF_MAX_CONSECUTIVE_LOSSES = 3;
const THREE_SECONDS = 3000;

const SMALL_WIN = 1;
const MEDIUM_WIN = 2;
const BIG_WIN = 3;
const LOSS = -1;

const WIN_PERCENTAGE = 33;
const BIG_WIN_PERCENTAGE = 20;
const MEDIUM_WIN_PERCENTAGE = 30;
const SMALL_WIN_PERCENTAGE = 50;
const NUMBER_OF_DIFFERENT_WINS = 3;


const HOUSE_EDGE = 0.05; 



const SMALL_WIN_OFFER = getSpecificWinQuotientWithHouseEdge(SMALL_WIN);
const MEDIUM_WIN_OFFER = getSpecificWinQuotientWithHouseEdge(MEDIUM_WIN);
const BIG_WIN_OFFER = getSpecificWinQuotientWithHouseEdge(BIG_WIN);

const {realWinningChance, realWinningChanceError} = calculateRealWinChance(WIN_PERCENTAGE / 100.0);



/* This function calculates the possibility that some win will occur, calculates fair quotient.
It also calculates the percentage of small, medium and big wins among all wins that occur. */
function calculateFairQuotients(){
	const realWinningChance = calculateRealWinChance(WIN_PERCENTAGE / 100.0).realWinningChance;
	const giftedWin = Math.pow(1-realWinningChance, 3);
	const winNotGifted = 1 - giftedWin;
	
	const chanceOfSmallWin = giftedWin + winNotGifted * WIN_PERCENTAGE * SMALL_WIN_PERCENTAGE / (100.0 * 100.0);
	const chanceOfMediumWin = winNotGifted * WIN_PERCENTAGE * MEDIUM_WIN_PERCENTAGE / (100.0 * 100.0);
	const chanceOfBigWin = winNotGifted * WIN_PERCENTAGE * BIG_WIN_PERCENTAGE / (100.0 * 100.0);
	
	const howMuchEachTierContributes = 1.0 / NUMBER_OF_DIFFERENT_WINS;
	
	const smallWinQuotient = howMuchEachTierContributes / chanceOfSmallWin;
	const mediumWinQuotient = howMuchEachTierContributes / chanceOfMediumWin;
	const bigWinQuotient = howMuchEachTierContributes / chanceOfBigWin;
	
	return {
		smallWinQuotient,
		mediumWinQuotient,
		bigWinQuotient,
		winQuotient: 1.0 / realWinningChance
	};
}


/* This function receives the winning chance on the first try and it returns the winning chance that you get 
when you play the game over and over again, under the assumption that after x number of consecutive losses you are guaranteed a win. 
Let p be chance of a win in the limit when a player plays over and over again. 
Let the basicWinChance be the chance that a player wins a round that is not fixed. 
Then, when a player plays there are only 2 ways a player can win, either he has lost the last x consecutive games and he will be gifted 
a win (the chance for that is Math.pow(1 - p, x)), or he did not lose x consecutive games and he got lucky to win this time
(chance for that is (1 - Math.pow(1-p, x) * basicWinChance)). When we add the chance of these two scenarios together we get 
the chance that a player wins a round (p). So, we get 
Math.pow(1-p, x) + (1 - Math.pow(1-p, x)) * basicWinChance = p
Math.pow(1-p, x) + basicWinChance - basicWinChance * Math.pow(1-p, x) = p
Math.pow(1-p, x) * (1 - basicWinChance) + basicWinChance - p = 0.
Instead of analytically solving this equation for the general case, I plugged in various probabilities for p (from 0 to 1) and 
chose the one which will yield the left hand side of the equation the closest to 0.
*/
function calculateRealWinChance(basicWinChance){
	const basicWinQuotient = 1.0 / basicWinChance;
	let [smallestDifference, minP] = [1, 0];
	
	const NUMBER_OF_TRIES = 1024;
	const deltaP = 1.0 / NUMBER_OF_TRIES;
	
	for(let i=0; i < NUMBER_OF_TRIES; i++){
		const p = deltaP * i;
		
		const difference = Math.abs(Math.pow(1 - p, NUMBER_OF_MAX_CONSECUTIVE_LOSSES) * (1 - basicWinChance) + basicWinChance - p);
		if (difference < smallestDifference){
			smallestDifference = difference;
			minP = p;
		}
	}
	
	return {
		realWinningChance: minP,
		difference: smallestDifference
	};
}



/* Returns a quotient for the specific win that is passed as an argument as SMALL_WIN, MEDIUM_WIN or BIG_WIN. 
House edge is NOT calculated into the odds. Quotient is fair, which means that if a player keeps playing neither house nor 
player should win in the long run. */
function getSpecificWinQuotient(whichWin){
	const winData = calculateFairQuotients();

	switch(whichWin){
		case SMALL_WIN: return winData.smallWinQuotient;
		case MEDIUM_WIN: return winData.mediumWinQuotient;
		case BIG_WIN: return winData.bigWinQuotient;
	}
}


/* Returns a quotient for the specific win that is passed as an argument as SMALL_WIN, MEDIUM_WIN or BIG_WIN. 
House edge is calculated into the odds. Quotient is not fair, which means that if a player keeps playing house wins in the long run. */
function getSpecificWinQuotientWithHouseEdge(whichWin){
	const fairQuotient = getSpecificWinQuotient(whichWin);
	const playerReturn = 1.0 - HOUSE_EDGE;
	return fairQuotient * playerReturn;
}



/* It receives whichWin, i.e. SMALL_WIN, MEDIUM_WIN, BIG_WIN and it returns the percentage that such win has occured 
under the assumption that some win has indeed occured. */
function mapWhichWinToWinTierPercentage(whichWin){
	switch (whichWin){
		case SMALL_WIN: return SMALL_WIN_PERCENTAGE;
		case MEDIUM_WIN: return MEDIUM_WIN_PERCENTAGE;
		case BIG_WIN: return BIG_WIN_PERCENTAGE;
	}
}


/* This code is called when a player wins. */
function doWin(betWonCallback, betsLostSinceWin, setAllCards){
	betsLostSinceWin.current = 0;
	const whichWin = calculateWhichWin();
	displayWin(whichWin, setAllCards);
	const winQuotient = getSpecificWinQuotientWithHouseEdge(whichWin);
	betWonCallback(winQuotient);
}

/* This code is called when you want to give player the smallest win. */
function doSmallWin(betWonCallback, betsLostSinceWin, setAllCards){
	betsLostSinceWin.current = 0;
	const whichWin = SMALL_WIN;
	displayWin(whichWin, setAllCards);
	const winQuotient = getSpecificWinQuotientWithHouseEdge(whichWin);
	betWonCallback(winQuotient);
}

/* Randomly decides whether a player got a SMALL_WIN, MEDIUM_WIN, or a BIG_WIN. */
function calculateWhichWin(){
	const randomNumber = Math.random() * 100;
	if (randomNumber < BIG_WIN_PERCENTAGE){
		return BIG_WIN;
	}
	if (randomNumber < BIG_WIN_PERCENTAGE + MEDIUM_WIN_PERCENTAGE){
		return MEDIUM_WIN;
	}
	return SMALL_WIN;
}

/* Randomly decides whether a player won this round. */
function clientHasWon(){
	const randomNumber = Math.random() * 100;
	if (randomNumber < WIN_PERCENTAGE){
		return true; 
	} 
	return false;
}


function chooseRandomPosition(){
	let randomRow = Math.floor(Math.random() * NUMBER_OF_ROWS);
	let randomColumn = Math.floor(Math.random () * (NUMBER_OF_COLUMNS - NUMBER_OF_CARDS_TO_WIN + 1));
	return [randomRow, randomColumn];
}

function chooseWinningCard(whichWin){
	const picturesToChooseFrom = allPictures.filter(p => p.tier === whichWin);
	const randomIndex = Math.floor(Math.random() * picturesToChooseFrom.length);
	return picturesToChooseFrom[randomIndex];
}

function randomlyChooseACard(){
	const randomIndex = Math.floor(Math.random() * allPictures.length);
	return allPictures[randomIndex];
}

/* Shows cards in a winning pattern on the screen. */
function displayWin(whichWin, setAllCards){
	const winningCard = chooseWinningCard(whichWin);
	const [row, column] = chooseRandomPosition();
	
	const newCards = calculateNewCards(winningCard, {row, column});
	setAllCards(newCards);
}

/* Returns an object with a field 'rows' that is a 2D array which contains a winning pattern of cards. 
Other functions may use this 2D array to display the cards on the screen. 
This function is given the information what the winning card should be and where the winning card should be. 
rowColumn.column stands for the column where the most left winning card is.  */
function calculateNewCards(winningCard, rowColumn){
	let newCards = {rows: []};
	
	for(let i=0; i<NUMBER_OF_ROWS; i++){
		newCards.rows[i] = [];
		
		if (i != rowColumn.row){
			newCards.rows[i] = getLosingRow();
		} else {
			newCards.rows[i] = getWinningRow(winningCard, rowColumn.column);
		}
	}
	
	return newCards;
}

/* Returns a row where there is no winning combination of cards. */
function getLosingRow(){
	let losingRow = [];
	
	for(let i=0; i < 2; i++){
		losingRow[i] = {src: randomlyChooseACard().src};
	}
	
	for(let i=2; i < NUMBER_OF_COLUMNS; i++){
		if (losingRow[i-1].src === losingRow[i-2].src){
			const potentialCards = allPictures.filter(p => p.src != losingRow[i-1].src);
			const randomCard = getRandomElement(potentialCards);
			losingRow[i] = {src: randomCard.src};
		} else {
			losingRow[i] = {src: randomlyChooseACard().src};
		}
	}
	
	return losingRow;
}

function getRandomElement(array){
	const randomIndex = Math.floor(Math.random() * array.length);
	return array[randomIndex];
}


function displayLoss(setAllCards){
	const cards = getLosingCards();
	setAllCards(cards);
}

function getLosingCards(){
	let cards = {rows: []};
	for(let i=0; i < NUMBER_OF_ROWS; i++){
		cards.rows[i] = [];
		cards.rows[i] = getLosingRow();
	}
	return cards;
}

/* Returns a row with a winning pattern of cards. Arguments are the winning card and the column of the most left winning card.*/
function getWinningRow(winningCard, column){
	let winningRow = [];
	
	let columnStart = column;
	let columnEnd = column + NUMBER_OF_CARDS_TO_WIN - 1;
	
	
	for(let i=0; i < NUMBER_OF_COLUMNS; i++){
		if (i >= columnStart && i <= columnEnd){
			winningRow[i] = {src: winningCard.src, winCard: true};
		} else if (i < 2){
			winningRow[i] = {src: randomlyChooseACard().src};
		} else if (winningRow[i-1].src !== winningRow[i-2].src){
			winningRow[i] = {src: randomlyChooseACard().src};
		}else{
			const potentialCards = allPictures.filter(p => p.src != winningRow[i-1].src);
			const randomCard = getRandomElement(potentialCards);
			winningRow[i] = {src: randomCard.src};
		}
	}
	
	return winningRow;
}

const NUMBER_OF_CARDS_TO_WIN = 3;

const allPictures = [
	{src: '/number2.png', tier: SMALL_WIN},
	{src: '/number3.png', tier: SMALL_WIN},
	{src: '/number5.png', tier: SMALL_WIN},
	{src: '/number6.png', tier: SMALL_WIN},
	
	{src: '/ball.png', tier: MEDIUM_WIN},
	{src: '/bucketScored.png', tier: MEDIUM_WIN},
	{src: '/hoopAndBall.png', tier: MEDIUM_WIN},
	
	{src: '/gold.png', tier: BIG_WIN},
	{src: '/bagOfGold.png', tier: BIG_WIN}];
	
function displayNoCards(xPicture, setAllCards){
	let tempAllCards = {rows : []};
	for(let i=0; i < NUMBER_OF_ROWS; i++){
		tempAllCards.rows[i] = [];
		for(let j=0; j < NUMBER_OF_COLUMNS; j++){
			tempAllCards.rows[i][j] = {src: xPicture};
		}
	}
	setAllCards(tempAllCards);
}

function GameView(props){

	function betWonCallback(winQuotient){
		setBetIsHappening(false);
		props.betWonCallback(winQuotient);
	}

	function startBet(){
		props.betStartedCallback();
		setBetIsHappening(true);
		displayNoCards(xPicture, setAllCards);
		
		setTimeout(() => {
			if (betsLostSinceWin.current >= NUMBER_OF_MAX_CONSECUTIVE_LOSSES){
				doSmallWin(betWonCallback, betsLostSinceWin, setAllCards);	
			} else {
				const clientWon = clientHasWon();
				if (clientWon){
					doWin(betWonCallback, betsLostSinceWin, setAllCards);
				} else {
					betsLostSinceWin.current += 1;
					displayLoss(setAllCards);
					
					setBetIsHappening(false);
					props.betLostCallback();
				}
			}
		}, THREE_SECONDS);
	}
	
	const betsLostSinceWin = useRef(0);
	const xPicture = '/xPicture.png';
	
	
	const [allCards, setAllCards] = useState(null);
	
	const [betIsHappening, setBetIsHappening] = useState(false);
	
	useEffect(() => {
		displayNoCards(xPicture, setAllCards);	
	}, []);
	

	
	return (
<div className="wrap">

	<div className="rowsWrap" >
			{allCards?.rows.map((row, iRow) => { return <div className="oneRow" key={iRow}> 
				{row?.map((imageInfo, jColumn) => {return <div className={imageInfo.winCard? 'winCard' : ''} key={jColumn}>
				<img src={imageInfo.src} width="60vw" height="60vw"  className={imageInfo.winCard? "winCard onePicture" : 'onePicture'}/> </div>})} 
				</div>
			})}
	</div>

		
		
	<div className="buttonStartBet">
		<button onClick={startBet} className={betIsHappening? 'dontShow' : ''}> ODIGRAJTE </button>
	</div>
</div>
	);
	

	
}

export default GameView;


