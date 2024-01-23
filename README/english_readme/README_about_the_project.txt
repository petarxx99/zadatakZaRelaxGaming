This is an online slot gambling program.
If the player gets at least 3 same cards in a row (horizontally) 
the player wins. 


There are 3 echalon of cards, if a player wins with the 
lowest echalon of cards they get the lowest possible prize. 
If a player wins with the medium echalon of cards they 
get a better prize than if they had won with the lowest 
echalon of cards. 
If they win with the highest echalon of cards they 
will get the highest echalon of cards.

If a player wins a round a sound goes off and the 3 winning cards in a row 
will be shown in a different color.
If a player wins more money than what they have betted another 
win is written all over the screen.


The expected return to the player's money is 95% 
(if a player starts with a 1000 tokens and bets 1 token 
100 times in a row, they are expected to net lose 5 tokens).
The constant which decides this is called HOUSE_EDGE and it 
is in the file src/components/GameView.jsx. 
HOUSE_EDGE being 0.05 means that if a player bets 1 token 
100 times they are expected to lose 5 tokens in total.

You can change the value of the constant HOUSE_EDGE if you want 
to change the expected return.

The constant SPINNING_PERIOD_IN_SECONDS in file src/components/GameView.jsx 
sets the speed of spinning by controlling how much time it takes 
one full spin to take place, how much time it takes for a card 
to go from the top to the bottom of the screen.


If a player losses 3 rounds in a row, he is gifted a win 
with the lowest echalon of cards. 
This number of 3 lost rounds in a row before being gifted a win 
is held by the constant that is called 
NUMBER_OF_MAX_CONSECUTIVE_LOSSES and that constant is in the file 
src/components/GameView.jsx. 
If you want to change the maximum number of consecutive losses 
before a player is gifted a win and the program will still work correctly.

The percentage that a player wins a round that is not gifted to him is 
set by the constant called WIN_PERCENTAGE, 
which you will find in the file src/components/GameView.jsx.
Feel free to change the value of this constant if you want to.


If a player wins a round the probability that it was a small win has occured 
is set by the constant SMALL_WIN_PERCENTAGE, 
the probability that a medium win has occured is set 
by the constant MEDIUM_WIN_PERCENTAGE, 
the probability that a big win has occured is set 
by the constant BIG_WIN_PERCENTAGE. 
All of this constants are in the file src/components/GameView.jsx.
You can change their values, but you must make sure that 
they must sum up to 100 (as given that a player has won the round 
the probability of small win + probability of medium win + probability of big win 
must equal 100%).


The bet offers are calculated from these previous parameters. 

For instance, function calculateFairQuotients from file src/components/GameView.jsx 
calculates fair bet offers for small win, medium win and big win. 
Fair odds means that with these odds as a player keeps playing he is neither 
expected to win nor lose money in the long run. 

The explanation written down assumes that NUMBER_OF_MAX_CONSECUTIVE_LOSSES 
is equal to 3, but the logic works for any other number, not just 3. 
I used the number 3 as an example.
Mathematics behind calculating odds for win happening is the following:

let a be the probability that the player won the previous round. 
We will call this "position 0".

let b be the probability that the player lost the previous round, 
but they won the round before the previous round. 
We will call this "position 1".

let c be the probability that the player lost the previous 2 rounds, 
but that they have won the round before those 2 rounds.
We will call this "position 2".

let d be the probability that the player lost the previous 3 rounds.
We will call this "position 3".

Every time a player wins a round they go back to position 0.

Wp is the probability that the player wins a round that 
isn't gifted to him. 
Lp is the probability that a player losses a round that isn't gifted.

M is the matrix below. 

M[i][j] is the probability that the player goes to position i to position j. 
i represents the row number, from 0 to 3, j is the column number, also from 0 to 3).

For instance we know that M[0][3] = 1 
M[0][3] = 1 = 100%

because if the player is in position 3, 
that means that the player has lost the previous 3 rounds, 
which means that they will 100% win the next round (
they have probability 1 of winning the next round).

M[0][2] = Wp 
because the chance that the player goes to position 0 from position 2 
is the chance that he wins a non-gifted round 
(remember that position 0 means that the player won the previous round, 
while the position 2 means that the player lost the previous 2 rounds).

M[1][2] = 0 because it is impossible for the player to go to 
position 1 from position 2 (from position 2 player can only 
lose and go to position 3, or win and go to position 0).

M[3][0] = 0 because it is impossible for the player to go to 
position 3 from position 0 (from position 0 player can only 
lose and go to position 1, or lose and stay at position 0).

For the same reasons 
M[2][0] = 0.

M[1,0] = Lp because the player goes to position 1 from the position 0 
when they lose a round while they are in position 0.
M[2,1] = Lp because the player goes to position 2 from position 1 
when they lose a round while they are in position 1.
M[3,2] = Lp because the player goes to position 3 from position 2 
when they lose a round while they are in position 2.


Wp Wp Wp 1 |  |a|      |a| 
Lp 0  0  0 |  |b|   =  |b|
0  Lp 0  0 |  |b|      |c|
0  0  Lp 0 |  |d|      |d|

Wp Wp Wp 1 |  |a|      |a|     |0|
Lp 0  0  0 |  |b|   -  |b|  =  |0|
0  Lp 0  0 |  |b|      |c|     |0|
0  0  Lp 0 |  |d|      |d|     |0|


Wp Wp Wp 1 |  |a|      |1 0 0 0| |a|     |0|
Lp 0  0  0 |  |b|   -  |0 1 0 0| |b|  =  |0|
0  Lp 0  0 |  |b|      |0 0 1 0| |c|     |0|
0  0  Lp 0 |  |d|      |0 0 0 1| |d|     |0|


Wp-1  Wp  Wp  1 |  |a|      |0| 
Lp   -1   0   0 |  |b|   =  |0|
0    Lp  -1   0 |  |b|      |0|
0    0   Lp  -1 |  |d|      |0|


Because we know that a+b+c+d=1 we can just replace the 0th row 
of the matrix with 1s and we can put 1 as the 0th row of the result vector.

1   1  1  1 |  |a|      |1| 
Lp -1  0  0 |  |b|   =  |0|
0  Lp -1  0 |  |b|      |0|
0  0  Lp -1 |  |d|      |0|

If we add the 3th row to the 0th row, the 0th row will become: 
1  1  1+Lp  0 

Because I want to turn 1+Lp into 0 in the 0th row 
I will multiply the 2th row with (1+Lp) and then add the 
2th row to the 0th row. 
After that 0th row will look like this:
1  1+Lp(1+Lp) 0  0

Because I want to turn 1+Lp(1+Lp) into 0 in the 0th row 
I will multiply the 1th row with 1+Lp(1+Lp) and then add the 
1th row to the 0th row.
The 0th row will then look like this:  
1 + Lp(1 + Lp(1 + Lp)) 0 0 0 

The matrix M will look like this: 

1+Lp(1+Lp(1+Lp))   1  1  1 |  |a|      |1| 
Lp                -1  0  0 |  |b|   =  |0|
0                 Lp -1  0 |  |b|      |0|
0                 0  Lp -1 |  |d|      |0|

a(1 + Lp(1 + Lp(1 + Lp)) = 1
a = 1 / (1 + Lp(1 + Lp(1 + Lp))

Remember that a represents the chance that the player is in position 0, 
it represents the chance that the the player 
won the previous round. 
Since this calculation is true for general case, 
the probability that a player won a round in when 
the number of rounds player goes to positive infinity is equal to a.

Remember M[0][0] was first 1 + Lp
then it was                1 + Lp(1 + Lp)
then it was                1 + Lp(1 + Lp(1 + Lp))

The pattern is M[0][0] = 1 + Lp * previousValue.
We did 3 iterations of 1 + Lp * previousValue because 
matrix M has 3 rows below the 0th row. 
Matrix M has 3 rows below the 0th row because 
NUMBER_OF_CONSECUTIVE_MAX_LOSSES is 3. 

The algorithm for calculating M[0][0] is the following: 

let m00 = 1;
for(let i=0; i<NUMBER_OF_MAX_CONSECUTIVE_LOSSES; i++){
	m00 = 1 + Lp * m00;
}

Then we have: 

const a = 1.0 / m00;
I write 1.0 instead of 1 so that the floating point division is done, 
instead of integer division.


When we calculate a, we can calculate d as well (d is the probability that 
the player lost the last 3 rounds and that the win in the next round will be gifted to them).


Wp-1 Wp Wp 1 |  |a|      |0| 
Lp -1   0  0 |  |b|   =  |0|
0  Lp  -1  0 |  |b|      |0|
0  0   Lp -1 |  |d|      |0|

I will ignore the 0th row.
I will multiply the 2th row with Lp and I will add the result 
to the last row.
The last row will be:
0  Lp*Lp 0 -1

I will multiply the 1st row with Lp*Lp and I will add the result 
to the last row.
The last row will then be: 
Lp*Lp*Lp  0  0 -1

The matrix M will be 

Wp-1      Wp   Wp 1 |  |a|      |0| 
Lp        -1   0  0 |  |b|   =  |0|
0         Lp  -1  0 |  |b|      |0|
Lp*Lp*Lp  0    0 -1 |  |d|      |0|


which means that Lp*Lp*Lp*a - d = 0
d = Lp*Lp*Lp*a
and we know a (if NUMBER_OF_MAX_CONSECUTIVE_LOSSES is 3 then a is 1.0 / (1 + Lp(1 + Lp(1 + Lp))). 

Notice that for d we have Lp multiplied by itself 3 times 
because there are 3 rows in the matrix above the last row, 
which is true because NUMBER_OF_MAX_CONSECUTIVE_LOSSES is 3.

d = (Lp^NUMBER_OF_MAX_CONSECUTIVE_LOSSES) * a

 
If NUMBER_OF_MAX_CONSECUTIVE_LOSSES is 3 and WIN_PERCENTAGE of a non-gifted round is 33%, 
then the percentage of rounds that a player will win in the limit 
when the number of rounds goes to positive infinity is 41.3%.

If NUMBER_OF_MAX_CONSECUTIVE_LOSSES is 3 and WIN_PERCENTAGE of a non-gifted round is 50%,
then the percentage of rounds that a player will win in the limit 
when the number of rounds goes to positive infinity is 53.3%.

If NUMBER_OF_MAX_CONSECUTIVE_LOSSES is 3 and WIN_PERCENTAGE of a non-gifted round is 70%,
then the percentage of rounds that a player will win in the limit 
when the number of rounds goes to positive infinity is 70.5%.


I have decided that in the limit when the number of rounds goes to positive infinity 
the player wins equal amount of money from small, medium and big wins 
(this is my decision, it didn't have to be this way).

The mathematics behind my code is the following: 

winNotGifted = 1 - giftedWin

chanceOfSmallWin = giftedWin + winNotGifted * WIN_PERCENTAGE * SMALL_WIN_PERCENTAGE / (100.0*100.0)
chanceOfMediumWin = winNotGifted * WIN_PERCENTAGE * MEDIUM_WIN_PERCENTAGE / (100.0 * 100.0)
chanceOfBigWin = winNotGifted * WIN_PERCENTAGE * BIG_WIN_PERCENTAGE / (100.0 * 100.0)

where 100.0*100.0 is the conversion factor.

Let's say that the player plays 100 rounds, betting 1 token in each round. 
The player is expected to have:
	
a small win chanceOfSmallWin * 100 number of times, 
let's call this number SM,
	
a medium win chanceOfMediumWin * 100 number of times, 
let's call this number MW,
	
a big win chanceOfBigWin * 100 number of times, 
let's call this number BW.

If the odds are fair the player wins back 100 tokens.
Since I want the player to win the same number of tokens from 
small wins, medium wins and big wins, the player will win 
33.3 tokens from small wins, 33.3 tokens from medium wins and 33.3 tokens from big wins.

In other words 
SM * smallWinQuotient = 33.3
MW * mediumWinQuotient = 33.3
BW * bigWinQuotient = 33.3

From this we can get smallWinQuotient, mediumWinQuotient and bigWinQuotient. 

smallWinQuotient = 33.3 / SM
mediumWinQuotient = 33.3 / MW 
bigWinQuotient = 33.3 / BW





