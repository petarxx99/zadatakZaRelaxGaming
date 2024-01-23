
import {useRef, useEffect, useState } from 'react';

import GameView from './GameView.jsx';
import './MainView.css';




function MainView(){

	function isOnPhone(){
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}
	const wrapClass = 'componentsWrap ' + `{isOnPhone()? 'phoneComponentsWrap' : 'noPhoneComponentsWrap'}`;

	const START_CREDIT = 10000;

	function startNextBet(event){
		alert("poruka: " + event.target.value);
	}
	
	function round2decimals(number){
		return Math.round(number * 100.0) / 100.0;
	}

	function validateInputNumber(event, amountToBet, credit){
		if (!/[0-9]/.test(event.key)) {
	          	event.preventDefault();
	        }    
	        const newDigit = parseInt(event.key);
	        const newAmountToBet = amountToBet * 10 + newDigit;
	        	        
	        if (newAmountToBet > credit || newAmountToBet < 0){
	        	event.preventDefault();
	        }
	}
	
	function changeAmountToBet(newAmountToBet){
		if (newAmountToBet <= credit && newAmountToBet >=0){
			setAmountToBet(newAmountToBet);
		}
	}
	
	function betLost(){
		if (creditTemporary.current < 1){
			alert("Izgubili ste sav novac.");
		}
		setBetIsHappening(false);
	}
	
	function betWon(winQuotient){
		const creditChange = amountToBet * winQuotient;
		const newCredit = creditTemporary.current + creditChange;
		setCredit(newCredit);
		setLastCreditChange(creditChange);
		setBetIsHappening(false);
		
		soundSuccess.play();
		
		
		setTimeout(() => {
				setShowingWinPicture(true);
			
				setTimeout(() => {
					setShowingWinPicture(false);
				}, ONE_AND_A_HALF_SECONDS);
		}, ONE_AND_A_HALF_SECONDS);
		
	}
	
	const TWO_SECONDS = 2000;
	const ONE_SECOND = 1000;
	const ONE_AND_A_HALF_SECONDS = 1500;
	
	const betStarted = () => {
		creditTemporary.current = credit - amountToBet;
		setCredit(credit - amountToBet);
		setLastCreditChange(-amountToBet);
		setBetIsHappening(true);
	}
	
	const [credit, setCredit] = useState(START_CREDIT);
	const [amountToBet, setAmountToBet] = useState(1);
	const [lastCreditChange, setLastCreditChange] = useState(0);
	const [showingWinPicture, setShowingWinPicture] = useState(false);
	const [betIsHappening, setBetIsHappening] = useState(false);
	const creditTemporary = useRef(START_CREDIT);
	
	const soundSuccess = new Audio("/soundSuccess.wav");
	const soundFailure = new Audio("/soundFailure.wav");
	
	const backgroundPhotoClass = 'backgroundPhoto ' + `${isOnPhone()? 'backgroundPhotoOnPhone' : ''}`;

	return (
	<div className={'wrap'}>
		<img src="/basketballArena.jpg" className={backgroundPhotoClass} />
		<div className={wrapClass}>
			
			<div className={(amountToBet > 0 && amountToBet <= credit)? 'up' : 'dontShow'} >
				<GameView betWonCallback={betWon} betLostCallback={betLost} betStartedCallback={betStarted} 
				className={showingWinPicture? 'dontShow' : ''}/>
				<img src="/win.jpg" className={showingWinPicture? 'winPicture' : 'dontShow'} />	
			</div>
			<div className={(amountToBet > 0 && amountToBet <= credit)? 'dontShow' : 'up'} >
				<label> <b>Niste uložili novac.</b> </label>	
			</div>
			
		
			<div className={'down'} >
				<div className={'credit'}>
					<label> <b>CREDIT {round2decimals(credit)} </b></label>
					<label className={lastCreditChange <= 0? 'dontShow' : ''}> 
					YOU WON {round2decimals(lastCreditChange)}! </label>
				</div>
			
				<div className={'amountToBet'} >
					<label className={betIsHappening? 'dontShow' : ''}> AMOUNT TO BET </label>
					<input	type="number" onKeyPress={event => {validateInputNumber(event, parseInt(amountToBet), credit)}}
      					value={amountToBet} 
      					onChange={event => changeAmountToBet(parseInt(event.target.value || 1))} 	
      					className={betIsHappening? 'dontShow' : ''}
    					/>
				</div>
			</div>
		</div>
	</div>
	);
}

export default MainView;
