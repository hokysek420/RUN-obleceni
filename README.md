# RUN — Kompletní E-commerce Platforma Značky Oblečení

Prémiový, produkčně připravený a plně funkční e-shop pro módní/streetwear značku **RUN**.

Postaveno na bázi moderního **Next.js 14 (App Router)** s reálnou relační **SQLite databází (`better-sqlite3` v WAL módu)**, kompletní administrací, zákaznickými účty, košíkem, pokladnou, správou objednávek, generováním faktur a 3D WebGL prohlížečem produktů (Three.js).

Všechny vizuály a fotografie produktů pocházejí **výhradně z oficiálních nahraných podkladů značky RUN** (žádné generované AI obrázky ani fotobanka).

---

## 🚀 Rychlé spuštění

Server již běží na pozadí na portu `3000`.

Pro manuální spuštění nebo vývojový režim v terminálu zadejte:

```bash
# Nastavení cesty k Node.js v prostředí WSL:
export PATH="$HOME/.local/node/bin:$PATH"

# Spuštění produkčního serveru (již zkompilováno přes npm run build):
npm run start

# Nebo spuštění vývojového serveru:
npm run dev
```

Otevřete v prohlížeči:
- **E-shop (Storefront):** [http://localhost:3000](http://localhost:3000)
- **Administrace:** [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🔐 Přihlašovací údaje

### Administrátor e-shopu (Vlastník / Správce)
- **URL administrace:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **E-mail:** `admin@runclothing.com`
- **Heslo:** `runadmin2026`
- **Oprávnění:** OWNER (plný přístup ke všem modulům)

### Testovací slevové kódy a poukazy
- Slevový kód 10%: `RUN10`
- Slevový kód pro první nákup (15%): `FIRSTDROP`
- Dárkový poukaz na 1 000 Kč: `RUN-GIFT-1000-VIP`

---

## 📦 Přehled architektonických modulů

### 1. Zpracování oficiálních RUN podkladů (`public/images/`)
Nahrané podklady byly bezeztrátově extrahovány a rozděleny na reálné produkty a detaily:
- **RUN Reversible Heavy Teddy Fur Zip Hoodie** (Černá s bílým kožichem, Bone Cream, Heather Grey) — 550 GSM, oboustranný heavy zip, zakázkový kovový taháček RUN
- **RUN Cyber-Chunky Air Sneaker** — Triple Black & Chrome akcenty
- **RUN 14.5 oz Heavyweight Baggy Denim Jeans** — Washed Black, raw okraje, custom RUN knoflíky a cvočky
- **RUN 450 GSM Baggy French Terry Sweatpants** — Heather Grey, robustní šňůry s kovovým zakončením, výšivka
- **RUN 280 GSM Boxy Cut Heavy T-Shirt** — Clean White, těžká bavlna, sítotisk na zádech
- **RUN Minimalist Heavyweight Zip Hoodie** — Clean White, boxy fit, kovový zip YKK

### 2. Storefront (Zákaznická část)
- **Homepage (`/`):** Hero kampaň, manifest značky, New Drop karusel, 3D interaktivní spotlight, kolekce, editorial, community feed.
- **Katalog & Filtrování (`/shop`):** Kategorie, velikosti, rozsah cen, stav dostupnosti (Skladem, Předobjednávka, Limitovaná edice), řazení.
- **Detail produktu (`/product/[slug]`):**
  - Galerie s možností zoomu a náhledu detailů.
  - **3D WebGL Prohlížeč:** Interaktivní 360° manipulace s rotací, zoomem a přepínáním režimu osvětlení/wireframe (Three.js).
  - Volba velikosti s napojením na reálný skladový stav v DB.
  - Informace o předobjednávkách (datum naskladnění).
  - Tabulka velikostí a průvodce materiály (modální okna).
  - Autentizační certifikát originality (pro limitované edice).
  - Zákaznické recenze s hvězdičkovým hodnocením a formulářem pro vložení.
- **Košík & Nákupní proces:**
  - Výsuvný košík (Cart Drawer) s live přepočtem.
  - Stránka košíku (`/cart`) s ukazatelem dopravy zdarma.
  - Pokladna (`/checkout`): **Nákup bez registrace (Guest checkout)** i pro přihlášené, validace adresy.
  - Dopravní metody: **Zásilkovna** (včetně výběru výdejního místa), **Kurýrní služba DPD/GLS**, **Osobní odběr Praha Showroom**.
  - Platební metody: Platební karta / Apple Pay / Google Pay, bankovní převod (QR/IBAN), dobírka.
  - Validace slevových kódů a dárkových poukazů.
  - **Potvrzení objednávky (`/order-confirmation/[orderNumber]`):** Shrnutí, časová osa, možnost tisku/stažení daňové faktury v PDF.
  - **Sledování zásilky (`/track`):** Vyhledání podle čísla objednávky s dynamickým zobrazením stavu logistiky.

### 3. Zákaznický účet (`/account`)
- Registrace a přihlášení (hesla šifrována pomocí `bcryptjs`, JWT tokeny v zabezpečených cookies).
- Historie a detaily objednávek.
- Seznam přání (Wishlist) synchronizovaný se zákaznickým účtem.
- Správa doručovacích adres a změna hesla.
- Přehled reklamací a vrácení zboží.

### 4. Specializované stránky značky
- **VIP Rezervace Showroomu (`/appointments`):** Rezervace privátního fittingu a stylingu v pražském studiu.
- **Komunitní Lookbook (`/community`):** Komunitní fotografie s možností nahrát vlastní outfit.
- **Formulář vrácení zboží do 14 dnů (`/returns`)**
- **Formulář reklamace vad (`/reclamations`)**
- Průvodci: Tabulka velikostí (`/size-guide`), Průvodce materiály (`/materials`), Údržba oděvů (`/care`), Záruka kvality (`/quality`), O značce (`/about`), Editorial (`/editorial`), Kolekce (`/collections`), Kontakt (`/contact`).
- Právní náležitosti: Obchodní podmínky (`/terms`), Ochrana osobních údajů GDPR (`/privacy`), Nastavení cookies (`/cookies`).

### 5. Administrační panel (`/admin`)
Kompletní dedikované rozhraní pro majitele a správce značky:
- **Přehled (Dashboard):** Celkové tržby, počet objednávek, skladové jednotky, průměrná hodnota košíku, graf posledních objednávek a upozornění na nízký stav zásob.
- **Správa produktů:** Kompletní CRUD, přidávání nových kousků, editace cen, slev, gramáže, popisů, fotografií a variant.
- **Skladové zásoby (Live Inventory):** Přímá editace počtu kusů pro každou velikost a barvu. Změna v adminu se ihned promítne do eshopu a nákup v eshopu ihned odečte kusy ze skladu.
- **Objednávky:** Změna stavu objednávky (*Přijato, Zaplaceno, Ve skladu, Odesláno, Doručeno, Stornováno, Vráceno*), zadání sledovacího čísla dopravce a externího odkazu, tisk faktur.
- **Správa zákazníků:** Seznam registrovaných zákazníků a jejich objednávek.
- **Recenze & Komunita:** Schvalování a mazání zákaznických recenzí a komunitních fotografií.
- **Slevy a dárkové poukazy:** Tvorba procentuálních i fixních slev, generování dárkových poukazů.
- **VIP Schůzky:** Správa rezervací fittingu na pražském showroomu.
- **Správa obsahu (CMS):** Editace textů v Hero sekci, oznámení, manifestu a FAQ přímo z administrace.
- **Nastavení e-shopu:** Fakturační údaje firmy, bankovní spojení, ceny dopravy a práh pro dopravu zdarma.

---

## 🗄 Databáze (`data/run.db`)
SQLite databáze je uložena lokálně v souboru `data/run.db` a využívá WAL (Write-Ahead Logging) režim pro vysokou propustnost a nulovou latenci.
Schéma obsahuje tabulky:
- `products`, `product_variants`, `categories`, `collections`
- `orders`, `order_items`
- `users`, `admin_users`
- `reviews`, `community_gallery`, `newsletter_subscribers`
- `discount_codes`, `gift_cards`, `appointments`
- `returns_and_reclamations`, `media_library`
- `website_content`, `store_settings`
>>>>>>> 645e99a (docs: add complete platform documentation and run guide)
