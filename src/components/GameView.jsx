


import {useRef, useEffect, useState } from 'react';
import style from './GameView.css';


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

function GameView(){
	
	const containerRectangle = {width: 50, height: 50};
	const pictureToContainerRatio = 0.8;
	const pictureRectangleRatio = {width: 1, height: 1};
	const pictureRectangle = getPictureRectangle(containerRectangle, pictureRectangleRatio, pictureToContainerRatio);
	
	const allPictures = [
	{src: '/number2.png', tier: 1},
	{src: '/number3.png', tier: 1},
	{src: '/number5.png', tier: 1},
	{src: '/number6.png', tier: 1},
	
	{src: '/ball.png', tier: 2},
	{src: '/bucketScored.png', tier: 2},
	{src: '/hoopAndBall.png', tier: 2},
	
	{src: '/gold.png', tier: 3},
	{src: '/bagOfGold.png', tier: 3}];	
	
	const xPicture = '/xPicture.png';
	
	
		   
	
	const [allCards, setAllCards] = useState(null);
	
	useEffect(() => {
		let tempAllCards = {rows : []};
		for(let i=0; i < NUMBER_OF_ROWS; i++){
			tempAllCards.rows[i] = [];
			for(let j=0; j < NUMBER_OF_COLUMNS; j++){
				tempAllCards.rows[i][j] = xPicture;
			}
		}
		setAllCards(tempAllCards);
		
		
	});
	

	
	return (
	<div className={style.wrap}>
		Proba {allCards?.rows.length} 
		
		{allCards?.rows.map(row => { return <div className={style.oneRow}> 
			{row?.map(imageSource => {return <img src={imageSource} width="100px" height="100px" />})} 
		</div>
		})}
		
		
		<img src={allCards?.rows[0][1]} height="100px" width="100px"  />
		<img src={allCards?.rows[0][0]}  height="100px" width="100px" />
		
	
	</div>
	);
	

	
}

export default GameView;


/* 
{allCards?.rows.map(row => { return 
				<div className={style.oneRow} > 
					<h3> Red </h3>
					{row?.map(imageSource => {return 
						<img src={imageSource} height="100px" width="100px" />
					})}
				</div>
			
		})}
*/

/*

{allCards?.rows.map(row => { return 
			<div className={style.oneRow}>
				{row?.map(imageSource => {return <img src={imageSource} />})}
			</div>
			})
		}
		
*/

/*
{allCards?.rows.map(row => { return <div className={style.oneRow}> Red 
</div>
})}
*/


