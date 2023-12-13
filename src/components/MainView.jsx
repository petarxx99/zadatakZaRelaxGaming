
import {useRef, useEffect, useState } from 'react';

import GameView from './GameView.jsx';
import './MainView.css';



function MainView(){

	const START_CREDIT = 10000;

	function startNextBet(event){
		alert("poruka: " + event.target.value);
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
	}
	
	const betStarted = () => setBetIsHappening(true);
	
	const [credit, setCredit] = useState(START_CREDIT);
	const [amountToBet, setAmountToBet] = useState(1);
	const [lastCreditChange, setLastCreditChange] = useState(0);
	const [betIsHappening, setBetIsHappening] = useState(false);
	

	return (
	<div className={'wrap'}>
		<div className={'up'} >
			<GameView betWonCallback={betWon} betLostCallback={betLost} betStartedCallback={betStarted}/>	
		</div>
		
		<div className={'down'} >
			<div className={'credit'}>
				<label> NOVAC {credit} </label>
			</div>
			
			<div className={'amountToBet'} >
				<input	type="number" onKeyPress={event => {validateInputNumber(event, parseInt(amountToBet), credit)}}
      					value={amountToBet} 
      					onChange={event => changeAmountToBet(parseInt(event.target.value || 1))} 	
      					className={betIsHappening? 'dontShow' : ''}
    				/>
			</div>
		</div>
	</div>
	);
}

export default MainView;
