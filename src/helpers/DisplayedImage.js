/* 
This class takes care of the properties of an image that is to be displayed.
It has public methods updateYourself, setYVelocity, stopAfterDistance, stopAndMoveTo, changeImage.

	Method updateYourself takes in 3 arguments, first is 
	time interval in miliseconds, 
	the second one is potentialNewSrc. This argument replaces the image when 
	the image goes out of boundaries of the container.
	The third argument is height of the container, it is used in order to calculate 
	velocity of the image. 

	Method setYVelocity takes velocity in portion of the container per seconds.
	
	Method stopAfterDistance takes in the distance 
	(measurement unit is: parts of the container, i.e. 1.5 means 150% of the container in which the image is)
	after which you want the image to stop moving.
	Method calculates the acceleration based off of this number and it returns 
	time in seconds after which the image will stop moving. 	

	Method stopAndMoveTo takes y to which you want to move the object. It moves the object to that 
	spot and it stops it there.
	
	Method changeImage takes in new image source.
*/
class DisplayedImage {

	
		constructor(object){
			this.x = object.x;
			this.y = object.y;
			this.startX = object.startX;
			this.startY = object.startY;
			
			const image = new Image();
			image.src = object.image.src;
			this.image = {
				htmlImageElement: image,
				winCard: object.image.winCard || false
			};
			this.xSize = object.xSize;
			this.ySize = object.ySize;

			this.xVelocityPerSecond = object.xVelocityPerSecond;
			this.yVelocityPerSecond = object.yVelocityPerSecond;
			
			this.yAccelerationInSecondsSquared = 0.0;
			this.slowestSpeedPerSecond = 0.0625;
			
			this.winCardColor = object.winCardColor;
			this.nonWinCardColor = object.backgroundColor;
		}
		
		drawYourself(ctx, xImageSizeRatio, yImageSizeRatio){
			if (this.image == null || this.image.htmlImageElement == null) {
				return;
			}
			const xImageSize = xImageSizeRatio * this.xSize;
			const yImageSize = yImageSizeRatio * this.ySize;
			
			const xImage = this.x + (this.xSize - xImageSize) / 2;
			let yImage = Math.round(this.y + (this.ySize - yImageSize) / 2);
			
			if (yImage < 0){
				yImage = 0;
			}
			
			ctx.drawImage(this.image.htmlImageElement, xImage, yImage, xImageSize, yImageSize);
		}
		
		updateAndDrawYourself(ctx, xImageSizeRatio, yImageSizeRatio, 
		timeIntervalInMiliseconds, potentialNewSrc, heightOfContainer){
			const outOfBounds = this.updateYourself(timeIntervalInMiliseconds, potentialNewSrc, heightOfContainer);
			this.drawYourself(ctx, xImageSizeRatio, yImageSizeRatio);
			return outOfBounds;
		}
		
		
		drawYourselfWithContainer(ctx, xImageSizeRatio, yImageSizeRatio){
			if (this.image == null || this.image.htmlImageElement == null || this.y < 0) {
				return;
			}
			
			const xImageSize = xImageSizeRatio * this.xSize;
			const yImageSize = yImageSizeRatio * this.ySize;
			
			const previousColor = ctx.fillStyle;
			
			if(this.image.winCard){
				ctx.fillStyle = this.winCardColor;
			} else {
				ctx.fillStyle = this.nonWinCardColor;
			}
			const xImage = this.x + (this.xSize - xImageSize) / 2;
			const yImage = this.y + (this.ySize - yImageSize) / 2;
			
			
			ctx.fillRect(this.x, this.y, this.xSize, this.ySize);
			ctx.drawImage(this.image.htmlImageElement, xImage, yImage, xImageSize, yImageSize);
			
			ctx.fillStyle = previousColor;
		}

		setYVelocityInSeconds(velocity){
			this.yVelocityPerSecond = velocity;
		}
	
		
		changeImage(image){
			this.image.htmlImageElement.src = image.src;
			this.image.winCard = image.winCard || false;
		}
		
		updateYourself(timeIntervalInMiliseconds, potentialNewSrc, heightOfContainer){
			this.updateVelocity(timeIntervalInMiliseconds);
			const outOfBounds = this.updatePosition(timeIntervalInMiliseconds, potentialNewSrc, heightOfContainer);
			return outOfBounds;
		}
	
	
	
		stopAtY(yAtWhichWeStop, heightOfContainer){
			let distance = yAtWhichWeStop;
			if (yAtWhichWeStop < this.y){
				distance += heightOfContainer;
			}
			
			this.stopAfterDistance(distance);
		}
		
		stopAfterNumberOfRows(numberOfRows){
			const distanceWithoutCorrection = numberOfRows * this.ySize;
			const correction = this.y % this.ySize;
			
			const distance = distanceWithoutCorrection - correction;
			return this.stopAfterDistance(distance);
		}
		
		accelerationAndTimeToStopAfterNumberOfRows(numberOfRows, numberOfRowsAbove){
			const distanceWithoutCorrection = numberOfRows * this.ySize;
			
			const endY = this.ySize * numberOfRowsAbove;
			const correction = -((this.y+this.ySize) % this.ySize);
			
			const distance = distanceWithoutCorrection + correction;
			return this.calculateAccelerationAndTimeToStop(distance);
		}
		
		
		
		calculateAccelerationAndTimeToStop(distance){
			/* 
		distance = (at^2)/2 + Vo t
		t = (Vresult - Vo)/a 
		t = Vchange / a 
		
		distance = a Vchange^2 / 2a^2  +  Vo Vchange / a
		distance = Vchange^2 / 2a  +  Vo Vchange / a
		distance = (Vchange^2 + 2Vo Vchange) / 2a
		a = (Vchange^2 + 2Vo Vchange) / 2distance
		*/
		
			const changeInVelocity = this.slowestSpeedPerSecond - this.yVelocityPerSecond;
			const acceleration = 
			(changeInVelocity * changeInVelocity + 2 * this.yVelocityPerSecond * changeInVelocity) / 
				(2*distance);
			
			const secondsToMiliseconds = 1000;
			const timeInMiliseconds = changeInVelocity * secondsToMiliseconds / acceleration;		
			return {acceleration, timeInMiliseconds};
		}
		
		stopAndMoveTo(y){
			this.y = y;
			this.yVelocityPerSecond = 0.0;
			this.yAccelerationInSecondsSquared = 0.0;
		}
		
		
		updatePosition(timeIntervalInMiliseconds, potentialNewImage, heightOfContainer){
		
			
			const yDistance = this.yVelocityPerSecond * timeIntervalInMiliseconds / 1000.0;
			if (this.y + yDistance > heightOfContainer){
				this.y = -this.ySize;
				this.changeImage(potentialNewImage);
				return true;
			} else {
				this.y += yDistance;
				return false;
			}
		}
		
		updateVelocity(timeIntervalInMiliseconds){
			const velocityChangeInSeconds = this.yAccelerationInSecondsSquared * timeIntervalInMiliseconds / 1000.0;
			
			if (this.yVelocityPerSecond + velocityChangeInSeconds <= this.slowestSpeedPerSecond){
				this.yVelocityPerSecond = 0.0;
				this.yAccelerationInSecondsSquared = 0.0;
			} else {
				this.yVelocityPerSecond += velocityChangeInSeconds;
			}
		}
		
		setNewAcceleration(newAcceleration){
			this.yAccelerationInSecondsSquared = newAcceleration;
		}
		
}

export default DisplayedImage;	
	
