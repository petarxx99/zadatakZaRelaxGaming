

class DisplayedImageAdapter{

	
	
	constructor(object){
		this.reset(object);
	}	
	
	
	
	
	reset(object){
		this.array = object.arrayOfDisplayedImages;
		this.containerHeight = object.containerHeight;
		this.twoDArrayOfAllImages = object.twoDArrayOfAllImages;
		this.firstStopRow = object.firstStopRow;
		
		this.lastDisplayedPicturesRow = this.array.length - 1;
		this.changedCards = 0;
		
		this.timeSpinningInSeconds = object.timeSpinningInSeconds;
		this.cardTurnoverBeforeStopping = object.cardTurnoverBeforeStopping;
		
		this.cardsToChangeWhileDeccelerating = this.firstStopRow;
		this.numberOfChangedCardsBeforeDeccelerating = this.cardTurnoverBeforeStopping * this.twoDArrayOfAllImages.length;
		this.numberOfChangedCardsBeforeStopping = this.numberOfChangedCardsBeforeDeccelerating + this.cardsToChangeWhileDeccelerating;
	
		this.distanceTraveledWhileDeccelerating = this.array[0][0].ySize * this.cardsToChangeWhileDeccelerating;
		this.yVelocity = this.numberOfChangedCardsBeforeDeccelerating * this.array[0][0].ySize / this.timeSpinningInSeconds;
		
		this.changeInSpeed = this.array[0][0].slowestSpeedPerSecond - this.yVelocity;
		this.calculateAccelerationToStop(this.distanceTraveledWhileDeccelerating, this.changeInSpeed, this.yVelocity);
	}
	
	
	calculateAccelerationToStop(distanceTraveledWhileDeccelerating, changeInSpeed, startSpeed){
				/* 
		distance = (at^2)/2 + Vo t
		t = (Vresult - Vo)/a 
		t = Vchange / a 
		
		distance = a Vchange^2 / 2a^2  +  Vo Vchange / a
		distance = Vchange^2 / 2a  +  Vo Vchange / a
		distance = (Vchange^2 + 2Vo Vchange) / 2a
		a = (Vchange^2 + 2Vo Vchange) / 2distance
		*/
		
			
			const acceleration = 
			(changeInSpeed * changeInSpeed + 2 * startSpeed * changeInSpeed) / 
				(2*distanceTraveledWhileDeccelerating);
			
			const secondsToMiliseconds = 1000;
			const timeInMiliseconds = changeInSpeed * secondsToMiliseconds / acceleration;
			this.accelerationToStop = acceleration;
			this.deccelerationTimeInMiliseconds = timeInMiliseconds;		
			
	}
	

	
	set2DArrayOfImages(images){
		this.twoDArrayOfAllImages = images;
		for(let i=0; i<this.array.length; i++){
			for(let j=0; j<this.array[i].length; j++){
				this.array[i][j].changeImage(images[i][j]);
			}
		}
	}
	
	
	spinOverResetImages(){
		let newPictures = [];
		const firstPicture = (this.twoDArrayOfAllImages.length + this.lastDisplayedPicturesRow - (this.array.length - 1) + 1) % this.twoDArrayOfAllImages.length;
		
		for(let i=0; i<this.twoDArrayOfAllImages.length; i++){
			newPictures[i] = [];
			const firstIndex = (i + firstPicture) % this.twoDArrayOfAllImages.length;
			
			for(let j=0; j<this.twoDArrayOfAllImages[i].length; j++){
				newPictures[i][j] = this.twoDArrayOfAllImages[firstIndex][j];
			}
		}
		
		this.twoDArrayOfAllImages = newPictures;
		this.lastDisplayedPicturesRow = this.array.length - 1;
	}
	
	spinningOver(){
		this.spinOverResetImages();
		
		const ySize = this.array[0][0].ySize;
		const canvasSize = ySize * (this.array.length - 1);
	
		for(let i=0; i<this.array.length; i++){
			const height = canvasSize - ySize * (i+1);
			
			for(let j=0; j<this.array[i].length; j++){
				const image = this.twoDArrayOfAllImages[i][j];
				
				this.array[i][j].y = height;	
				this.array[i][j].changeImage(image);
			}			
		}
	}
	
	

	
	findFirstArrayRow(){
		let firstRow = 0;
		const arrayLength = this.array.length;
		
		for(let i=0; i<arrayLength; i++){
			if (this.array[i].y > this.array[firstRow].y){
				firstRow = i;
			}
		}
		
		return firstRow;
	}
	
	
	
	updateObjectsAnddisplayCards(ctx, xImageRatio, yImageRatio, timeIntervalInMiliseconds, heightOfContainer){

		const potentialNewSrcRow = (this.lastDisplayedPicturesRow+1) % this.twoDArrayOfAllImages.length;
		let outOfBoundsHappened = false;
		
		for(let i=0; i<this.array.length; i++){
			for(let j=0; j<this.array[i].length; j++){
				const potentialNewSrc = this.twoDArrayOfAllImages[potentialNewSrcRow][j];
				
				const outOfBounds = this.array[i][j].updateYourself(
					timeIntervalInMiliseconds, 
					potentialNewSrc, 
					heightOfContainer);
					
					
				if (outOfBounds){
					outOfBoundsHappened = true;
				}
				
				this.array[i][j].drawYourself(ctx, xImageRatio, yImageRatio);
			}
		}
		
		if (outOfBoundsHappened){
			this.lastDisplayedPicturesRow = potentialNewSrcRow;
			this.changedCards++;
			
			if (this.changedCards === this.numberOfChangedCardsBeforeDeccelerating){
				this.array.forEach(oneDarray => {oneDarray.forEach(
					displayedImage => displayedImage.setNewAcceleration(this.accelerationToStop)
				)});
			}
		}
	}
	
	displayCardsAndContainer(ctx, xImageRatio, yImageRatio){
		this.array.forEach(oneDarray => {oneDarray.forEach(
			displayedImage => displayedImage.drawYourselfWithContainer(ctx, xImageRatio, yImageRatio)
		)});
	}
	
	displayCards(ctx, xImageRatio, yImageRatio){
		this.array.forEach(oneDarray => {oneDarray.forEach(
			displayedImage => displayedImage.drawYourself(ctx, xImageRatio, yImageRatio)
		)});
	}
	
	startSpinning(){
	
		this.array.forEach(oneDarray => {oneDarray.forEach(
			displayedImage => displayedImage.setYVelocityInSeconds(this.yVelocity)
		)}); 
	}
	
	
	setNewImages(newTwoDArrayOfAllImages){
		this.twoDArrayOfAllImages = newTwoDArrayOfAllImages;
		for(let i=0; i<this.array.length; i++){
			for(let j=0; j<this.array[0].length; j++){
				this.array[i][j].changeImage(newTwoDArrayOfAllImages[i][j].src);		
			}
		}
	}
	
	setContainerSize(newContainerSize){
		this.containerSize = newContainerSize;
	}
	
	gotOutOfScreen(callbackObject){
		const newRow = (callbackObject.pictureRow + this.array.length) % this.twoDArrayOfAllImages.length;
		const column = callbackObject.pictureColumn;
		callbackObject.pictureRow = newRow;
		
		const newPicture = this.twoDArrayOfAllImages[newRow][column]
		return newPicture;
	}
	
	stopAfterNumberOfRows(rowDifference){
		this.array.forEach(oneDarray => {oneDarray.forEach(
			displayedImage => displayedImage.stopAfterNumberOfRows(rowDifference)
		)});
	}
};



export default DisplayedImageAdapter;
