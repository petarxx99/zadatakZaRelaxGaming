

class DisplayedImageAdapter{

	
	
	constructor(object){
		this.array = object.arrayOfDisplayedImages;
		this.containerHeight = object.containerHeight;
		this.twoDArrayOfAllImages = object.twoDArrayOfAllImages;
		this.firstStopRow = object.firstStopRow;
		
		this.lastDisplayedPicturesRow = this.array.length - 1;
		
	}	
	
	reset(object){
		this.array = object.arrayOfDisplayedImages;
		this.containerHeight = object.containerHeight;
		this.twoDArrayOfAllImages = object.twoDArrayOfAllImages;
		this.firstStopRow = object.firstStopRow;
		
		this.lastDisplayedPicturesRow = this.array.length - 1;
	}

	
	set2DArrayOfImages(images){
		this.twoDArrayOfAllImages = images;
		for(let i=0; i<this.array.length; i++){
			for(let j=0; j<this.array[i].length; j++){
				this.array[i][j].changeImage(images[i][j]);
			}
		}
	}
	
	
	
	
	stopObjects(heightOfContainer){
		const numberOfDisplayedRows = this.array.length;
		const numberOfPictureRows = this.twoDArrayOfAllImages.length;
		
		let currentFirstRow =  this.lastDisplayedPicturesRow - (numberOfDisplayedRows - 1);
		if (currentFirstRow < 0){
			currentFirstRow += numberOfPictureRows;
		}
		
		
		let rowDifference = this.firstStopRow - currentFirstRow;
		if (rowDifference <= 0){
			rowDifference += numberOfPictureRows;
		}
		
		const firstArrayRow = this.findFirstArrayRow();
		const arrayToBeOnTheBottom = (firstArrayRow + rowDifference-1) % this.array.length;
		const numberOfRowsAbove = this.array.length - 2;
		
		const stopInfo = this.array[arrayToBeOnTheBottom][0].accelerationAndTimeToStopAfterNumberOfRows(rowDifference, numberOfRowsAbove);
		
		const timeBeforeStoppingInMiliseconds = stopInfo.timeInMiliseconds;
		const accelerationToStop = stopInfo.acceleration;
		
		this.array.forEach(oneDarray => {oneDarray.forEach(
			displayedImage => displayedImage.setNewAcceleration(accelerationToStop)
		)});
		
		return timeBeforeStoppingInMiliseconds;
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
	
	updateObjects(timeIntervalInMiliseconds, heightOfContainer){
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
			}
		}
		
		if (outOfBoundsHappened){
			this.lastDisplayedPicturesRow = potentialNewSrcRow;
		}
	}
	
	updateObjectsAnddisplayCards(ctx, xImageRatio, yImageRatio, timeIntervalInMiliseconds, heightOfContainer){
		ctx.fillStyle = "blue";
		ctx.fillRect(0,0, heightOfContainer, heightOfContainer);
		
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
	
	startSpinning(canvasHeight){
		const periodInSeconds = 2;
		const velocityInPixelsPerSecond = canvasHeight * 1.0 / periodInSeconds;
		this.array.forEach(oneDarray => {oneDarray.forEach(
			displayedImage => displayedImage.setYVelocityInSeconds(velocityInPixelsPerSecond)
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
