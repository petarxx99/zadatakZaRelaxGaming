
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
	        	        
	        if (newAmountToBet > credit || newAmountToBet < 1){
	        	event.preventDefault();
	        }
	}
	
	function changeAmountToBet(newAmountToBet){
		if (newAmountToBet >= 1 && newAmountToBet <= credit){
			setAmountToBet(newAmountToBet);
		}
	}
	
	function betLost(){
		alert("Bet lost");
		setCredit(credit - amountToBet);
		setBetIsHappening(false);
	}
	
	function betWon(winQuotient){
		alert("Bet won: " + winQuotient);
		const creditChange = amountToBet * winQuotient;
		setCredit(credit + creditChange);
		setBetIsHappening(false);
		soundSuccess.play();
	}
	
	const betStarted = () => setBetIsHappening(true);
	
	const [credit, setCredit] = useState(START_CREDIT);
	const [amountToBet, setAmountToBet] = useState(1);
	const [lastCreditChange, setLastCreditChange] = useState(0);
	const [betIsHappening, setBetIsHappening] = useState(false);
	
	const soundSuccess = new Audio("/soundSuccess.wav");
	const soundFailure = new Audio("/soundFailure.wav");
	
	const backgroundPhotoClass = 'backgroundPhoto ' + `${isOnPhone()? 'backgroundPhotoOnPhone' : ''}`;

	return (
	<div className={'wrap'}>
		<img src="/basketballArena.jpg" className={backgroundPhotoClass} />
		<div className={wrapClass}>
			
			<div className={'up'} >
				<GameView betWonCallback={betWon} betLostCallback={betLost} betStartedCallback={betStarted}/>	
			</div>
		
			<div className={'down'} >
				<div className={'credit'}>
					<label> <b>NOVAC KOJI IMATE {round2decimals(credit)} </b></label>
				</div>
			
				<div className={'amountToBet'} >
					<label className={betIsHappening? 'dontShow' : ''}> ULOG </label>
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
