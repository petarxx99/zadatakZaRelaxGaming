Kao što je zadato, napravio sam da ako korisnik izgubi 3 opklade zaredom 4. dobija. 
Napravio sam da je ta poklonjena pobeda mala pobeda (zadato je da imam 3 različite pobede - malu, srednju i veliku. 
Napravio sam da ako korisnik izgubi 3 partije zaredom kada naredni put odigra poklanja mu se mala pobeda).

Napravio sam da je očekivani povraćaj novca korisniku 95% (na svakih 100 uloženih očekivano je da dobije nazad 95).
Konstanta koja ovo određuje se nalazi u fajlu components/GameView.jsx, a konstanta se zove HOUSE_EDGE.


Napravio sam da je šansa da igrač dobije rundu koja nije nameštena 33% (konstanta WIN_PERCENTAGE iz components/GameView.jsx ovo određuje). 
Ako korisnik dobije rundu koja nije nameštena napravio sam da su šanse da se ostvari mala pobeda 50% (SMALL_WIN_PERCENTAGE), 
srednja pobeda 30% (MEDIUM_WIN_PERCENTAGE), velika pobeda 20% (BIG_WIN_PERCENTAGE).

Sve ove vrednosti se mogu lako promeniti u kodu. Svaka od ovih vrednosti se nalazi u odgovarajućoj konstanti, 
čak i konstanta koja određuje da se nakon 3 poraza korisniku poklanja pobeda se nalazi u konstanti MAX_NUMBER_OF_CONSECUTIVE_LOSSES (components/GameView.jsx) 
i ona se može lako izmeniti kako bi se korisniku poklanjala pobeda nakon 4, 5, ili bilo kog drugog broja uzastopnih poraza.
Kod sam napravio tako da kada se ta konstanta izmeni, onda će se i kvote izmeniti. Kvote su programabilno napravljene, 
one se računaju u kodu na osnovu gore navedenih parametara. 

Na primer, funkcija calculateRealWinChance iz fajla components/GameView.jsx na osnovu šanse da korisnik dobija nepoklonjenu rundu 
(pod ,,nepoklonjenom rundom" mislim na sve runde gde korisniku nije poklonjena pobeda nakon što je izgubio prethodnih x puta zaredom) i 
na osnovu toga koliko rundi korisnik mora zaredom da izgubi da bi mu bila poklonjena pobeda u narednoj rundi. 
Matematika iza koda koji se nalazi u toj funkciji je sledeća: 

a je verovatnoća da se je korisnik dobio prošlu partiju i nalazi se na položaju 0.
b je verovatnoća da je korisnik izgubio prošlu partiju, a dobio onu pre nje. To zovem položaj 1.
c je verovatnoća da je korisnik izgubio prošle 2 partije, a dobio onu pre nje. To zovem položaj 2.
d je verovatnoća da je korisnik izgubio prošle 3 partije. To zovem položaj 4.

Kada korisnik dobije partiju to ga vraća na položaj 0.

Pp je verovatnoća da korisnik dobije partiju koja nije nameštena.
Lp je verovatnoća da korisnik izgubi partiju koja nije nameštena.

M je matrica dole. 
M[i,j] (i je broj reda, od 0 do 3, je je broj kolone, od 0 do 3) je verovatnoća 
da korisnik ode na položaj i sa položaja j.
Na primer, M[0,3] = 1 zato što ako se korisnik nalazi u položaju 3 
to znači da je izgubio prošle 3 partije, što znači da ima 100% šansu 
da dobije narednu partiju. 
M[0,2] = Pp zato što je šansa da korisnik ode na položaj 0 sa položaja 2 
(položaj 0 znači da je korisnik dobio prošlu partiju, položaj 2 znači 
da je izgubio prethodne 2 partije).
M[1,2] = 0 zato što je nemoguće da korisnik ode na položaj 1 iz položaja 2.
M[3,0] = 0 zato što je nemoguće da korisnik ode na položaj 3 iz položaja 0.
M[1,0] = Lp zato što korisnik dolazi u položaj 1 iz položaja 0 tako što gubi partiju.
M[2,1] = Lp zato što korisnik dolazi u položaj 2 iz položaja 1 tako što gubi partiju.
Itd.


Pp Pp Pp 1 |  |a|      |a| 
Lp 0  0  0 |  |b|   =  |b|
0  Lp 0  0 |  |b|      |c|
0  0  Lp 0 |  |d|      |d|

Pp-1 Pp Pp 1 |  |a|      |0| 
Lp -1   0  0 |  |b|   =  |0|
0  Lp  -1  0 |  |b|      |0|
0  0   Lp -1 |  |d|      |0|


Pošto znamo da je a+b+c+d=1 možemo da stavimo jedinice u nulti red. 

1   1  1  1 |  |a|      |1| 
Lp -1  0  0 |  |b|   =  |0|
0  Lp -1  0 |  |b|      |0|
0  0  Lp -1 |  |d|      |0|

Ako dodam 3. red nultom redu, nulti red će biti
1  1  1+Lp  0 

drugi red je:
0  Lp  -1   0

Pošto u nultom redu želim da pretvorim 1+Lp u nulu množim 2. red sa 1+Lp i dodajem ga nultom redu. 
Nulti red će biti:
1  1+Lp(1+Lp) 0  0

prvi red je  
Lp   -1       0  0

Ako pomnožim prvi red sa 1+Lp(1+Lp) i dodam ga nultom redu 
nulti red će biti 
1 + Lp(1 + Lp(1 + Lp)) 0 0 0 

šansaPoložaja0 * (1 + Lp(1 + Lp(1+Lp))) = 1
šansaPoložaja0 = 1.0 / (1 + Lp(1 + Lp(1 + Lp)))

Prvo smo imali     1 + Lp
onda               1 + Lp(1 + Lp)
onda               1 + Lp(1 + Lp(1 + Lp))
Obrazac je  1 + Lp*prošlaVrednost što sam uradio 3 puta zato što imamo 3 reda matrice.
Imamo 3 reda matrice zato što je 3 maksimalan broj poraza pre nego što se pokloni pobeda. 


Kada izračunam šansu položaja 0 (a) izračunaću šansu da je korisnik izgubio 3 puta zaredom.


Pp-1 Pp Pp 1 |  |a|      |0| 
Lp -1   0  0 |  |b|   =  |0|
0  Lp  -1  0 |  |b|      |0|
0  0   Lp -1 |  |d|      |0|


Želim da pronađem d, jer d predstavlja šansu da je igrač izgubio 3 puta i da će biti poklonjena pobeda u narednoj rundi.

Ignorišem nulti red.
Množim 2. red sa Lp i dodajem ga poslednjem redu.
Poslednji red će biti:
0  Lp*Lp 0 -1

Prvi red je: 
Lp  -1   0  0
Množim ga sa Lp*Lp i dodajem ga poslednjem redu.
Poslednji red će tada biti:
Lp*Lp*Lp  0  0 -1

Što znači Lp*Lp*Lp*a - d = 0
d = Lp*Lp*Lp*a
a je 1.0 / (1 + Lp(1 + Lp(1 + Lp))) 



 
Za zadate parametre (nakon 3 uzastopna poraza se poklanja pobeda, a u rundama gde se ne poklanja pobeda šansa za dobitak je 33%), 
šansa da korisnik pobedi u nasumičnoj rundi u limesu kada broj odigranih partija teži beskonačno je oko 41.3%.


Funkcija calculateFairQuotients() računa koristi rezultat gore pomenute funkcije. 
Ona u svom kodu uzima u obzir šansu da korisnik dobije nasumičnu partiju (što računa gorepomenuta funkcija) i 
na osnovu tog podatka računa kvote za malu, srednju i veliku pobedu. Napravio sam da u limesu kada broj rundi koje korisnik igra 
teži beskonačno, on osvaja podjednako novca malim, srednjim i velikim pobedama.
Matematika iza koda koji se nalazi u ovoj funkciji je sledeća: 
 
	Ako je šansa da korisnik pobedi u nasumičnoj rundi u limesu kada broj odigranih partija teži beskonačnosti 44.6%, 
	što znači da na 1000 odigranih rundi očekivano je da korisnik dobije 446 puta, tada je 
	(1-0.413)(1-0.413)(1-0.413) * 1000 = 202 očekivan broj poklonjenih pobeda, što znači da je 
	413 - 202 = 211 broj očekivanih nepoklonjenih pobeda. 
	Sve poklonjene pobede su male, a što se tiče nepoklonjenih pobeda, 
	211 * SMALL_WIN_PERCENTAGE / 100.0 je broj očekivanih nepoklonjenih malih pobeda,
	211 * MEDIUM_WIN_PERCENTAGE / 100.0 je broj očekivanih srednjih pobeda,
	211 * BIG_WIN_PERCENTAGE / 100.0 je broj očekivanih srednjih pobeda.
	
	Računamo da korisnik ulaže 1 u svakoj od svojih 1000 rundi.
	Kad računamo fer kvote, imamo jednačinu 
	brojMalihPobeda * kvotaMalePobede + brojSrednjihPobeda * kvotaSrednjePobede + brojVelikihPobeda * kvotaVelikePobede = 1000.
	Pošto hoću da male pobede, srednje pobede i velike pobede daju podjednako novca, računam 
	brojMalihPobeda * kvotaMalePobede = brojSrednjihPobeda * kvotaSrednjePobede = brojVelikihPobeda * kvotaVelikePobede
	tj.  1000 / 3.0 = brojMalihPobeda * kvotaMalePobede = brojSrednjihPobeda * kvotaSrednjePobede = brojVelikihPobeda * kvotaVeliPobede
	 Odavde je lako izačunati kvotaMalePobede, kvotaSrednjePobede, kvotaVelikePobede, tj. 
	 kvotaMalePobede = 1000 / (3.0 * brojMalihPobeda), 
	 kvotaSrednjePobede = 1000 / (3.0 * brojSrednjihPobeda),
	 kvotaVelikePobede = 1000 / (3.0 * brojVelikihPobeda).


NAPOMENA: Kod sam počeo da pišem na engleskom jeziku, jer sam tako navikao da radim. 
Zato sam ceo kod i komentare pisao na engleskom jeziku, kako bih imao ceo kod i komentare na istom jeziku (smatram da je tako bolje nego malo koda na engleskom, malo na srpskom, ili da komentari budu na srpskom, a kod na engleskom). 
Ovo mogu lako izmeniti ako to bude od mene traženo.





