export const AUDIT_AT='2026-09-26T13:16:00+02:00';

const rows=`
Alpha|Marszałkowska 28|Śródmieście|N/P|09:00–19:00|C
Alpha|Targowa 70|Praga-Północ|N/P|10:00–19:00|C
Anydays|Górczewska 97|Wola|7 zł/szt.; LUX 109 zł/kg|10:00–17:00|A
Anydays|Ludwika Kondratowicza 25|Targówek|1 zł/szt.; LUX 69 zł/kg|10:00–17:00|A
Anydays|Marszałkowska 18|Śródmieście|9 zł/szt.; LUX 95 zł/kg|10:00–17:00|A
Anydays|Targowa 24|Praga-Północ|95 zł/kg; LUX 145 zł/kg|10:00–17:00|A
Anydays – Galeria Renova|Rembielińska 20|Targówek|55 zł/kg; LUX 105 zł/kg|10:00–21:00|A
Avalonia Vintage|Bracka 18|Śródmieście|indywidualne|N/P|C
Baskinka|Zamieniecka 54|Praga-Południe|N/P|N/P|C
Baza Vintage|Polna 30A|Śródmieście|indywidualne|czynny wg katalogu|C
Butik Cyrkularny|Galeria Wileńska, Targowa 72|Praga-Północ|N/P|09:00–21:00|B
Chwila Spokoju|Broniewskiego 9A|Żoliborz|N/P|N/P|C
Ciuchy – Odzież na wagę|Grójecka 38|Ochota|waga; stawka N/P|N/P|C
Ciuchy i nie tylko|Nowolipki 14|Wola|N/P|N/P|C
Ciuchy i nie tylko|Belgradzka 44|Ursynów|N/P|N/P|C
Ciuchy i nie tylko|Pasaż Ursynowski 11|Ursynów|N/P|N/P|C
Ciuchy i nie tylko|al. Waszyngtona 146|Praga-Południe|N/P|09:00–15:00|C
Ciuchy i nie tylko – Bielany|Przy Agorze 11a|Bielany|N/P|N/P|C
Creamtex|Człuchowska 23|Bemowo|N/P|N/P|C
DAMESSA zero waste & art|al. Solidarności 129/131|Wola|indywidualne|czynny wg katalogu|C
Fajneciuchy24.pl|Pasaż Ursynowski 3|Ursynów|N/P|otwarte wg katalogu|C
Family Shop|Ernesta Malinowskiego 5|Ursynów|N/P|czynny wg katalogu|C
Farciarz|Grochowska 258/260|Praga-Południe|model 12/6/3 zł; dzisiejszy etap N/P|sprzeczne dane|C
FRIPERIA SECOND HAND|Juliusza Słowackiego 45|Żoliborz|indywidualne|N/P|C
Galeria Mody|Płocka 39|Wola|N/P|N/P|C
Galeria Taniej Odzieży|Pasaż Ursynowski 9/u12|Ursynów|N/P|N/P|C
GEMMA|Wolska 58|Wola|cykl 3 tyg.; baza N/P|09:00–14:00|B
GEMMA|Grójecka 81/87|Ochota|cykl 3 tyg.; baza N/P|09:00–14:00|B
GEMMA|al. KEN 57|Ursynów|cykl 3 tyg.; baza N/P|09:00–14:00|B
GEMMA – wyprzedażowy|Targowa 15|Praga-Północ|cykl 79→24 zł; -5 zł/dzień|09:00–14:00|B
GEMMA Deluxe|Aleje Jerozolimskie 89|Ochota|cykl 3 tyg.; baza N/P|09:00–14:00|B
Goose Vintage|Juliana Smulikowskiego 4|Śródmieście|N/P|N/P|C
Humana Secondhand Poland|al. Jana Pawła II 36|Śródmieście|N/P|N/P|B
JEILA ciucholand|Targowa 20b|Praga-Północ|N/P|do ok. 16:00 wg źródła mapowego|B
Kantonia|Polinezyjska 10|Ursynów|N/P|N/P|C
Komis Damski|Młynarska 4d|Wola|indywidualne|N/P|C
KOMODA|Piękna 11A/1|Śródmieście|indywidualne|czynny wg katalogu|C
Kopalnia – sklep charytatywny|Białostocka 9|Praga-Północ|N/P|N/P|C
Kopalnia Ciuchów|Górczewska 17b|Wola|N/P|N/P|C
Lampka Komis|Solec 109|Śródmieście|indywidualne|N/P|C
Lumpeksowy Butik i Bibelotki|Porajów 1|Białołęka|indywidualne|N/P|C
Modna Tania Odzież|Wolska 54|Wola|N/P|N/P|C
ModoMania|Staszica 6|Wola|N/P|N/P|C
ModoMania|Warszawska 55 lok.196|Wesoła|N/P|N/P|C
ModoMania Wolumen|Wolumen 2|Bielany|N/P|N/P|C
Niebo – sklep charytatywny|11 Listopada 10|Praga-Północ|N/P|N/P|C
Odzież na Wagę|Powstańców Śląskich 26A|Bemowo|waga; stawka N/P|N/P|C
Premium Second Hand|Dobra 12|Śródmieście|indywidualne|N/P|C
Second Hand Gocław|Meissnera 1/3 lok. 309|Praga-Południe|N/P|N/P|C
Second Hand Gocław|Umińskiego 6|Praga-Południe|N/P|N/P|C
SecondHand|Górczewska 23|Wola|N/P|N/P|C
Sklepowisko|Bazyliańska 1|Targówek|N/P|N/P|C
Still Love|Targowa 2|Praga-Północ|N/P|N/P|C
Studio Odzieży Używanej|Abrahama 1c|Praga-Południe|N/P|N/P|C
Stylówka|Aleje Jerozolimskie 11|Śródmieście|N/P|N/P|C
Stylówka|Grzybowa 5|Rembertów|N/P|N/P|C
Stylówka|Targowa 23|Praga-Północ|N/P|N/P|C
Szafiarka Rembertów|Grawerska 5|Rembertów|N/P|N/P|C
Szmizjerka|Bohaterów Warszawy 11|Ursus|N/P|N/P|C
Szmizjerka Wiatraczna|al. Stanów Zjednoczonych 72|Praga-Południe|kg/szt.; aktualna stawka N/P|N/P|C
Tania Odzież|Puławska 134|Mokotów|N/P|N/P|C
Tania Odzież|Gotarda 16|Mokotów|N/P|N/P|C
Tania Odzież|Targowa 63|Praga-Północ|N/P|N/P|C
Tanie Ubranie|al. Reymonta 6|Bielany|N/P|N/P|C
Tanie Ubranie|al. Niepodległości 121|Mokotów|N/P|N/P|C
Tanie Ubranie|Jana Kasprowicza 50|Bielany|N/P|N/P|C
Tekstylowo|Stanisława Wojciechowskiego 41|Ursus|N/P|08:00–20:00|C
TERA Ciuchy|Marszałkowska 64|Śródmieście|N/P|N/P|C
Vintage Bazar|Targowa 54|Praga-Północ|indywidualne|N/P|C
VIVE Premium Wola Park|Górczewska 124|Wola|N/P|10:00–22:00|B
VIVE Profit|Łopuszańska 22|Włochy|N/P|08:00–20:00|B
VIVE Profit|Powstańców Śląskich 126|Bemowo|N/P|10:00–21:00|B
VIVE Profit Hala Kopińska|Sokołowskiego „Grzymały” 2|Ochota|N/P|08:00–17:00|B
Współdzielnik|Górczewska 124|Wola|N/P|N/P|C
Z 2 Ręki|Meander 2A|Ursynów|N/P|09:00–19:00|C
Z 2 Ręki|Targowa 59|Praga-Północ|N/P|09:00–19:00|C`;

export const places=rows.trim().split('\n').map((row,index)=>{
  const [name,address,district,price,hours,confidence]=row.split('|');
  return {id:`warsaw-${index+1}`,name,address,district,price,hours,confidence};
});
