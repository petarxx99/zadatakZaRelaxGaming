


import {useRef, useEffect, useState } from 'react';
import './GameView.css';
import MyProbability from '../helpers/MyProbability.js';
import DisplayedImage from '../helpers/DisplayedImage.js';
import DisplayedImageAdapter from '../helpers/DisplayedImageAdapter.js';


function round2decimals(number){
	return Math.round(number * 100.0) / 100.0;
}

const BACKGROUND_COLOR = "beige";
const WIN_CARD_COLOR = "gold";

const SPINNING_PERIOD_IN_SECONDS = 1.2;

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



/* This function calculates the possibility that some win will occur, calculates fair quotient.
It also calculates the percentage of small, medium and big wins among all wins that occur. */
function calculateFairQuotients(){
	
	const giftedWinAndWinProbability = MyProbability.calculateProbabilities(WIN_PERCENTAGE, NUMBER_OF_MAX_CONSECUTIVE_LOSSES);
	const realWinningChance = giftedWinAndWinProbability.realWinningChance;
	const giftedWin = giftedWinAndWinProbability.giftedWinChance;
	
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

function getAllWinningCards(whichWin){
	const winningCard = chooseWinningCard(whichWin);
	const [row, column] = chooseRandomPosition();
	
	const newCards = calculateNewCards(winningCard, {row, column});
	return newCards;
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

	const NUMBER_OF_FRAMES = 60;
	const TIME_BETWEEN_FRAMES = 1000.0 / NUMBER_OF_FRAMES;

	function betWonCallback(winQuotient){
		setBetIsHappening(false);
		props.betWonCallback(winQuotient);
	}
	
	function betLostCallback(){
		setBetIsHappening(false);
		props.betLostCallback();
	}
	
	function afterSpinning(result){
		if (result.win){
			betWonCallback(result.quotient);
		} else {
			betLostCallback();	
		}
	}
	

	function startBet(){
			props.betStartedCallback();
			setBetIsHappening(true);
			
			const canvas = canvasRef.current;
			if (ctx === null || ctx === undefined){
				ctx = canvas.getContext('2d');
			}
		
			let win = true;
			let whichWin = 0;
			
			if (betsLostSinceWin.current >= NUMBER_OF_MAX_CONSECUTIVE_LOSSES){
				betsLostSinceWin.current = 0;
				whichWin = SMALL_WIN;
			} else {
				const clientWon = clientHasWon();
				if (clientWon){
					betsLostSinceWin.current = 0;
					whichWin = calculateWhichWin();
				} else {
					betsLostSinceWin.current += 1;
					win = false;
				}
			}
			
			startSpinningCards(win, whichWin);
	}
	
	const betsLostSinceWin = useRef(0);
	const xPicture = '/xPicture.png';
	
	
	const [allCards, setAllCards] = useState(null);
	
	const [betIsHappening, setBetIsHappening] = useState(false);
	
	
	
	
	let adapter = null;
	
	function displaySpinningCards(ctx){
		const imageContainerRatio = 0.5;
		
		adapter?.displayCards(ctx, imageContainerRatio, imageContainerRatio);
	}
	const FIRST_STOP_ROW = NUMBER_OF_ROWS*2;
	const NUMBER_OF_ROTATING_ROWS = NUMBER_OF_ROWS*3;
	
	function initCards(images){
		
		let cards = [];
		
		const numberOfVisibleRows = NUMBER_OF_ROWS + 1;
		for(let i=0; i<numberOfVisibleRows; i++){
			cards[i] = [];
			for(let j=0; j<NUMBER_OF_COLUMNS; j++){
				const startX = j * cardSize;
				const startY = canvasHeight - (i+1) * cardSize;
				
				cards[i][j] = new DisplayedImage({
					x: startX,
					y: startY,
					startX,
					startY,
					image: images[i][j],
					xSize: cardSize,
					ySize: cardSize,
					xVelocityPerSecond: 0,
					yVelocityPerSecond: 0,
					backgroundColor: BACKGROUND_COLOR,
					winCardColor: WIN_CARD_COLOR
				});
			}
		}
		
		const adapterInfo = {
			arrayOfDisplayedImages: cards, 
			twoDArrayOfAllImages: images, 
			containerHeight: canvasHeight,
			firstStopRow: FIRST_STOP_ROW
			};
			
		return adapterInfo;
	}
	
	function initAdapter(adapterInfo){
		if (adapter == null){
			adapter = new DisplayedImageAdapter(adapterInfo);
		} else {
			adapter.reset(adapterInfo);
		}
	}
	
	
	function setInfoForSpinningCards(cards){
		const adapterInfo = initCards(cards);
		initAdapter(adapterInfo);
	}	
	
	
	function spinCards(result){
		setSpinningRightNow(true);
		clearIntervalIfNotNull(stationaryCardsInterval);
		
		adapter?.startSpinning(SPINNING_PERIOD_IN_SECONDS);
		
		spinningInterval = setInterval(() => {
			paintCanvas();
			adapter?.updateObjectsAnddisplayCards(ctx, IMAGE_RATIO, IMAGE_RATIO, TIME_BETWEEN_FRAMES, canvasHeight);
		}, TIME_BETWEEN_FRAMES);
		
		setTimeout(() => {
			const timeToStopInMiliseconds = adapter.stopObjects(canvasHeight);
			setTimeout(() => {
				setSpinningRightNow(false);
				clearIntervalIfNotNull(spinningInterval);
				adapter?.spinningOver();
				showStationaryCards();
				afterSpinning(result);
			}, timeToStopInMiliseconds + 50);
			
		}, 3000);
	}
	
	function spinLosingCards(){
		const cards = getLosingSpinningCards();
		setInfoForSpinningCards(cards);
		spinCards({win: false});
	}
	
	function spinWinningCards(whichWin){
		const winQuotient = getSpecificWinQuotientWithHouseEdge(whichWin);
		
		const cards = getSpinningWinningCards(whichWin);
		setInfoForSpinningCards(cards);
		
		spinCards({win: true, quotient: winQuotient});
	}
	
	function startSpinningCards(itIsAWin, whichWin){
		if (itIsAWin){
			spinWinningCards(whichWin);
		} else {
			spinLosingCards();
		}
	}
	
	function showStationaryCards(){
			paintCanvas();
			adapter?.displayCardsAndContainer(ctx, IMAGE_RATIO, IMAGE_RATIO);
	}
	
	function showStationaryLosingCards(){
		const cards = getLosingSpinningCards();
		setInfoForSpinningCards(cards);
		showStationaryCards();
	}

	function showStationaryLosingCardsWithDelay(){
		const cards = getLosingSpinningCards();
		setInfoForSpinningCards(cards);
		setTimeout(() => {showStationaryCards();}, 1000);
	}
	
	function clearIntervalIfNotNull(interval){
		if(interval != null){
			clearInterval(interval);
		}
	}
	
	const IMAGE_RATIO = 0.5;
	let spinningInterval = null;
	let stationaryCardsInterval = null;
	const [spinningRightNow, setSpinningRightNow] = useState(false);
	const SPIN_TIME_IN_MILISECONDS = 4000;
	let spinTimerMiliseconds = SPIN_TIME_IN_MILISECONDS;
	/***************************************************************************************** */
	
	function getLosingSpinningCards(){
		let images = [];
		
		for(let i=0; i<NUMBER_OF_ROTATING_ROWS; i++){
			images[i] = [];
			images[i] = getLosingRow();
		}
		return images;
	}
	
	
	function getSpinningWinningCards(whichWin){
		const cards = getLosingSpinningCards();
		const winningCards = getAllWinningCards(whichWin);
		
		for(let i=0; i<NUMBER_OF_ROWS; i++){
			cards[i+FIRST_STOP_ROW] = [];
			for(let j=0; j<NUMBER_OF_COLUMNS; j++){
				cards[i+FIRST_STOP_ROW][j] = winningCards.rows[i][j];
			} 
		}
		
		return cards;
	}
	
	function paintCanvas(){
		ctx.fillStyle = BACKGROUND_COLOR;
		ctx.fillRect(0,0, canvasWidth, canvasHeight);
	}
	
/* ********************************************************************* */

	const canvasRef = useRef();
	let ctx = null;
	
		
	useEffect(() => {

		const canvas = canvasRef.current;
		if (ctx === null || ctx === undefined){
			ctx = canvas.getContext('2d');
		}
		showStationaryLosingCardsWithDelay();
	}, []);
	

	
	function createMatrixOfPictures(pictures){
		let newDisplayedImages = [];
		for(let i=0; i<NUMBER_OF_ROWS; i++){
			newDisplayedImages[i] = [];
			for(let j=0; j<NUMBER_OF_COLUMNS; j++){
				newDisplayedImages[i][j] = {
					src: pictures[i][j].src,
					x: 0 
				};
			}
		}
	}
	
	
	
	let displayedImageAdapter = null;
	

	const calculateCanvasSize = () => Math.min(window.innerWidth, window.innerHeight)/2
	
	const [displayedImages, setDisplayedImages] = useState([]);
	
	
	const [windowWidth, setWindowWidth] = useState(window.innerWidth);
	const [windowHeight, setWindowHeight] = useState(window.innerHeight);

	
	const canvasWidth = Math.min(window.innerWidth, window.innerHeight) / 2;
	const canvasHeight = 1.0 * canvasWidth * NUMBER_OF_ROWS / NUMBER_OF_COLUMNS;
	let cardSize = canvasHeight / NUMBER_OF_ROWS;
	let fromTop = (canvasHeight - cardSize * NUMBER_OF_ROWS) / 2.0;

	return (
<div className="wrap">

	
	
		
	<div className="buttonStartBet">
		<button onClick={startBet} className={betIsHappening? 'dontShow' : ''}> ODIGRAJTE </button>
	</div>
	
	<div>
		<canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} background="white"></canvas>
	</div>
</div>
	);
	

	
}

export default GameView;


