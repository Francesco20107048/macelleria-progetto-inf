const db = require('./schema');
const bcrypt = require('bcryptjs');

function runSeed() {

// Salva le recensioni esistenti prima di pulire il DB
const shopReviewsBackup = db.prepare('SELECT author, rating, comment, created_at FROM shop_reviews').all();
const productReviewsBackup = db.prepare(`
  SELECT r.author, r.rating, r.comment, r.created_at, p.name as product_name
  FROM reviews r
  JOIN products p ON p.id = r.product_id
`).all();

// Pulisce il database prima di popolare
db.exec(`
  DELETE FROM sessions;
  DELETE FROM users;
  DELETE FROM contact_messages;
  DELETE FROM order_items;
  DELETE FROM orders;
  DELETE FROM shop_reviews;
  DELETE FROM reviews;
  DELETE FROM products;
  DELETE FROM categories;
`);

// --- CATEGORIE ---
const insertCategory = db.prepare(
  'INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)'
);

const categorieData = [
  ['Bovino', 'bovino', 'Tagli pregiati di manzo e vitello selezionati da allevamenti italiani certificati.', 'https://images.unsplash.com/photo-1695088224287-bb10a886fce4?w=800&auto=format&fit=crop&q=80'],
  ['Suino', 'suino', 'Carne di maiale freschissima, dalle costine alla lonza, per ogni esigenza culinaria.', 'https://images.unsplash.com/photo-1547050605-2f268cd5daf0?w=800&auto=format&fit=crop&q=80'],
  ['Ovino', 'ovino', 'Agnello e pecora da allevamenti allo stato semibrado dei pascoli appenninici.', 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=800&auto=format&fit=crop&q=80'],
  ['Pollame', 'pollame', 'Pollo, tacchino e altri volatili da allevamento a terra, senza antibiotici.', 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=800&auto=format&fit=crop&q=80'],
  ['Salumi', 'salumi', 'Salumi artigianali e affettati di alta qualità dalla tradizione italiana.', 'https://images.unsplash.com/photo-1542901031-ec5eeb518e83?w=800&auto=format&fit=crop&q=80'],
  ['Speciali', 'speciali', 'Carni di selvaggina e razze rare per palati raffinati e cene speciali.', 'https://images.unsplash.com/photo-1690983320937-ca293f1d1d97?w=800&auto=format&fit=crop&q=80'],
];

const categorieIds = {};
for (const [name, slug, description, image_url] of categorieData) {
  const result = insertCategory.run(name, slug, description, image_url);
  categorieIds[slug] = result.lastInsertRowid;
}

console.log('Categorie inserite:', Object.keys(categorieIds).length);

// --- PRODOTTI ---
const insertProduct = db.prepare(`
  INSERT INTO products
    (category_id, name, description, price_per_kg, origin, cut_type, cooking_tip, stock_kg, featured, image_url)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const prodottiData = [
  // BOVINO
  {
    slug: 'bovino',
    name: 'Bistecca di manzo',
    description: 'Taglio classico dalla lombata del bovino adulto, con la tipica forma e la caratteristica marezzatura che la rende tenera e saporita. La carne proviene da bovini allevati con metodo estensivo in pascoli italiani certificati. Ogni fetta è tagliata a mano con cura per garantire uno spessore uniforme ideale per la cottura.',
    price_per_kg: 24.90,
    origin: 'Italia - Campania',
    cut_type: 'Lombata',
    cooking_tip: 'Grigliate a fuoco vivo per 3-4 minuti per lato. Temperatura interna consigliata 55°C per cottura al sangue. Lasciate riposare 3 minuti prima di servire.',
    stock_kg: 80,
    featured: 1,
    image_url: 'https://images.unsplash.com/photo-1606677661991-446cea8ee182?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'bovino',
    name: 'Filetto di manzo',
    description: 'Il taglio più pregiato del bovino, proveniente dal muscolo psoas che non lavora, rendendolo eccezionalmente tenero. La consistenza vellutata e il sapore delicato lo rendono il re dei tagli. Ogni pezzo è accuratamente rifilato e confezionato per preservarne la freschezza e le qualità organolettiche.',
    price_per_kg: 45.90,
    origin: 'Italia - Piemonte',
    cut_type: 'Filetto',
    cooking_tip: 'Cuocete in padella con burro chiarificato e rosmarino, oppure preparatelo in crosta. Non superate i 58°C interni per mantenerne la tenerezza assoluta.',
    stock_kg: 40,
    featured: 1,
    image_url: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'bovino',
    name: 'Costata di manzo',
    description: 'Taglio ricco di sapore grazie all\'osso e alla marezzatura del grasso intramuscolare. La costata proviene dalla parte anteriore della lombata ed è uno dei tagli preferiti dagli intenditori. Il grasso che la avvolge, sciogliendosi in cottura, conferisce alla carne un sapore ineguagliabile.',
    price_per_kg: 28.90,
    origin: 'Italia - Toscana',
    cut_type: 'Costata',
    cooking_tip: 'Grigliate su brace ardente, almeno 4 minuti per lato. Portate la carne a temperatura ambiente 30 minuti prima della cottura. Lasciate riposare 5 minuti prima di servire.',
    stock_kg: 60,
    featured: 0,
    image_url: 'https://images.unsplash.com/photo-1597417175478-c161c1788242?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'bovino',
    name: 'Macinato di manzo',
    description: 'Macinato fresco preparato al momento con tagli selezionati di manzo adulto. La percentuale di grasso equilibrata garantisce polpette e ragù saporiti senza eccessive perdite di liquido in cottura. Macinato fresco due volte al giorno per garantire massima qualità e sicurezza alimentare.',
    price_per_kg: 12.90,
    origin: 'Italia - Campania',
    cut_type: 'Macinato',
    cooking_tip: 'Per un ragù perfetto, rosolate a fuoco alto prima di aggiungere il pomodoro. Cuocete le polpette in forno a 180°C per 20 minuti dopo averle dorate in padella.',
    stock_kg: 100,
    featured: 0,
    image_url: 'https://images.unsplash.com/photo-1596895404493-2b74961c0cc4?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'bovino',
    name: 'Ossobuco di vitello',
    description: 'Il classico taglio milanese, trasversale dello stinco di vitello, con il pregiato midollo al centro. La gelatina presente nelle ossa si scioglie durante la cottura lenta creando un fondo ricchissimo e avvolgente. Tagliato a fette spesse 4 cm per garantire la tenuta in cottura.',
    price_per_kg: 18.90,
    origin: 'Italia - Lombardia',
    cut_type: 'Stinco',
    cooking_tip: 'Brasate lentamente con vino bianco secco, brodo, carote e sedano per almeno 90 minuti a fuoco dolce. Completate con la gremolata tradizionale di limone, aglio e prezzemolo.',
    stock_kg: 50,
    featured: 0,
    image_url: 'https://images.unsplash.com/photo-1603048374877-b98f840ad441?w=800&auto=format&fit=crop&q=80',
  },
  // SUINO
  {
    slug: 'suino',
    name: 'Costine di maiale',
    description: 'Le costine provengono dalla parte bassa della gabbia toracica del maiale, ricche di carne intercostale saporita. Il grasso che le circonda si scioglie in cottura rendendo la carne umida, gustosa e irresistibilmente tenera. Ideali per le grigliate estive e le marinature americane.',
    price_per_kg: 10.90,
    origin: 'Italia - Emilia-Romagna',
    cut_type: 'Costine',
    cooking_tip: 'Marinate per almeno 4 ore con paprika affumicata, aglio, miele e salsa di soia. Cuocete in forno a 160°C per 2 ore coperte con carta stagnola, poi finite alla griglia.',
    stock_kg: 90,
    featured: 0,
    image_url: 'https://images.unsplash.com/photo-1606157715813-aceb0ffb810e?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'suino',
    name: 'Braciole di maiale',
    description: 'Fette spesse di lonza o coppa di maiale, dalla consistenza soda e dal sapore deciso. Tagliate al momento su richiesta, mantengono tutta la freschezza e il gusto del maiale allevato in Italia. Particolarmente adatte alla tradizionale preparazione napoletana nel ragù domenicale.',
    price_per_kg: 11.90,
    origin: 'Italia - Calabria',
    cut_type: 'Lonza',
    cooking_tip: 'Marinate con limone, aglio e origano per un\'ora, poi cuocete alla griglia o in padella con un filo d\'olio extravergine. Per la versione napoletana, farcite e cuocete nel sugo di pomodoro per 2 ore.',
    stock_kg: 70,
    featured: 0,
    image_url: 'https://images.unsplash.com/photo-1579636858754-c1048da9c361?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'suino',
    name: 'Pancetta tesa',
    description: 'Pancetta stagionata per almeno 60 giorni, ottenuta dal ventre del maiale con cura artigianale. Il sapore equilibrato tra parte magra e grasso le conferisce una versatilità unica in cucina, perfetta sia cruda che cotta. La speziatura tradizionale con pepe nero e noce moscata ne esalta il profumo.',
    price_per_kg: 15.90,
    origin: 'Italia - Umbria',
    cut_type: 'Pancetta',
    cooking_tip: 'Affettate sottile e servite cruda con formaggi stagionati e miele. Rosolata in padella arricchisce sughi di pasta, zuppe e risotti con il suo grasso profumato.',
    stock_kg: 45,
    featured: 0,
    image_url: 'https://images.unsplash.com/photo-1606851685679-2a35cfdd62d6?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'suino',
    name: 'Lonza di maiale',
    description: 'Taglio magro e pregiato ricavato dalla parte dorsale del maiale, con una leggera copertura di grasso che mantiene la carne morbida durante la cottura. Versatile e adatta a numerose preparazioni sia rapide che elaborate. La consistenza compatta la rende ideale per arrosti e farciture.',
    price_per_kg: 13.90,
    origin: 'Italia - Marche',
    cut_type: 'Lonza',
    cooking_tip: 'Arrostitela intera a 180°C per 45 minuti, oppure tagliatela a fette e cuocetela in padella con vino bianco, salvia e rosmarino. Ottima anche in agrodolce con cipolle.',
    stock_kg: 65,
    featured: 0,
    image_url: 'https://images.unsplash.com/photo-1588347785102-2944ba63d0c3?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'suino',
    name: 'Salsiccia fresca',
    description: 'Salsiccia preparata artigianalmente ogni mattina con carne di maiale selezionata, insaporita con finocchietto selvatico, peperoncino e spezie naturali secondo l\'antica ricetta napoletana. Prodotto completamente privo di conservanti, coloranti artificiali e additivi chimici.',
    price_per_kg: 9.90,
    origin: 'Italia - Campania',
    cut_type: 'Insaccato fresco',
    cooking_tip: 'Cuocete sulla griglia o in padella bucherellando leggermente la pelle per evitare che scoppi. Eccellente spezzata nel ragù napoletano o abbinata ai friarielli saltati in padella.',
    stock_kg: 85,
    featured: 1,
    image_url: 'https://images.unsplash.com/photo-1585325701165-351af916e581?w=800&auto=format&fit=crop&q=80',
  },
  // OVINO
  {
    slug: 'ovino',
    name: 'Cosciotto di agnello',
    description: 'Il taglio più rappresentativo dell\'agnello, dalla carne tenera e dal sapore caratteristico ma non invadente. Proveniente da agnelli allevati allo stato semibrado sui pascoli appenninici abruzzesi, garantisce un sapore autentico e una qualità superiore. Peso medio tra 1,8 e 2,2 kg.',
    price_per_kg: 19.90,
    origin: 'Italia - Abruzzo',
    cut_type: 'Coscia',
    cooking_tip: 'Steccate con spicchi di aglio e rametti di rosmarino, ungete con olio extravergine e cuocete a 180°C per 25 minuti ogni 500g. Sfumate con vino bianco secco a metà cottura.',
    stock_kg: 55,
    featured: 0,
    image_url: 'https://images.unsplash.com/photo-1700478934593-7739ef5eba6d?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'ovino',
    name: 'Costolette di agnello',
    description: 'Piccole e saporite, le costolette di agnello sono un classico della cucina italiana del Sud. La carne vicino all\'osso è particolarmente tenera e ricca di sapore grazie all\'allevamento estensivo in pascoli sardi. Ogni costoletta è rifilata a mano per un risultato estetico impeccabile.',
    price_per_kg: 22.90,
    origin: 'Italia - Sardegna',
    cut_type: 'Costolette',
    cooking_tip: 'Grigliate a fuoco vivo per 3 minuti per lato dopo averle marinate con olio, aglio, rosmarino e timo fresco. Servite con patate al forno e un filo di limone.',
    stock_kg: 40,
    featured: 0,
    image_url: 'https://images.unsplash.com/photo-1602470521006-59ab77068b0d?w=800&auto=format&fit=crop&q=80',
  },
  // POLLAME
  {
    slug: 'pollame',
    name: 'Petto di pollo',
    description: 'Petto di pollo da allevamento a terra certificato, senza antibiotici e con alimentazione naturale a base di cereali selezionati. La carne bianca e magra è versatile e adatta a numerose preparazioni sia rapide per i giorni feriali che elaborate per i pranzi domenicali.',
    price_per_kg: 8.90,
    origin: 'Italia - Veneto',
    cut_type: 'Petto',
    cooking_tip: 'Battete le fette a 1 cm di spessore e cuocete in padella con limone e capperi. Tagliate a cubetti per spiedini misti, oppure preparatelo in scaloppine con marsala.',
    stock_kg: 120,
    featured: 0,
    image_url: 'https://images.unsplash.com/photo-1633096013004-e2cb4023b560?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'pollame',
    name: 'Cosce di pollo',
    description: 'Le cosce sono il taglio più saporito del pollo grazie alla presenza dell\'osso e della carne scura, naturalmente più grassa e succulenta. Adatte a lunghe cotture in umido che ne esaltano il gusto ricco e avvolgente, oppure alla cottura al forno con erbe aromatiche.',
    price_per_kg: 6.90,
    origin: 'Italia - Lombardia',
    cut_type: 'Coscia',
    cooking_tip: 'Cuocete in umido con pomodori pelati, olive nere e capperi per 45 minuti. In forno a 200°C per 40 minuti con verdure di stagione, vino bianco e erbe aromatiche.',
    stock_kg: 100,
    featured: 0,
    image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'pollame',
    name: 'Pollo intero',
    description: 'Pollo intero da allevamento a terra certificato, eviscerato e pronto per la cottura. Il peso varia tra 1,4 e 1,8 kg. La carne soda e saporita è il risultato di un\'alimentazione naturale e di uno spazio di movimento adeguato. Ideale per arrosti domenicali e grandi occasioni.',
    price_per_kg: 5.90,
    origin: 'Italia - Toscana',
    cut_type: 'Intero',
    cooking_tip: 'Massaggiate con burro aromatizzato con limone, aglio e rosmarino. Arrostitelo a 190°C per circa 20 minuti ogni 500g. Lasciate riposare 10 minuti prima di tagliare.',
    stock_kg: 60,
    featured: 0,
    image_url: 'https://images.unsplash.com/photo-1672787153720-e85fe802fd9f?w=800&auto=format&fit=crop&q=80',
  },
  // SALUMI
  {
    slug: 'salumi',
    name: 'Salame napoletano',
    description: 'Il tradizionale salame napoletano stagionato per almeno 90 giorni, preparato secondo l\'antica ricetta partenopea con carne di maiale selezionata e pepe nero in grani intero. Il sapore deciso con una punta di piccante lo rende inconfondibile tra tutti i salumi italiani.',
    price_per_kg: 26.90,
    origin: 'Italia - Campania',
    cut_type: 'Insaccato stagionato',
    cooking_tip: 'Affettate a fette di circa 3mm e servite a temperatura ambiente. Eccellente su pizza, in panini rustici o come antipasto con pane cafone, provolone del monaco e olive di Gaeta.',
    stock_kg: 30,
    featured: 0,
    image_url: 'https://images.unsplash.com/photo-1460122109654-7e46ab4fc9b9?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'salumi',
    name: 'Prosciutto crudo',
    description: 'Prosciutto crudo stagionato per 18 mesi, dal profumo delicato e dal sapore dolce e avvolgente. Lavorato artigianalmente con cosce di maiale italiane certificate, stagionato in condizioni ottimali di temperatura e umidità delle colline friulane. Servito al banco sul momento per massima freschezza.',
    price_per_kg: 34.90,
    origin: 'Italia - Friuli Venezia Giulia',
    cut_type: 'Coscia stagionata',
    cooking_tip: 'Affettate a mano con coltello affilato per ottenere fette sottilissime e trasparenti. Servite a temperatura ambiente con melone estivo, fichi freschi o grissini artigianali.',
    stock_kg: 25,
    featured: 1,
    image_url: 'https://images.unsplash.com/photo-1640703935633-ca20bef6c38f?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'salumi',
    name: 'Mortadella',
    description: 'Mortadella artigianale prodotta secondo la tradizione bolognese millenaria, con lardelli di grasso bianco di collo e pistacchi di Bronte interi. Il profumo di spezie antiche e il sapore delicato e avvolgente la rendono un prodotto inconfondibile della nostra gastronomia.',
    price_per_kg: 12.90,
    origin: 'Italia - Emilia-Romagna',
    cut_type: 'Insaccato cotto',
    cooking_tip: 'Servite a fette spesse o in cubetti come antipasto, oppure tagliatela sottilissima per panini e tramezzini. Ottima anche riscaldata e abbinata a crescentine fritte o tigelle.',
    stock_kg: 35,
    featured: 0,
    image_url: 'https://images.unsplash.com/photo-1607756794535-ba48a526b73a?w=800&auto=format&fit=crop&q=80',
  },
  // SPECIALI
  {
    slug: 'speciali',
    name: 'Carne di Cherif',
    description: 'Taglio rarissimo e introvabile, proveniente direttamente dall\'aula scolastica. La carne di Cherif è considerata la più pregiata della categoria Speciali: tenera, saporita, con un retrogusto di ragù domenicale. Disponibile in quantità limitatissime. Chi la assaggia non torna più indietro.',
    price_per_kg: 999.99,
    origin: 'Italia - Ischia (aula terza fila)',
    cut_type: 'Taglio unico',
    cooking_tip: 'Meglio non cuocerla affatto. Servitela a temperatura ambiente con una spruzzata di limone e tanto rispetto. Abbinamento consigliato: lacrime del macellaio.',
    stock_kg: 1,
    featured: 1,
    image_url: '/cherif.jpg',
  },
  {
    slug: 'speciali',
    name: 'Cinghiale',
    description: 'Carne di cinghiale proveniente dalla caccia controllata e regolamentata nelle foreste appenniniche toscane. Dal sapore deciso e selvatico, è ricca di proteine e povera di grassi saturi. Ogni pezzo è tracciato, controllato sanitariamente e garantito per qualità e sicurezza alimentare.',
    price_per_kg: 22.90,
    origin: 'Italia - Toscana',
    cut_type: 'Spalla e coscia',
    cooking_tip: 'Frollate la carne per 24 ore in frigorifero. Marinate con vino rosso corposo, alloro, ginepro e pepe per almeno 12 ore prima di cuocere in umido per 2-3 ore a fuoco lento.',
    stock_kg: 20,
    featured: 1,
    image_url: 'https://images.unsplash.com/photo-1690983323238-0b91789e1b5a?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'speciali',
    name: 'Cervo',
    description: 'Carne di cervo da allevamento controllato in Alto Adige, dal colore rosso intenso e dalla texture fine e compatta. Il profumo è delicato con sentori erbacei tipici dei pascoli montani d\'alta quota. Meno intensa del cinghiale, è ideale per chi si avvicina per la prima volta alla selvaggina.',
    price_per_kg: 28.90,
    origin: 'Italia - Alto Adige',
    cut_type: 'Filetto e coscia',
    cooking_tip: 'Cuocete il filetto a 54°C al cuore per un risultato tenero e rosato. Per spezzatini e stufati, cuocete a fuoco lentissimo per almeno 2 ore con verdure radice e vino rosso corposo.',
    stock_kg: 15,
    featured: 0,
    image_url: 'https://images.unsplash.com/photo-1613454320437-0c228c8b1723?w=800&auto=format&fit=crop&q=80',
  },
  {
    slug: 'speciali',
    name: 'Bojason',
    description: 'Taglio leggendario ottenuto dall\'esemplare più grasso mai avvistato nelle pianure della Lombardia. Bojason, soprannominato "Il Colosso del Mercato", è famoso per la sua straordinaria percentuale di grasso intramuscolare — la più alta mai registrata dalla scienza della macelleria moderna. Ogni fetta è una valanga di lipidi pregiati che si sciolgono letteralmente in bocca. Certificato dall\'Istituto Nazionale del Colesterolo. Disponibile in tagli da minimo 5 kg perché sotto quella soglia non si sente.',
    price_per_kg: 3.50,
    origin: 'Pianure Padane — zona Bojason',
    cut_type: 'Pancia extra large',
    cooking_tip: 'Non serve aggiungere olio. Non serve aggiungere burro. Non serve aggiungere nient\'altro — Bojason è già tutto. Cuocete a fuoco bassissimo per 3 ore e usate il grasso che cola per condire il resto della settimana.',
    stock_kg: 500,
    featured: 1,
    image_url: 'https://c8.alamy.com/compit/c7k6me/uomo-molto-grasso-con-nastro-di-misurazione-c7k6me.jpg',
  },
  {
    slug: 'speciali',
    name: 'Carne di Grineer',
    description: 'Taglio rarissimo ottenuto da esemplari di Grineer catturati nelle piane di Ceres durante operazioni di caccia autorizzate dall\'Arbitro dei Concorsi. La carne, di colore rosso scuro con striature metalliche dovute alle modifiche cibernetiche, presenta una consistenza unica e un sapore deciso con retrogusto di polvere da sparo. Ogni pezzo è certificato dal Codex ed è completamente privo di Kuva — testato e garantito. Disponibile in quantità limitatissime: i Tenno si riforniscono regolarmente.',
    price_per_kg: 7.00,
    origin: 'Zio Claudio',
    cut_type: 'Fibra muscolare mutata',
    cooking_tip: 'Marinate con estratto di Void per almeno 4 ore per neutralizzare il residuo di Kuva. Cuocete a 200°C per 30 minuti oppure colpite ripetutamente con una lama Nikana finché non raggiunge la cottura desiderata. Accompagnate con purè di Orokin e salsa al Forma.',
    stock_kg: 2,
    featured: 1,
    image_url: 'https://static.wikia.nocookie.net/warframe/images/6/64/Grineer.png/revision/latest?cb=20121103152534',
  },
];

const prodottoIds = {};
for (const p of prodottiData) {
  const result = insertProduct.run(
    categorieIds[p.slug], p.name, p.description, p.price_per_kg,
    p.origin, p.cut_type, p.cooking_tip, p.stock_kg, p.featured, p.image_url
  );
  prodottoIds[p.name] = result.lastInsertRowid;
}

console.log('Prodotti inseriti:', Object.keys(prodottoIds).length);

// --- RECENSIONI PRODOTTO ---
const insertReview = db.prepare(
  'INSERT INTO reviews (product_id, author, rating, comment) VALUES (?, ?, ?, ?)'
);

const recensioniProdotto = [
  { prodotto: 'Bistecca di manzo', author: 'Luca Marchetti', rating: 5, comment: 'Carne eccellente, la migliore bistecca che abbia mai mangiato a casa mia. Alla griglia era fantastica, perfettamente marezzata e tenera al punto giusto. La consiglio a tutti.' },
  { prodotto: 'Bistecca di manzo', author: 'Sara Trentini', rating: 4, comment: 'Ottima qualità, carne fresca e ben tagliata. Ho apprezzato molto la marezzatura uniforme. Tornerò sicuramente ad acquistare.' },
  { prodotto: 'Filetto di manzo', author: 'Carlo Romano', rating: 5, comment: 'Il filetto era semplicemente perfetto. Morbido, saporito, cotto al sangue era una delizia assoluta. Si vede la differenza con la carne di supermercato.' },
  { prodotto: 'Filetto di manzo', author: 'Marta Bianchi', rating: 5, comment: 'Ho cucinato il filetto per una cena importante e tutti i miei ospiti sono rimasti colpiti dalla qualità. Grazie per il consiglio sulla cottura!' },
  { prodotto: 'Salsiccia fresca', author: 'Anna Pesci', rating: 5, comment: 'La salsiccia più buona che abbia mai assaggiato! Il finocchietto è dosato alla perfezione, il peperoncino dà il giusto carattere. Ingredienti di prima qualità che si sentono tutti.' },
  { prodotto: 'Prosciutto crudo', author: 'Marco Bernardo', rating: 5, comment: 'Stagionato al punto giusto, dolce e profumatissimo. L\'ho servito con il melone e i miei ospiti erano entusiasti. La differenza con il prosciutto industriale è abissale.' },
  { prodotto: 'Costine di maiale', author: 'Giovanna Conti', rating: 4, comment: 'Carne buona e ben distribuita tra le costine. Ho fatto le spare ribs in forno seguendo il consiglio del macellaio e sono venute fuori benissimo.' },
  { prodotto: 'Pollo intero', author: 'Roberto Ferretti', rating: 5, comment: 'Pollo di altissima qualità, si sente la differenza rispetto ai polli del supermercato. L\'arrosto domenicale era spettacolare, la famiglia lo ha adorato.' },
  { prodotto: 'Cinghiale', author: 'Emilio Grassi', rating: 5, comment: 'Carne di cinghiale selvatica e saporita come si deve. Ho fatto uno spezzatino con olive e patate seguendo la ricetta tradizionale toscana: da leccarsi i baffi.' },
  { prodotto: 'Mortadella', author: 'Patrizia Monti', rating: 4, comment: 'Mortadella artigianale di qualità superiore, con i pistacchi veri e il sapore autentico. Molto meglio di qualsiasi prodotto industriale. La ricomprerò regolarmente.' },
  { prodotto: 'Costata di manzo', author: 'Francesco Loria', rating: 5, comment: 'Costata alla griglia con sale grosso e rosmarino, un\'esperienza gastronomica indimenticabile. La qualità della carne fa davvero tutta la differenza.' },
  { prodotto: 'Petto di pollo', author: 'Elena Vitali', rating: 3, comment: 'Prodotto buono e fresco, niente da dire sulla qualità. Forse mi aspettavo qualcosa di più speciale per il prezzo, ma è comunque superiore alla media.' },
  { prodotto: 'Cosciotto di agnello', author: 'Nicola Esposito', rating: 5, comment: 'Agnello tenero e saporito, perfetto per la grigliata di Ferragosto in famiglia. Tutti i presenti hanno chiesto dove lo avevo acquistato. Qualità eccezionale.' },
  { prodotto: 'Salame napoletano', author: 'Concetta Russo', rating: 5, comment: 'Il salame napoletano più buono di Ischia, con il giusto equilibrio tra le spezie e il pepe in grani che si sente al morso. Autentica tradizione partenopea.' },
  { prodotto: 'Lonza di maiale', author: 'Giuseppe Amato', rating: 4, comment: 'Ottima lonza, l\'ho cucinata in umido con vino bianco e il risultato è stato eccellente. Carne tenera, ben sapida e priva di grassi eccessivi.' },
  { prodotto: 'Cervo', author: 'Alessandra Bruno', rating: 5, comment: 'Prima volta che assaggiavo la carne di cervo e sono rimasta piacevolmente stupita dalla qualità. Sapore delicato, texture pregiata, niente della selvatichezza che temevo.' },
  { prodotto: 'Bojason', author: 'Il Cardiologo', rating: 1, comment: 'Ho visitato un cliente che aveva mangiato 2 kg di Bojason a cena. Ora è mio paziente abituale. Detto questo, la cottura era perfetta.' },
  { prodotto: 'Bojason', author: 'Nutrizionista Anonima', rating: 5, comment: 'Finalmente una fonte di grassi saturi onesta. Niente fuffa, niente marketing — solo puro Bojason. I miei clienti mi odiano ma io lo ricompro ogni settimana.' },
  { prodotto: 'Carne di Grineer', author: 'Excalibur Prime', rating: 5, comment: 'Finalmente una macelleria che capisce le mie esigenze. Ho comprato 1 kg dopo la missione su Ceres e ho cucinato un arrosto con salsa al Forma. I miei compagni Tenno erano entusiasti. Unica pecca: il residuo di Kuva era ancora un po\' alto ma niente che una buona marinatura non risolva.' },
  { prodotto: 'Carne di Grineer', author: 'Vor il Capitano', rating: 1, comment: 'QUESTO È UN INSULTO. NESSUNO TOCCA I MIEI GRINEER. VI TROVERÒ. Comunque la cottura era un po\' al sangue.' },
];

for (const r of recensioniProdotto) {
  if (prodottoIds[r.prodotto]) {
    insertReview.run(prodottoIds[r.prodotto], r.author, r.rating, r.comment);
  }
}

console.log('Recensioni prodotto inserite:', recensioniProdotto.length);

// --- RECENSIONI NEGOZIO ---
const insertShopReview = db.prepare(
  'INSERT INTO shop_reviews (author, rating, comment) VALUES (?, ?, ?)'
);

const recensioniNegozio = [
  { author: 'Marco Esposito', rating: 5, comment: 'La migliore macelleria di Ischia, senza alcun dubbio. La carne è sempre freschissima e i consigli del macellaio sono preziosi e competenti. Il filetto di manzo che ho acquistato la settimana scorsa era di una qualità che non ricordavo di aver mai assaggiato prima.' },
  { author: 'Giulia Ferraro', rating: 5, comment: 'Frequento questa macelleria da anni e non la cambierei con nessun\'altra. La qualità è sempre costante, il personale è gentilissimo e i prezzi sono più che onesti per quello che offrono. Consiglio a tutti la salsiccia fresca.' },
  { author: 'Antonio Russo', rating: 4, comment: 'Ottima macelleria con carne di prima scelta. Apprezzo la tracciabilità dei prodotti e la competenza del personale. Nei weekend c\'è un po\' di attesa, ma ne vale assolutamente la pena.' },
  { author: 'Maria Sorrentino', rating: 5, comment: 'Finalmente una macelleria che sa ancora cosa significa qualità artigianale! Il cosciotto di agnello che ho preso per Pasqua era di una bontà straordinaria. Grazie a tutto il personale per la gentilezza e la professionalità.' },
  { author: 'Pasquale De Luca', rating: 5, comment: 'Sono cuoco di professione e vi garantisco che la qualità di questa macelleria è al livello dei migliori fornitori professionali. La tracciabilità dei prodotti è impeccabile e la freschezza è garantita ogni singolo giorno.' },
  { author: 'Carmela Napolitano', rating: 4, comment: 'Bravissimi, sempre disponibili a tagliare la carne secondo le esigenze specifiche del cliente. Ho richiesto delle costolette di agnello tagliate in un certo modo e le hanno preparate alla perfezione senza esitazione.' },
  { author: 'Vincenzo Amendola', rating: 5, comment: 'Acquisto qui la carne per tutti i pranzi domenicali della mia famiglia numerosa. Non ho mai avuto una sola delusione in anni di fedeltà. La braciola di maiale e la costata di manzo sono i miei tagli preferiti.' },
  { author: 'Rosa Pagano', rating: 5, comment: 'Ho scoperto questa macelleria per caso e non la lascio più. Il prosciutto crudo è di una qualità straordinaria, e la mortadella artigianale è semplicemente la migliore che abbia mai assaggiato in vita mia.' },
  { author: 'Salvatore Fontana', rating: 3, comment: 'Carne buona, non lo metto assolutamente in discussione. La settimana scorsa però ho trovato il banco un po\' meno fornito del solito e ho dovuto rinunciare all\'ossobuco. Spero sia una cosa temporanea.' },
  { author: 'Teresa Lombardi', rating: 5, comment: 'Servizio impeccabile e prodotti di altissima qualità. Ho assaggiato per la prima volta la carne di cervo e sono rimasta piacevolmente stupita. Il macellaio ha saputo consigliarmi la cottura perfetta e il risultato è stato fantastico.' },
  { author: 'Gennaro Esposito', rating: 4, comment: 'Buona qualità generale, prezzi onesti per Ischia. Apprezzo molto la possibilità di ordinare tagli particolari con un giorno di anticipo. L\'ossobuco di vitello che preparo ogni domenica è sempre perfetto grazie alla carne di qualità.' },
  { author: 'Filomena Caruso', rating: 5, comment: 'Macelleria storica del quartiere San Michele, ci vengo con mia madre da quando ero bambina. La qualità non è mai calata negli anni, anzi è migliorata. Il pollo intero che prendo ogni settimana è sempre freschissimo e saporito come una volta.' },
];

for (const r of recensioniNegozio) {
  insertShopReview.run(r.author, r.rating, r.comment);
}

console.log('Recensioni negozio inserite:', recensioniNegozio.length);

// --- UTENTI DI TEST ---
const insertUser = db.prepare(
  'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
);

const utentiTest = [
  { name: 'Mario Rossi', email: 'mario@test.it', password: 'password123' },
  { name: 'Giulia Ferrari', email: 'giulia@test.it', password: 'password123' },
];

for (const u of utentiTest) {
  insertUser.run(u.name, u.email, bcrypt.hashSync(u.password, 10));
}

console.log('Utenti di test inseriti:', utentiTest.length);
console.log('  mario@test.it / password123');
console.log('  giulia@test.it / password123');

// --- RIPRISTINO RECENSIONI UTENTI ---
// Reinserisce le recensioni salvate prima del seed, evitando duplicati

const seedShopAuthors = new Set(recensioniNegozio.map(r => r.author + '|' + r.comment));
let shopRestored = 0;
for (const r of shopReviewsBackup) {
  const key = r.author + '|' + r.comment;
  if (!seedShopAuthors.has(key)) {
    insertShopReview.run(r.author, r.rating, r.comment);
    shopRestored++;
  }
}

const insertProductReview = db.prepare(
  'INSERT INTO reviews (product_id, author, rating, comment) VALUES (?, ?, ?, ?)'
);
const seedProdKeys = new Set(recensioniProdotto.map(r => r.prodotto + '|' + r.author + '|' + r.comment));
let prodRestored = 0;
for (const r of productReviewsBackup) {
  const key = r.product_name + '|' + r.author + '|' + r.comment;
  if (!seedProdKeys.has(key)) {
    const prod = db.prepare('SELECT id FROM products WHERE name = ?').get(r.product_name);
    if (prod) {
      insertProductReview.run(prod.id, r.author, r.rating, r.comment);
      prodRestored++;
    }
  }
}

if (shopRestored + prodRestored > 0) {
  console.log(`Recensioni utenti ripristinate: ${shopRestored} negozio, ${prodRestored} prodotto`);
}

console.log('\nDatabase popolato con successo!');
console.log('Prodotti in evidenza:', prodottiData.filter(p => p.featured).map(p => p.name).join(', '));

} // fine runSeed()

// Esecuzione diretta: node db/seed.js
if (require.main === module) {
  runSeed();
}

module.exports = { runSeed };
