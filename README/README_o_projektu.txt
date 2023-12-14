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
	Neka je p verovatnoća da igrač dobija nasumično izabranu rundu u limesu kada broj odigranih rundi teži beskonačnosti. 
	Neka je osnovnaŠansa verovatnoća da igrač dobija rundu koja mu nije poklonjena. 
	Neka je x broj rundi koji igrač mora da izgubi zaredom da bi mu naredna runda bila poklonjena. 
	Igrač onda ima 2 načina da pobedi, ili mu je pobeda u toj rundi poklonjena (šansa za to je Math.pow(1 - p, x)), 
	ili mu pobeda u toj rundi nije poklonjena (šansa za to je 1 - Math.pow(1-p, x)), ali je igrač imao sreće te je dobio tu rundu. 
	Šansa da se to desi je (1 - Math.pow(1 - p, x)) * osnovnaŠansa. 
	Dakle, šansa da igrač dobije rundu (p) je Math.pow(1 - p, x)) + (1 - Math.pow(1 - p, x)) * osnovnaŠansa.
	Math.pow(1 - p, x)) + (1 - Math.pow(1 - p, x)) * osnovnaŠansa = p
	Math.pow(1 - p, x) + osnovnaŠansa - Math.pow(1 - p, x) * osnovnaŠansa = p 
	Math.pow(1 - p, x) * (1 - osnovnaŠansa) + osnovnaŠansa - p = 0.
	Leva strana jednačine je funkcija koja zavisi samo od p, sve ostale promenljive su zadate. 
	Pronalazim za koju vrednost p je funkcija najbliže 0 i to je rešenje jednačine (jednačina nije rešena analitički, 
	jer nisam siguran da je moguće analitički rešiti ovu jednačinu za opšti slučaj. Moguće je rešiti je za x = 3, ali sam ja svejedno 
	ostavio ovo rešenje, jer je opštije, x ne mora biti 3 i kod će i dalje raditi). 
Za zadate parametre (nakon 3 uzastopna poraza se poklanja pobeda, a u rundama gde se ne poklanja pobeda šansa za dobitak je 33%), 
šansa da korisnik pobedi u nasumičnoj rundi u limesu kada broj odigranih partija teži beskonačno je oko 44.6%.


Funkcija calculateFairQuotients() računa koristi rezultat gore pomenute funkcije. 
Ona u svom kodu uzima u obzir šansu da korisnik dobije nasumičnu partiju (što računa gorepomenuta funkcija) i 
na osnovu tog podatka računa kvote za malu, srednju i veliku pobedu. Napravio sam da u limesu kada broj rundi koje korisnik igra 
teži beskonačno, on osvaja podjednako novca malim, srednjim i velikim pobedama.
Matematika iza koda koji se nalazi u ovoj funkciji je sledeća: 
 
	Ako je šansa da korisnik pobedi u nasumičnoj rundi u limesu kada broj odigranih partija teži beskonačnosti 44.6%, 
	što znači da na 1000 odigranih rundi očekivano je da korisnik dobije 446 puta, tada je 
	(1-0.446)(1-0.446)(1-0.446) * 1000 = 170 očekivan broj poklonjenih pobeda, što znači da je 
	446 - 170 = 276 broj očekivanih nepoklonjenih pobeda. 
	Sve poklonjene pobede su male, a što se tiče nepoklonjenih pobeda, 
	276 * SMALL_WIN_PERCENTAGE / 100.0 je broj očekivanih nepoklonjenih malih pobeda,
	276 * MEDIUM_WIN_PERCENTAGE / 100.0 je broj očekivanih srednjih pobeda,
	276 * BIG_WIN_PERCENTAGE / 100.0 je broj očekivanih srednjih pobeda.
	
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





