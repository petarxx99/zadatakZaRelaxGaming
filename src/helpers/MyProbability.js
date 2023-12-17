
/* 
Wp Wp Wp 1 |  |a|      |a| 
Lp 0  0  0 |  |b|   =  |b|
0  Lp 0  0 |  |b|      |c|
0  0  Lp 0 |  |d|      |d|

Wp-1 Wp Wp 1 |  |a|      |0| 
Lp -1   0  0 |  |b|   =  |0|
0  Lp  -1  0 |  |b|      |0|
0  0   Lp -1 |  |d|      |0|


Since we know a+b+c+d=1 we can put 1 in first row 

1   1  1  1 |  |a|      |1| 
Lp -1  0  0 |  |b|   =  |0|
0  Lp -1  0 |  |b|      |0|
0  0  Lp -1 |  |d|      |0|


Add the last row to the first 
1  1  1+Lp  0 

The 2nd last row is 
0  Lp  -1   0
Since we want to cancel 1+Lp we need to multiply the 2nd last row with 1+Lp and add it to the 1st row.
The first row will be 

1  1+Lp(1+Lp) 0  0
The 3rd last row is 
Lp   -1       0  0

We need to multiply id with 1+Lp(1+Lp) and add it to the 1st row.
The first row will be 
1 + Lp(1 + Lp(1 + Lp)) 0 0 0 

stage0Probability * (1 + Lp(1 + Lp(1+Lp))) = 1
stage0Probability = 1.0 / (1 + Lp(1 + Lp(1 + Lp)))

Notice the pattern. We first had 1 + Lp
Then we had               1 + Lp(1 + Lp)
Then we had        1 + Lp(1 + Lp(1 + Lp))
In general, we just do 1 + Lp*previousValue and we did this 3 times because we added 3 rows.
We have 3 rows, because the max number of consecutive losses before a win is gifted is 3.


When we have stage0Probability we will calculate lastStageProbability.
Let's go back to the matrix:

Wp-1 Wp Wp 1 |  |a|      |0| 
Lp -1   0  0 |  |b|   =  |0|
0  Lp  -1  0 |  |b|      |0|
0  0   Lp -1 |  |d|      |0|

Ignore the first row.
We are trying to find d, the probability that we are in the last stage.

Multiply 2nd last row by Lp and add it to the last row.
The last row will be:
0  Lp*Lp 0 -1

The 3rd last row is: 
Lp  -1   0  0
Multiply it by Lp*Lp and add it to the last row.
The last row will be 
Lp*Lp*Lp  0  0 -1

Remember that this means Lp*Lp*Lp*a - d = 0
d = Lp*Lp*Lp*a
d is lastStageProbability, a is stage0Probability.
Therefore, a is 1.0 / (1 + Lp(1 + Lp(1 + Lp))) 
  

*/


/*
function createMatrix(winPercentage, maxNumberOfConsecutiveLosses){
		const basicWinProbability = winPercentage / 100.0;
		const basicLossProbability = 1.0 - basicWinProbability;
		
		const matrixSize = maxNumberOfConsecutiveLosses + 1;
		const biggestIndex = matrixSize - 1;
		
		let matrix = [];
		matrix[0] = [];
		for(let i=0; i<matrixSize-1; i++){
			matrix[0][i] = basicWinProbability;
		} 
		matrix[biggestIndex] = 1.0;
		
		for(let i=1; i<matrixSize; i++){
			for(let j=0; j<matrixSize; j++){
				if (j+1 === i){
					matrix[i][j] = basicLossProbability;
				} else {
					matrix[i][j] = 0.0;
				}
			}
		}
		
		return matrix;
}

function matrixMinusLambda(matrix, lambda){
	for(let i=0; i<matrix.length; i++){
		matrix[i][i] -= lambda;
	}
}
*/


function findState0ByGaussian(maxNumberOfConsecutiveLosses, basicLossProbability){


	let state0coefficient = 1 + basicLossProbability;
	for(let i=1; i<maxNumberOfConsecutiveLosses; i++){  /* starts from i=1 because we've already done 1st iteration.*/
		state0coefficient = 1 + (basicLossProbability * state0coefficient);
	}
	
	return 1.0 / state0coefficient;
}


const MyProbability = {
	calculateLastStateProbability(winPercentage, maxNumberOfConsecutiveLosses){

		const basicLossProbability = 1.0 - winPercentage / 100.0;
		const state0Probability = findState0ByGaussian(maxNumberOfConsecutiveLosses, basicLossProbability);
		
		const lastStateProbability = state0Probability * Math.pow(basicLossProbability, maxNumberOfConsecutiveLosses);
		return lastStateProbability;
	}
	
	
};

export default MyProbability;
