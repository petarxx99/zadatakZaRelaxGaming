


import {useRef, useEffect, useState } from 'react';
import './GameView.css';


function getPictureRectangle(containerRectangle, pictureRectangle, pictureToContainerRatio){
	
	let calculatedPictureRectangle = {
		width: pictureRectangle.width,
		height: pictureRectangle.height
	};
	
	if (pictureRectangle.width > pictureRectangle.height){
		const pictureWidth = containerRectangle.width * pictureToContainerRatio;
		calculatedPictureRectangle.width = Math.round(pictureWidth);
		
		const ratioOfNewToOldEdge = pictureWidth / pictureRectangle.width;
		 
		calculatedPictureRectangle.height = Math.round(ratioOfNewToOldEdge * pictureRectangle.height);
	} else {
		const pictureHeight = containerRectangle.height * pictureToContainerRatio;
		calculatedPictureRectangle.height = Math.round(pictureHeight);
		
		const ratioOfNewToOldEdge = pictureHeight / pictureRectangle.height;
		
		calculatedPictureRectangle.width = Math.round(ratioOfNewToOldEdge * pictureRectangle.width);
	}
	
	return calculatedPictureRectangle;
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

function mapWhichWinToWinQuotient(whichWin){

	const winTierPercentage = mapWhichWinToWinTierPercentage(whichWin);
	const totalWinPercentage = WIN_PERCENTAGE * winTierPercentage;
	
	const PERCENT_CONVERTER = 1.0/(100 * 100);
	const winChance = totalWinPercentage * PERCENT_CONVERTER;
	return 1.0 / winChance;
}

function mapWhichWinToWinTierPercentage(whichWin){
	switch (whichWin){
		case SMALL_WIN: return SMALL_WIN_PERCENTAGE;
		case MEDIUM_WIN: return MEDIUM_WIN_PERCENTAGE;
		case BIG_WIN: return BIG_WIN_PERCENTAGE;
	}
}

function doWin(betWonCallback, betsSinceWin, setAllCards){
	betsSinceWin.current = 0;
	const whichWin = calculateWhichWin();
	displayWin(whichWin, setAllCards);
	const winQuotient = mapWhichWinToWinQuotient(whichWin);
	betWonCallback(winQuotient);
}

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

function displayWin(whichWin, setAllCards){
	const winningCard = chooseWinningCard(whichWin);
	const [row, column] = chooseRandomPosition();
	
	const newCards = calculateNewCards(winningCard, {row, column});
	setAllCards(newCards);
}

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
			if (betsSinceWin.current > NUMBER_OF_MAX_CONSECUTIVE_LOSSES){
				doWin(betWonCallback, betsSinceWin, setAllCards);	
			} else {
				const clientWon = clientHasWon();
				if (clientWon){
					doWin(betWonCallback, betsSinceWin, setAllCards);
				} else {
					betsSinceWin.current += 1;
					displayLoss(setAllCards);
					
					setBetIsHappening(false);
					props.betLostCallback();
				}
			}
		}, THREE_SECONDS);
	}
	
	let betsSinceWin = useRef(0);
	
	
	const containerRectangle = {width: 50, height: 50};
	const pictureToContainerRatio = 0.8;
	const pictureRectangleRatio = {width: 1, height: 1};
	const pictureRectangle = getPictureRectangle(containerRectangle, pictureRectangleRatio, pictureToContainerRatio);
	
		
	
	const xPicture = '/xPicture.png';
	
	
	const [allCards, setAllCards] = useState(null);
	
	const [betIsHappening, setBetIsHappening] = useState(false);
	
	useEffect(() => {
		displayNoCards(xPicture, setAllCards);	
	}, []);
	

	
	return (
	<div className="wrap">
		
		<div className="rowsWrap" >
			{allCards?.rows.map(row => { return <div className="oneRow"> 
				{row?.map(imageInfo => {return <div className={imageInfo.winCard? 'winCard' : ''}><img src={imageInfo.src} width="80vw" height="80vw" 
					className={imageInfo.winCard? "winCard onePicture" : 'onePicture'}/> </div>})} 
				</div>
			})}
		</div>
		
		<div className="button">
			<button onClick={startBet} className={betIsHappening? 'dontShow' : ''}> IGRAJ </button>
		</div>
	</div>
	);
	

	
}

export default GameView;


