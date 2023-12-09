
import {useRef, useEffect, useState } from 'react';

import GameView from './GameView.jsx';
import style from './MainView.css';



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
	        	        
	        if (newAmountToBet > credit){
	        	event.preventDefault();
	        }
	}
	
	const [credit, setCredit] = useState(START_CREDIT);
	const [amountToBet, setAmountToBet] = useState(0);
	const [lastCreditChange, setLastCreditChange] = useState(0);
	

	return (
	<div className={style.wrap}>
		<div className={style.up} >
			<GameView />		
		</div>
		
		<div className={style.down} >
			<div className={style.credit}>
				<label> NOVAC {credit} </label>
			</div>
			
			<div className={style.amountToBet} >
				<input	type="number" onKeyPress={event => {validateInputNumber(event, parseInt(amountToBet), credit)}}
      					value={amountToBet} 
      					onChange={event => parseInt(setAmountToBet(event.target.value || 0))} 	
    				/>
			</div>
			
			<div className={style.betButton}>
				<button onClick={startNextBet}> ODIGRAJ </button>
			</div>
		</div>
	</div>
	);
}

export default MainView;
