const db = require('./schema');
const bcrypt = require('bcryptjs');

function runSeed() {

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
  ['Bovino', 'bovino', 'Tagli pregiati di manzo e vitello selezionati da allevamenti italiani certificati.', 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800&auto=format&fit=crop&q=80'],
  ['Suino', 'suino', 'Carne di maiale freschissima, dalle costine alla lonza, per ogni esigenza culinaria.', 'https://images.unsplash.com/photo-1523986490752-c28064f26be3?w=800&auto=format&fit=crop&q=80'],
  ['Ovino', 'ovino', 'Agnello e pecora da allevamenti allo stato semibrado dei pascoli appenninici.', 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&auto=format&fit=crop&q=80'],
  ['Pollame', 'pollame', 'Pollo, tacchino e altri volatili da allevamento a terra, senza antibiotici.', 'https://images.unsplash.com/photo-1630564510761-a560db92a09b?w=800&auto=format&fit=crop&q=80'],
  ['Salumi', 'salumi', 'Salumi artigianali e affettati di alta qualità dalla tradizione italiana.', 'https://images.unsplash.com/photo-1502333052765-1424f32cf5ca?w=800&auto=format&fit=crop&q=80'],
  ['Speciali', 'speciali', 'Carni di selvaggina e razze rare per palati raffinati e cene speciali.', 'https://images.unsplash.com/photo-1628268909376-e8c44bb3153f?w=800&auto=format&fit=crop&q=80'],
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
    image_url: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=800&auto=format&fit=crop&q=80',
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
    image_url: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&auto=format&fit=crop&q=80',
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
    image_url: 'https://images.unsplash.com/photo-1568901346375-be28fcf9a2f9?w=800&auto=format&fit=crop&q=80',
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
    image_url: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=800&auto=format&fit=crop&q=80',
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
    image_url: 'https://images.unsplash.com/photo-1615852735201-2ce54ffa6afa?w=800&auto=format&fit=crop&q=80',
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
    image_url: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&auto=format&fit=crop&q=80',
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
    image_url: 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=800&auto=format&fit=crop&q=80',
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
    image_url: 'https://images.unsplash.com/photo-1504649346668-2cc86afaa2e1?w=800&auto=format&fit=crop&q=80',
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
    image_url: 'https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?w=800&auto=format&fit=crop&q=80',
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
    image_url: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=800&auto=format&fit=crop&q=80',
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
    image_url: 'https://images.unsplash.com/photo-1773417325310-cc9c9bef75e7?w=800&auto=format&fit=crop&q=80',
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
    image_url: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800&auto=format&fit=crop&q=80',
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
    image_url: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=800&auto=format&fit=crop&q=80',
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
    image_url: 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=800&auto=format&fit=crop&q=80',
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
    image_url: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&auto=format&fit=crop&q=80',
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
    image_url: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop&q=80',
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
    image_url: 'https://images.unsplash.com/photo-1560781290-7dc94c0f8f4f?w=800&auto=format&fit=crop&q=80',
  },
  // SPECIALI
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
    image_url: 'https://images.unsplash.com/photo-1611504262701-8a48422da4a1?w=800&auto=format&fit=crop&q=80',
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
    image_url: 'https://images.unsplash.com/photo-1592686092916-672fa9e86866?w=800&auto=format&fit=crop&q=80',
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
  { prodotto: 'Salame napoletano', author: 'Concetta Russo', rating: 5, comment: 'Il salame napoletano più buono di Napoli, con il giusto equilibrio tra le spezie e il pepe in grani che si sente al morso. Autentica tradizione partenopea.' },
  { prodotto: 'Lonza di maiale', author: 'Giuseppe Amato', rating: 4, comment: 'Ottima lonza, l\'ho cucinata in umido con vino bianco e il risultato è stato eccellente. Carne tenera, ben sapida e priva di grassi eccessivi.' },
  { prodotto: 'Cervo', author: 'Alessandra Bruno', rating: 5, comment: 'Prima volta che assaggiavo la carne di cervo e sono rimasta piacevolmente stupita dalla qualità. Sapore delicato, texture pregiata, niente della selvatichezza che temevo.' },
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
  { author: 'Marco Esposito', rating: 5, comment: 'La migliore macelleria di Napoli, senza alcun dubbio. La carne è sempre freschissima e i consigli del macellaio sono preziosi e competenti. Il filetto di manzo che ho acquistato la settimana scorsa era di una qualità che non ricordavo di aver mai assaggiato prima.' },
  { author: 'Giulia Ferraro', rating: 5, comment: 'Frequento questa macelleria da anni e non la cambierei con nessun\'altra. La qualità è sempre costante, il personale è gentilissimo e i prezzi sono più che onesti per quello che offrono. Consiglio a tutti la salsiccia fresca.' },
  { author: 'Antonio Russo', rating: 4, comment: 'Ottima macelleria con carne di prima scelta. Apprezzo la tracciabilità dei prodotti e la competenza del personale. Nei weekend c\'è un po\' di attesa, ma ne vale assolutamente la pena.' },
  { author: 'Maria Sorrentino', rating: 5, comment: 'Finalmente una macelleria che sa ancora cosa significa qualità artigianale! Il cosciotto di agnello che ho preso per Pasqua era di una bontà straordinaria. Grazie a tutto il personale per la gentilezza e la professionalità.' },
  { author: 'Pasquale De Luca', rating: 5, comment: 'Sono cuoco di professione e vi garantisco che la qualità di questa macelleria è al livello dei migliori fornitori professionali. La tracciabilità dei prodotti è impeccabile e la freschezza è garantita ogni singolo giorno.' },
  { author: 'Carmela Napolitano', rating: 4, comment: 'Bravissimi, sempre disponibili a tagliare la carne secondo le esigenze specifiche del cliente. Ho richiesto delle costolette di agnello tagliate in un certo modo e le hanno preparate alla perfezione senza esitazione.' },
  { author: 'Vincenzo Amendola', rating: 5, comment: 'Acquisto qui la carne per tutti i pranzi domenicali della mia famiglia numerosa. Non ho mai avuto una sola delusione in anni di fedeltà. La braciola di maiale e la costata di manzo sono i miei tagli preferiti.' },
  { author: 'Rosa Pagano', rating: 5, comment: 'Ho scoperto questa macelleria per caso e non la lascio più. Il prosciutto crudo è di una qualità straordinaria, e la mortadella artigianale è semplicemente la migliore che abbia mai assaggiato in vita mia.' },
  { author: 'Salvatore Fontana', rating: 3, comment: 'Carne buona, non lo metto assolutamente in discussione. La settimana scorsa però ho trovato il banco un po\' meno fornito del solito e ho dovuto rinunciare all\'ossobuco. Spero sia una cosa temporanea.' },
  { author: 'Teresa Lombardi', rating: 5, comment: 'Servizio impeccabile e prodotti di altissima qualità. Ho assaggiato per la prima volta la carne di cervo e sono rimasta piacevolmente stupita. Il macellaio ha saputo consigliarmi la cottura perfetta e il risultato è stato fantastico.' },
  { author: 'Gennaro Esposito', rating: 4, comment: 'Buona qualità generale, prezzi onesti per Napoli. Apprezzo molto la possibilità di ordinare tagli particolari con un giorno di anticipo. L\'ossobuco di vitello che preparo ogni domenica è sempre perfetto grazie alla carne di qualità.' },
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
console.log('\nDatabase popolato con successo!');
console.log('Prodotti in evidenza:', prodottiData.filter(p => p.featured).map(p => p.name).join(', '));

} // fine runSeed()

// Esecuzione diretta: node db/seed.js
if (require.main === module) {
  runSeed();
}

module.exports = { runSeed };
