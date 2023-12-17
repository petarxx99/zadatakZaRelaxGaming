

function findState0ByGaussian(maxNumberOfConsecutiveLosses, basicLossProbability){


	let state0coefficient = 1 + basicLossProbability;
	for(let i=1; i<maxNumberOfConsecutiveLosses; i++){  /* starts from i=1 because we've already done 1st iteration.*/
		state0coefficient = 1 + (basicLossProbability * state0coefficient);
	}
	
	return 1.0 / state0coefficient;
}


const MyProbability = {
/* Calculates probability that a win has occured and it calculates the probabilty that player has lost enough games 
in a row so that the next round is gifted to him. */
	calculateProbabilities(winPercentage, maxNumberOfConsecutiveLosses){

		const basicLossProbability = 1.0 - winPercentage / 100.0;
		const state0Probability = findState0ByGaussian(maxNumberOfConsecutiveLosses, basicLossProbability);
		
		const lastStateProbability = state0Probability * Math.pow(basicLossProbability, maxNumberOfConsecutiveLosses);
		return {giftedWinChance: lastStateProbability, realWinningChance: state0Probability};
	}
	
	
};

export default MyProbability;
