
# ExtJS - REST


# Általános, CRUD műveleteket támogató felületet kiszolgáló REST service-ek

A felületen egy Grid-et kell elképzelni, opcionálisan lapozó sávval. Rekordot kijelölve szerkeszteni lehet pl. egy megjelenő Window-ban, vagy a Grid mellett elhelyezett (egyszerűbb) Form panelben. Rekordot kijelölve törölni is lehet, illetve új rekordot felvenni. Az ilyen felülethez a következő REST servicek szükségesek.

A példában legyen a resource neve `person`.


## Read

Request:

    GET /rest/person?start=150&limit=50


Response:

    {
        success: true,
        total: 359,
        result: [{
            id: 124,
            name: '...',
            ...
        }, {
            id: 235,
            name: '...',
            ...
        }]
    }


- `success` paraméternek mindig `true`-nak kell lennie, ha sikeres volt a lekérés. Ha 0 találat van, akkor is.
- `total` property tartalmazná a szerver oldalon/adatbázisban létező összes rekord számát.
- `message` Hiba esetén a hibaüzenetet tartalmazó String, melyet usernek meg lehet jeleníteni.
    (Esetleg hibakulcsot tartalmazó string, ha kliens oldalon van hozzá egy szótár.)
- `result` listában lennének a rekordok.


## Create

Request:

    POST /rest/person
    {
        id: null,
        name: '...',
        ...
    }

Response:

    {
        success: true,
        result: {
            id: 1234,
            name: '...',
            ...
        }
    }

A szervernek mindig vissza kell adnia a létrehozott rekordot.


## Update

Request:

    PUT /rest/person/123
    {
        id: 123,
        name: '...',
        ...
    }

Response:

    {
        success: true,
        result: {
            id: 1234,
            name: '...',
            ...
        }
    }


A szervernek mindig vissza kell adnia az elmentett rekordot.


## Delete

Request:

    DELETE /rest/person/123
    {
        id: 123,
        name: '...',
        ...
    }

Response:

    {
        success: true
    }

Az ExtJS alap esetben nem csak az ID-t adja át URL-ben, hanem body-ban elküldi a teljes, kliens oldalon létező rekordot. Ezt a szerver opcionálisan felhasználhatja, vagy törölheti egyből URL-ben lévő ID alapján.

Ha sikertelen volt a törlés, akor `success: false` mellett egy `message` property-ben vissza kell adni a hibaüzenetet.


## Read (single record)

Request:

    GET /rest/person/123

Response:

    {
        success: true,
        result: {
            id: 123,
            nam: '...',
            ...
        }
    }

Egy rekord lekérése. Alap esetben nincs szükség ilyen interfészre, csak kivételes esetben (pl. lásd _'Read (lista) esetén szűkebb rekord model alkalmazása'_ fejezet).

Opcionálisan a `result` változó lehet egy elemű lista is, elvileg ezt is képes betölteni az ExtJS:

    result: [{
        id: 123,
        name: '...'
    }]


## Általános dolgok

- Mindegyik CRUD műveletnél ugyan azt a Modelt kell használni, tehát nem különbözhet a mentendő rekord adatszerkezete a Read-nél visszaadott rekord adatszerkezetétől.
- A szervernek mindig `200 OK` http státusszal kell válaszolnia. Hiba esetén is. (Néhány speciális esettől eltekintve, pl. nincs bejelentkezve a user/lejárt a session.)
- Ha hiba történt (nincs megfelelő jogosultság, nem menthető az adat, stb.), akkor `success` mezőben `false`-t kell visszaadni, és ezen a szinten egy `message` mezőben a user felé megjeleníthető hibaüzenetet.


## Rekord strukturája

- Rekord adatszerkezetének, amit egy gridben és/vagy formban akarunk megjeleníteni, laposnak kell lennie.
- Amit a Form felületen egy mezőben akarunk szerkeszteni, annak a modelben is egy mezőben kell szerepelnie.
- Amit a Grid-ben egy cellában akarunk megjeleníteni, annak többnyire a rekordban is egy mezőnek kell lennie. Itt lehetnek kivételek, és cellában könnyen össze tudunk fűzni több mező tartalmát is, viszont ilyen esetben sorrendezésnél előjöhet probléma. (pl. szerver felé csak egy mező nevet küld a grid, hogy a szerint rendezze, közben a cellában több mező összefűzött eredménye látható)


## Az URL felépítése

- Az URL-nek egy előre meghatározott prefix-szel célszerű kezdődnie, pl. `/rest/`
- Ezt a resource nevének kell követnie, pl `person`. Ezt a nevet egyes számban kell írnunk és kliens oldalon is ezt fogjuk Model névnek használni, illetve a többes számú változatát Store névnek. (URL-ben kisbetűsnek kell lennie, Model és Store névben nagy betűvel fog kezdődni.)
- Ezt követi egyes CRUD műveleteknél a rekord ID-ja, vagy néhány speciális kulcsszó, pl. `_bulk`, `_list` (természetesen itt figyelni kell arra, hogy a rekord ID-ja soha nem veheti fel a fenntartott kulcsszavakat).

Milyen ne legyen:

- Ne legyen többszintű, pl. `/rest/group/2/person`. Ilyen esetben a szűrő feltételeket ne az URL-be tegyük bele, hanem paraméterként adjuk át a Read-nél leírtaknak megfelelően és használjuk a korábbi leírt formát (`rest/person`).
- Ne különbözzenek a CRUD műveletek címei, pl. Read esetén `rest/persons`, mentésnél meg `rest/storeperson`.



## Read - sort és filter

ExtJS-ben a sort és filter beállításokat egy-egy lista reprezentálja:

    sort: [{
        property: 'name',
        direction: 'ASC'
    }]

    filter: [{
        property: 'name',
        value: 'Peter'
    }, {
        property: 'zip',
        value: '1119'
    }]

Az alap ExtJS REST-es proxy az URL-ben GET-es paraméterként adja át ezeket a fenti listákat. Ez viszont problémát okozhat egyes proxy szerverek URL hossz korlátozásánál, vagy csak nem teljesen kielégítő ennyi információt GET-es paraméterbe csomagolni, ezért a `GET`-es Read-et le lehet cserélni a következő request formátumra:

    POST /rest/person/_list
    {
        start: 0,
        limit: 50,
        sort: [{
            property: 'name',
            direction: 'ASC'
        }],
        filter: [{
            property: 'city',
            value: 'Budapest'
        }]
    }

Fontos:

- A válasz formátuma megegyezik a fenti 'Read' fejezetben bemutatottal.
- A `_list` kulcsszó fenntartott, ilyen azonosítóval nem létezhet rekord.
- Nem keverhetjük a GET és POST-os Read műveletet, tehát ha POST-os változat mellett döntünk, akkor a kliens minden esetben így fogja küldeni a kérést, független attól, hogy van-e `filter` paraméter, vagy sincs.
- _A single record-ot lekérő `GET /rest/person/123` formátumú kérés nem tartozik ide, tehát az továbbra is `GET` metódussal lesz lekérve._
- A szervernek akkor is működnie kell, ha pl. hiányzik vagy `null` a `sort` vagy `filter` paraméter.
- Ez a `POST`-os Read proxy külső kiegészítő/beállítás, nem tartalmazza alapértelmezetten az ExtJS.


### Sort / filter formátuma

Szükség esetén a `sort` és `filter` listát a következő (kulcs-érték) formátumban is képes küldeni a kliens:

    {
        start: 0,
        limit: 50,
        sort: {
            name: 'ASC'
        },
        filter: {
            city: 'Budapest',
            name: 'Pisti'
        }
    }

Természetesen ilyen igény esetén erősen ajánlott, hogy projekt szinten mindenhol változzon a formátum, de csak néhány interfészen.


### Reader extraParams

Kliens oldalon megadható a reader proxyban `extraParams`, melyeket a `start` és `limit` paraméterek mellett fog küldeni a kliens a szerver felé.

Például:

    store.proxy.extraParams = {
        groupId: 3
    }

A következő formában jelenik meg a requestben:

    {
        start: 0,
        limit: 50,
        groupId: 3
    }

Ezt a lehetőséget tipikusan kliens oldalon kód szinten beállított filterezésnél szoktuk használni. Felhasználó által állítható filterezésnél pedig a `filter` listát.

A kliens oldalon használt `clearFilter()` metódus is csak a `filter` listát törli, az `extraParams`-ot nem. Így ezt fejlesztés során kell eldönteni, hogy mely filterezési paramétereket lehessen/kell használni az `extraParams`-on keresztül.

GET-es lekérés esetén az extraParams egy-egy GET-es változóba fog kerülni, pl. `GET /rest/person?start=0&limit=50&groupId=3`.

__Példa az `extraParams` használatára:__

Az ExtJS-es autocomplete-es `combobox` is `extraParams`-ként küldi a mezőbe beírt kifejezést. A paraméter neve: `query`.


## Bulk delete

Request (URL and body):

    DELETE /rest/person/_bulk
    [123, 523, 6236]

Ez nem ExtJS specifikus, így megegyezés szerint módosítható. Akkor van erre az interfészre szükség, ha a grid-ben lehetséges a multiselect és a rekordok kötegelt törlése egy Ajax hívással.

Eldöntendő dolgok ezzel kapcsolatban:

- Az átadott ID-hoz tartozó rekordot tranzakcióban lesznek törölve, vagy egyesével külön? Ettől függne a szerver válasz formátuma is, hogy elég-e egy darab `success` és `message` property, vagy minden ID-hoz külön vissza kell-e adni ezeket? Kettő mixelése nem ajánlott.

Amennyiben lehetséges a multiselect és ezen több kijelölt rekord törlése, úgy erősen ajánlott ezt egy ajax műveletben végrehajtani, nem pedig minden rekord törlése egyesével a kliens oldalról a korábbi fejezetben leírt DELETE interfészen.


## Read (lista) esetén szűkebb rekord model alkalmazása

Előfordulhat olyan eset, hogy a rekord sok/nagy méretű mezőket tartalmaz, melyek a táblázatban nem jelennek meg és a táblázatot feltöltő Read műveletnél nem akarjuk átadni a rest interfészen az összes mezőt (pl. lassítaná a szervert/szűk az internetkapcsolat/performancia/stb.), viszont rekordot megnyitva megjelenítésre/szerkesztésre láthatónak kell lennie az összes mezőnek.

Ilyenkor van olyan lehetőség, hogy a több rekordot visszaadó Read művelet csak kevesebb mezőt ad vissza a rekordokhoz - és egy `isFullRecord` mezőben jelzi `false` értékkel, hogy ez a rekord hiányos.

A rekordot megnyitó mechanizmusnál pedig ezen `isFullRecord` mező alapján a kliens újratöltené a rekordot (single read - `GET /rest/person/123`), ahol a szerver már az összes mezőt visszaadná, illetve az `isFullRecord` mezőben `true` értéket szolgáltatna, és ezt nyitná meg a kliens megjelenítésre/szerkesztésre.

Ez a megoldás nem ExtJS specifikus, így pl. az `isFullRecord` mezőnek akár jobb nevet is lehet találni.

Fontos! Kliens oldalon egy közös Model van használva, így a több mezőt tartalmazó interfésznek vissza kell adnia azokat a mezőket is, melyet a listát szolgáltató read interfész is visszaad / nem lehet a szűkebb listában máshogy elnevezni a mezőket, mint ahogy a bővebb listában van.


# További interfészek, információk

TODO:

- list of values
    - globálisan elérhetők
    - Rekordon belül átadott specifikusak
    - id vagy value mentése?
    - megjelenítés, pl. gridben, ha csak Id van jelen
- direct services
- login/logout, hibakód bejelentkezés nélkül rest hívás esetén
- speciális adatok definiálása a rekordban
    - auto complete (mi legyen tárolva? Id/value?)
    - dátum/idő (alap esetben '2000-02-13T21:25:33' formátum)
    - listák
- stb.

